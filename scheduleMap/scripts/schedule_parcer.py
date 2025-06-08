import requests
from bs4 import BeautifulSoup
import django
import os

# Инициализация Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.db import connection

# Конфигурация (корпус 6 выбран по умолчанию)
SELECTED_BUILDING_ID = "6"
SELECTED_BUILDING_NAME = "6 корпус"  # Можно уточнить название
BASE_URL = "https://isu.uust.ru/api/new_schedule_api/?schedule_semestr_id=232&WhatShow=3"
INITIAL_URL = f"{BASE_URL}&building_id={SELECTED_BUILDING_ID}&room=9361&weeks=0"
ROOM_URL_TEMPLATE = f"{BASE_URL}&building_id={SELECTED_BUILDING_ID}&room={{room_id}}&weeks=0"

def get_rooms():
    """Получаем список всех аудиторий в выбранном корпусе"""
    response = requests.get(INITIAL_URL)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        room_select = soup.find('select', {'name': 'room'})
        return {
            opt['value']: opt.get_text(strip=True)
            for opt in room_select.find_all('option')
        } if room_select else {}
    else:
        print(f"Ошибка при запросе списка аудиторий: {response.status_code}")
        return {}

def get_schedule_for_room(room_id, room_name):
    """Получаем расписание для конкретной аудитории"""
    url = ROOM_URL_TEMPLATE.format(room_id=room_id)
    response = requests.get(url)

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        return [
            {
                'room_id': room_id,
                'day': cols[0].get_text(strip=True),
                'time': cols[1].get_text(strip=True),
                'weeks': cols[2].get_text(strip=True)
            }
            for row in soup.find_all('tr')
            if len(cols := row.find_all('td')) >= 3
        ]
    else:
        print(f"Ошибка для аудитории {room_name} ({room_id}): {response.status_code}")
        return []

def save_to_db(data):
    """Сохраняем данные в БД Django"""
    try:
        with connection.cursor() as cursor:
            # Добавляем корпус (если ещё нет)
            cursor.execute(
                "INSERT OR IGNORE INTO buildings (building_id, name) VALUES (?, ?)",
                [SELECTED_BUILDING_ID, SELECTED_BUILDING_NAME]
            )
            # Добавляем аудитории и расписание
            for room_id, room_name in data['rooms'].items():
                cursor.execute(
                    "INSERT OR IGNORE INTO rooms (building_id, room_id, name) VALUES (?, ?, ?)",
                    [SELECTED_BUILDING_ID, room_id, room_name]
                )

                for lesson in data['schedule'].get(room_id, []):
                    cursor.execute(
                        """INSERT INTO schedule (room_id, day, time, weeks) 
                        VALUES (?, ?, ?, ?)""",
                        [room_id, lesson['day'], lesson['time'], lesson['weeks']]
                    )

        print(f"Успешно сохранено {len(data['rooms'])} аудиторий")
    except Exception as e:
        print(f"Ошибка при сохранении в БД: {e}")
        raise

def main():
    # Получаем данные
    rooms = get_rooms()
    if not rooms:
        print("Не удалось получить список аудиторий")
        return

    schedule_data = {
        'building': {'id': SELECTED_BUILDING_ID, 'name': SELECTED_BUILDING_NAME},
        'rooms': rooms,
        'schedule': {
            room_id: get_schedule_for_room(room_id, room_name)
            for room_id, room_name in rooms.items()
        }
    }

    # Сохраняем в БД
    save_to_db(schedule_data)
    print("Готово!")

if __name__ == "__main__":
    main()
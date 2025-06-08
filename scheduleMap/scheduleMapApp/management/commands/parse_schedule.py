from django.core.management.base import BaseCommand
from scheduleMapApp.models import Buildings, Rooms, Schedule
import requests
from bs4 import BeautifulSoup


class Command(BaseCommand):
    help = 'Парсит расписание с isu.uust.ru и сохраняет в БД'

    def handle(self, *args, **options):
        SELECTED_BUILDING_ID = "2"
        SELECTED_BUILDING_NAME = "2 корпус"
        BASE_URL = "https://isu.uust.ru/api/new_schedule_api/?schedule_semestr_id=232&WhatShow=3"

        def get_rooms():
            url = f"{BASE_URL}&building_id={SELECTED_BUILDING_ID}&room=9361&weeks=0"
            response = requests.get(url)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                room_select = soup.find('select', {'name': 'room'})
                return {
                    opt['value']: opt.get_text(strip=True)
                    for opt in room_select.find_all('option')
                } if room_select else {}
            else:
                self.stdout.write(self.style.ERROR(f"Ошибка при запросе аудиторий: {response.status_code}"))
                return {}

        def get_schedule(room_id):
            url = f"{BASE_URL}&building_id={SELECTED_BUILDING_ID}&room={room_id}&weeks=0"
            response = requests.get(url)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                return [
                    {
                        'day': cols[0].get_text(strip=True),
                        'time': cols[1].get_text(strip=True),
                        'weeks': cols[2].get_text(strip=True)
                    }
                    for row in soup.find_all('tr')
                    if len(cols := row.find_all('td')) >= 3
                ]
            else:
                self.stdout.write(self.style.WARNING(f"Ошибка для аудитории {room_id}: {response.status_code}"))
                return []

        rooms = get_rooms()
        if not rooms:
            self.stdout.write(self.style.ERROR("Не удалось загрузить аудитории"))
            return

        building, _ = Buildings.objects.get_or_create(
            building_id=SELECTED_BUILDING_ID,
            defaults={'name': SELECTED_BUILDING_NAME}
        )

        for room_id, room_name in rooms.items():
            room, _ = Rooms.objects.get_or_create(
                building=building,
                room_id=room_id,
                defaults={'name': room_name}
            )

            for lesson in get_schedule(room_id):
                Schedule.objects.create(
                    room=room,
                    day=lesson['day'],
                    time=lesson['time'],
                    weeks=lesson['weeks']
                )

        self.stdout.write(self.style.SUCCESS(f"Данные для {len(rooms)} аудиторий сохранены!"))
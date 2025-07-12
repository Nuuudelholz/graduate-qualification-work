import os
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from scheduleMapApp.models import Schedule
from .utils.occupancy_room_weekly import get_room_weekly_occupancy

from .utils.occupancy import calculate_occupancy, get_chart_data
import json


def geojson_files(request):
    GEOJSON_DIRECTORY = os.path.join(settings.BASE_DIR, 'scheduleMapApp', 'static', 'geojson')

    geojson_files = [f for f in os.listdir(GEOJSON_DIRECTORY) if f.endswith('.geojson')]
    return JsonResponse({'files': geojson_files})

def scheduleMapApp_view(request):
    return render(request, 'scheduleMapApp/index.html')


def main_view(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse(get_chart_data())  # Только JSON!

    filtered_rooms = Schedule.objects.filter(
        room__building__building_id="6"
    ).exclude(
        room__name="Переход в УК №5"
    ).exclude(
        weeks=""
    ).values_list('room__name', flat=True).distinct()

    return render(request, 'scheduleMapApp/index.html', {
        'occupancy_list': calculate_occupancy(),
        'chart_data': json.dumps(get_chart_data()),
        'room_list': filtered_rooms
    })


def analyze_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            building = data.get('building')
            week = data.get('week')
            day = data.get('day')
            time = data.get('time')

            if building and week and day and time:
                occupied_qs = Schedule.objects.filter(
                    day=day,
                    time=time,
                    weeks__contains=week,
                    room__building__building_id=building
                ).values_list('room__name', flat=True).distinct()

                return JsonResponse({'occupied_rooms': list(occupied_qs)})
            # ⬇ если фильтров нет — просто отдать get_chart_data()
            return JsonResponse(get_chart_data())

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Only POST allowed'}, status=400)


def room_schedule_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            room_name = data.get('room')
            if not room_name:
                return JsonResponse({'error': 'Не указана аудитория'}, status=400)

            stats = get_room_weekly_occupancy(room_name)
            return JsonResponse(stats)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Only POST allowed'}, status=400)



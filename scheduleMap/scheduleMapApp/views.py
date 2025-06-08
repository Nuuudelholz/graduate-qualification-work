import os
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render

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
        from .utils.occupancy import get_chart_data
        return JsonResponse(get_chart_data())  # Только JSON!

    # Обычный GET-запрос
    from .utils.occupancy import calculate_occupancy
    return render(request, 'scheduleMapApp/index.html', {
        'occupancy_list': calculate_occupancy(),
        'chart_data': json.dumps(get_chart_data())
    })

def analyze_view(request):
    if request.method == 'POST':
        try:
            from .utils.occupancy import get_chart_data
            return JsonResponse(get_chart_data())
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Only POST allowed'}, status=400)

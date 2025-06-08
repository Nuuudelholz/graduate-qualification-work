from collections import defaultdict
from django.db.models import Count
from scheduleMapApp.models import Schedule


def calculate_occupancy():
    occupancy_data = (
        Schedule.objects
        .annotate(week_count=Count('weeks'))
        .values('room__name', 'week_count')
        .order_by('-week_count')
    )

    return [f"Аудитория {item['room__name']} - занята {item['week_count']} раз"
            for item in occupancy_data]


def get_chart_data():
    data = (
        Schedule.objects
        .values('room__name')
        .annotate(count=Count('id'))
        .order_by('-count')[:50]
    )
    return {
        'rooms': [item['room__name'] for item in data],
        'counts': [item['count'] for item in data]
    }
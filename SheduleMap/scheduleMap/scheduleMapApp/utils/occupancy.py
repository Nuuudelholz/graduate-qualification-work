from collections import defaultdict

from django.db.models import Count

from scheduleMapApp.models import Schedule


def calculate_occupancy():
    occupancy_data = (
        Schedule.objects
        .filter(room__building__building_id="6")
        .values('room__room_id', 'room__name')
        .annotate(count=Count('id'))
        .order_by('-count')
    )

    seen = set()
    result = []

    for item in occupancy_data:
        room_id = item['room__room_id']
        if room_id not in seen:
            seen.add(room_id)
            result.append(f"Аудитория {item['room__name']} - занята {item['count']} раз")

    return result


def get_chart_data():
    qs = (
        Schedule.objects
        .filter(room__building__building_id="6")
        .exclude(room__name="Переход в УК №5")
        .values('room__room_id', 'room__name', 'weeks')
    )

    room_counts = defaultdict(int)
    room_weeks = defaultdict(set)
    room_names = {}

    for entry in qs:
        room_id = entry['room__room_id']
        name = entry['room__name']
        weeks_str = entry['weeks'] or ""

        room_counts[room_id] += 1
        room_names[room_id] = name

        for w in weeks_str.split():
            if w.isdigit():
                room_weeks[room_id].add(w)

    rooms = []
    counts = []
    weeks = []

    for room_id in room_counts:
        rooms.append(room_names[room_id])
        counts.append(room_counts[room_id])
        weeks.append(' '.join(sorted(room_weeks[room_id], key=int)))

    return {
        'rooms': rooms,
        'counts': counts,
        'weeks': weeks
    }

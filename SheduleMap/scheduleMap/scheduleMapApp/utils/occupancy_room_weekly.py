from collections import defaultdict
from scheduleMapApp.models import Schedule

def get_room_weekly_occupancy(room_name: str) -> dict:
    queryset = Schedule.objects.filter(
        room__name=room_name,
        room__building__building_id=6
    ).exclude(
        room__name="Переход в УК №5"
    ).exclude(
        weeks=[]
    )

    week_counts = defaultdict(int)

    for entry in queryset:
        if entry.weeks:
            for week in entry.weeks.split():
                if week.isdigit():
                    week_counts[int(week)] += 1

    sorted_weeks = sorted(week_counts.items())
    labels = [f"{week}" for week, _ in sorted_weeks]
    data = [count for _, count in sorted_weeks]

    return {
        "labels": labels,
        "data": data
    }


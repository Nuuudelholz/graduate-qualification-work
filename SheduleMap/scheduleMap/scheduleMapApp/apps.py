from django.apps import AppConfig


class SchedulemapappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'scheduleMapApp'

class ScheduleMapAppConfig(AppConfig):
    name = 'scheduleMapApp'

    def ready(self):
        from . import scheduler
        scheduler.start()

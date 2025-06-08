from django.db import models

class Buildings(models.Model):
    building_id = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'buildings'

class Rooms(models.Model):
    building = models.ForeignKey(
        Buildings,
        on_delete=models.CASCADE,
        to_field='building_id'
    )
    room_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'rooms'

class Schedule(models.Model):
    room = models.ForeignKey(
        Rooms,
        on_delete=models.CASCADE,
        to_field='room_id'
    )
    day = models.CharField(max_length=50)
    time = models.CharField(max_length=50)
    weeks = models.CharField(max_length=100)

    class Meta:
        db_table = 'schedule'
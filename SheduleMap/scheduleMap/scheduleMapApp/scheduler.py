from apscheduler.schedulers.background import BackgroundScheduler
from django.core.management import call_command
import logging

def start():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        lambda: call_command('parse_schedule'),
        'cron',
        hour=0,
        minute=0,
        id='daily_parse_schedule',
        replace_existing=True
    )
    try:
        scheduler.start()
        logging.info("⏰ Scheduler started.")
    except Exception as e:
        logging.error(f"Scheduler failed: {e}")

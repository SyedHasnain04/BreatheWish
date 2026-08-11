from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from datetime import date, timedelta

def send_follow_up_reminders(db_factory):
    """Daily job at 9am — notify patients of tomorrow's follow-ups."""
    from app.models.follow_up import FollowUp
    from app.models.case import Case
    from app.models.notification import Notification

    db: Session = db_factory()
    try:
        tomorrow = date.today() + timedelta(days=1)
        due = db.query(FollowUp).filter(
            FollowUp.scheduled_date == tomorrow,
            FollowUp.reminder_sent == False
        ).all()

        for fu in due:
            case = db.query(Case).filter(Case.id == fu.case_id).first()
            if case and case.patient_id:
                notif = Notification(
                    user_id=case.patient_id,
                    title="Follow-up Tomorrow",
                    body=f"Reminder: Your follow-up is scheduled for tomorrow ({tomorrow.strftime('%d %B %Y')}).",
                    type="follow_up_reminder",
                    entity_id=case.id
                )
                db.add(notif)
                fu.reminder_sent = True

        db.commit()
        print(f"[Scheduler] Sent reminders for {len(due)} follow-ups due tomorrow.")
    except Exception as e:
        print(f"[Scheduler] Error: {e}")
    finally:
        db.close()


def start_scheduler(db_factory):
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=lambda: send_follow_up_reminders(db_factory),
        trigger=CronTrigger(hour=9, minute=0),
        id="follow_up_reminders",
        replace_existing=True
    )
    scheduler.start()
    print("[Scheduler] Started — follow-up reminders run daily at 9am")
    return scheduler

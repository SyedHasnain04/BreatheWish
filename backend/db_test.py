import sys
sys.path.append('.')
from app.database import SessionLocal
from app.models.user import User
from app.middleware.auth import get_password_hash

db = SessionLocal()
try:
    hashed = get_password_hash('password123')
    user = User(email='test@test.com', password_hash=hashed, full_name='Test', role='patient')
    db.add(user)
    db.commit()
    print("Success")
except Exception as e:
    print(f"Error: {e}")

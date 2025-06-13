import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://poker_user:password@db:5432/pokerdb")
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here")


import os

from dotenv import load_dotenv

load_dotenv()

URL_DB = os.getenv("URL_DB")

# AUTH

ACCESS_TOKEN_EXPIRE_MINUTES = 10
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 1

ALGORITHM = os.getenv("ALGORITHM")
SECRET_KEY = os.getenv("SECRET_KEY")
PASSWORD_SALT = os.environ.get("PASSWORD_SALT")

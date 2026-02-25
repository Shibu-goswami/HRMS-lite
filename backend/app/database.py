import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import certifi

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

# ✅ Proper SSL Fix for macOS + Atlas
client = AsyncIOMotorClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where()
)

db = client["hrms"]


# ✅ Proper Index Creator (to be called on startup)
async def create_indexes():
    await db.attendance.create_index(
        [("employee_id", 1), ("date", 1)],
        unique=True
    )
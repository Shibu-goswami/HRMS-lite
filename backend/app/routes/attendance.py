from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
from typing import Optional
from app.database import db

router = APIRouter(prefix="/attendance", tags=["Attendance"])


# 🔹 Helper
def attendance_helper(attendance) -> dict:
    return {
        "id": str(attendance["_id"]),
        "employee_id": str(attendance["employee_id"]),
        "date": attendance["date"],
        "status": attendance["status"],
    }


# 🔹 Schema
class AttendanceCreate(BaseModel):
    employee_id: str
    date: str   # format: YYYY-MM-DD
    status: str  # Present / Absent


# 🔹 Mark Attendance
@router.post("/")
async def mark_attendance(attendance: AttendanceCreate):

    if not ObjectId.is_valid(attendance.employee_id):
        raise HTTPException(status_code=400, detail="Invalid employee ID")

    # Check if employee exists
    employee = await db.employees.find_one(
        {"_id": ObjectId(attendance.employee_id)}
    )
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Prevent duplicate attendance
    existing = await db.attendance.find_one({
        "employee_id": ObjectId(attendance.employee_id),
        "date": attendance.date
    })

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Attendance already marked for this date"
        )

    attendance_dict = {
        "employee_id": ObjectId(attendance.employee_id),
        "date": attendance.date,
        "status": attendance.status,
        "created_at": datetime.utcnow()
    }

    result = await db.attendance.insert_one(attendance_dict)

    new_attendance = await db.attendance.find_one(
        {"_id": result.inserted_id}
    )

    return attendance_helper(new_attendance)


# 🔹 Get Attendance (Filter by date optional)
@router.get("/")
async def get_attendance(date: Optional[str] = Query(None)):
    records = []

    query = {}
    if date:
        query["date"] = date

    async for record in db.attendance.find(query):
        records.append(attendance_helper(record))

    return records


# 🔹 Get Attendance by Employee
@router.get("/{employee_id}")
async def get_employee_attendance(employee_id: str):

    if not ObjectId.is_valid(employee_id):
        raise HTTPException(status_code=400, detail="Invalid employee ID")

    records = []

    async for record in db.attendance.find(
        {"employee_id": ObjectId(employee_id)}
    ):
        records.append(attendance_helper(record))

    return records

# 🔹 Update Attendance
@router.put("/{attendance_id}")
async def update_attendance(attendance_id: str, attendance: AttendanceCreate):

    if not ObjectId.is_valid(attendance_id):
        raise HTTPException(status_code=400, detail="Invalid attendance ID")

    if not ObjectId.is_valid(attendance.employee_id):
        raise HTTPException(status_code=400, detail="Invalid employee ID")

    existing_attendance = await db.attendance.find_one(
        {"_id": ObjectId(attendance_id)}
    )
    if not existing_attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    employee = await db.employees.find_one(
        {"_id": ObjectId(attendance.employee_id)}
    )
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    duplicate = await db.attendance.find_one({
        "employee_id": ObjectId(attendance.employee_id),
        "date": attendance.date,
        "_id": {"$ne": ObjectId(attendance_id)}
    })

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="Attendance already exists for this employee on this date"
        )

    update_data = {
        "employee_id": ObjectId(attendance.employee_id),
        "date": attendance.date,
        "status": attendance.status,
        "updated_at": datetime.utcnow()
    }

    await db.attendance.update_one(
        {"_id": ObjectId(attendance_id)},
        {"$set": update_data}
    )

    updated_record = await db.attendance.find_one(
        {"_id": ObjectId(attendance_id)}
    )

    return attendance_helper(updated_record)

# 🔹 Delete Attendance
@router.delete("/{attendance_id}")
async def delete_attendance(attendance_id: str):

    if not ObjectId.is_valid(attendance_id):
        raise HTTPException(status_code=400, detail="Invalid attendance ID")

    record = await db.attendance.find_one(
        {"_id": ObjectId(attendance_id)}
    )

    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    await db.attendance.delete_one(
        {"_id": ObjectId(attendance_id)}
    )

    return {"message": "Attendance deleted successfully"}
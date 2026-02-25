from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from bson import ObjectId
from datetime import datetime
from app.database import db

router = APIRouter(prefix="/employees", tags=["Employees"])


# 🔹 Helper
def employee_helper(employee) -> dict:
    return {
        "id": str(employee["_id"]),
        "employee_id": employee["employee_id"],  # ✅ added
        "name": employee["name"],
        "email": employee["email"],
        "department": employee["department"],
        "role": employee["role"],
        "salary": employee["salary"],
        "created_at": employee["created_at"],
    }


# 🔹 Schema
class EmployeeCreate(BaseModel):
    employee_id: str  # ✅ added
    name: str
    email: EmailStr
    department: str
    role: str
    salary: float


# 🔹 Create Employee
@router.post("/")
async def create_employee(employee: EmployeeCreate):

    # Check duplicate email
    existing_email = await db.employees.find_one({"email": employee.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Check duplicate employee_id
    existing_emp_id = await db.employees.find_one(
        {"employee_id": employee.employee_id}
    )
    if existing_emp_id:
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    employee_dict = employee.dict()
    employee_dict["created_at"] = datetime.utcnow()

    result = await db.employees.insert_one(employee_dict)
    new_employee = await db.employees.find_one({"_id": result.inserted_id})

    return employee_helper(new_employee)


# 🔹 Get All Employees
@router.get("/")
async def get_employees():
    employees = []
    async for employee in db.employees.find():
        employees.append(employee_helper(employee))
    return employees


# 🔹 Update Employee
@router.put("/{employee_id}")
async def update_employee(employee_id: str, employee: EmployeeCreate):

    if not ObjectId.is_valid(employee_id):
        raise HTTPException(status_code=400, detail="Invalid ID")

    # Prevent duplicate employee_id on update
    existing_emp_id = await db.employees.find_one(
        {"employee_id": employee.employee_id}
    )
    if existing_emp_id and str(existing_emp_id["_id"]) != employee_id:
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    updated = await db.employees.update_one(
        {"_id": ObjectId(employee_id)},
        {"$set": employee.dict()}
    )

    if updated.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")

    return {"message": "Employee updated successfully"}


# 🔹 Delete Employee
@router.delete("/{employee_id}")
async def delete_employee(employee_id: str):

    if not ObjectId.is_valid(employee_id):
        raise HTTPException(status_code=400, detail="Invalid ID")

    deleted = await db.employees.delete_one(
        {"_id": ObjectId(employee_id)}
    )

    if deleted.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")

    return {"message": "Employee deleted successfully"}
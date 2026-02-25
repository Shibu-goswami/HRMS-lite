# HRMS Lite

A Full-Stack Human Resource Management System built with:

- FastAPI (Backend)
- React + Vite (Frontend)
- MongoDB (Database)
- Railway (Backend Deployment)
- Vercel (Frontend Deployment)

---

## 🚀 Live Demo
- Frontend : https://hrms-lite-ashen-pi.vercel.app
- Backend : https://hrms-lite-production-f1e9.up.railway.app/docs

---

## Features

### 👨‍💼 Employee Management
- Add Employee
- Edit Employee
- Delete Employee
- Form Validation

### 📅 Attendance Management
- Mark Attendance
- Edit Attendance
- Delete Attendance
- Daily Attendance Stats

### 📊 Dashboard
- Total Employees
- Total Attendance Records
- Present Count (Current Date)
- Attendance Rate

---

## Project Structure
```
HRMS-lite/
│
├── backend/
│ ├── app/
│ │ ├── main.py
│ │ ├── database.py
│ │ ├── routes/
│ │ │ ├── employee.py
│ │ │ ├── attendance.py
│ │ ├── models/
│ │ └── init.py
│ │
│ ├── requirements.txt
│ ├── Procfile
│
├── frontend/
│ ├── src/
│ │ ├── pages/
│ │ │ ├── Dashboard.jsx
│ │ │ ├── Employees.jsx
│ │ │ ├── Attendance.jsx
│ │ ├── features/
│ │ │ ├── employeeApi.js
│ │ │ ├── attendanceApi.js
│ │ ├── components/
│ │ ├── App.jsx
│ │ └── main.jsx
│ │
│ ├── vercel.json
│ ├── package.json
│
└── README.md
```


---

## Backend Setup

### 1️⃣ Go to backend folder

```
cd backend
```

### 2️⃣ Create virtual environment

```
python -m venv venv
source venv/bin/activate # Mac/Linux
venv\Scripts\activate # Windows
```

### 3️⃣ Install dependencies

```
pip install -r requirements.txt
```

### 4️⃣ Add Environment Variable

Create `.env` file:
```
MONGO_URL=your_mongodb_connection_string
```

### 5️⃣ Run server

```
uvicorn app.main:app --reload
```

---

## Frontend Setup

### 1️⃣ Go to frontend folder

```
cd frontend
```

### 2️⃣ Install dependencies

```
npm install
```

### 3️⃣ Start development server

```
npm run dev
```

## Tech Stack

- FastAPI
- React
- MongoDB
- Redux Toolkit Query
- Tailwind CSS

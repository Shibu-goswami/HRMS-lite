from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import employee
from app.routes import attendance

app = FastAPI()

app.include_router(employee.router)
app.include_router(attendance.router)

# CORS (for frontend later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # we’ll restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "HRMS Lite API Running 🚀"}
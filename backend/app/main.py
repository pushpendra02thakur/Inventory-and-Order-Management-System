from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn

from . import models, database, crud, auth, schemas
from .config import settings
from .routers import auth as auth_router, users, products, customers, orders, inventory, logs

app = FastAPI(
    title="TraceHub API",
    description="Enterprise Inventory & Order Management API with JWT Authentication and Role-Based Access Control. Made by Pushpendra.",
    version="1.0.0"
)

@app.on_event("startup")
def on_startup():
    print("Database initialization starting...")
    try:
        # Automatically create tables on startup
        models.Base.metadata.create_all(bind=database.engine)
        
        # Seed default users if tables are empty
        db = database.SessionLocal()
        try:
            crud.seed_default_users(db)
        finally:
            db.close()
        print("Database initialization completed successfully.")
    except Exception as e:
        print("=" * 60)
        print(f"DATABASE CONNECTION / INITIALIZATION ERROR: {e}")
        print("Your FastAPI app has successfully booted, but could not connect to PostgreSQL.")
        print("Please verify that your DATABASE_URL is correct and that the PostgreSQL service is active in Railway.")
        print("=" * 60)

# CORS configuration
cors_origins_list = []
if settings.CORS_ORIGINS:
    # If it looks like a JSON list, try to parse it
    if settings.CORS_ORIGINS.startswith("[") and settings.CORS_ORIGINS.endswith("]"):
        import json
        try:
            cors_origins_list = json.loads(settings.CORS_ORIGINS)
        except Exception:
            cors_origins_list = [settings.CORS_ORIGINS]
    else:
        # Otherwise, split by comma
        cors_origins_list = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
else:
    cors_origins_list = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount individual routers
app.include_router(auth_router.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(inventory.router)
app.include_router(logs.router)

# --- DASHBOARD DATA ENDPOINT ---
@app.get("/api/dashboard", response_model=schemas.DashboardData, tags=["Dashboard"])
def get_dashboard(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Staff role is allowed to view Dashboard metrics, as requested
    return crud.get_dashboard_data(db)

@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "TraceHub Backend API",
        "author": "Pushpendra",
        "swagger_docs": "/docs",
        "redoc_docs": "/redoc"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

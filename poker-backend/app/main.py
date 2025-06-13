from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from app.api import hand as hand_api
from app.db.database import initialize_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code to run on startup
    print("Application startup...")
    try:
        initialize_database() # Initialize DB tables on startup
        print("Database initialization check complete.")
    except Exception as e:
        print(f"Error during database initialization: {e}")
        # Depending on severity, you might want to prevent the app from starting
    yield
    # Code to run on shutdown
    print("Application shutdown...")

app = FastAPI(
    title="Poker Hand API",
    description="API for storing and retrieving poker hand histories.",
    version="0.1.0",
    lifespan=lifespan # Use the lifespan context manager for startup/shutdown events
)

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API router for hand endpoints
app.include_router(hand_api.router)

@app.get("/", tags=["Health Check"])
def read_root():
    """Root endpoint for basic health check."""
    return {"status": "ok", "message": "Welcome to the Poker Hand API"}

# If you were running this directly with uvicorn:
# import uvicorn
# if __name__ == "__main__":
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
# However, we will run it via Docker Compose.

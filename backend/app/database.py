from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Get the absolute path to the database file
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "roadmap_app.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

print(f"Database path: {DB_PATH}")
print(f"Database URL: {SQLALCHEMY_DATABASE_URL}")

# Create database directory if it doesn't exist
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    echo=True  # Enable SQL logging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Log all SQL statements
@event.listens_for(engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    print("\nExecuting SQL:", statement)
    print("Parameters:", parameters)

# Dependency for DB session
def get_db():
    db = SessionLocal()
    try:
        print("Opening new database session")
        yield db
    finally:
        print("Closing database session")
        db.close()

# Create all tables
def init_db():
    print("Creating database tables...")
    from app.models import User, Creation, GraphNodes, ComprehensiveRoadmap
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

# Initialize tables when this module is imported
init_db()

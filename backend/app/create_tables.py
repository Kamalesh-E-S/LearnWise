from app.database import Base, engine
from app.models import User, Creation, GraphNodes, ComprehensiveRoadmap

def create_tables():
    print("Creating database tables...")
    Base.metadata.drop_all(bind=engine)  # Drop existing tables
    Base.metadata.create_all(bind=engine)  # Create all tables
    print("Database tables created successfully!")

if __name__ == "__main__":
    create_tables()

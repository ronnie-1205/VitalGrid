from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Connect to SQLite
# This creates a file named 'vitalgrid.db' in the current folder.
SQLALCHEMY_DATABASE_URL = "sqlite:///./vitalgrid.db"

# We use connect_args={"check_same_thread": False} because SQLite strictly 
# restricts connections, but FastAPI needs to run requests simultaneously.
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# 2. Session Maker
# A 'Session' is like a shopping cart. You put data in the cart, 
# and when you are ready, you 'commit' (checkout) to save it to the database.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. The Base Class
# All our database tables will inherit from this Base.
Base = declarative_base()

# --- OUR DATABASE TABLES ---

class Facility(Base):
    __tablename__ = "facilities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # "Hub" or "Clinic"
    lat = Column(Float)
    lon = Column(Float)

class Medicine(Base):
    __tablename__ = "medicines"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    unit = Column(String)

class Inventory(Base):
    __tablename__ = "inventory"
    
    # Notice we don't have a simple ID. We make a unique ID for every record.
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"))
    medicine_id = Column(String, ForeignKey("medicines.id"))
    current_stock = Column(Integer)
    # We store the 90 days of history as a JSON object inside the cell
    consumption_history = Column(JSON) 

# Create the tables in the database file right now
Base.metadata.create_all(bind=engine)
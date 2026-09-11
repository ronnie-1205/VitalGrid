from backend.database import SessionLocal, Inventory
db = SessionLocal()
inv = db.query(Inventory).first()
print(type(inv.consumption_history))
print(inv.consumption_history)

import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, String
from backend.database.connection import Base

class BaseModel(Base):
    """Abstract Base Model providing UUID primary key and timestamp fields."""
    __abstract__ = True

    id = Column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4()), 
        index=True
    )
    created_at = Column(
        DateTime, 
        default=datetime.utcnow, 
        nullable=False
    )

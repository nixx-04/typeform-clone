from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.models.base import BaseModel

class Response(BaseModel):
    __tablename__ = "responses"

    form_id = Column(
        String(36), 
        ForeignKey("forms.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    submitted_at = Column(
        DateTime, 
        default=datetime.utcnow, 
        nullable=False,
        index=True
    )

    # Relationships
    form = relationship("Form", back_populates="responses")
    answers = relationship(
        "Answer", 
        back_populates="response", 
        cascade="all, delete-orphan"
    )

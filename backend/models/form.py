import enum
from sqlalchemy import Column, String, Enum
from sqlalchemy.orm import relationship
from backend.models.base import BaseModel

class FormStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"

class Form(BaseModel):
    __tablename__ = "forms"

    title = Column(String(255), nullable=False, index=True)
    status = Column(
        Enum(FormStatus), 
        default=FormStatus.DRAFT, 
        nullable=False,
        index=True
    )

    # Relationships
    questions = relationship(
        "Question", 
        back_populates="form", 
        cascade="all, delete-orphan",
        order_by="Question.order_index"
    )
    responses = relationship(
        "Response", 
        back_populates="form", 
        cascade="all, delete-orphan"
    )

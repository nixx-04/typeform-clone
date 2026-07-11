from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.models.base import BaseModel

class Answer(BaseModel):
    __tablename__ = "answers"

    response_id = Column(
        String(36), 
        ForeignKey("responses.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    question_id = Column(
        String(36), 
        ForeignKey("questions.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    value = Column(Text, nullable=False)  # Storing the response as text

    # Relationships
    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")

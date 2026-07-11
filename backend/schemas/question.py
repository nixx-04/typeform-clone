from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from backend.models.question import QuestionType

class QuestionBase(BaseModel):
    title: str
    type: QuestionType
    description: Optional[str] = None
    is_required: bool = False
    order_index: int
    options: Optional[List[str]] = None  # Choice list stored as JSON in DB

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[QuestionType] = None
    description: Optional[str] = None
    is_required: Optional[bool] = None
    order_index: Optional[int] = None
    options: Optional[List[str]] = None

class QuestionResponse(QuestionBase):
    id: str
    form_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

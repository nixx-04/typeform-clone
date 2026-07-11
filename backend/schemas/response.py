from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from backend.schemas.answer import AnswerCreate, AnswerResponse

class ResponseBase(BaseModel):
    form_id: str

class ResponseCreate(ResponseBase):
    answers: List[AnswerCreate]

class ResponseResponse(ResponseBase):
    id: str
    submitted_at: datetime
    answers: List[AnswerResponse] = []

    model_config = ConfigDict(from_attributes=True)

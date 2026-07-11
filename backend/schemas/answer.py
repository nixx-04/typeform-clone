from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional

class AnswerBase(BaseModel):
    question_id: str
    value: str

class AnswerCreate(AnswerBase):
    pass

class AnswerResponse(AnswerBase):
    id: str
    response_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

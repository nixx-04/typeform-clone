from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from backend.models.form import FormStatus

class FormBase(BaseModel):
    title: str
    status: FormStatus = FormStatus.DRAFT

class FormCreate(FormBase):
    pass

class FormUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[FormStatus] = None

class FormResponse(FormBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

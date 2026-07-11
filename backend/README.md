# Relational Typeform Backend (SQLite + SQLAlchemy + Alembic + FastAPI)

This is a modern, production-ready, relational backend designed for the Typeform workspace. It is fully decoupled and optimized for CRUD operations, drag-and-drop question ordering, comprehensive real-time analytics, and secure survey response storage.

## Features & Architectural Highlights

- **SQLAlchemy 2.0 ORM**: Implements declarative models with explicit table definitions, strict foreign keys, index optimization, and cascaded deletes (`ondelete="CASCADE"` and `cascade="all, delete-orphan"`).
- **UUID Primary Keys**: Every table uses fully secure, non-sequential UUIDs for primary keys to prevent ID scraping.
- **Alembic Migrations**: Fully structured migration history. Includes the initial migration file `1e9a3b75489f_initial_migration.py` to recreate the schema safely on any SQLite or PostgreSQL database.
- **FastAPI Framework**: High-performance, fully validated request/response schemas using **Pydantic v2** with auto-generated interactive API documentation (Swagger UI).
- **Idempotent Seeding**: Includes a seeding script `seed_data.py` that pre-populates your database with beautiful, realistic survey templates, questions, submissions, and response answers.

---

## Folder Structure

The project has been structured cleanly to promote modularity and clear separation of concerns:

```text
backend/
├── alembic/                # Alembic database migration scripts
│   ├── env.py              # Alembic environment config
│   ├── script.py.mako      # Alembic migration template
│   └── versions/           # Schema migration history files
├── database/
│   └── connection.py       # Session makers and engine configuration
├── models/                 # SQLAlchemy 2.0 Models
│   ├── base.py             # BaseModel with UUID & created_at
│   ├── form.py             # Form model & Status Enum
│   ├── question.py         # Question model & Type Enum
│   ├── response.py         # Response submission model
│   └── answer.py           # Individual question answer model
├── schemas/                # Pydantic validation schemas
│   ├── form.py
│   ├── question.py
│   ├── response.py
│   └── answer.py
├── crud/                   # High-performance CRUD & Analytics functions
│   ├── form.py
│   ├── question.py
│   └── response.py
├── seed/
│   └── seed_data.py        # Seed script for initial published forms & answers
├── main.py                 # FastAPI application entrypoint
├── requirements.txt        # Backend dependencies list
└── sqlite.db               # SQLite database file (generated on startup)
```

---

## Installation & Local Setup

### 1. Prerequisites
Ensure you have **Python 3.8+** installed on your machine.

### 2. Create a Virtual Environment
Navigate to this directory and create a virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Apply Database Migrations (Alembic)
Apply the initial migration to create your SQLite database file (`sqlite.db`) and configure all tables, keys, and indexes:
```bash
alembic upgrade head
```

### 5. Seed the Database
Populate the database with realistic template forms (Customer Satisfaction, Meetup Registration), comprehensive multi-choice answers, ratings, and submission histories:
```bash
python seed/seed_data.py
```

### 6. Run the FastAPI Server
Launch the development server to test the REST API:
```bash
uvicorn main:app --reload
```
Once started, you can access:
- **Interactive Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) (Swagger UI)
- **Alternative Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) (ReDoc)

---

## DB Schema Definition

### 1. Forms Table (`forms`)
- `id`: `String(36)` (UUID, Primary Key)
- `title`: `String(255)` (Index)
- `status`: `Enum(DRAFT, PUBLISHED)` (Index)
- `created_at`: `DateTime`

### 2. Questions Table (`questions`)
- `id`: `String(36)` (UUID, Primary Key)
- `form_id`: `String(36)` (Foreign Key → `forms.id` with `ondelete="CASCADE"`)
- `type`: `Enum(short_text, long_text, multiple_choice, dropdown, email, number, yes_no, rating)`
- `title`: `String(500)`
- `description`: `String(1000)` (Nullable)
- `is_required`: `Boolean`
- `order_index`: `Integer` (Index, optimized for drag-and-drop sorting)
- `options`: `JSON` (SQLite serialized JSON list of choices, nullable)
- `created_at`: `DateTime`

### 3. Responses Table (`responses`)
- `id`: `String(36)` (UUID, Primary Key)
- `form_id`: `String(36)` (Foreign Key → `forms.id` with `ondelete="CASCADE"`)
- `submitted_at`: `DateTime` (Index, optimized for time-series aggregation)
- `created_at`: `DateTime`

### 4. Answers Table (`answers`)
- `id`: `String(36)` (UUID, Primary Key)
- `response_id`: `String(36)` (Foreign Key → `responses.id` with `ondelete="CASCADE"`)
- `question_id`: `String(36)` (Foreign Key → `questions.id` with `ondelete="CASCADE"`)
- `value`: `Text` (Actual string/choice submitted)
- `created_at`: `DateTime`

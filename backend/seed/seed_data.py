import sys
import os
# Add the project root to python path so we can import 'backend'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from datetime import datetime, timedelta
from backend.database.connection import SessionLocal, engine, Base
from backend.models.form import Form, FormStatus
from backend.models.question import Question, QuestionType
from backend.models.response import Response
from backend.models.answer import Answer

def clear_db(db):
    """Clear all tables in the correct dependency order."""
    db.query(Answer).delete()
    db.query(Response).delete()
    db.query(Question).delete()
    db.query(Form).delete()
    db.commit()

def seed():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Clearing old seed data...")
        clear_db(db)
        
        print("Seeding new database data...")
        
        # ----------------------------------------------------
        # FORM 1: Customer Satisfaction Survey
        # ----------------------------------------------------
        form_feedback = Form(
            title="Customer Satisfaction Survey",
            status=FormStatus.PUBLISHED,
            created_at=datetime.utcnow() - timedelta(days=10)
        )
        db.add(form_feedback)
        db.flush()  # to get the ID for question form_id references
        
        # Questions for Customer Satisfaction
        q_fb_1 = Question(
            form_id=form_feedback.id,
            type=QuestionType.rating,
            title="How would you rate your overall experience with our service?",
            description="Your rating helps us improve daily.",
            is_required=True,
            order_index=0,
            options=None
        )
        q_fb_2 = Question(
            form_id=form_feedback.id,
            type=QuestionType.multiple_choice,
            title="Which feature of our product do you find most valuable?",
            description="Choose the one you spend the most time in.",
            is_required=True,
            order_index=1,
            options=["Dashboard Analytics", "Form Creator", "Team Workspaces", "Third-party Integrations"]
        )
        q_fb_3 = Question(
            form_id=form_feedback.id,
            type=QuestionType.yes_no,
            title="Have you encountered any major issues or bugs?",
            description="Please select honestly.",
            is_required=True,
            order_index=2,
            options=None
        )
        q_fb_4 = Question(
            form_id=form_feedback.id,
            type=QuestionType.long_text,
            title="Please describe the bugs or issues you encountered.",
            description="Be as detailed as possible so we can squash them.",
            is_required=False,
            order_index=3,
            options=None
        )
        q_fb_5 = Question(
            form_id=form_feedback.id,
            type=QuestionType.email,
            title="What is your email address? (Optional)",
            description="We will only contact you to follow up on your feedback.",
            is_required=False,
            order_index=4,
            options=None
        )
        
        db.add_all([q_fb_1, q_fb_2, q_fb_3, q_fb_4, q_fb_5])
        db.flush()
        
        # Submissions & Answers for Customer Satisfaction
        # Resp 1: Alice
        r_fb_1 = Response(form_id=form_feedback.id, submitted_at=datetime.utcnow() - timedelta(days=4))
        db.add(r_fb_1)
        db.flush()
        db.add_all([
            Answer(response_id=r_fb_1.id, question_id=q_fb_1.id, value="5"),
            Answer(response_id=r_fb_1.id, question_id=q_fb_2.id, value="Dashboard Analytics"),
            Answer(response_id=r_fb_1.id, question_id=q_fb_3.id, value="No"),
            Answer(response_id=r_fb_1.id, question_id=q_fb_5.id, value="alice@example.com")
        ])
        
        # Resp 2: Bob
        r_fb_2 = Response(form_id=form_feedback.id, submitted_at=datetime.utcnow() - timedelta(days=3))
        db.add(r_fb_2)
        db.flush()
        db.add_all([
            Answer(response_id=r_fb_2.id, question_id=q_fb_1.id, value="3"),
            Answer(response_id=r_fb_2.id, question_id=q_fb_2.id, value="Form Creator"),
            Answer(response_id=r_fb_2.id, question_id=q_fb_3.id, value="Yes"),
            Answer(response_id=r_fb_2.id, question_id=q_fb_4.id, value="The visual designer was sluggish on Safari when dragging elements."),
            Answer(response_id=r_fb_2.id, question_id=q_fb_5.id, value="bob@example.com")
        ])
        
        # Resp 3: Anonymous
        r_fb_3 = Response(form_id=form_feedback.id, submitted_at=datetime.utcnow() - timedelta(days=2))
        db.add(r_fb_3)
        db.flush()
        db.add_all([
            Answer(response_id=r_fb_3.id, question_id=q_fb_1.id, value="4"),
            Answer(response_id=r_fb_3.id, question_id=q_fb_2.id, value="Dashboard Analytics"),
            Answer(response_id=r_fb_3.id, question_id=q_fb_3.id, value="No")
        ])

        # Resp 4: Charlie
        r_fb_4 = Response(form_id=form_feedback.id, submitted_at=datetime.utcnow() - timedelta(days=1))
        db.add(r_fb_4)
        db.flush()
        db.add_all([
            Answer(response_id=r_fb_4.id, question_id=q_fb_1.id, value="5"),
            Answer(response_id=r_fb_4.id, question_id=q_fb_2.id, value="Third-party Integrations"),
            Answer(response_id=r_fb_4.id, question_id=q_fb_3.id, value="No"),
            Answer(response_id=r_fb_4.id, question_id=q_fb_5.id, value="charlie@example.com")
        ])
        
        # ----------------------------------------------------
        # FORM 2: Developer Meetup Registration
        # ----------------------------------------------------
        form_event = Form(
            title="Developer Meetup Registration",
            status=FormStatus.PUBLISHED,
            created_at=datetime.utcnow() - timedelta(days=5)
        )
        db.add(form_event)
        db.flush()
        
        # Questions for Event
        q_ev_1 = Question(
            form_id=form_event.id,
            type=QuestionType.short_text,
            title="What is your full name?",
            description="This will be printed on your physical badge.",
            is_required=True,
            order_index=0,
            options=None
        )
        q_ev_2 = Question(
            form_id=form_event.id,
            type=QuestionType.email,
            title="What email should we send your ticket to?",
            description="Double check for spelling typos.",
            is_required=True,
            order_index=1,
            options=None
        )
        q_ev_3 = Question(
            form_id=form_event.id,
            type=QuestionType.number,
            title="How many guests will you be bringing?",
            description="Maximum of 3 guests allowed per registered attendee.",
            is_required=True,
            order_index=2,
            options=None
        )
        q_ev_4 = Question(
            form_id=form_event.id,
            type=QuestionType.dropdown,
            title="Which main topic are you most excited to learn about?",
            description="Select from the dropdown list.",
            is_required=True,
            order_index=3,
            options=["Vite & React 19", "Full-stack Node.js", "Tailwind CSS v4 Engine", "Framer Motion Animations"]
        )
        
        db.add_all([q_ev_1, q_ev_2, q_ev_3, q_ev_4])
        db.flush()
        
        # Submissions & Answers for Event
        # Resp 1: John Doe
        r_ev_1 = Response(form_id=form_event.id, submitted_at=datetime.utcnow() - timedelta(days=2))
        db.add(r_ev_1)
        db.flush()
        db.add_all([
            Answer(response_id=r_ev_1.id, question_id=q_ev_1.id, value="John Doe"),
            Answer(response_id=r_ev_1.id, question_id=q_ev_2.id, value="john.doe@gmail.com"),
            Answer(response_id=r_ev_1.id, question_id=q_ev_3.id, value="1"),
            Answer(response_id=r_ev_1.id, question_id=q_ev_4.id, value="Vite & React 19")
        ])
        
        # Resp 2: Sarah Connor
        r_ev_2 = Response(form_id=form_event.id, submitted_at=datetime.utcnow() - timedelta(hours=12))
        db.add(r_ev_2)
        db.flush()
        db.add_all([
            Answer(response_id=r_ev_2.id, question_id=q_ev_1.id, value="Sarah Connor"),
            Answer(response_id=r_ev_2.id, question_id=q_ev_2.id, value="sconnor@skynet.com"),
            Answer(response_id=r_ev_2.id, question_id=q_ev_3.id, value="0"),
            Answer(response_id=r_ev_2.id, question_id=q_ev_4.id, value="Tailwind CSS v4 Engine")
        ])
        
        db.commit()
        print("Database seeded successfully with premium test data!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()

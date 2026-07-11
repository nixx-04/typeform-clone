"""Initial migration

Revision ID: 1e9a3b75489f
Revises: 
Create Date: 2026-07-11 04:12:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1e9a3b75489f'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Create Forms Table ---
    op.create_table(
        'forms',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('status', sa.Enum('DRAFT', 'PUBLISHED', name='formstatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_forms_id'), 'forms', ['id'], unique=False)
    op.create_index(op.f('ix_forms_status'), 'forms', ['status'], unique=False)
    op.create_index(op.f('ix_forms_title'), 'forms', ['title'], unique=False)

    # --- Create Questions Table ---
    op.create_table(
        'questions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('form_id', sa.String(length=36), nullable=False),
        sa.Column('type', sa.Enum('short_text', 'long_text', 'multiple_choice', 'dropdown', 'email', 'number', 'yes_no', 'rating', name='questiontype'), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=True),
        sa.Column('is_required', sa.Boolean(), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False),
        sa.Column('options', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['form_id'], ['forms.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_questions_form_id'), 'questions', ['form_id'], unique=False)
    op.create_index(op.f('ix_questions_id'), 'questions', ['id'], unique=False)
    op.create_index(op.f('ix_questions_order_index'), 'questions', ['order_index'], unique=False)

    # --- Create Responses Table ---
    op.create_table(
        'responses',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('form_id', sa.String(length=36), nullable=False),
        sa.Column('submitted_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['form_id'], ['forms.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_responses_form_id'), 'responses', ['form_id'], unique=False)
    op.create_index(op.f('ix_responses_id'), 'responses', ['id'], unique=False)
    op.create_index(op.f('ix_responses_submitted_at'), 'responses', ['submitted_at'], unique=False)

    # --- Create Answers Table ---
    op.create_table(
        'answers',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('response_id', sa.String(length=36), nullable=False),
        sa.Column('question_id', sa.String(length=36), nullable=False),
        sa.Column('value', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['response_id'], ['responses.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_answers_id'), 'answers', ['id'], unique=False)
    op.create_index(op.f('ix_answers_question_id'), 'answers', ['question_id'], unique=False)
    op.create_index(op.f('ix_answers_response_id'), 'answers', ['response_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_answers_response_id'), table_name='answers')
    op.drop_index(op.f('ix_answers_question_id'), table_name='answers')
    op.drop_index(op.f('ix_answers_id'), table_name='answers')
    op.drop_table('answers')
    op.drop_index(op.f('ix_responses_submitted_at'), table_name='responses')
    op.drop_index(op.f('ix_responses_id'), table_name='responses')
    op.drop_index(op.f('ix_responses_form_id'), table_name='responses')
    op.drop_table('responses')
    op.drop_index(op.f('ix_questions_order_index'), table_name='questions')
    op.drop_index(op.f('ix_questions_id'), table_name='questions')
    op.drop_index(op.f('ix_questions_form_id'), table_name='questions')
    op.drop_table('questions')
    op.drop_index(op.f('ix_forms_title'), table_name='forms')
    op.drop_index(op.f('ix_forms_status'), table_name='forms')
    op.drop_index(op.f('ix_forms_id'), table_name='forms')
    op.drop_table('forms')

"""updated camp model

Revision ID: 004d2d88d2ce
Revises: 
Create Date: 2025-02-11 17:22:49.175398

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004d2d88d2ce'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('camp',
    sa.Column('cid', sa.Integer(), nullable=False),
    sa.Column('camp_name', sa.String(length=100), nullable=False),
    sa.Column('location', sa.String(length=100), nullable=False),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('capacity', sa.Integer(), nullable=False),
    sa.Column('num_people_present', sa.Integer(), nullable=True),
    sa.Column('food_stock_quota', sa.Integer(), nullable=True),
    sa.Column('water_stock_litres', sa.Integer(), nullable=True),
    sa.Column('contact_number', sa.String(length=20), nullable=True),
    sa.Column('announcements', sa.Text(), nullable=True),
    sa.Column('people_list', sa.PickleType(), nullable=True),
    sa.PrimaryKeyConstraint('cid'),
    sa.UniqueConstraint('camp_name')
    )
    op.create_table('user',
    sa.Column('uid', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=50), nullable=False),
    sa.Column('email', sa.String(length=100), nullable=False),
    sa.Column('password', sa.String(length=255), nullable=False),
    sa.Column('associated_camp_id', sa.Integer(), nullable=True),
    sa.Column('friend_list', sa.PickleType(), nullable=True),
    sa.Column('family_list', sa.PickleType(), nullable=True),
    sa.Column('role', sa.String(length=20), nullable=False),
    sa.Column('location', sa.String(length=100), nullable=True),
    sa.Column('mobile', sa.String(length=20), nullable=True),
    sa.ForeignKeyConstraint(['associated_camp_id'], ['camp.cid'], ),
    sa.PrimaryKeyConstraint('uid'),
    sa.UniqueConstraint('email')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('user')
    op.drop_table('camp')
    # ### end Alembic commands ###

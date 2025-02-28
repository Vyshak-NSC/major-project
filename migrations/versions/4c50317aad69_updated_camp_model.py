"""updated camp model

Revision ID: 4c50317aad69
Revises: 004d2d88d2ce
Create Date: 2025-02-11 17:47:24.038841

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4c50317aad69'
down_revision = '004d2d88d2ce'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('camp', schema=None) as batch_op:
        batch_op.add_column(sa.Column('coordinates_lat', sa.Float(), nullable=False))
        batch_op.add_column(sa.Column('coordinates_lng', sa.Float(), nullable=False))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('camp', schema=None) as batch_op:
        batch_op.drop_column('coordinates_lng')
        batch_op.drop_column('coordinates_lat')

    # ### end Alembic commands ###

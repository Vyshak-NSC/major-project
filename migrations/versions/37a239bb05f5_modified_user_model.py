"""modified user model

Revision ID: 37a239bb05f5
Revises: 15004267aeaf
Create Date: 2025-03-10 10:37:22.252844

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '37a239bb05f5'
down_revision = '15004267aeaf'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('friend_list')
        batch_op.drop_column('family_list')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('family_list', sa.BLOB(), nullable=True))
        batch_op.add_column(sa.Column('friend_list', sa.BLOB(), nullable=True))

    # ### end Alembic commands ###

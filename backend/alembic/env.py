from alembic import context
from app.database import engine, Base
from app.core.models import *  # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", None)

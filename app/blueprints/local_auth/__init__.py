from flask import Blueprint
local_auth_bp = Blueprint('local_auth',__name__)
from .routes import *
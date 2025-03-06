from flask import Blueprint
warehouse_bp = Blueprint('warehouse_manager',__name__, url_prefix='/warehouse_manager')
from .routes import *
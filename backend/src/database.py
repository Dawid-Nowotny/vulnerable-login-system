import psycopg2
from psycopg2.extras import RealDictCursor

from config import get_database_config

def get_db_connection() -> psycopg2.extensions.connection:
    db_config = get_database_config()
    
    conn = psycopg2.connect(
        host=db_config['host'],
        database=db_config['database'],
        user=db_config['user'],
        password=db_config['password'],
        cursor_factory=RealDictCursor,
    )
    return conn
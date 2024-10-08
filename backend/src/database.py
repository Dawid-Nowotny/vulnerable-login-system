import asyncpg

from config import get_database_config

async def get_db_connection() -> asyncpg.connection.Connection:
    db_config = get_database_config()
    
    conn = await asyncpg.connect(
        host=db_config['host'],
        database=db_config['database'],
        user=db_config['user'],
        password=db_config['password'],
    )
    return conn
import configparser

config = configparser.ConfigParser()
config.read("..\\..\\config.ini")

def get_database_config():
    db_config = {
        'host': config['database']['host'],
        'database': config['database']['database'],
        'user': config['database']['user'],
        'password': config['database']['password'],
    }
    return db_config

def get_secure_mode():
    return config.getboolean('settings', 'secure_mode')
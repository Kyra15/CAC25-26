import sqlite3
import bcrypt

def get_db():
    db = sqlite3.connect('conquercode.db')
    db.row_factory = sqlite3.Row
    return db

def init_db():
    conn = get_db()

    conn.execute('''CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        email TEXT,
                        username TEXT NOT NULL,
                        hashed_password BLOB)''')
    
    conn.commit()
    conn.close()

def add_user(name, email, username, password):
    conn = get_db()
    hashable_pw = password.encode('utf-8')
    hashed_pw = bcrypt.hashpw(hashable_pw, bcrypt.gensalt())
    conn.execute('''INSERT INTO users (name, email, username, hashed_password) 
                 VALUES (?, ?, ?, ?)''',
                 (name, email, username, hashed_pw))
    conn.commit()
    print(f"user {username} registered successfully.")
    conn.close()


def drop_table():
    conn = get_db()
    conn.execute('''DROP TABLE IF EXISTS users;''')
    conn.commit()
    conn.close()
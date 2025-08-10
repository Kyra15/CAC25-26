from flask import Flask, render_template, url_for, redirect, jsonify, request, g
import contextlib
import io
from tqdm import tqdm
import torch
import numpy as np
import sqlite3
import pandas
import sklearn
import math
import random
import bcrypt
# ok so one problem i have is that you can't import anything within the code editor
# you have to do it up here

# i love flask so much its not funny.

app = Flask(__name__)



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
    print(f"User '{username}' registered successfully.")
    conn.close()


def drop_table():
    conn = get_db()
    conn.execute('''DROP TABLE IF EXISTS users;''')
    conn.commit()
    conn.close()





@app.route("/")
def home():
    return redirect(url_for("signin"), code=302)

@app.route("/signin")
def signin():
    return render_template('signin.html')

@app.route("/lesson")
def lesson():
    return render_template('lesson.html')

# @app.route('/lesson/<unit>/<lesson_num>')
# def lesson(unit, lesson_num):
#     return render_template('lesson.html', 
#                          json_path=f'static/json/u{unit}l{lesson_num}.json')

@app.route("/editor")
def editor():
    return render_template('editor.html')

# erm
@app.route('/run', methods=['POST'])
def run_code():
    # basically get from js and store in computer mem
    code = request.json.get('code', '')
    stdout = io.StringIO()

    safe_builtins = {
        'print': print,
        'len': len,
        'str': str,
        'int': int,
        'float': float,
        'bool': bool,
        'list': list,
        'dict': dict,
        'range': range,
        'max': max,
        'min': min,
        'sum': sum,
        'abs': abs,
        'input': input,
    }

    # then execute the code within and also have pytorch and then show error if u get one
    try:
        with contextlib.redirect_stdout(stdout):
            exec(code, {"__builtins__": safe_builtins, "torch": torch})
        output = stdout.getvalue()
    except Exception as e:
        output = str(e)
    
    # export response as json (back to js)
    response = jsonify({"output": output})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    drop_table()
    init_db()
    add_user("Kayla Wang", "kw@gmail.com", "1", "1")
    app.run(debug=True, port=4200)



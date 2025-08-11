from flask import Flask, render_template, url_for, redirect, jsonify, request, g, flash
import sqlfunc as sql
import sqlite3
import bcrypt
import contextlib
import io
import torch
import numpy as np
import pandas
import sklearn
import math
import random

# ok so one problem i have is that you can't import anything within the code editor
# you have to do it up here

# i love flask so much its not funny.

app = Flask(__name__)

app.secret_key = 'conquercode-blah-blah-1234'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect('conquercode.db')
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()



def init_db():
    with app.app_context():
        conn = get_db()
        conn.execute('''CREATE TABLE IF NOT EXISTS users (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT,
                            email TEXT,
                            username TEXT NOT NULL,
                            hashed_password BLOB)''')
        conn.commit()

def add_user(name, email, username, password):
    with app.app_context():
        conn = get_db()
        hashable_pw = password.encode()
        hashed_pw = bcrypt.hashpw(hashable_pw, bcrypt.gensalt())
        conn.execute('''INSERT INTO users (name, email, username, hashed_password) 
                     VALUES (?, ?, ?, ?)''',
                     (name, email, username, hashed_pw))
        conn.commit()
        print(f"user {username} registered successfully.")


# def verify_user(user, pw):
#     with app.app_context():
#         conn = get_db()
#         db_pw = conn.execute('''SELECT * FROM users
#                         WHERE username = ?''', user)
#         if bcrypt.check_password_hash(db_pw, pw):
#             print("right password!") 
#         else:
#             print("wrong password")


def drop_table():
    with app.app_context():
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


@app.route('/users_testbank', methods=['GET'])
def get_users():
    conn = get_db()
    users = conn.execute('SELECT * FROM users').fetchall()

    user_list = [dict(user) for user in users]

    return jsonify(user_list)


@app.route('/sign_up_data', methods=['POST'])
def su_handle_data():
    email = request.form['email']
    password = request.form['password']
    conf_password = request.form['conf_password']

    conn = get_db()
    cur = conn.execute('''SELECT * FROM users
                       WHERE email = ?''', (email,))

    if cur:
        flash("An account with this email already exists. Login instead of signing up!", "signup")
        return redirect(url_for("signin"), code=302) 
    if password == conf_password:
        flash("Account made successfully!", "signup")
        return redirect(url_for("lesson"), code=302) 
    else:
        flash("Passwords do not match. Check for typos!", "signup")
        return redirect(url_for("signin"), code=302) 

@app.route('/login_data', methods=['POST'])
def lg_handle_data():
    user = request.form['username']
    pw = request.form['password_log'].encode()

    conn = get_db()
    cur = conn.execute('''SELECT * FROM users
                 WHERE username = ?''', (user,))
    
    db_user = cur.fetchone()
    
    if db_user:
        db_pw = db_user["hashed_password"]
        if bcrypt.checkpw(pw, db_pw):
            flash("Logged in successfully!", "login")
            return redirect(url_for("lesson"), code=302)
        else:
            flash("Wrong password. Try again!", "login")
            return redirect(url_for("signin"), code=302)
    else:
        flash("User not found. Sign up!", "login")
        return redirect(url_for("signin"), code=302)
    


drop_table()
init_db()
add_user("Kayla Wang", "k@gmail.com", "1", "1")

if __name__ == '__main__':
    app.run(debug=True, port=4200)



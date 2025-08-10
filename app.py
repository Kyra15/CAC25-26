from flask import Flask, render_template, url_for, redirect, jsonify, request
import contextlib
import io
from tqdm import tqdm
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
    app.run(debug=True, port=4200)
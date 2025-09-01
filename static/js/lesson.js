// loading in the lesson text

let json_data = null;
let currentSectionIndex = 1;
let img_ind = 0;
let qind = 0;

async function fetchJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch data:', error);
        return null;
    }
}

function updateHTML(data) {
    document.getElementById("lesson-title").innerText = data["title"];
    document.getElementById("unit-title").innerText = data["unit"];
}


function showSection(sec) {
    console.log(sec)
    const newSec = document.createElement('div');
    const headSec = document.createElement("h2");
    const textSec = document.createElement("p");

    const bar = document.getElementById("lesson-progressbar")

    let sectionKeys = Object.keys(json_data).filter(key => key.startsWith("section"));

    headSec.innerHTML = sec["header"];

    textSec.style = "font-size: 16px;"

    document.getElementById("sec-text").append(newSec);
    newSec.append(headSec);
    newSec.append(textSec);

    codefont(sec)
    findImage(sec, newSec)
    findEdit(sec)
    findQuiz(sec)
    textSec.innerHTML = sec["text"] + "<br><br>";

    const nextBtn = document.getElementById("btn-span");
    const btnBrk = document.getElementById("btn-break")
    nextBtn.remove();
    btnBrk.remove();
    document.getElementById("sec-text").append(nextBtn);
    document.getElementById("sec-text").append(btnBrk);
    const lessonText = document.querySelector('.lesson-text');
    lessonText.scrollTo({
                top: lessonText.scrollHeight,
                behavior: 'smooth'
                });
    bar.style.width = `${(currentSectionIndex / sectionKeys.length) * 100}%`
    currentSectionIndex += 1;
    Prism.highlightAll()
}

function codefont(sec) {
    if (sec["code"]) {
        sec["code"].forEach((code, index) => {
            const codeBlock = `<pre><code class="language-python">${escapeHtml(code)}</code></pre>`;
            sec["text"] = sec["text"].replace(`{{CODE_BLOCK_${index}}}`, codeBlock);
        });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


function findImage(sec, new_sec) {
    while (sec["text"].indexOf("*img*") >= 0) {
        const fig = document.createElement("figure")
        const img = document.createElement('img');
        const cap = document.createElement("figcaption")

        img.src = "static/images/" + sec["images"][img_ind];
        cap.innerHTML = sec["caption"][img_ind] + "<br><br>"
        console.log(img.src)
        new_sec.append(fig);
        fig.append(img)
        fig.append(cap)
        sec["text"] = sec["text"].replace("*img*", "<br><br>")
        img_ind += 1;
    }
}


function findQuiz(sec) {
    while (sec["text"].indexOf("*quiz*") >= 0) {
        sec["text"] = sec["text"].replace("*quiz*", "<br>")
        setTimeout(() => {
            toggleQuiz();
        }, 600);
    }
}

function toggleQuiz() {
    console.log("toggle quiz")
    const act_box = document.getElementsByClassName("activity-box")[0]
    const quiz_q = document.getElementsByClassName("quiz-question")[0]
    const quiz = document.getElementsByClassName("quiz")[0]
    const next_btn = document.getElementById("btn-span")

    if (act_box.classList.contains("hidden")) {

        act_box.classList.remove("hidden");
        quiz_q.classList.remove("hidden");
        quiz.classList.remove("hidden");
        next_btn.classList.add("hidden");
        
        act_box.style.height = "0px";
        act_box.style.overflow = "hidden";
        
        const targetHeight = "40vh";
        
        act_box.offsetHeight;
        act_box.style.height = targetHeight;

        const questions = json_data[`section${currentSectionIndex - 1}`]["activity"]

        qind = 0

        const q_keys = Object.keys(questions);
        showQuestion(q_keys[qind], questions[q_keys[qind]]);

        
        setTimeout(() => {
            const lessonText = document.querySelector('.lesson-text');
            lessonText.scrollTo({
                top: lessonText.scrollHeight,
                behavior: 'smooth'
            });
            act_box.style.overflow = "visible";
        }, 300);
        
    } else {
        act_box.style.height = act_box.offsetHeight + "px";
        act_box.style.overflow = "hidden";

        act_box.offsetHeight;
        act_box.style.height = "0px";
        
        next_btn.classList.remove("hidden");
        
        setTimeout(() => {
            act_box.classList.add("hidden");
            quiz_q.classList.add("hidden");
            quiz.classList.add("hidden");
            act_box.style.overflow = "";
        }, 300);
    }
}


function showQuestion(question, options) {
    document.getElementById("directions_quiz").innerHTML = question
    for (let i = 0; i < options.length; i++) {
        document.querySelectorAll(".quiz button")[i].innerHTML = `<span class="front">${options[i]}</span>
                                                                 <span class="back">ans</span>`
    }
}

function checkAnswerQuiz(ind) {
    const qlst = Object.keys(json_data[`section${currentSectionIndex - 1}`]["activity"])
    console.log(qind)
    const answers = json_data[`section${currentSectionIndex - 1}`]["answer"]

    if (ind == answers[qind][0]) {
        correct()
    } else {
        incorrect()
    }

    quizShowAns(answers[qind], ind)

    if (qind == qlst.length) {
        setTimeout(() => {
            toggleQuiz()
            nextSection()
        }, 6000);
    }
}

function quizShowAns(answer, clicked_ind) {
    qind += 1;
    // make all buttons disappear except for that one 
    // then let it go onto the next question by doing show question

    const buttons = document.querySelectorAll(".buttons button") 

    let ans_ind = answer[0]
    
    let ans_button = buttons[ans_ind]

    for (const q of buttons) {
        q.style.visibility = "hidden"
    }

    ans_button.style.visibility = "visible"

    let back = ans_button.children[1]
    back.innerHTML = answer[1]

    buttons[clicked_ind].style.visibility = "visible"

    setTimeout(() => {
        ans_button.classList.add('flipped');
    }, 1000);

    setTimeout(() => {
        const questions = json_data[`section${currentSectionIndex - 1}`]["activity"];
        const q_keys = Object.keys(questions);
        
        if (qind < q_keys.length) {
            const next_q = q_keys[qind];
            const next_ops = questions[next_q];
            
            for (const btn of buttons) {
                btn.style.visibility = "visible";
                btn.classList.remove('flipped');
            }
            
            showQuestion(next_q, next_ops);
        }
    }, 5000);

}


function findEdit(sec) {
    while (sec["text"].indexOf("*edit*") >= 0) {
        sec["text"] = sec["text"].replace("*edit*", "<br>")
        setTimeout(() => {
            toggleEditor();
        }, 600);
    }
}


function toggleEditor() {
    const act_box = document.getElementsByClassName("activity-box")[0];
    const instruct = document.getElementsByClassName("instructions")[0];
    const mini_edit = document.getElementsByClassName("mini-editor")[0];
    const next_btn = document.getElementById("btn-span");
    
    if (act_box.classList.contains("hidden")) {
        console.log("editor shown")

        act_box.classList.remove("hidden");
        instruct.classList.remove("hidden");
        mini_edit.classList.remove("hidden");
        
        act_box.style.height = "0px";
        act_box.style.overflow = "hidden";
        
        const targetHeight = "40vh";
        
        act_box.offsetHeight;
        act_box.style.height = targetHeight;

        next_btn.classList.add("hidden");

        document.getElementById("directions_edit").innerHTML = json_data[`section${currentSectionIndex - 1}`]["activity"]
        
        setTimeout(() => {
            const lessonText = document.querySelector('.lesson-text');
            lessonText.scrollTo({
                top: lessonText.scrollHeight,
                behavior: 'smooth'
            });
            act_box.style.overflow = "visible";
            initCodeMirror();
            document.getElementById("submitcode").disabled = true
        }, 300);
        
    } else {
        console.log("editor hidden")
        act_box.style.height = act_box.offsetHeight + "px";
        act_box.style.overflow = "hidden";

        act_box.offsetHeight;
        act_box.style.height = "0px";
        
        next_btn.classList.remove("hidden");
        
        setTimeout(() => {
            act_box.classList.add("hidden");
            instruct.classList.add("hidden");
            mini_edit.classList.add("hidden");
            act_box.style.overflow = "";
        }, 300);
    }
}


function nextSection() {
    console.log("next")
    const nextBtn = document.getElementById("btn-span")
    const btnBrk = document.getElementById("btn-break")
    nextBtn.remove();
    btnBrk.remove();
    document.getElementById("sec-text").append(nextBtn);
    document.getElementById("sec-text").append(btnBrk);
    let sectionKeys = Object.keys(json_data).filter(key => key.startsWith("section"));
    if (currentSectionIndex == sectionKeys.length) {
        nextBtn.style = "background-color: var(--orange)"
        nextBtn.innerText = "End"
    } else {
        showSection(json_data[`section${currentSectionIndex}`])
    }
}

async function loadDataHTML() {
    json_data = await fetchJSON(json_path);
    if (json_data) {
        updateHTML(json_data);
        showSection(json_data["section1"])
    }
}


loadDataHTML()


let output = null
let editor = null

function initCodeMirror() {
    if (editor) {
        editor.toTextArea();
        editor = null;
    }
    // code for the editor activity box
    output = document.getElementById("output");

    editor = CodeMirror.fromTextArea(document.getElementById("code"), {
        mode: {
                name: "python",
                version: 3,
                singleLineStringErrors: false
            },
            lineNumbers: true,
            indentUnit: 4,
            matchBrackets: true,
            indentWithTabs: true,
            theme: "ghcolors",
        });
        
        editor.setValue("# write your code here\nprint(\"hello world\")")
        output.value = "hello world"
        editor.getWrapperElement().style.borderTopLeftRadius = "0";
        editor.getWrapperElement().style.borderTopRightRadius = "0";
}

function addToOutput(s) {
    console.log(s)
    const output_val = document.getElementById("output");
    output_val.value = s;
}

function runCode() {
    if ( document.getElementById("submitcode").disabled == true) {
        document.getElementById("submitcode").disabled = false
    }
    
    output.value = "Loading..."
    fetch("http://127.0.0.1:4200/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: editor.getValue() }),
    })
      .then((res) => res.json())
      .then((data) => {
        addToOutput(data.output);
    });
}

// const hint = document.querySelector(".code-overlay");

// // https://stackoverflow.com/questions/76837048/creating-the-simplest-html-toggle-button
// const hint_button = document.getElementById('hint')
// hint_button.addEventListener('click', (e) => e.target.closest('button').classList.toggle('pressed'))

// function giveHint() {
//     if (hint.innerText.trim() == "") {
//         console.log("toggle on")
//         hint.innerText = json_data;
//         var lastLine = editor.lineCount() - 1;
//         if (editor.getLine(lastLine).trim() != "") {
//             const Pos = editor.constructor.Pos;
//             editor.replaceRange("\n", Pos(editor.lineCount(), 0));
//         }

//         lastLine = editor.lineCount() - 1
//         const coords = editor.charCoords({ line: lastLine, ch: 0 }, "page");
//         const editorCoords = editor.getWrapperElement().getBoundingClientRect();

//         hint.style.top = `${coords.top - editorCoords.top - 2.5}px`;
//         hint.style.left = `${coords.left - editorCoords.left}px`;
//     }
//     else {
//         console.log("toggle off")
//         hint.innerText = "";
//     }
// }


async function checkAnswerCode() {
    sec = json_data[`section${currentSectionIndex - 1}`]

    // check if input has what we want
    // then check if the output gives us the write stuff if WE input stuff

    input = editor.getValue()

    let is_correct = true

    let input_ans = sec["answer"][0]
    let output_ans = sec["answer"][1]
    let test_vals = sec["answer"][2]

    for (let i = 0; i < input_ans.length; i++) {
        console.log(input_ans[i])
        if (!input.includes(input_ans[i])) {
            console.log("input wrong")
            is_correct = false
        }
    }

    for (let t = 0; t < test_vals.length; t++) {

        let assignments = "";
        console.log(test_vals[t])

        for (let [varName, value] of Object.entries(test_vals[t])) {

            new_input = input.replace(varName, `USERINPUT${t}`)

            if (typeof test_vals[t] === "string") {
                value = JSON.stringify(value)
            }

            assignments += `${varName} = ${value}\n`;
            console.log(varName, value)
        }

        let wrapped_code = assignments + new_input;

        let res = await fetch("http://127.0.0.1:4200/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: wrapped_code }),
        });
        let data = await res.json();

        let output = data.output.trim();

        if (output != output_ans[t]) {
            console.log(`Test ${t} failed: expected '${output_ans[t]}' got '${output}'`);
            is_correct = false;
        }
    }

    if (is_correct) {
        correct()
        toggleEditor()
        nextSection()
    } else {
        incorrect()
    }
}


function correct() {
    const overlay_lst = Array.from(document.getElementsByClassName("overlay"))

    let overlay_new = overlay_lst.filter(item => !item.parentNode.classList.contains("hidden"));

    overlay_new.forEach((overlay) => {

        overlay.style.opacity = 1;
        overlay.setAttribute('transition-style', 'in:wipe:right');

        setTimeout(() => {
            overlay.setAttribute('transition-style', 'out:wipe:right');
            overlay.addEventListener("animationend", () => {
                overlay.removeAttribute("transition-style");
                overlay.style.opacity = 0;
            }, { once: true });
        }, 1200);

    });
}

function incorrect() {
    console.log("wrong")
}


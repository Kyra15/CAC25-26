// loading in the lesson text
var json_path = "static/json/u1l1.json"

let json_data = null;
let currentSectionIndex = 1;
let img_ind = 0;

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
    console.log("balls", data)
    document.getElementById("lesson-title").innerText = data["title"];
    document.getElementById("unit-title").innerText = data["unit"];
}


function showSection(sec) {
    console.log(sec)
    const newSec = document.createElement('div');
    const headSec = document.createElement("h2");
    const textSec = document.createElement("p");

    headSec.innerHTML = sec["header"];

    textSec.style = "font-size: 16px;"

    document.getElementById("sec-text").append(newSec);
    newSec.append(headSec);
    newSec.append(textSec);
    currentSectionIndex += 1;

    codefont(sec)
    findImage(sec, newSec)
    findEdit(sec)
    findQuiz(sec)
    textSec.innerHTML = sec["text"];

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
}

function codefont(sec) {
    while (sec["text"].indexOf("*cf*") >= 0) {
        sec["text"] = sec["text"].replace("*cf*", '<span style="font-family: &#34;Courier New&#34;, monospace;">')
    }

    while (sec["text"].indexOf("*/cf*") >= 0) { 
        sec["text"] = sec["text"].replace("*/cf*", '</span>')
    }
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
        toggleQuiz();
        sec["text"] = sec["text"].replace("*quiz*", "<br>")
    }
}

function toggleQuiz() {
    const act_box = document.getElementsByClassName("activity-box")[0]
    const quiz_q = document.getElementsByClassName("quiz-question")[0]
    const quiz = document.getElementsByClassName("quiz")[0]
    const next_btn = document.getElementById("btn-span")

    if ("hidden" in act_box.classList) {
        act_box.classList.remove("hidden")
        quiz_q.classList.remove("hidden")
        quiz.classList.remove("hidden")
        next_btn.classList.add("hidden")
    } else {
        act_box.classList.add("hidden")
        quiz_q.classList.add("hidden")
        quiz.classList.add("hidden")
        next_btn.classList.remove("hidden")
    }
   
}


function findEdit(sec) {
    while (sec["text"].indexOf("*edit*") >= 0) {
        toggleEditor();
        sec["text"] = sec["text"].replace("*edit*", "<br>")
    }
}

// function toggleEditor() {
//     const act_box = document.getElementsByClassName("activity-box")[0]
//     const instruct = document.getElementsByClassName("instructions")[0]
//     const mini_edit = document.getElementsByClassName("mini-editor")[0]
//     const next_btn = document.getElementById("btn-span")
// 
//     if (act_box.classList.contains("hidden")) {
//         console.log("unhidden")
//         act_box.classList.remove("hidden")
//         // instruct.classList.remove("hidden")
//         // mini_edit.classList.remove("hidden")
//         next_btn.classList.add("hidden")
//         setTimeout(() => {
//             initCodeMirror();
//         }, 250);
//     } else {
//         act_box.classList.add("hidden")
//         // instruct.classList.add("hidden")
//         // mini_edit.classList.add("hidden")
//         next_btn.classList.remove("hidden")
//     }
// }


function toggleEditor() {
    const act_box = document.getElementsByClassName("activity-box")[0];
    const instruct = document.getElementsByClassName("instructions")[0];
    const mini_edit = document.getElementsByClassName("mini-editor")[0];
    const next_btn = document.getElementById("btn-span");
    
    if (act_box.classList.contains("hidden")) {

        act_box.classList.remove("hidden");
        instruct.classList.remove("hidden");
        mini_edit.classList.remove("hidden");
        
        act_box.style.height = "0px";
        act_box.style.overflow = "hidden";
        
        const targetHeight = "40vh";
        
        act_box.offsetHeight;
        act_box.style.height = targetHeight;
        
        next_btn.classList.add("hidden");
        
        setTimeout(() => {
            const lessonText = document.querySelector('.lesson-text');
            lessonText.scrollTo({
                top: lessonText.scrollHeight,
                behavior: 'smooth'
            });
            act_box.style.overflow = "visible";
            initCodeMirror();
        }, 300);
        
    } else {
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
    showSection(json_data[`section${currentSectionIndex}`])
}

async function loadDataHTML() {
    json_data = await fetchJSON(json_path);
    if (json_data) {
        updateHTML(json_data);
        showSection(json_data["section1"])
    }
}


loadDataHTML()

// next section button
// show section and next section functions

let output = null
let editor = null

function initCodeMirror() {
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
        });
        editor.setValue("# write your code here\nprint(\"hello world\")")
        output.value = "hello world"
}

function addToOutput(s) {
    console.log(s)
    output.value = ""
    output.value += s + "\n";
}

function runCode() {
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

const hint = document.querySelector(".code-overlay");

// https://stackoverflow.com/questions/76837048/creating-the-simplest-html-toggle-button
const hint_button = document.getElementById('hint')
hint_button.addEventListener('click', (e) => e.target.closest('button').classList.toggle('pressed'))

function giveHint() {
    if (hint.innerText.trim() == "") {
        console.log("toggle on")
        hint.innerText = "my_num = 8\nprint(my_num)";
        var lastLine = editor.lineCount() - 1;
        if (editor.getLine(lastLine).trim() != "") {
            const Pos = editor.constructor.Pos;
            editor.replaceRange("\n", Pos(editor.lineCount(), 0));
        }

        lastLine = editor.lineCount() - 1
        const coords = editor.charCoords({ line: lastLine, ch: 0 }, "page");
        const editorCoords = editor.getWrapperElement().getBoundingClientRect();

        hint.style.top = `${coords.top - editorCoords.top}px`;
        hint.style.left = `${coords.left - editorCoords.left}px`;
    }
    else {
        console.log("toggle off")
        hint.innerText = "";
    }
}


function checkAnswerCode() {
    sec = json_data[`section${currentSectionIndex}`]
    // basically check if the code has the output we want and that the output has the number we want
}


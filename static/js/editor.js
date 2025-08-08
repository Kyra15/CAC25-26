// https://www.geeksforgeeks.org/python/build-python-code-editor-using-codemirror-and-pyodide/
// i freaking hate js im never coding in ts every again

const output = document.getElementById("output");

const editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    mode: {
        name: "python",
        version: 3,
        singleLineStringErrors: false
    },
    lineNumbers: true,
    indentUnit: 4,
    matchBrackets: true,
});
editor.setValue("# write your code here\nprint(\"hello world\")")
output.value = "hello world"

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


// https://www.w3schools.com/howto/howto_js_tabs.asp
document.getElementsByClassName("default-open")[0].click();
function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}
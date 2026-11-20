(() => {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const editor = byId("code");
  const languageSelect = byId("language");
  const fontSizeSelect = byId("font-size");
  const lineNumbers = byId("lines");
  const hintLayer = byId("editor-hint");
  const runButton = byId("run");
  const checkButton = byId("check");
  const copyButton = byId("copy-code");
  const clearButton = byId("clear-terminal");
  const terminal = byId("terminal");
  const terminalOutput = byId("terminal-output");
  const terminalInput = byId("terminal-input");
  const statusLabel = byId("status");
  const questionGrid = byId("questions");
  const statement = byId("statement");

  const questions = typeof mnsQuestions === "undefined" ? [] : mnsQuestions;
  const hint = "// Write your code here";
  const starters = {
    cpp: {
      icon: "C++",
      filename: "main.cpp",
      code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    ${hint}

    return 0;
}
`
    },
    java: {
      icon: "JAVA",
      filename: "Main.java",
      code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        ${hint}
    }
}
`
    },
    csharp: {
      icon: "C#",
      filename: "Program.cs",
      code: `using System;

class Program {
    static void Main() {
        ${hint}
    }
}
`
    }
  };

  const drafts = new Map();
  const tiles = [];
  let selectedIndex = -1;
  let runSocket = null;
  let grading = false;
  let copyTimer;

  function addText(parent, tag, text, className = "") {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    parent.append(element);
    return element;
  }

  function updateControls() {
    runButton.disabled = grading;
    checkButton.disabled = grading || Boolean(runSocket) || selectedIndex < 0;
    languageSelect.disabled = grading || Boolean(runSocket);
  }

  function showQuestion(index) {
    const question = questions[index];
    if (!question) return;

    selectedIndex = index;
    for (const [tileIndex, { button }] of tiles.entries()) {
      button.setAttribute("aria-pressed", String(tileIndex === index));
    }

    statement.replaceChildren();
    statement.hidden = false;
    statement.style.setProperty("display", "block", "important");
    statement.lang = "en";
    statement.dir = "ltr";

    const heading = addText(statement, "h3", question.title);
    addText(statement, "p", question.description);
    addText(statement, "h4", "Input");
    addText(statement, "p", question.input);
    addText(statement, "h4", "Example output");
    addText(statement, "pre", question.sample ?? question.cases[0].expected);

    updateControls();

    requestAnimationFrame(() => {
      if (selectedIndex !== index) return;
      const bounds = heading.getBoundingClientRect();
      if (bounds.top < 0 || bounds.bottom > window.innerHeight) {
        heading.scrollIntoView({ block: "nearest" });
      }
    });
  }

  questionGrid.replaceChildren();

  for (const [index, question] of questions.entries()) {
    const button = addText(
      questionGrid, "button", question.label ?? `Question ${index + 1}`, "question-tile"
    );
    button.type = "button";
    button.setAttribute("aria-controls", "statement");
    button.setAttribute("aria-pressed", "false");

    const score = addText(button, "span", "", "question-score");
    score.hidden = true;
    tiles.push({ button, score });

    button.addEventListener("click", () => showQuestion(index));
  }

  if (!questions.length) {
    statement.hidden = false;
    statement.style.setProperty("display", "block", "important");
    statement.textContent = "تعذّر تحميل الأسئلة من questions.js.";
  }

  function syncEditorScroll() {
    lineNumbers.scrollTop = editor.scrollTop;
    hintLayer.scrollTop = editor.scrollTop;
    hintLayer.scrollLeft = editor.scrollLeft;
  }

  function updateEditor() {
    const lines = editor.value.split("\n");
    lineNumbers.textContent = lines.map((_, index) => index + 1).join("\n");
    hintLayer.textContent = lines
      .map((line) => line.trim() === hint ? line : "")
      .join("\n") + "\n";
    syncEditorScroll();
  }

  function showLanguage() {
    const language = languageSelect.value;
    const starter = starters[language];
    byId("filename").textContent = starter.filename;
    byId("file-icon").textContent = starter.icon;
    editor.value = drafts.get(language) ?? starter.code;
    editor.scrollTop = 0;
    editor.scrollLeft = 0;
    updateEditor();
  }

  function applyFontSize() {
    editor.closest(".code-area").style.setProperty(
      "--editor-size", `${fontSizeSelect.value}px`
    );
    syncEditorScroll();
  }

  languageSelect.addEventListener("change", showLanguage);
  fontSizeSelect.addEventListener("change", applyFontSize);
  editor.addEventListener("scroll", syncEditorScroll);
  editor.addEventListener("input", () => {
    drafts.set(languageSelect.value, editor.value);
    updateEditor();
  });

  function editCode(text, start, end, cursor) {
    const length = editor.value.length - (end - start) + text.length;
    if (editor.maxLength >= 0 && length > editor.maxLength) return;

    editor.setRangeText(text, start, end, "end");
    editor.setSelectionRange(cursor, cursor);
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }

  editor.addEventListener("keydown", (event) => {
    if (event.shiftKey || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    if (event.key === "Tab") {
      event.preventDefault();
      editCode("    ", start, end, start + 4);
      return;
    }

    if (event.key !== "Enter" || start !== end) return;

    const before = editor.value.slice(0, start);
    const line = before.slice(before.lastIndexOf("\n") + 1);
    const indent = line.match(/^[ \t]*/)[0];
    event.preventDefault();

    if (line.trimEnd().endsWith("{")) {
      const inner = indent + "    ";
      const closing = editor.value.slice(start).match(/^[ \t]*}/);
      editCode(
        `\n${inner}\n${indent}}`,
        start,
        start + (closing?.[0].length ?? 0),
        start + 1 + inner.length
      );
    } else {
      editCode(`\n${indent}`, start, end, start + 1 + indent.length);
    }
  });

  const themeButtons = document.querySelectorAll(".theme-switch button");

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    for (const button of themeButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.theme === theme));
    }
    requestAnimationFrame(syncEditorScroll);
  }

  let theme = "dark";
  try {
    if (localStorage.getItem("mns-compiler-theme") === "light") theme = "light";
  } catch {
    // يظل التبديل متاحًا خلال الجلسة.
  }

  setTheme(theme);

  for (const button of themeButtons) {
    button.addEventListener("click", () => {
      setTheme(button.dataset.theme);
      try {
        localStorage.setItem("mns-compiler-theme", button.dataset.theme);
      } catch {
        // يظل التبديل متاحًا خلال الجلسة.
      }
    });
  }

  copyButton.addEventListener("click", async () => {
    clearTimeout(copyTimer);
    try {
      await navigator.clipboard.writeText(editor.value);
      copyButton.textContent = "تم النسخ";
    } catch {
      editor.focus();
      editor.select();
      copyButton.textContent = "اضغط Ctrl + C";
    }
    copyTimer = setTimeout(() => {
      copyButton.textContent = "نسخ الكود";
    }, 2000);
  });

  function print(text, className = "") {
    if (!text) return;
    addText(terminalOutput, "span", text, className);
    clearButton.disabled = false;
    terminal.scrollTop = terminal.scrollHeight;
  }

  function clearTerminal() {
    terminalOutput.replaceChildren();
    clearButton.disabled = true;
  }

  clearButton.addEventListener("click", () => {
    clearTerminal();
    if (!terminalInput.hidden) terminalInput.focus({ preventScroll: true });
  });

  function openSocket() {
    const scheme = location.protocol === "https:" ? "wss:" : "ws:";
    return new WebSocket(`${scheme}//${location.host}/terminal`);
  }

  function send(socket, message) {
    socket.send(JSON.stringify(message));
  }

  runButton.addEventListener("click", () => {
    if (runSocket) {
      statusLabel.textContent = "تم إيقاف البرنامج";
      terminalInput.hidden = true;
      runSocket.close();
      return;
    }

    if (grading) return;
    const code = editor.value;
    const language = languageSelect.value;

    if (!code.trim()) {
      statusLabel.textContent = "اكتب كود قبل التشغيل";
      editor.focus();
      return;
    }

    let socket;
    try {
      socket = openSocket();
    } catch {
      statusLabel.textContent = "افتح الموقع من http://127.0.0.1:3000/";
      return;
    }

    runSocket = socket;
    clearTerminal();
    terminalInput.hidden = true;
    terminalInput.value = "";
    runButton.textContent = "إيقاف";
    statusLabel.textContent = "جارٍ الاتصال…";
    updateControls();

    let finished = false;

    socket.addEventListener("open", () => {
      statusLabel.textContent = "جارٍ التجميع…";
      send(socket, { type: "start", language, code });
    });

    socket.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data);

      if (message.type === "output") {
        print(message.text, message.stream === "stderr" ? "bad" : "");
      } else if (message.type === "ready") {
        statusLabel.textContent = "البرنامج شغّال";
        terminalInput.hidden = false;
        terminalInput.focus({ preventScroll: true });
        terminal.scrollIntoView({ block: "nearest" });
        terminal.scrollTop = terminal.scrollHeight;
      } else if (message.type === "done") {
        finished = true;
        terminalInput.hidden = true;
        statusLabel.textContent = message.text;
      }
    });

    socket.addEventListener("error", () => {
      finished = true;
      statusLabel.textContent = "تعذّر الاتصال بخادم التشغيل";
    });

    socket.addEventListener("close", () => {
      if (!finished && statusLabel.textContent !== "تم إيقاف البرنامج") {
        statusLabel.textContent = "انقطع الاتصال بخادم التشغيل";
      }
      runSocket = null;
      terminalInput.hidden = true;
      runButton.textContent = "تشغيل";
      updateControls();
    });
  });

  terminalInput.addEventListener("keydown", (event) => {
    if (
      event.key !== "Enter" ||
      event.isComposing ||
      runSocket?.readyState !== WebSocket.OPEN
    ) return;

    event.preventDefault();
    const text = terminalInput.value;
    send(runSocket, { type: "input", text });
    terminalInput.value = "";
    print(`${text}\n`, "good");
  });

  function runTest(code, input) {
    return new Promise((resolve, reject) => {
      const socket = openSocket();
      let output = "";
      let diagnostics = "";
      let result;
      let failure;

      const timer = setTimeout(() => {
        failure = "انتهت مهلة الاختبار.";
        socket.close();
      }, 20000);

      socket.addEventListener("open", () => {
        send(socket, { type: "start", language: "cpp", code });
      });

      socket.addEventListener("message", ({ data }) => {
        const message = JSON.parse(data);

        if (message.type === "ready") {
          if (input) {
            for (const text of input.split("\n")) {
              send(socket, { type: "input", text });
            }
          }
          send(socket, { type: "eof" });
        } else if (message.type === "output") {
          if (message.stream === "stdout") output += message.text;
          else diagnostics += message.text;
        } else if (message.type === "done") {
          result = message;
        }
      });

      socket.addEventListener("error", () => {
        failure ||= "تعذّر الاتصال بخادم التشغيل.";
      });

      socket.addEventListener("close", () => {
        clearTimeout(timer);
        if (result?.ok && !failure) {
          resolve(output);
          return;
        }

        const details = [result?.text, diagnostics.trim()].filter(Boolean).join("\n");
        reject(new Error(failure || details || "انقطع الاتصال أثناء الاختبار."));
      });
    });
  }

  function normalizeLines(text) {
    return text.split(/\r?\n/)
      .map((line) => line.toLowerCase().replace(/\s+/g, ""))
      .filter(Boolean);
  }

  checkButton.addEventListener("click", async () => {
    if (selectedIndex < 0 || runSocket || grading) return;

    if (languageSelect.value !== "cpp") {
      statusLabel.textContent = "اختَر C++ لتمارين اللاب";
      return;
    }

    const code = editor.value;
    if (!code.trim()) {
      statusLabel.textContent = "اكتب حلّك أول";
      editor.focus();
      return;
    }

    const index = selectedIndex;
    const question = questions[index];
    let grade = 0;

    grading = true;
    updateControls();
    clearTerminal();
    terminal.scrollIntoView({ block: "nearest" });

    try {
      for (const [caseIndex, test] of question.cases.entries()) {
        statusLabel.textContent = `اختبار ${caseIndex + 1} من ${question.cases.length}…`;
        const actual = await runTest(code, test.input);
        const actualLines = normalizeLines(actual);

        if (question.linePoints) {
          let nextLine = 0;
          let missedLine = false;

          for (const [lineIndex, line] of normalizeLines(question.sample).entries()) {
            const position = actualLines.indexOf(line, nextLine);
            const passed = position !== -1;
            const points = question.linePoints[lineIndex];

            if (passed) {
              grade += points;
              nextLine = position + 1;
            } else {
              missedLine = true;
            }

            print(
              `Line ${lineIndex + 1}: ${passed ? points : 0}/${points}\n`,
              passed ? "good" : "bad"
            );
          }

          if (missedLine) {
            print(`Expected:\n${question.sample}\nReceived:\n${actual.trimEnd() || "(no output)"}\n`);
          }
        } else {
          const passed = actualLines.join("\n") === normalizeLines(test.expected).join("\n");
          if (passed) grade += test.points;

          print(
            `Test ${caseIndex + 1}: ${passed ? test.points : 0}/${test.points}\n`,
            passed ? "good" : "bad"
          );

          if (!passed) {
            print(`Input:\n${test.input}\nExpected:\n${test.expected}\nReceived:\n${actual.trimEnd() || "(no output)"}\n\n`);
          }
        }
      }

      tiles[index].score.textContent = `${grade}/100`;
      tiles[index].score.hidden = false;
      statusLabel.textContent = `Question ${index + 1} · ${grade}/100`;
    } catch (error) {
      statusLabel.textContent = "الاختبار ما اكتمل";
      print(`${error.message}\n`, "bad");
    } finally {
      grading = false;
      updateControls();
    }
  });

  applyFontSize();
  showLanguage();
  updateControls();
})();
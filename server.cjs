const { spawn } = require("node:child_process");
const { createServer } = require("node:http");
const { createReadStream } = require("node:fs");
const { randomUUID } = require("node:crypto");
const { StringDecoder } = require("node:string_decoder");
const { WebSocketServer, WebSocket } = require("ws");

const address = "127.0.0.1";
const port = 3000;
const origin = `http://${address}:${port}`;

const files = {
  "/": ["index.html", "text/html"],
  "/style.css": ["style.css", "text/css"],
  "/app.js": ["app.js", "text/javascript"],
  "/questions.js": ["questions.js", "text/javascript"]
};

const commands = {
  cpp: 'head -c "$1" > main.cpp && g++ -std=c++17 main.cpp -o main >&2 && printf "\\001" && exec stdbuf -o0 ./main',
  java: 'head -c "$1" > Main.java && javac -J-Xmx128m Main.java >&2 && printf "\\001" && exec java -Xmx128m -XX:-UsePerfData Main',
  csharp: 'head -c "$1" > Program.cs && mcs Program.cs >&2 && printf "\\001" && exec mono Program.exe'
};

const server = createServer((req, res) => {
  if (req.method !== "GET" || !Object.hasOwn(files, req.url)) {
    res.writeHead(404).end();
    return;
  }

  const [file, type] = files[req.url];
  const stream = createReadStream(file);

  stream.on("error", () => res.writeHead(404).end());
  stream.on("open", () => {
    res.setHeader("Content-Type", `${type}; charset=utf-8`);
    stream.pipe(res);
  });
});

const websocket = new WebSocketServer({
  noServer: true,
  maxPayload: 220000
});

server.on("upgrade", (req, socket, head) => {
  if (req.url !== "/terminal" || req.headers.origin !== origin) {
    socket.destroy();
    return;
  }

  websocket.handleUpgrade(req, socket, head, (ws) => {
    websocket.emit("connection", ws);
  });
});

let active = false;

websocket.on("connection", (ws) => {
  const container = `mns-${randomUUID()}`;
  let child;
  let running = false;
  let outputBytes = 0;

  function send(type, text, details = {}) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, text, ...details }));
  }
}

function finish(text, ok = false) {
  send("done", text, { ok });
  ws.close();
}

  function removeContainer() {
    if (!child) return;

    const cleanup = spawn("docker", ["rm", "-f", container], {
      stdio: "ignore"
    });
    cleanup.on("error", () => {});
  }

  const timer = setTimeout(() => {
    finish("انتهت مهلة الجلسة.");
    removeContainer();
  }, 120000);

  ws.on("close", () => {
    clearTimeout(timer);
    removeContainer();
  });
  ws.on("error", removeContainer);

  ws.on("message", (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (!message || typeof message !== "object") return;

    if (message.type === "eof" && running) {
  if (child.stdin.writable) child.stdin.end();
  return;
}

    if (message.type === "input" && running) {
      if (
        typeof message.text === "string" &&
        message.text.length <= 4096 &&
        !/[\r\n]/.test(message.text) &&
        !child.stdin.writableNeedDrain
      ) {
        child.stdin.write(`${message.text}\n`);
      }
      return;
    }

    if (child || message.type !== "start") return;
    if (active) return finish("في برنامج شغّال حاليًا.");

    if (
      !Object.hasOwn(commands, message.language) ||
      typeof message.code !== "string" ||
      !message.code.trim() ||
      Buffer.byteLength(message.code) > 200000
    ) {
      return finish("افحص اللغة وحجم الكود قبل التشغيل.");
    }

    const source = Buffer.from(message.code);
    active = true;

    child = spawn("docker", [
      "run", "--rm", "-i", "--name", container,
      "--network=none", "--read-only", "--user=65534:65534",
      "--cap-drop=ALL", "--security-opt=no-new-privileges",
      "--memory=512m", "--memory-swap=512m", "--cpus=1",
      "--pids-limit=64", "--ulimit", "nofile=256:256",
      "--ulimit", "core=0:0",
      "--tmpfs", "/work:rw,exec,size=64m,mode=1777",
      "--tmpfs", "/tmp:rw,noexec,size=16m,mode=1777",
      "-w", "/work",
      "mns-runner", "timeout", "-k", "2s", "115s",
      "sh", "-c", commands[message.language],
      "runner", String(source.length)
    ]);

    function forward(stream, isStdout) {
      const decoder = new StringDecoder("utf8");

      stream.on("data", (data) => {
        if (ws.readyState !== WebSocket.OPEN) return;

        outputBytes += data.length;
        if (outputBytes > 65536) {
          finish("وصلت المخرجات للحد الأقصى.");
          removeContainer();
          return;
        }

        if (isStdout && !running && data[0] === 1) {
          running = true;
          send("ready");
          data = data.subarray(1);
        }

        const text = decoder.write(data);
        if (text) {
  send("output", text, { stream: isStdout ? "stdout" : "stderr" });
}
      });

      stream.on("end", () => {
        const text = decoder.end();
       if (text) {
  send("output", text, { stream: isStdout ? "stdout" : "stderr" });
}
      });
    }

    forward(child.stdout, true);
    forward(child.stderr, false);
    child.stdin.on("error", () => {});
    child.on("error", () => finish("تعذّر تشغيل Docker."));

    child.on("close", (code) => {
      active = false;

      if (code === 0) finish("انتهى البرنامج.", true);
      else if (code === 124) finish("انتهت مهلة الجلسة.");
      else if (running) finish(`انتهى البرنامج برمز خروج ${code}.`);
      else finish("تعذّر بدء البرنامج. راجع الرسائل أعلاه.");

      removeContainer();
    });

    child.stdin.write(source);
  });
});

server.listen(port, address, () => console.log(origin));
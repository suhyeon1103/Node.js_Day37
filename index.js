const http = require("http");
const url = require("url");
const fs = require("fs");

const PORT = 3000;
const todos = [];

if (fs.existsSync("todos.json")) {
  const data = fs.readFileSync("todos.json");

  todos = JSON.parse(data);
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;

  // CORS 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === "/todos") {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });

      res.end(JSON.stringify(todos));
    } else if (req.method === "POST") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        const todo = JSON.parse(body);
        todo.id = Date.now();
        todos.push(todo);
        fs.writeFileSync("todos.json", JSON.stringify(todos));
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(todo));
      });
    }
  } else if (pathname.startsWith("/todos/")) {
    const id = parseInt(pathname.split("/")[2]);
    const todoIndex = todos.findIndex((t) => t.id === id);

    if (todoIndex === -1) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Not Found" }));
      return;
    }

    if (req.method === "PUT") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        const updatedTodo = JSON.parse(body);
        todos[todoIndex] = { ...todos[todoIndex], ...updatedTodo };
        fs.writeFileSync("todos.json", JSON.stringify(todos));
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(todos[todoIndex]));
      });
    } else if (req.method === "DELETE") {
      todos.splice(todoIndex, 1);
      fs.writeFileSync("todos.json", JSON.stringify(todos));
      res.writeHead(204);
      res.end();
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Not Found" }));
  }
});

server.listen(PORT, () => {
  console.log(`To-Do 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

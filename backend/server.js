/*const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("A user connected");

  // TODO: Implement WebSocket events for task management

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
*/
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"] 
  }
});

app.use(cors());
app.use(express.json());

let tasks = [];   // In-memory storage (for assignment this is fine)

// Send current tasks to new client
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.emit('sync:tasks', tasks);   // Send all tasks on connect

  // Create new task
  socket.on('task:create', (newTask) => {
    const task = { 
      id: Date.now().toString(),
      ...newTask,
      createdAt: new Date()
    };
    tasks.push(task);
    io.emit('task:created', task);   // Broadcast to everyone
  });

  // Update task (title, desc, priority, category, attachments)
  socket.on('task:update', (updatedTask) => {
    tasks = tasks.map(task => task.id === updatedTask.id ? updatedTask : task);
    io.emit('task:updated', updatedTask);
  });

  // Move task between columns (change status)
  socket.on('task:move', ({ id, newStatus }) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.status = newStatus;
      io.emit('task:updated', task);
    }
  });

  // Delete task
  socket.on('task:delete', (id) => {
    tasks = tasks.filter(t => t.id !== id);
    io.emit('task:deleted', id);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const app = express();

const server = http.createServer(app);
app.use(cors());
const io = socketIo(server, {
   cors: {
     origin: "http://localhost:5173",
     methods: ["GET", "POST"],
   },
});

const PORT = process.env.PORT || 5000;

const rooms ={};

const questions = [
  {
    question: "What is the time complexity of binary search on a sorted array?",
    answers: [
      { text: "O(n)", correct: false },
      { text: "O(log n)", correct: true },
      { text: "O(n log n)", correct: false },
      { text: "O(1)", correct: false },
    ],
  },
  {
    question: "Which data structure uses FIFO order?",
    answers: [
      { text: "Stack", correct: false },
      { text: "Queue", correct: true },
      { text: "Tree", correct: false },
      { text: "Graph", correct: false },
    ],
  },
  {
    question: "Which sorting algorithm is the most efficient for large data sets?",
    answers: [
      { text: "Bubble Sort", correct: false },
      { text: "Selection Sort", correct: false },
      { text: "Merge Sort", correct: true },
      { text: "Insertion Sort", correct: false },
    ],
  },
  {
    question: "Which data structure is used in recursion?",
    answers: [
      { text: "Queue", correct: false },
      { text: "Stack", correct: true },
      { text: "Linked List", correct: false },
      { text: "Graph", correct: false },
    ],
  },
  {
    question: "What is the result of 15 % 4 in programming?",
    answers: [
      { text: "3", correct: true },
      { text: "4", correct: false },
      { text: "0", correct: false },
      { text: "1", correct: false },
    ],
  },
  {
    question: "Which of the following is not a linear data structure?",
    answers: [
      { text: "Array", correct: false },
      { text: "Stack", correct: false },
      { text: "Queue", correct: false },
      { text: "Tree", correct: true },
    ],
  },
  {
    question: "What does Big-O notation describe?",
    answers: [
      { text: "The actual run time", correct: false },
      { text: "The best case performance", correct: false },
      { text: "The worst-case time complexity", correct: true },
      { text: "The memory usage", correct: false },
    ],
  },
  {
    question: "Which algorithm is used to find the shortest path in a graph?",
    answers: [
      { text: "DFS", correct: false },
      { text: "BFS", correct: false },
      { text: "Dijkstra's Algorithm", correct: true },
      { text: "Prim's Algorithm", correct: false },
    ],
  },
  {
    question: "Which of the following is not a primitive data type in Java?",
    answers: [
      { text: "int", correct: false },
      { text: "String", correct: true },
      { text: "char", correct: false },
      { text: "boolean", correct: false },
    ],
  },
  {
    question: "Which operation is the fastest in HashMap?",
    answers: [
      { text: "Search", correct: true },
      { text: "Insert", correct: false },
      { text: "Delete", correct: false },
      { text: "Traversal", correct: false },
    ],
  },
  {
    question: "What is 75% of 240?",
    answers: [
      { text: "160", correct: false },
      { text: "180", correct: true },
      { text: "200", correct: false },
      { text: "150", correct: false },
    ],
  },
  {
    question: "If A can do a work in 6 days, B in 8 days, how long together?",
    answers: [
      { text: "3.5 days", correct: false },
      { text: "3.43 days", correct: true },
      { text: "4 days", correct: false },
      { text: "2.5 days", correct: false },
    ],
  },
  {
    question: "Which is a greedy algorithm?",
    answers: [
      { text: "Binary Search", correct: false },
      { text: "Prim's Algorithm", correct: false },
      { text: "Kruskal's Algorithm", correct: true },
      { text: "Merge Sort", correct: false },
    ],
  },
  {
    question: "Which sorting has O(n^2) worst-case time?",
    answers: [
      { text: "Quick Sort", correct: true },
      { text: "Merge Sort", correct: false },
      { text: "Heap Sort", correct: false },
      { text: "Radix Sort", correct: false },
    ],
  },
  {
    question: "Which of these is used to implement LRU cache?",
    answers: [
      { text: "Stack + Queue", correct: false },
      { text: "Deque + HashMap", correct: true },
      { text: "Linked List + Stack", correct: false },
      { text: "Queue only", correct: false },
    ],
  },
  {
    question: "Find the missing number: 2, 4, 8, 16, __",
    answers: [
      { text: "32", correct: true },
      { text: "24", correct: false },
      { text: "20", correct: false },
      { text: "30", correct: false },
    ],
  },
  {
    question: "Which is best for implementing recursion?",
    answers: [
      { text: "Queue", correct: false },
      { text: "Stack", correct: true },
      { text: "Heap", correct: false },
      { text: "Array", correct: false },
    ],
  },
  {
    question: "What is 20% of 450?",
    answers: [
      { text: "90", correct: true },
      { text: "80", correct: false },
      { text: "70", correct: false },
      { text: "100", correct: false },
    ],
  },
];


io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (room, name) => {
    socket.join(room);
    io.to(room).emit("message", `${name} has joined the game!`);

    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        currentIndex: 0,
        questionTimeout: null,
        totalQuestions: questions.length,
      };
    }

    rooms[room].players.push({ id: socket.id, name, score: 0 });

    if (rooms[room].players.length === 1) {
      sendNextQuestion(room);
    }
  });

  socket.on("submitAnswer", (room, answerIndex) => {
    // const player = rooms[room]?.players.find(p => p.id === socket.id);
    // const question = questions[rooms[room]?.currentIndex]-1;
    // const correctIndex = question.answers.findIndex(ans => ans.correct);
    // const isCorrect = answerIndex === correctIndex;
    const questionIndex = rooms[room]?.currentIndex - 1;
   const question = questions[questionIndex];

   if (!question || !question.answers) return;

   const correctIndex = question.answers.findIndex(ans => ans.correct);
   const isCorrect = answerIndex === correctIndex;

   const player = rooms[room]?.players.find(p => p.id === socket.id);
    if (player) player.score += isCorrect ? 1 : -1;

    io.to(room).emit("answerResult", {
      playerName: player?.name || "Unknown",
      isCorrect,
      correctAnswer: correctIndex,
      scores: rooms[room].players.map(p => ({ name: p.name, score: p.score })),
    });

    clearTimeout(rooms[room].questionTimeout);
    setTimeout(() => sendNextQuestion(room), 2000);
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      rooms[room].players = rooms[room].players.filter(p => p.id !== socket.id);
    }
    console.log("A user disconnected");
  });
});

function sendNextQuestion(room) {
  if (!rooms[room]) return;

  const index = rooms[room].currentIndex;
  if (index >= questions.length) {
    const winner = rooms[room].players.reduce((top, p) => (p.score > top.score ? p : top), rooms[room].players[0]);
    io.to(room).emit("gameOver", { winner: winner.name });
    delete rooms[room];
    return;
  }

  const q = questions[index];
  io.to(room).emit("newQuestion", {
    question: q.question,
    answers: q.answers.map(a => a.text),
    timer: 50,
    totalQuestions: questions.length,
    questionCount: index + 1,
  });

  rooms[room].questionTimeout = setTimeout(() => {
    io.to(room).emit("answerResult", {
      playerName: "No one",
      isCorrect: false,
      correctAnswer: q.answers.findIndex(a => a.correct),
      scores: rooms[room].players.map(p => ({ name: p.name, score: p.score })),
    });
    rooms[room].currentIndex++;
    sendNextQuestion(room);
  }, 30000);

  rooms[room].currentIndex++;
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

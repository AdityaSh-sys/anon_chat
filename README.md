# 🕵️ Anonymous Chat App

A real-time, anonymous chat application built with **React**, **WebSockets**, and **Node.js**, designed to connect users instantly without signups or personal data.

Hosted on [Railway](https://railway.app/) 🚄

---

## 📸 Features

- ⚡ **Real-time messaging** via WebSockets (`ws`)
- 🔒 Anonymous 1:1 chat rooms (no login required)
- 🧠 Message auto-expiry after 10 minutes
- 🔌 Persistent server via Node.js + Express-style HTTP handling
- 🧰 Modern UI with **React 18 + TailwindCSS**
- 📦 Fully containerized with Docker for scalable deployment

---

## 🛠️ Tech Stack

| Layer       | Tech                                |
|-------------|-------------------------------------|
| Frontend    | React, Vite, Tailwind CSS           |
| Backend     | Node.js, `ws` (WebSocket)           |
| Dev Tools   | ESLint, TypeScript, Vite            |
| Deployment  | Docker, Railway                     |

---

## 🚀 Getting Started (Local Dev)

### 1. Clone the repository
```bash
git clone https://github.com/AdityaSh-sys/anon_chat.git
cd anon_chat

Install dependencies & Run Locally
npm install
npm run dev:all


✅ To-Do / Improvements

-Room matchmaking
-Add emojis / file support
-Persistent storage (Redis/Mongo)
-Better error handling & reconnect

🧑‍💻 Author
 Aditya Sharma

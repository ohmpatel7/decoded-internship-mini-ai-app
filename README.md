# Decoded Internship – Mini AI App

A simple AI-powered web app that extracts system features from natural language descriptions.  
Built with React (Vite) for the frontend and Node.js + Express for the backend, connected to the OpenAI API.

---

# Features
- Enter a plain-text description of an app/system.  
- Extract Entities, Roles, and Features using AI.  
- Fallback mode if API is unavailable.  
- Clean, modern UI with live results.

---

# Tech Stack
- Frontend: React (Vite) + CSS  
- Backend: Node.js + Express  
- AI: OpenAI GPT (JSON structured output)  

---

# **Running the Project**
# Backend Setup
cd backend
npm install
# Create .env file inside backend with your OpenAI key:
# OPENAI_API_KEY=your_api_key_here
npm run dev
Runs on: http://localhost:5000

# Frontend Setup
cd frontend
npm install
npm run dev
Runs on: http://localhost:5173 (or next port if busy)

# 1. Clone the Repository
```bash
git clone https://github.com/ohmpatel7/decoded-internship-mini-ai-app.git
cd decoded-internship-mini-ai-app

# Demo

Input → Output example:

User input:
I want an app where students submit homework and teachers grade it.

AI output:

{
  "appName": "Homework Hub",
  "entities": ["Student", "Teacher", "Homework Submission", "Grade"],
  "roles": ["Student", "Teacher"],
  "features": ["Submit Homework", "Grade Homework", "View Grades"]
}

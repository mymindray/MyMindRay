# My MindRay — AI Desk setup

## 1. Install Node.js
Use Node.js 20 or newer.

## 2. Install dependencies
From this project folder:

```bash
npm install
```

## 3. Create your environment file
Copy `.env.example` to `.env` and put your real Gemini API key in `GEMINI_API_KEY`.
Get a key from https://aistudio.google.com/apikey.

Do not put the key in `ai.js`, `ai.html`, or any browser-side file.

## 4. Start the website

```bash
npm start
```

Open `http://localhost:3000` and go to `ai.html`.

The AI Desk calls `/api/chat`, which keeps the Gemini API key on the server and talks to the `gemini-3.8-flash` model.

## 5. Production
Deploy the project to a Node-compatible host. Set the same environment variables in the host's secret/environment-variable settings. Do not upload `.env`.

The browser will continue calling `/api/chat` on the same domain, so no frontend API URL needs to be hard-coded.

## Notes
- Images are sent to the AI only when the user chooses to attach them.
- Conversation history is kept client-side by the existing AI Desk session storage; the server does not persist conversations, and only the last 12 turns are sent along with each request for context.
- The AI is configured as a mental-wellness companion, not a diagnostic or emergency service.

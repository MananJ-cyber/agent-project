# LLM Tool-Calling Agent System

This project is a backend application that uses a language model to answer user queries by calling external tools when needed. It supports tasks like fetching weather data or retrieving predefined information.

---

## What this project does

- Takes user input through an API
- Uses an LLM to understand the query
- Decides whether a tool needs to be called
- Executes the tool (e.g., weather API)
- Returns the final response

---

## Tech used

- Node.js and Express for backend
- LangChain for building the agent
- Google Gemini API as the language model
- OpenWeather API for real-time data
- Zod for input validation

---

## Project files

- `server.js` → main backend with agent and API routes  
- `weather.js` → separate script where LangGraph-based agent was explored  
- `.env` → stores API keys  

---

git clone https://github.com/MananJ-cyber/agent-project.git

cd agent-project


2. Install dependencies

npm install


3. Create a `.env` file and add:

GOOGLE_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here


4. Start the server

node server.js


---

## Example queries

- "What is the weather in Jalandhar?"
- "Get menu for Pasta Palace"

---

## Notes

- The agent is configured to limit iterations to avoid loops
- If the agent stops early, the last tool output is returned
- A separate file (`weather.js`) was used to experiment with LangGraph

---

## What I learned

- How LLM agents decide when to call tools
- Handling API responses inside an agent workflow
- Managing execution flow to avoid repeated loops
- Structuring backend services around LLMs

---

## Possible improvements

- Add a frontend interface
- Support more tools dynamically
- Deploy the project online

## How to run

1. Clone the repository

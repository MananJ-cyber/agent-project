import express from "express";
import dotenv from "dotenv";
import path from "path";
import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const port = 3000;
app.use(express.json());

// 1. USE STABLE MODEL (The video uses 2.5, but 1.5 is the safe public version)
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0,
  modelName: "gemini-1.5-flash", 
});

const getMenuTool = new DynamicStructuredTool({
  name: "get_menu",
  description: "Get the menu for a restaurant.",
  schema: z.object({
    restaurant_name: z.string().describe("The name of the restaurant."),
  }),
  func: async ({ restaurant_name }) => {
    const menus = {
      "Pasta Palace": "Spaghetti, Fettuccine Alfredo, Lasagna",
      "Sushi Central": "California Roll, Spicy Tuna Roll, Nigiri",
      "Burger Barn": "Cheeseburger, Veggie Burger, Bacon Burger",
    };
    const menu = menus[restaurant_name];
    if (menu) return `SUCCESS: Menu is: ${menu}`;
    return "FAILURE: Menu not found.";
  },
});

const tools = [getMenuTool];

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant. Call the tool once and stop."],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

console.log("Initializing Agent...");
const agent = await createToolCallingAgent({
  llm: model,
  tools: tools,
  prompt: prompt,
});

// 2. THE VIDEO'S LOGIC
const executor = new AgentExecutor({
  agent: agent,
  tools: tools,
  // He sets this to TRUE to see the logs
  returnIntermediateSteps: true, 
  // He sets this to stop the infinite loop
  maxIterations: 2, 
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/chat", async (req, res) => {
  const userInput = req.body.input;
  try {
    const result = await executor.invoke({ input: userInput });
    
    // 3. THE HACK FROM THE VIDEO (Timestamp ~50:33)
    // If the agent stops early, grab the tool output directly from the steps!
    let finalResponse = result.output;
    
    // If output is the "Agent stopped" error, try to find the real answer in the steps
    if (result.output.includes("Agent stopped") && result.intermediateSteps.length > 0) {
        const lastStep = result.intermediateSteps[result.intermediateSteps.length - 1];
        if (lastStep.observation) {
            finalResponse = lastStep.observation;
        }
    }

    res.json({ response: finalResponse });
  } catch (error) {
    console.error("Agent Error:", error);
    res.json({ response: "Error: Could not fetch menu." });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
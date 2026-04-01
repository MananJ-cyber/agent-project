import 'dotenv/config'; 
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const getWeather = tool(
  async ({ city }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    // DEBUG 1: Check if key exists
    if (!apiKey) {
      console.log("❌ DEBUG: OPENWEATHER_API_KEY is missing from .env!");
      return "Error: API Key missing.";
    }
    console.log(`🔹 DEBUG: Using API Key starting with: ${apiKey.slice(0,4)}...`);

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
      
      // DEBUG 2: Log the actual URL we are hitting
      console.log(`🔹 DEBUG: Fetching: ${url}`);
      
      const response = await fetch(url);
      
      // DEBUG 3: Log the status code (200 = OK, 401 = Bad Key, 404 = Wrong City)
      console.log(`🔹 DEBUG: Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ DEBUG: API Error Body: ${errorText}`);
        return `Error: Weather API returned ${response.status}. Message: ${errorText}`;
      }

      const data = await response.json();
      console.log(`✅ DEBUG: Success! Temp is ${data.main.temp}`);
      return `The current weather in ${data.name} is ${data.weather[0].description} with a temperature of ${data.main.temp}°C.`;
      
    } catch (error) {
      console.log("❌ DEBUG: Network/Fetch Error:", error);
      return "Error: Failed to connect to the weather service.";
    }
  },
  {
    name: "get_weather",
    description: "Get the current weather for a given city.",
    schema: z.object({
      city: z.string(),
    }),
  }
);

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash", 
  apiKey: process.env.GOOGLE_API_KEY,
});

const agent = await createReactAgent({
  llm: model,
  tools: [getWeather],
});

console.log("Thinking...");
const result = await agent.invoke({
  messages: [{ role: "user", content: "What is the weather in Jalandhar?" }],
});

console.log("\n🤖 Agent Answer:");
console.log(result.messages[result.messages.length - 1].content);
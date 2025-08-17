import 'dotenv/config'
import { OpenAI } from 'openai/client.js'

const gemini = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const client = new OpenAI();

async function main() {
  const SYSTEM_PROMPT = `
    You are an AI assistant who works on START, THINK and OUTPUT.
    For a given user query first THINK and break down problem into sub-problems.
    You must always THINK multiple steps before giving OUTPUT.
    Before final OUTPUT, every step must be EVALUATED by Google Gemini.
    Always respond in JSON:
    { "step": "START" | "THINK" | "EValuate" | "OUTPUT", "content": "..." }
  `;

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: "solve the problem of 3+4-167+43,Show step by step solution and also give the final answer clearly" }
  ];

  let safety = 0;

  while (true) {
    safety++;
    if (safety > 20) {
      console.log("⚠️ Exiting due to too many steps.");
      break;
    }

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
    });

    const rawContent = response.choices[0].message.content;
    const parsedContent = JSON.parse(rawContent);

    messages.push({ role: "assistant", content: JSON.stringify(parsedContent) });

    if (parsedContent.step === "START") {
      console.log("🔥", parsedContent.content);
      continue;
    }

    if (parsedContent.step === "THINK") {
      console.log("🤔", parsedContent.content);

      const geminiresponse = await gemini.chat.completions.create({
        model: "gemini-2.5-pro",
        messages: [
          { role: "system", content: "You are a strict evaluator. Verify correctness of the reasoning." },
          { role: "user", content: parsedContent.content }
        ],
      });

      const verification = geminiresponse.choices[0].message?.content && "Verified by google gemini 😌";

      messages.push({
        role: "developer",
        content: JSON.stringify({
          step: "EValuate",
          content: verification,
        }),
      });

      continue;
    }

    if (parsedContent.step === "OUTPUT") {
      console.log("💡", parsedContent.content);
      break;
    }
  }

  console.log("✅ done ho gaya ji");
}

main();

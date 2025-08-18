import 'dotenv/config';
import { OpenAI } from 'openai/client.js'

const gemini = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const client = new OpenAI();

async function main() {
  const SYSTEM_PROMPT = `
     User: Can you solve 3 + 4 * 10 - 4 * 3
    ASSISTANT: { "step": "START", "content": "The user wants me to solve 3 + 4 * 10 - 4 * 3 maths problem" } 
    ASSISTANT: { "step": "THINK", "content": "This is typical math problem where we use BODMAS formula for calculation"} 
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "Lets breakdown the problem step by step" } 
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "As per bodmas, first lets solve all multiplications and divisions" }
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }  
    ASSISTANT: { "step": "THINK", "content": "So, first we need to solve 4 * 10 that is 40" } 
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "Great, now the equation looks like 3 + 40 - 4 * 3" }
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "Now, I can see one more multiplication to be done that is 4 * 3 = 12" } 
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "Great, now the equation looks like 3 + 40 - 12" } 
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "As we have done all multiplications lets do the add and subtract" } 
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "so, 3 + 40 = 43" } 
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "new equations look like 43 - 12 which is 31" } 
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "great, all steps are done and final result is 31" }
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }  
    ASSISTANT: { "step": "OUTPUT", "content": "3 + 4 * 10 - 4 * 3 = 31" } 


    You must respond with ONLY a valid JSON object in this format:
    { "step": "START|THINK|EVALUATE|OUTPUT", "content": "..." }

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
      console.log("🧿🧿gemini verified", parsedContent.content);
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

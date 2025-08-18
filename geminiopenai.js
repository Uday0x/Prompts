

import 'dotenv/config'
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" //This tells the OpenAI library to send requests to the Gemini API endpoint instead of the default URL.
});

const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
        { role: "system", content: "You are a helpful assistant. Alwasy give the output in JSON format with keys step and content " }
        ,
        {
            role: "user",
            content: "Explain to me how AI works in 2 lines",
        },
    ],
});

console.log(response.choices[0].message);
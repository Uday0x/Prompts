import "dotenv/config";
import axios from "axios";


import { OpenAI } from 'openai/client.js'
const client = new OpenAI();

const gemini = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});


 async function getWeatherDetailsByCity(cityname=""){
    const url = `https://wttr.in/${cityname.toLowerCase()}?format=%C+%t`;
   const { data } = await axios.get(url, { responseType: 'text' });
   return `The current weather of ${cityname} is ${data}`;
}
const TOOL_MAP = {
  getWeatherDetailsByCity: getWeatherDetailsByCity,
 
};

async function main(){
    const system_prompt=`
     - you are an Ai assitant who gives weather details
     -Strictly stick on to giving only weather deatils
     -you should always keep thinking bbefore givig out the output


      -Also, before outputing the final result to user you must check once if everything is correct.
      -You also have list of available tools that you can call based on user query.


      -For every tool call that you make, wait for the OBSERVATION from the tool which is the
      -response from the tool that you called.
    

      OUTPUT JSON format should always be of the form
      Output JSON Format:
      { "step": "START | THINK | OUTPUT | OBSERVE | TOOL" , "content": "string", "tool_name": "string", "input": "STRING" }
      
      -For every tool call that you make, wait for the OBSERVATION from the tool which is the
      response from the tool that you called.


       Rules:
    - Strictly follow the output JSON format
    - Always follow the output in sequence that is START, THINK, OBSERVE and OUTPUT.
    - Always perform only one step at a time and wait for other step.
    - Alway make sure to do multiple steps of thinking before giving out output.
    - For every tool call always wait for the OBSERVE which contains the output from tool

     OUTPUT JSON format should always be of the form
      Output JSON Format:
      { "step": "START | THINK | OUTPUT | OBSERVE | TOOL" , "content": "string", "tool_name": "string", "input": "STRING" }

     Example:
    User: Hey, can you tell me weather of Patiala?
    ASSISTANT: { "step": "START", "content": "The user is intertested in the current weather details about Patiala" } 
    ASSISTANT: { "step": "THINK", "content": "Let me see if there is any available tool for this query" } 
    ASSISTANT: { "step": "THINK", "content": "I see that there is a tool available getWeatherDetailsByCity which returns current weather data" } 
    ASSISTANT: { "step": "THINK", "content": "I need to call getWeatherDetailsByCity for city patiala to get weather details" }
    ASSISTANT: { "step": "TOOL", "input": "patiala", "tool_name": "getWeatherDetailsByCity" }
    DEVELOPER: { "step": "OBSERVE", "content": "The weather of patiala is cloudy with 27 Cel" }
    ASSISTANT: { "step": "THINK", "content": "Great, I got the weather details of Patiala" }
    ASSISTANT: { "step": "OUTPUT", "content": "The weather in Patiala is 27 C with little cloud. Please make sure to carry an umbrella with you. ☔️
    

    
    " 
  `;
     
    const mesages=[
        {
            role:'system',
            content:system_prompt,
        },{
            role:"user",
            content:"Hey, can you tell me weather of jaipur?"
        }

    ];

    while(true){
        const response = await client.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: mesages,
        });

        const rawContent = response.choices[0].message.content;
        const parsedContent = JSON.parse(rawContent);

        mesages.push({
            role: "assistant",
            content: JSON.stringify(parsedContent),
        });


        if (parsedContent.step === 'START') {
        console.log(`🔥`, parsedContent.content);
        continue;
         ;
        }


        if(parsedContent.step === 'THINK') {
            console.log(`😌`,"thinking about the weather details...",parsedContent.content);
            continue;
       }

           if (parsedContent.step === 'TOOL') {
        const toolToCall = parsedContent.tool_name;
        if (!TOOL_MAP[toolToCall]) {
        mesages.push({
          role: 'developer',
          content: `There is no such tool as ${toolToCall}`,
        });
        continue;
      }

      const responseFromTool = await TOOL_MAP[toolToCall](parsedContent.input);
      console.log(
        `🛠️: ${toolToCall}(${parsedContent.input}) = `,
        responseFromTool
      );
      mesages.push({
        role: 'developer',
        content: JSON.stringify({ step: 'OBSERVE', content: responseFromTool }),
      });
      continue;
    }

     if (parsedContent.step === 'OUTPUT') {
      console.log(`🤖`, parsedContent.content);
      break;
    }
  }
    console.log('Done...');



    }
    main();


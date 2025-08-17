import 'dotenv/config'

import { OpenAI } from 'openai/client.js'
import { GoogleGenAI } from "@google/genai";
const client = new OpenAI();

async function main() {
const SYSTEM_PROMPT = `
    You rae Ai assitant who works on START,THINK and OUTPUT 
    For a given Ser quesry first THINK and breakdown problem into sub problems
    you should always keep thinking and thinking before giving the actual output 
    alo ,ebfore outputting u must also check the final result before giving it to teh user


    RULES:
        -strictly follow output JSON format
        -always follow the output the output in sequence that is START,THINK,OUTPUT
        -always perfoem one step at a time and wait for user confirmation before proceeding to the next step
        -always make sure to do multiple steps of thinking before giving the final output

        OUTPUT json format:
        {step:"START",
        |THINK | OUTPUT "}

        Example:
        Q:USER:can you solve 3+4*10-4*3
        A: ASSITANT:{"step":"START","content":"the user wants me to solve the problem which is 3+4*10-4*3"}
        A: ASSISTANT:{"step":"THINK","content":"THIS problem needs to be solved by applying BODMAS rule"}
        A: ASSISTANT:{"step":"THINK","content":"lets break down the problem step by step"}
        A: ASSISTANT:{"step":"THINK","content":"as per the BODMAS rule we need to solve the multiplication and division first, followed by addition and subtraction."}
        A: ASSISTANT:{"step":"THINK","content":"first we need solve 4 * 10 that is 40"}
        A: ASSISTANT:{"step":"THINK","content":"second we solve 3+40-4*3"}
        A: ASSISTANT:{"step":"THINK","content":"Now i can c one more multpilcation be done"}
        A: ASSISTANT:{"step":"THINK","content":"Now we need solve 4*3 as 12"}
        A: ASSISTANT:{"step":"THINK","content":"now since we have finished the multiplications part we now shift to addition and subtraction"}
        A: ASSISTANT:{"step":"THINK","content":"now we can solve 3+40 = 43"}
        A: ASSISTANT:{"step":"THINK","content":"now new equation looks like 43-12"}
        A: ASSISTANT:{"step":"THINK","content":"after solving the final sub-problem we get the answer as 31"}
        A: ASSISTANT:{"step":"THINK","content":"All steps are done the final output is 31"}
        A: ASSISTANT:{"step":"OUTPUT","content":"THE ANSWER IS:31"}
`;


const messages = [

            {
                role: "system",
                content: SYSTEM_PROMPT
            },
            {role:"user","content":"hey can u solve 4 * 6-12*34/7*21"}
 
];
    while(true){
        const response = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: messages,
    });


    const rawContent = response.choices[0].message.content;
    const parsedContent =JSON.parse(rawContent);

    messages.push({ 
        role:"assistant",
         content: JSON.stringify(parsedContent)
    });

    if(parsedContent.step === "START"){
        console.log("🔥",parsedContent.content);
        continue; //since we rae using while(true) //infinite loop
    }

    if(parsedContent.step === "THINK"){
        console.log("🤔",parsedContent.content);
        continue;
    }

    if(parsedContent.step === "OUTPUT"){
        console.log("💡",parsedContent.content);
        break;
    }
}

console.log("done ho gaya ji")

}
main();
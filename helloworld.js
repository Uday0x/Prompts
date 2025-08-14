import "dotenv/config"
import { OpenAI } from "openai/client.js"

const client = new OpenAI()


async function main() {
    const response = await client.chat.completions.create({
        model:"gpt-4.1-mini",
        messages:[
            {role:'user', content:"hey how are you"},
            {role:'assistant',content:"Hi! I'm doing great, thanks for asking. How about you? How can I assist you today?"},
            {role:'user',content:"can you tell me what my name is"},
            {role:'assistant',content:"I don't know your name yet. Could you please tell me?"},
            {role:'user',content:"My name is uday"},

        ]
    })
    console.log(response.choices[0].message.content) //choices[0] because it gives you mulltiple outputs ww ewant only initial output

}

main();
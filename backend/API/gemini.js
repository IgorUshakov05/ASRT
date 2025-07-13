const OpenAI = require('openai')
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.API_II,

});

async function main() {
  const completion = await openai.chat.completions.create({
    model: process.env.MODEL,
    messages: [
      {
        role: 'user',
        content: 'What is the meaning of life?',
      },
    ],
  });

  console.log(completion.choices[0].message);
}


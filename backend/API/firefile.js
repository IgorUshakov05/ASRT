const axios = require("axios");

const API_KEY = process.env.FIRE_API_KEY;
const BASE_URL = "https://api.fireflies.ai/v1";
const GRAPHQL_URL = "https://api.fireflies.ai/graphql";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_KEY}`,
};

async function getTranscriptById(id) {
  const query = `
    query Transcript($id: String!) {
      transcript(id: $id) {
        summary {
          outline
          shorthand_bullet
        }
        sentences {
          speaker_name
          text
        }
      }
    }
  `;

  const variables = { id };

  try {
    const res = await axios.post(
      GRAPHQL_URL,
      { query, variables },
      { headers }
    );
    console.log(res.data.data.transcript.summary, " то самое");
    if (res.data.errors)
      return { success: false, message: res.data.errors[0].message };
    const summary = res.data.data.transcript.summary;

    const rawText = summary.shorthand_bullet || summary.outline || "";

    const data = parseShorthandBullet(rawText);

    console.log(data);
    return { success: true, data };
  } catch (error) {
    console.error("Ошибка запроса:", error);
    return {
      success: false,
      message:
        "Ттекущий тариф не позволяет получить доступ к этой транскрипции",
    };
  }
}
async function getInfoAboutMeet(id) {
  try {
    const data = {
      query: `
        query Transcript($transcriptId: String!) {
          transcript(id: $transcriptId) {
           id
          title
          transcript_url
          }
        }`,
      variables: { transcriptId: id },
    };

    const response = await axios.post(GRAPHQL_URL, data, { headers });
    if (response.data.errors)
      return { success: false, message: response.data.errors[0].message };
    const transcriptData = response.data.data.transcript;
    return { success: true, transcriptData };
  } catch (e) {
    console.error("Error in GraphQL:", e.data.errors[0].message);
    return { success: false, message: e.data.errors[0].message };
  }
}

module.exports = { getInfoAboutMeet, getTranscriptById };
function parseShorthandBullet(shorthand) {
  const sections = [];
  const lines = shorthand.split("\n");

  let currentStage = "";
  let currentScript = "";

  for (const line of lines) {
    // Если нашли новый stage
    if (/\*\*(.+?)\*\*/.test(line)) {
      // Сохраняем предыдущий блок
      if (currentStage) {
        sections.push({
          stage: currentStage,
          script: currentScript.trim(),
        });
      }

      // Новый stage
      currentStage = line
        .match(/\*\*(.+?)\*\*/)[1]
        .replace(/\(\d{2}:\d{2} - \d{2}:\d{2}\)/, "")
        .trim();

      currentScript = line.replace(/\*\*(.+?)\*\*/, "").trim();
    } else {
      currentScript += "\n" + line;
    }
  }

  if (currentStage) {
    sections.push({
      stage: currentStage,
      script: currentScript.trim(),
    });
  }

  return sections;
}
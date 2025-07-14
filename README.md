# Документация backend-приложения
Сайт - https://igorushakov.ru/
## 1. Общее описание

Приложение предоставляет сервис для работы с расшифровками (транскриптами) встреч из Fireflies.ai. Основной функционал включает:

- Получение метаданных встречи (название, ссылка) по ID или URL через Fireflies.ai API (GraphQL).
- Создание Google Sheets файла с названием встречи в общем Google Drive диске.
- Получение текста транскрипта, разбитого по тематическим блокам.
- Запись структурированных данных в Google таблицу с заданным форматированием.
- Возврат пользователю ссылки на созданный Google Sheets файл.

## 2. Используемые технологии и сервисы

- **Fireflies.ai API**: Получение метаданных и транскриптов встреч.
- **Google Sheets API**: Создание и редактирование Google таблиц.
- **Google Drive API**: Управление файлами в общем Google Drive.
- **Express.js**: Веб-сервер и маршрутизация.
- **Axios**: Отправка HTTP-запросов к Fireflies.ai API.
- **dotenv**: Управление переменными окружения.
- **React**: Клиентская библиотека для построения пользовательских интерфейсов.
- **React Query**: Управление асинхронными запросами и состоянием данных на клиенте.

## 3. Архитектура и структура приложения

- **Маршрут**: `/api/v1/create` — точка входа для создания Google Sheets по ссылке на встречу.
- **Модули**:
  - `firefile.js`: Взаимодействие с Fireflies.ai API.
  - `googlesheets.js`: Авторизация и работа с Google Sheets и Google Drive API.
  - `uploadRouter`: Загрузка аудиофайлов (не входит в основной процесс создания таблицы).
- **Среда**: Node.js с Express.

## 4. Описание маршрута `/api/v1/create`

### 4.1 Входные параметры

- `url`: Ссылка на встречу Fireflies.ai (например, `https://fireflies.ai/view/meeting:12345abcdef`).

### 4.2 Логика работы

1. Извлечение ID встречи из URL (парсинг по разделителю `:`).
2. Получение метаданных встречи через GraphQL Fireflies.ai. Если встреча не найдена — возвращается ошибка.
3. Создание Google Sheets файла с названием встречи в общем диске Google Drive.
4. Получение разбитого по темам транскрипта встречи.
5. Запись данных в Google Sheets с форматированием.
6. Возврат ответа клиенту с информацией об успешности операции и ссылкой на таблицу.

## 5. Модуль Fireflies.ai API (`firefile.js`)

### 5.1 Конфигурация

```js
const API_KEY = process.env.FIRE_API_KEY;
const GRAPHQL_URL = "https://api.fireflies.ai/graphql";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_KEY}`,
};
```

### 5.2 Функция получения информации о встрече

```js
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
    console.error("Error in GraphQL:", e.response?.data || e.message);
    return { success: false, message: e.response?.data?.errors?.[0]?.message || e.message };
  }
}
```

### 5.3 Функция получения транскрипта по ID

```js
async function getTranscriptById(id) {
  const query = `
    query Transcript($id: String!) {
      transcript(id: $id) {
        summary {
          outline
          shorthand_bullet
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
    if (res.data.errors)
      return { success: false, message: res.data.errors[0].message };

    const summary = res.data.data.transcript.summary;
    const rawText = summary.shorthand_bullet || summary.outline || "";

    const parts = rawText.split(/\n(?=📈|⚠️|⏳|🤝|🔍)/);

    const data = parts.map((part) => {
      const firstLineEnd = part.indexOf("\n");
      let stage, script;

      if (firstLineEnd !== -1) {
        stage = part
          .substring(0, firstLineEnd)
          .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
          .trim();
        script = part.substring(firstLineEnd + 1).trim();
      } else {
        stage = part.trim();
        script = "";
      }

      stage = stage.replace(/\(?:\d{2}:\d{2} - \d{2}:\d{2}\)/, "").trim();

      return { stage, script };
    });

    return { success: true, data };
  } catch (error) {
    console.error("Ошибка запроса:", error);
    return {
      success: false,
      message: "Текущий тариф не позволяет получить доступ к этой транскрипции",
    };
  }
}
```

## 6. Модуль Google Sheets и Drive API (`googlesheets.js`)

### 6.1 Авторизация

```js
const { google } = require("googleapis");
const path = require("path");

async function authorize() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, "./credentials.json"),
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  return await auth.getClient();
}
```

### 6.2 Создание Google Sheets файла

```js
async function createFiles(title) {
  const authClient = await authorize();
  const drive = google.drive({ version: "v3", auth: authClient });

  const folderId = "ID_ОБЩЕГО_ДИСКА";

  try {
    const sheetRes = await drive.files.create({
      requestBody: {
        name: title,
        mimeType: "application/vnd.google-apps.spreadsheet",
        parents: [folderId],
      },
      supportsAllDrives: true,
      fields: "id, name, parents",
    });

    const sheetLink = `https://docs.google.com/spreadsheets/d/${sheetRes.data.id}`;
    return { success: true, id: sheetRes.data.id, link: sheetLink };
  } catch (error) {
    console.error("Ошибка при создании файла:", error);
    return { success: false };
  }
}
```

### 6.3 Запись данных в таблицу с форматированием

```js
async function writeFile(spreadsheetId, data) {
  const authClient = await authorize();
  const sheets = google.sheets({ version: "v4", auth: authClient });

  const values = [
    ["№", "Этап", "Скрипт"],
    ...data.map((item, index) => [index + 1, item.stage, item.script]),
  ];

  const grayColor = { red: 0.6, green: 0.6, blue: 0.6 };
  const whiteColor = { red: 1, green: 1, blue: 1 };

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: { values },
    });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 3,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: grayColor,
                  textFormat: { bold: true, foregroundColor: whiteColor },
                  horizontalAlignment: "CENTER",
                  verticalAlignment: "MIDDLE",
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
            },
          },
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 1,
                endRowIndex: values.length,
                startColumnIndex: 0,
                endColumnIndex: 2,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: grayColor,
                  textFormat: { bold: true, foregroundColor: whiteColor },
                  horizontalAlignment: "CENTER",
                  verticalAlignment: "MIDDLE",
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
            },
          },
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 1,
                endRowIndex: values.length,
                startColumnIndex: 2,
                endColumnIndex: 3,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: grayColor,
                  textFormat: { bold: false, foregroundColor: whiteColor },
                  horizontalAlignment: "LEFT",
                  verticalAlignment: "MIDDLE",
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
            },
          },
        ],
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Ошибка при записи в таблицу:", error);
    return { success: false };
  }
}
```

## 7. Пример основного сервера

```js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const uploadRouter = require("./API/routes/upload");
const routerCreateSheet = require("./API/routes/createSheet");

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use("/api/v1", uploadRouter);
app.use("/api/v1", routerCreateSheet);

app.get("/", (req, res) => {
  res})();

app.listen(process.env.PORT, () => {
  console.log(`Server started at ${process.env.URL}:${process.env.PORT}`);
});
```

## 8. Переменные окружения (`.env`)

```.env
FIRE_API_KEY=your_fireflies_api_key
PORT=3000
URL=http://localhost
```

## 9. Важные моменты

- ID листа Google Sheets (`sheetId`) обычно равен 0 для первого листа.
- Права сервисного аккаунта Google должны включать доступ к общему диску (shared drive).
- Fireflies.ai API имеет ограничения по тарифу — ошибки "Too many requests" или "subscription level" обрабатываются отдельно.
- Текст в ячейках Google Sheets не поддерживает частичное форматирование (например, жирность отдельных слов).
- Парсинг транскрипта использует эмодзи-маркеры для разделения на темы, при необходимости адаптируется.

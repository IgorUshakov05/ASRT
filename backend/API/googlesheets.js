const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
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

async function createFiles(title) {
  const authClient = await authorize();
  const drive = google.drive({ version: "v3", auth: authClient });

  const folderId = "0ADNg7DLUC0pPUk9PVA";

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
    console.log("Создан Google Sheets файл:");
    console.log({ id: sheetRes.data.id, link: sheetLink });
    return { success: true, id: sheetRes.data.id, link: sheetLink };
  } catch (error) {
    console.error("Ошибка при создании файла:", error);
    return { success: false };
  }
}

async function writeFile(spreadsheetId, data) {
  const authClient = await authorize();
  const sheets = google.sheets({ version: "v4", auth: authClient });

  const values = [
    ["№", "Этап", "Скрипт"],
    ...data.map((item, index) => [index + 1, item.stage, item.script]),
  ];

  try {
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });
    console.log("Данные записаны в таблицу:", res.data.updatedRange);
    const grayColor = { red: 0.6, green: 0.6, blue: 0.6 };
    const whiteColor = { red: 1, green: 1, blue: 1 };

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
              fields:
                "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
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
              fields:
                "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
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
              fields:
                "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
            },
          },
        ],
      },
    });

    console.log("Форматирование применено к столбцам A и B");
    return { success: true };
  } catch (error) {
    console.error("Ошибка при записи в таблицу:", error);
    return { success: false };
  }
}

module.exports = { createFiles, writeFile };

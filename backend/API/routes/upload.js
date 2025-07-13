const { Router } = require("express");
const { getInfoAboutMeet, getTranscriptById } = require("../firefile");
const { createFiles, writeFile } = require("../googlesheets");
const router = Router();
router.get("/create", async (req, res) => {
  try {
    let id = req.query.url.split("?")[0].split(":").reverse()[0];
    let findInfo = await getInfoAboutMeet(id);
    console.log(findInfo);
    if (!findInfo.success) return res.status(500).json(findInfo);
    console.log(findInfo);
    let createSheet = await createFiles(findInfo.transcriptData.title);
    if (!createSheet.success) return res.status(500).json(createSheet);
    let getContent = await getTranscriptById(id);
    if (!getContent.success) return res.status(500).json(getContent);
    let writeFileSheets = await writeFile(createSheet.id,getContent.data);
    console.log(getContent);
    res.status(201).json({
      success: writeFileSheets.success,
      title: findInfo.transcriptData.title,
      url: createSheet.link,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false });
  }
});

module.exports = router;

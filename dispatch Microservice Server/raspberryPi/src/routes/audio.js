const express = require("express");
const Speaker = require("speaker");
const { generateSineWave } = require("../utils/audioUtils");

const router = express.Router();

router.get("/", (req, res) => {
  const speaker = new Speaker();
  const sineWave = generateSineWave(600);
  speaker.write(sineWave);

  setTimeout(() => {
    speaker.end();
    res.status(200).json({ result: "Success from PI!" });
  }, 1000);
});


module.exports = router;

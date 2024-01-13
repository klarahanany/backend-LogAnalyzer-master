const express = require("express");
const audioRoute = require("./src/routes/audio");

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/audio", audioRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

require("dotenv").config();
const express = require("express");
const verifyPaidRoute = require("./routes/verifyPaid");

const app = express();

app.use(express.json());

app.use("/verifyPaid", verifyPaidRoute);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

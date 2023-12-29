require("dotenv").config();
const express = require("express");
const { readFile } = require("fs").promises;

const verifyPaidRoute = require("./routes/verifyPaid");
const checkoutRoute = require("./routes/checkout");
const webhookRoute = require("./routes/webhook");

const app = express();

app.use("/webhook", webhookRoute);

app.use(express.json());

app.use("/verifyPaid", verifyPaidRoute);
app.use("/checkout", checkoutRoute);

app.get("/publicKey", async (req, res) => {
  const publicKey = await readFile("./public_key.pem", "utf8");
  res.send(publicKey);
});

app.get("/success", (req, res) => {
  res.send("Success");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

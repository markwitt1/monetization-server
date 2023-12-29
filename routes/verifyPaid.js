const express = require("express");
const stripe = require("../stripe");
const { readFile } = require("fs").promises;
const crypto = require("crypto");

const router = express.Router();

router.post("/", async (req, res) => {
  const privateKey = await readFile("./private_key.pem", "utf8");

  const { hashedDeviceID } = req.body;

  if (!hashedDeviceID) {
    return res.status(400).send("Missing hashedDeviceID");
  }

  const { data: payments } = await stripe.paymentIntents.search({
    query: `status:'succeeded' AND metadata['hashedDeviceID']:'${hashedDeviceID}'`,
  });

  for (const payment of payments) {
    const { data: refunds } = await stripe.refunds.list({
      payment_intent: payment.id,
    });

    if (refunds.length === 0) {
      console.log(
        `Found paymentIntent ${payment.id} with hashedDeviceID ${hashedDeviceID}`
      );

      return res
        .status(200)
        .send(signMessage(`paid:${hashedDeviceID}`, privateKey));
    }
  }

  res.sendStatus(404);
});

function signMessage(message, privateKey) {
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(message);
  return signer.sign(privateKey, "base64");
}

module.exports = router;

const express = require("express");
const stripe = require("../stripe");

const router = express.Router();

router.get("/", async (req, res) => {
  const hashedDeviceID = req.query.hashedDeviceID;
  if (!hashedDeviceID) {
    res.status(400).send("Missing hashedDeviceID");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "My Application License",
          },
          unit_amount: 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
    metadata: {
      hashedDeviceID,
    },
  });

  res.redirect(303, session.url);
});

module.exports = router;

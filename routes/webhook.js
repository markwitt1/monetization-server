const express = require("express");
const router = express.Router();
const stripe = require("../stripe");

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event && event.type === "checkout.session.completed") {
      const checkoutSession = event.data.object;

      const { hashedDeviceID } = checkoutSession.metadata;

      if (typeof hashedDeviceID === "string") {
        // Get the associated payment_intent ID from the checkout session
        const paymentIntentId = checkoutSession.payment_intent;

        if (paymentIntentId) {
          // Update the PaymentIntent with the new metadata
          await stripe.paymentIntents.update(paymentIntentId, {
            metadata: {
              hashedDeviceID,
            },
          });
          console.log(
            `Webhook: updated paymentIntent ${paymentIntentId} with hashedDeviceID ${hashedDeviceID}`
          );
        }
      }
    }

    // Return a response to acknowledge receipt of the event
    res.sendStatus(200);
  }
);

module.exports = router;

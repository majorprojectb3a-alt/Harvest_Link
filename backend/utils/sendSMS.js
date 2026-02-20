import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (toE164, body, opts = {}) => {
  try {
    if(!toE164)
      throw new Error("Missing 'to' phone number");
    const fromOpts = {}

    if(process.env.TWILIO_MESSAGING_SERVICE_SID){
      fromOpts.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    }
    else if (process.env.TWILIO_PHONE_NUMBER) {
    fromOpts.from = process.env.TWILIO_PHONE_NUMBER;
    }
    else {
    throw new Error("No Twilio sender configured (MESSAGING_SERVICE_SID or TWILIO_PHONE_NUMBER)");
  }

  const statusCallback = opts.callbackUrl || `${process.env.BASE_URL.replace(/\/$/, "")}/twilio/status`;

  const payload = {
    to: toE164,
    body,
    statusCallback,
    ...fromOpts
  };

  // create returns a MessageInstance
  return client.messages.create(payload);
  } catch (error) {
    console.error("SMS error:", error.message);
  }
};

export default sendSMS;
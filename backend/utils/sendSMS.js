import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const formatToE164 = (phone10)=>{
  if (!phone10) return null;
  phone10 = phone10.trim();
  console.log(phone10);
  if (phone10.startsWith("+")) return phone10;
  console.log(phone10, '1');
  if (phone10.length === 10) return `+91${phone10}`;
  console.log(phone10, '2');
  if (phone10.length === 11 && phone10.startsWith("0")) return `+91${phone10.slice(1)}`;
  return phone10; 

}
const sendSMS = async (to, message) => {
  const toe164 = formatToE164(to);
    if(!toe164)
      throw new Error("invalid phone number");
    console.log(process.env.TWILIO_ACCOUNT_SID);
  try {
    const res = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toe164
    });
    console.log("SMS sent:", res.sid);
    return res;
  } catch (err) {
    console.log("SMS error:", err.message);
  }
};

export default sendSMS;
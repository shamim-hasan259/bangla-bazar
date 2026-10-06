import axios from "axios";

type SMSType = {
  message: string;
  numbers: string;
};

export default async function sendSms({ message, numbers }: SMSType) {
  let url  = process.env.SMS_GATEWAY;
  url += `&receiver=${numbers}`;
  url += `&message=${message}`;

  console.log("SMS URL: ", url)

  try {
    await axios.get(url).then((res) => {
      return res.data;
    });
  } catch (err) {
    err;
  }
}

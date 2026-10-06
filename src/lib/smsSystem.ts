import axios from "axios";
// import queryString from 'query-string';
import qs from "qs";
const TOKEN = process.env.REACT_APP_SMS_TOKEN
  ? process.env.REACT_APP_SMS_TOKEN
  : "828217544316590092839a29f7f8044f8306783734380ec762fe";

type SMSType = {
  message: string;
  to: string;
};
const sendMessage = async ({ to, message }: SMSType) => {
  to, message, TOKEN;
  const url = "https://api.greenweb.com.bd/api.php";
  if (to && message) {
    const data = {
      to: to,
      message: message,
      token: TOKEN,
    };
    const options = {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: qs.stringify(data),
      url,
    };
    axios(options).then((res) => res);
  }
  //  (queryString.stringify({  token: TOKEN, to: to, message: message }))
};

export default sendMessage;

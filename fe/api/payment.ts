import axios from "axios";

export const createQR = async (data: any) => {
  const qr = await axios.post(`${process.env.URL}/payment/create-qr`, data, {
    withCredentials: true,
  });

  return qr;
};

export const handleCallback = async (data: any) => {
  const callback = await axios.post(
    `${process.env.URL}/payment/callback`,
    data,
    {
      withCredentials: true,
    }
  );

  return callback;
};

import axios from "axios";

export const StartYouTubeLivestream = async (data: any) => {
  const stream = await axios.post(
    `${process.env.URL}/livestream/youtube/start`,
    data,
    {
      withCredentials: true,
    }
  );

  return stream;
};
export const StopYouTubeLivestream = async () => {
  const stream = await axios.post(
    `${process.env.URL}/livestream/youtube/stop`,
    {},
    {
      withCredentials: true,
    }
  );

  return stream;
};
export const StartFacebookLivestream = async (data: any) => {
  const stream = await axios.post(
    `${process.env.URL}/livestream/facebook/start`,
    data,
    {
      withCredentials: true,
    }
  );

  return stream;
};
export const StopFacebookLivestream = async () => {
  const stream = await axios.post(
    `${process.env.URL}/livestream/facebook/stop`,
    {},
    {
      withCredentials: true,
    }
  );

  return stream;
};

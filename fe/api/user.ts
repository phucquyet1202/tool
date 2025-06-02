import axios from "axios";

export const GetAllUser = async () => {
  const user = await axios.get(`${process.env.URL}/user`, {
    withCredentials: true,
  });

  return user;
};
export const GetUserById = async (id: string) => {
  const user = await axios.get(`${process.env.URL}/user/get-one/${id}`, {
    withCredentials: true,
  });

  return user;
};
export const RegisterUser = async (data: any) => {
  const user = await axios.post(`${process.env.URL}/user`, data, {
    withCredentials: true,
  });

  return user;
};
export const LoginUser = async (data: any) => {
  const user = await axios.post(`${process.env.URL}/user/login`, data, {
    withCredentials: true,
  });

  return user;
};
export const LogoutUser = async () => {
  const user = await axios.post(
    `${process.env.URL}/user/logout`,
    {},
    {
      withCredentials: true,
    }
  );

  return user;
};
export const UpdateUser = async (id: string, data: any) => {
  const user = await axios.patch(`${process.env.URL}/user/${id}`, data, {
    withCredentials: true,
  });

  return user;
};
export const DeleteUser = async (id: string) => {
  const user = await axios.delete(`${process.env.URL}/user/${id}`, {
    withCredentials: true,
  });

  return user;
};
export const GetUserByToken = async () => {
  const user = await axios.get(`${process.env.URL}/user/get-user-by-token`, {
    withCredentials: true,
  });

  return user;
};

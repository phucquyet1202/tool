import axios from "axios";

export const create = async (data: any) => {
  const history = await axios.post(`${process.env.URL}/history`, data, {
    withCredentials: true,
  });

  return history;
};
export const getAll = async (page = 1, limit = 10) => {
  const history = await axios.get(`${process.env.URL}/history`, {
    params: { page, limit },
    withCredentials: true,
  });

  return history;
};
export const getById = async (id: string) => {
  const history = await axios.get(`${process.env.URL}/history/${id}`, {
    withCredentials: true,
  });

  return history;
};
export const update = async (id: string, data: any) => {
  const history = await axios.patch(`${process.env.URL}/history/${id}`, data, {
    withCredentials: true,
  });

  return history;
};
export const remove = async (id: string) => {
  const history = await axios.delete(`${process.env.URL}/history/${id}`, {
    withCredentials: true,
  });

  return history;
};

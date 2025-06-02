import axios from "axios";

export const createOrder = async (data: any) => {
  const order = await axios.post(`${process.env.URL}/orders`, data, {
    withCredentials: true,
  });

  return order;
};
export const getAllOrders = async (page = 1, limit = 10) => {
  const orders = await axios.get(`${process.env.URL}/orders`, {
    params: { page, limit },
    withCredentials: true,
  });

  return orders;
};
export const getOrderById = async (id: string) => {
  const order = await axios.get(`${process.env.URL}/orders/${id}`, {
    withCredentials: true,
  });

  return order;
};
export const updateOrder = async (id: string, data: any) => {
  const order = await axios.patch(`${process.env.URL}/orders/${id}`, data, {
    withCredentials: true,
  });

  return order;
};
export const deleteOrder = async (id: string) => {
  const order = await axios.delete(`${process.env.URL}/orders/${id}`, {
    withCredentials: true,
  });

  return order;
};

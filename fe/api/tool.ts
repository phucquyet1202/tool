import axios from "axios";

export const CreateTool = async (tool: any) => {
  const data = await axios.post(`${process.env.URL}/tool`, tool, {
    withCredentials: true,
  });

  return data;
};
export const GetAllTool = async () => {
  const data = await axios.get(`${process.env.URL}/tool`, {
    withCredentials: true,
  });

  return data;
};
export const GetToolById = async (id: string) => {
  const data = await axios.get(`${process.env.URL}/tool/${id}`, {
    withCredentials: true,
  });

  return data;
};
export const UpdateTool = async (id: string, tool: any) => {
  const data = await axios.patch(`${process.env.URL}/tool/${id}`, tool, {
    withCredentials: true,
  });

  return data;
};
export const DeleteTool = async (id: string) => {
  const data = await axios.delete(`${process.env.URL}/tool/${id}`, {
    withCredentials: true,
  });

  return data;
};

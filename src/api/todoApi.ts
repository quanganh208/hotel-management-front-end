import axiosInstance from "@/lib/axios";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  userId?: string;
}

export interface CreateTodoData {
  title: string;
  completed?: boolean;
}

const todoApi = {
  getAll: async () => {
    const response = await axiosInstance.get<Todo[]>("/todos");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<Todo>(`/todos/${id}`);
    return response.data;
  },

  create: async (data: CreateTodoData) => {
    const response = await axiosInstance.post<Todo>("/todos", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Todo>) => {
    const response = await axiosInstance.put<Todo>(`/todos/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await axiosInstance.delete(`/todos/${id}`);
    return true;
  },
};

export default todoApi;

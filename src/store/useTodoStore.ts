import { create } from "zustand";
import { Todo, CreateTodoData } from "@/api/todoApi";
import todoApi from "@/api/todoApi";

interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTodos: () => Promise<void>;
  addTodo: (data: CreateTodoData) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, data: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export const useTodoStore = create<TodoState>()((set, get) => ({
  todos: [],
  isLoading: false,
  error: null,

  fetchTodos: async () => {
    set({ isLoading: true, error: null });
    try {
      const todos = await todoApi.getAll();
      set({ todos, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          "Không thể tải danh sách việc cần làm",
        isLoading: false,
      });
    }
  },

  addTodo: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newTodo = await todoApi.create(data);
      set((state) => ({
        todos: [...state.todos, newTodo],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Không thể thêm công việc mới",
        isLoading: false,
      });
    }
  },

  toggleTodo: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const todo = get().todos.find((t) => t.id === id);
      if (!todo) throw new Error("Không tìm thấy công việc");

      const updatedTodo = await todoApi.update(id, {
        completed: !todo.completed,
      });

      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? updatedTodo : t)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Không thể cập nhật trạng thái",
        isLoading: false,
      });
    }
  },

  updateTodo: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTodo = await todoApi.update(id, data);
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? updatedTodo : t)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Không thể cập nhật công việc",
        isLoading: false,
      });
    }
  },

  deleteTodo: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await todoApi.delete(id);
      set((state) => ({
        todos: state.todos.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Không thể xóa công việc",
        isLoading: false,
      });
    }
  },
}));

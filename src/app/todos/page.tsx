"use client";

import { useEffect, useState } from "react";
import { useTodoStore } from "@/store/useTodoStore";
import { Todo, CreateTodoData } from "@/api/todoApi";

export default function TodosPage() {
  const {
    todos,
    isLoading,
    error,
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
  } = useTodoStore();
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    const todoData: CreateTodoData = {
      title: newTodoTitle,
      completed: false,
    };

    await addTodo(todoData);
    setNewTodoTitle("");
  };

  const handleToggle = async (id: string) => {
    await toggleTodo(id);
  };

  const handleDelete = async (id: string) => {
    await deleteTodo(id);
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo || !editTitle.trim()) return;

    await updateTodo(editingTodo.id, { title: editTitle });
    setEditingTodo(null);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Danh sách công việc</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="Thêm công việc mới..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Thêm"}
          </button>
        </div>
      </form>

      {isLoading && <p>Đang tải dữ liệu...</p>}

      <ul className="space-y-3">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="bg-white shadow-sm rounded-lg p-4 flex items-center justify-between"
          >
            {editingTodo?.id === todo.id ? (
              <form onSubmit={handleEditSubmit} className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTodo(null)}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition"
                >
                  Hủy
                </button>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggle(todo.id)}
                    className="h-5 w-5 text-blue-600"
                  />
                  <span
                    className={`text-lg ${
                      todo.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {todo.title}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(todo)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                  >
                    Xóa
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {!isLoading && todos.length === 0 && (
        <p className="text-gray-500 text-center mt-6">
          Chưa có công việc nào. Hãy thêm công việc mới!
        </p>
      )}
    </div>
  );
}

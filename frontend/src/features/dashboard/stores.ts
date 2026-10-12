import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

export interface Task {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

type TaskState = {
  tasks: Task[];
  addTask: (data: { name: string }) => void;
  updateTask: (id: string, data: Partial<Pick<Task, 'name'>>) => void;
  removeTask: (id: string) => void;
};

export const useTaskStore = create<TaskState>()(
  devtools(
    persist(
      (set) => ({
        tasks: [],
        addTask: (data) =>
          set((state) => ({
            tasks: [
              {
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...data,
              },
              ...state.tasks,
            ],
          })),
        updateTask: (id, data) =>
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, ...data, updatedAt: new Date().toISOString() }
                : task,
            ),
          })),
        removeTask: (id) =>
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          })),
      }),
      {
        name: 'task-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ tasks: state.tasks }),
      },
    ),
    { name: 'TaskStore' },
  ),
);

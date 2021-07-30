// A mock function to mimic making an async request for data
import { tasks } from './tasks.json';

export function fetchTasks() {
  return new Promise<{ data: Object }>((resolve) => {
    setTimeout(() => resolve({ data: tasks }), 1000)
  });
}

type TaskType = {
  key?: string,
  title: string,
  status: string,
}

type TasksState = {
  list: Array<TaskType>;
  status: 'idle' | 'loading' | 'failed';
}

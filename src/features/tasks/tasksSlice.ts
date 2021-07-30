import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../app/store';
import { fetchTasks } from './tasksAPI';

const initialState: TasksState = {
  list: [],
  status: 'idle',
};

const prepareData = (data: any) => (data.map((task: any, index: any) => ({ ...task, key: `task${index}` })));

export const getTasksAsync = createAsyncThunk(
  'tasks/fetchTasks',
  async () => {
    const response = await fetchTasks();
    return prepareData(response.data);
  }
);

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    markAsDone: (state, action: PayloadAction<string>) => {
      state.list.map((task) => task.key === action.payload ? { ...task, status: 'done' } : task);
    },
    markAsTodo: (state, action: PayloadAction<string>) => {
      state.list.map((task) => task.key === action.payload ? { ...task, status: 'todo' } : task);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTasksAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getTasksAsync.fulfilled, (state: any, action) => {
        state.status = 'idle';
        state.list = action.payload;
      });
  },
});

export const { markAsDone, markAsTodo } = tasksSlice.actions;

export const selectTodoTasks = (state: RootState) => state.tasks.list.filter((task) => task.status === 'todo');
export const selectDoneTasks = (state: RootState) => state.tasks.list.filter((task) => task.status === 'done');

export default tasksSlice.reducer;

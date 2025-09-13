import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/api.js';


// Boards
export const fetchBoards = createAsyncThunk('boards/fetchBoards', async () => {
  const res = await API.get('/boards');
  return res.data;
});

export const createBoard = createAsyncThunk('boards/createBoard', async (payload) => {
  const res = await API.post('/boards', payload);
  return res.data;
});

export const updateBoard = createAsyncThunk('boards/updateBoard', async ({ id, updates }) => {
  const res = await API.put(`/boards/${id}`, updates);
  return res.data;
});

export const deleteBoard = createAsyncThunk('boards/deleteBoard', async (id) => {
  await API.delete(`/boards/${id}`);
  return id;
});

// Board details
export const fetchBoard = createAsyncThunk('boards/fetchBoard', async (boardId) => {
  const res = await API.get(`/boards/${boardId}`);
  return res.data;
});

// Lists
export const createList = createAsyncThunk('boards/createList', async (payload) => {
  const res = await API.post('/lists', payload);
  return res.data;
});

export const updateList = createAsyncThunk('boards/updateList', async ({ id, updates }) => {
  const res = await API.put(`/lists/${id}`, updates);
  return res.data;
});

export const deleteList = createAsyncThunk('boards/deleteList', async (id) => {
  await API.delete(`/lists/${id}`);
  return id;
});

// Tasks
export const createTask = createAsyncThunk('boards/createTask', async (payload) => {
  const res = await API.post('/tasks', payload);
  return res.data;
});

export const updateTask = createAsyncThunk('boards/updateTask', async ({ id, updates }) => {
  const res = await API.put(`/tasks/${id}`, updates);
  return res.data;
});

export const deleteTask = createAsyncThunk('boards/deleteTask', async (id) => {
  await API.delete(`/tasks/${id}`);
  return id;
});

export const moveTaskApi = createAsyncThunk('boards/moveTask', async (payload) => {
  const res = await API.put('/tasks/move', payload);
  return res.data;
});

// ==================== Slice ====================

const initialState = {
  list: [],
  current: null,
  lists: [],
  tasks: [],
  status: 'idle',
};

const slice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    // Apply incoming socket update
    applyBoardUpdate(state, action) {
      const { type, data } = action.payload;

      switch (type) {
        case 'list-created':
          state.lists.push(data);
          break;

        case 'list-updated':
          state.lists = state.lists.map((l) => (l._id === data._id ? data : l));
          break;

        case 'list-deleted':
          state.lists = state.lists.filter((l) => l._id !== data.listId);
          state.tasks = state.tasks.filter((t) => t.list !== data.listId);
          break;

        case 'task-created': {
          state.tasks.push(data);
          const listIdx = state.lists.findIndex((l) => l._id === data.list);
          if (listIdx >= 0) {
            if (!state.lists[listIdx].taskOrder) state.lists[listIdx].taskOrder = [];
            state.lists[listIdx].taskOrder.push(data._id);
          }
          break;
        }

        case 'task-updated':
          state.tasks = state.tasks.map((t) => (t._id === data._id ? data : t));
          break;

        case 'task-deleted':
          state.tasks = state.tasks.filter((t) => t._id !== data.taskId);
          state.lists = state.lists.map((l) => ({
            ...l,
            taskOrder: (l.taskOrder || []).filter((id) => id !== data.taskId),
          }));
          break;

        case 'task-moved': {
          const { taskId, fromListId, toListId, toIndex } = data;

          // Remove from source list
          state.lists = state.lists.map((l) =>
            l._id === fromListId
              ? { ...l, taskOrder: (l.taskOrder || []).filter((id) => id !== taskId) }
              : l
          );

          // Add to destination list
          state.lists = state.lists.map((l) => {
            if (l._id === toListId) {
              const taskOrder = Array.isArray(l.taskOrder) ? [...l.taskOrder] : [];
              taskOrder.splice(toIndex, 0, taskId);
              return { ...l, taskOrder };
            }
            return l;
          });

          // Update task's list
          state.tasks = state.tasks.map((t) => (t._id === taskId ? { ...t, list: toListId } : t));
          break;
        }

        case 'board-updated':
          if (state.current?._id === data._id) state.current = data;
          break;

        case 'board-deleted':
          break;

        default:
          break;
      }
    },
  },
  extraReducers: (builder) => {
    // Boards
    builder.addCase(fetchBoards.fulfilled, (state, action) => {
      state.list = action.payload;
    });
    builder.addCase(createBoard.fulfilled, (state, action) => {
      state.list.push(action.payload);
    });
    builder.addCase(deleteBoard.fulfilled, (state, action) => {
      state.list = state.list.filter((b) => b._id !== action.payload);
    });

    // Board details
    builder.addCase(fetchBoard.fulfilled, (state, action) => {
      state.current = action.payload.board;
      state.lists = action.payload.lists;
      state.tasks = action.payload.tasks;
    });

    // Lists
    builder.addCase(createList.fulfilled, (state, action) => {
      state.lists.push(action.payload);
    });
    builder.addCase(deleteList.fulfilled, (state, action) => {
      const listId = action.payload;
      state.lists = state.lists.filter((l) => l._id !== listId);
      state.tasks = state.tasks.filter((t) => t.list !== listId);
    });

    // Tasks
    builder.addCase(createTask.fulfilled, (state, action) => {
      state.tasks.push(action.payload);
    });
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload);
    });

    builder.addCase(moveTaskApi.fulfilled, (state) => {
    });
  },
});

export const { applyBoardUpdate } = slice.actions;
export default slice.reducer;

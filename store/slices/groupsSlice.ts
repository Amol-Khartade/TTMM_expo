import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GroupsState, Group, GroupMember } from '@/types';
import { groupsService } from '@/services/groupsService';

const initialState: GroupsState = {
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,
};

export const fetchGroups = createAsyncThunk('groups/fetchGroups', async (userId: string) => {
  return await groupsService.getUserGroups(userId);
});

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async ({ name, description, userId }: { name: string; description?: string; userId: string }) => {
    return await groupsService.createGroup(name, description, userId);
  }
);

export const addMember = createAsyncThunk(
  'groups/addMember',
  async ({ groupId, email }: { groupId: string; email: string }) => {
    return await groupsService.addMemberToGroup(groupId, email);
  }
);

export const removeMember = createAsyncThunk(
  'groups/removeMember',
  async ({ groupId, userId }: { groupId: string; userId: string }) => {
    return await groupsService.removeMemberFromGroup(groupId, userId);
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ groupId, updates }: { groupId: string; updates: Partial<Group> }) => {
    return await groupsService.updateGroup(groupId, updates);
  }
);

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    setCurrentGroup: (state, action: PayloadAction<Group | null>) => {
      state.currentGroup = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch groups';
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.groups.push(action.payload);
      })
      .addCase(addMember.fulfilled, (state, action) => {
        const groupIndex = state.groups.findIndex(g => g.id === action.payload.groupId);
        if (groupIndex !== -1) {
          state.groups[groupIndex].members.push(action.payload.member);
        }
        if (state.currentGroup?.id === action.payload.groupId) {
          state.currentGroup.members.push(action.payload.member);
        }
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        const { groupId, userId } = action.payload;
        const groupIndex = state.groups.findIndex(g => g.id === groupId);
        if (groupIndex !== -1) {
          state.groups[groupIndex].members = state.groups[groupIndex].members.filter(
            m => m.userId !== userId
          );
        }
        if (state.currentGroup?.id === groupId) {
          state.currentGroup.members = state.currentGroup.members.filter(
            m => m.userId !== userId
          );
        }
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        const groupIndex = state.groups.findIndex(g => g.id === action.payload.id);
        if (groupIndex !== -1) {
          state.groups[groupIndex] = action.payload;
        }
        if (state.currentGroup?.id === action.payload.id) {
          state.currentGroup = action.payload;
        }
      });
  },
});

export const { setCurrentGroup, clearError } = groupsSlice.actions;
export default groupsSlice.reducer;
import { groupsService } from '@/services/groupsService';
import { Group, GroupsState } from '@/types';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: GroupsState = {
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,
};

export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await groupsService.getUserGroups(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (
    {
      name,
      description,
      userId,
      memberEmails,
    }: {
      name: string;
      description?: string;
      userId: string;
      memberEmails?: string[];
    },
    { rejectWithValue }
  ) => {
    try {
      return await groupsService.createGroup(
        name,
        description,
        userId,
        memberEmails
      );
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addMultipleMembers = createAsyncThunk(
  'groups/addMultipleMembers',
  async (
    { groupId, emails }: { groupId: string; emails: string[] },
    { rejectWithValue }
  ) => {
    try {
      return await groupsService.addMultipleMembersToGroup(groupId, emails);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addMember = createAsyncThunk(
  'groups/addMember',
  async (
    { groupId, email }: { groupId: string; email: string },
    { rejectWithValue }
  ) => {
    try {
      return await groupsService.addMemberToGroup(groupId, email);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeMember = createAsyncThunk(
  'groups/removeMember',
  async (
    { groupId, userId }: { groupId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      return await groupsService.removeMemberFromGroup(groupId, userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async (
    { groupId, updates }: { groupId: string; updates: Partial<Group> },
    { rejectWithValue }
  ) => {
    try {
      return await groupsService.updateGroup(groupId, updates);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
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
        state.error = action.payload as string;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.groups = [...state.groups, action.payload];
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(addMultipleMembers.fulfilled, (state, action) => {
        const groupIndex = state.groups.findIndex(
          (g) => g.id === action.payload[0]?.groupId
        );
        if (groupIndex !== -1) {
          state.groups[groupIndex].members = [
            ...state.groups[groupIndex].members,
            ...action.payload,
          ];
        }
        if (state.currentGroup?.id === action.payload[0]?.groupId) {
          state.currentGroup.members = [
            ...state.currentGroup.members,
            ...action.payload,
          ];
        }
      })
      .addCase(addMember.fulfilled, (state, action) => {
        const groupIndex = state.groups.findIndex(
          (g) => g.id === action.payload.groupId
        );
        if (groupIndex !== -1) {
          state.groups[groupIndex].members.push(action.payload.member);
        }
        if (state.currentGroup?.id === action.payload.groupId) {
          state.currentGroup.members.push(action.payload.member);
        }
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        const { groupId, userId } = action.payload;
        const groupIndex = state.groups.findIndex((g) => g.id === groupId);
        if (groupIndex !== -1) {
          state.groups[groupIndex].members = state.groups[
            groupIndex
          ].members.filter((m) => m.userId !== userId);
        }
        if (state.currentGroup?.id === groupId) {
          state.currentGroup.members = state.currentGroup.members.filter(
            (m) => m.userId !== userId
          );
        }
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        const groupIndex = state.groups.findIndex(
          (g) => g.id === action.payload.id
        );
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

import { createSlice } from '@reduxjs/toolkit';

interface InitialStatetype {
  user: any;
  suspensionData: {
    status: 'blocked' | 'suspended' | null;
    reason: string | null;
  } | null;
}

const initialState: InitialStatetype = {
  user: null,
  suspensionData: null,
};

const userSlice = createSlice({
  name: 'userSlice',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;

    },
    logout(state) {
      state.user = null;
    },
    setSuspensionData(state, action) {
      state.suspensionData = action.payload;
    },
    clearSuspensionData(state) {
      state.suspensionData = null;
    },
    updateUserStore: (state, action) => {
      if (!state.user) return;

      Object.keys(action.payload).forEach((key) => {
        const value = action.payload[key];

        if (Array.isArray(value)) {
          state.user[key] = value;
        } else {
          state.user[key] = value;
        }
      });
    },
  },
});

export const { setUser, logout, updateUserStore, setSuspensionData, clearSuspensionData } = userSlice.actions;
export default userSlice.reducer;

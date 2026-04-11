import { createSlice } from '@reduxjs/toolkit';

interface InitialStatetype {
  user: any;

}

const initialState: InitialStatetype = {
  user: null,

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

export const { setUser, logout, updateUserStore } = userSlice.actions;
export default userSlice.reducer;

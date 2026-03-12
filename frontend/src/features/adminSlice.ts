import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AdminTypes {
  _id: string;
  name: string;
  email: string;
  organizationName?: string;
  role?: string;
}

interface AdminState {
  admin: AdminTypes | null;
}

const initialState: AdminState = {
  admin: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdmin: (state, action: PayloadAction<AdminTypes>) => {
      state.admin = action.payload;
    },
    adminLogout: (state) => {
      state.admin = null;
    },
  },
});

export const { setAdmin, adminLogout } = adminSlice.actions;
export default adminSlice.reducer;

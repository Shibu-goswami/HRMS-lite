import { configureStore } from "@reduxjs/toolkit";
import { employeeApi } from "../features/employeeApi";
import { attendanceApi } from "../features/attendanceApi";

export const store = configureStore({
  reducer: {
    [employeeApi.reducerPath]: employeeApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      employeeApi.middleware,
      attendanceApi.middleware,
    ),
});
    
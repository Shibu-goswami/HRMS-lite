import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://hrms-lite-production-f1e9.up.railway.app/",
  }),
  tagTypes: ["Attendance"],
  endpoints: (builder) => ({
    // 🔹 Get Attendance (optional date filter)
    getAttendance: builder.query({
      query: (date) =>
        date ? `attendance/?date=${date}` : "attendance/",
      providesTags: ["Attendance"],
    }),

    // 🔹 Create
    markAttendance: builder.mutation({
      query: (data) => ({
        url: "attendance/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // 🔹 Update
    updateAttendance: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `attendance/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // 🔹 Delete
    deleteAttendance: builder.mutation({
      query: (id) => ({
        url: `attendance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attendance"],
    }),
  }),
});

export const {
  useGetAttendanceQuery,
  useMarkAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
} = attendanceApi;
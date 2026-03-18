import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CalendarCheck,
  UserCheck,
  Percent,
} from "lucide-react";

import { useGetEmployeesQuery } from "../features/employeeApi";
import { useGetAttendanceQuery } from "../features/attendanceApi";

export default function Dashboard() {
  const { data: employees } = useGetEmployeesQuery();
  const { data: attendanceRecords } = useGetAttendanceQuery();

  const today = new Date().toISOString().split("T")[0];

  const totalEmployees = employees?.length || 0;

  const employeeMap = useMemo(() => {
    const map = {};
    employees?.forEach((emp) => {
      map[emp.id] = emp.name;
    });
    return map;
  }, [employees]);

  const validAttendance = useMemo(() => {
    if (!attendanceRecords || !employees) return [];
    const ids = new Set(employees.map((e) => e.id));
    return attendanceRecords.filter((rec) =>
      ids.has(rec.employee_id)
    );
  }, [attendanceRecords, employees]);

  const todaysAttendance = validAttendance.filter(
    (rec) => rec.date === today
  );

  const presentCount = todaysAttendance.filter(
    (r) => r.status === "Present"
  ).length;

  const rate =
    todaysAttendance.length > 0
      ? ((presentCount / todaysAttendance.length) * 100).toFixed(1)
      : 0;

  const recentAttendance = validAttendance.slice(-5).reverse();

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back 👋
          </h1>
          <p className="text-gray-500">
            Here's what’s happening today
          </p>
        </div>

        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-sm text-gray-600">
          📅 {today}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          icon={<Users />}
          color="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Today's Records"
          value={todaysAttendance.length}
          icon={<CalendarCheck />}
          color="bg-purple-50 text-purple-600"
        />

        <StatCard
          title="Present Today"
          value={presentCount}
          icon={<UserCheck />}
          color="bg-green-50 text-green-600"
        />

        <StatCard
          title="Attendance Rate"
          value={`${rate}%`}
          icon={<Percent />}
          color="bg-orange-50 text-orange-600"
        />
      </div>

      {/* GRID SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* RECENT ATTENDANCE */}
        <motion.div
          className="xl:col-span-2 bg-white rounded-2xl shadow-sm border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">
              Recent Attendance
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="p-4 text-left">Employee</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentAttendance.map((rec) => (
                  <tr
                    key={rec.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium text-gray-800">
                      {employeeMap[rec.employee_id]}
                    </td>

                    <td className="p-4 text-gray-500">
                      {rec.date}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          rec.status === "Present"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {recentAttendance.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center p-6 text-gray-400"
                    >
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* QUICK SUMMARY PANEL */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">
            Quick Summary
          </h2>

          <SummaryItem
            label="Total Employees"
            value={totalEmployees}
          />
          <SummaryItem
            label="Present Today"
            value={presentCount}
          />
          <SummaryItem
            label="Absent Today"
            value={
              todaysAttendance.length - presentCount
            }
          />
          <SummaryItem label="Attendance %" value={`${rate}%`} />
        </div>
      </div>
    </div>
  );
}

/* Stat Card */
function StatCard({ title, value, icon, color }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl p-5 shadow-sm border flex justify-between items-center"
    >
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-2xl font-bold text-gray-800 mt-1">
          {value}
        </h2>
      </div>

      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </motion.div>
  );
}

/* Summary Item */
function SummaryItem({ label, value }) {
  return (
    <div className="flex justify-between text-sm text-gray-600">
      <span>{label}</span>
      <span className="font-semibold text-gray-800">
        {value}
      </span>
    </div>
  );
}
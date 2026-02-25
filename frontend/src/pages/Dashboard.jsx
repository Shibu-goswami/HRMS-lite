import { useMemo } from "react";
import { useGetEmployeesQuery } from "../features/employeeApi";
import { useGetAttendanceQuery } from "../features/attendanceApi";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

function Dashboard() {
  const {
    data: employees,
    isLoading: employeesLoading,
  } = useGetEmployeesQuery();

  const {
    data: attendanceRecords,
    isLoading: attendanceLoading,
  } = useGetAttendanceQuery();

  const today = new Date().toISOString().split("T")[0];

  const totalEmployees = employees?.length || 0;

  // 🔥 Employee Map
  const employeeMap = useMemo(() => {
    const map = {};
    employees?.forEach((emp) => {
      map[emp.id] = emp.name;
    });
    return map;
  }, [employees]);

  // 🔥 Remove deleted employees attendance
  const validAttendance = useMemo(() => {
    if (!attendanceRecords || !employees) return [];
    const employeeIds = new Set(employees.map((e) => e.id));
    return attendanceRecords.filter((rec) =>
      employeeIds.has(rec.employee_id)
    );
  }, [attendanceRecords, employees]);

  // 🔥 Today's attendance only
  const todaysAttendance = useMemo(() => {
    return validAttendance.filter((rec) => rec.date === today);
  }, [validAttendance, today]);

  const totalAttendanceToday = todaysAttendance.length;

  const presentCountToday = todaysAttendance.filter(
    (rec) => rec.status === "Present"
  ).length;

  const attendanceRateToday =
    totalAttendanceToday > 0
      ? ((presentCountToday / totalAttendanceToday) * 100).toFixed(1)
      : 0;

  const recentAttendance = validAttendance
    .slice(-5)
    .reverse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1">
          Summary of employees and today’s attendance performance.
        </p>
      </div>

      {/* Loading */}
      {(employeesLoading || attendanceLoading) && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.1 },
          },
        }}
      >
        <StatCard title="Total Employees" value={totalEmployees} />
        <StatCard
          title="Today's Records"
          value={totalAttendanceToday}
        />
        <StatCard
          title="Today's Present"
          value={presentCountToday}
        />
        <StatCard
          title="Today's Attendance Rate"
          value={`${attendanceRateToday}%`}
        />
      </motion.div>

      {/* Recent Attendance */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-700">
            Recent Attendance
          </h2>
        </div>

        {recentAttendance.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No attendance records available.
          </div>
        )}

        {recentAttendance.length > 0 && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentAttendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {employeeMap[rec.employee_id]}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {rec.date}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        rec.status === "Present"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </motion.div>
  );
}

function StatCard({ title, value }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition"
    >
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800 mt-2">
        {value}
      </h3>
    </motion.div>
  );
}

export default Dashboard;
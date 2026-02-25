import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useGetEmployeesQuery } from "../features/employeeApi";
import {
  useGetAttendanceQuery,
  useMarkAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
} from "../features/attendanceApi";

function Attendance() {
  /* ===============================
     Employees Query
  =============================== */
  const {
    data: employees,
    isLoading: employeesLoading,
  } = useGetEmployeesQuery();

  /* ===============================
     Attendance Query
  =============================== */
  const {
    data: attendanceRecords,
    isLoading,
    isError,
    error,
  } = useGetAttendanceQuery();

  const [markAttendance, { isLoading: isMarking }] =
    useMarkAttendanceMutation();
  const [updateAttendance, { isLoading: isUpdating }] =
    useUpdateAttendanceMutation();
  const [deleteAttendance, { isLoading: isDeleting }] =
    useDeleteAttendanceMutation();

  /* ===============================
     Local States
  =============================== */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const [formError, setFormError] = useState(null);

  const [form, setForm] = useState({
    employee_id: "",
    date: "",
    status: "Present",
  });

  const today = new Date().toISOString().split("T")[0];

  /* ===============================
     Employee Map
  =============================== */
  const employeeMap = useMemo(() => {
    const map = {};
    employees?.forEach((emp) => {
      map[emp.id] = emp.name;
    });
    return map;
  }, [employees]);

  /* ===============================
     Filter attendance of deleted employees
  =============================== */
  const filteredAttendance = useMemo(() => {
    if (!attendanceRecords || !employees) return [];
    return attendanceRecords.filter(
      (record) => employeeMap[record.employee_id]
    );
  }, [attendanceRecords, employeeMap, employees]);

  /* ===============================
     Stats
  =============================== */
  const totalRecords = filteredAttendance.length;
  const presentCount =
    filteredAttendance.filter((r) => r.status === "Present").length;

  /* ===============================
     Modal Handlers
  =============================== */
  const openAddModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setForm({
      employee_id: "",
      date: "",
      status: "Present",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setIsEditing(true);
    setSelectedId(record.id);
    setForm({
      employee_id: record.employee_id,
      date: record.date,
      status: record.status,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (isEditing) {
        await updateAttendance({
          id: selectedId,
          ...form,
        }).unwrap();
      } else {
        await markAttendance(form).unwrap();
      }

      setIsModalOpen(false);
    } catch (err) {
      setFormError(err?.data?.detail || "Something went wrong");
    }
  };

  const openDelete = (record) => {
    setRecordToDelete(record);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAttendance(recordToDelete.id).unwrap();
      setIsDeleteOpen(false);
      setRecordToDelete(null);
    } catch {
      alert("Failed to delete attendance");
    }
  };

  const isSubmitting = isMarking || isUpdating;

  /* ===============================
     No Employees State
  =============================== */
  if (!employeesLoading && (!employees || employees.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-semibold text-gray-800">
          No Employees Found
        </h2>
        <p className="text-gray-500 mt-2">
          Please add employees before marking attendance.
        </p>
      </div>
    );
  }

  /* ===============================
     Main UI
  =============================== */
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Attendance Management
          </h1>
          <p className="text-gray-500 mt-1">
            Track and manage employee attendance records.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          + Mark Attendance
        </button>
      </div>

   

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {isLoading && (
          <div className="p-6 flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        )}

        {isError && (
          <p className="p-6 text-red-500">
            {error?.data?.detail || "Failed to load attendance"}
          </p>
        )}

        {!isLoading && filteredAttendance.length === 0 && (
          <p className="p-6 text-gray-500 text-center">
            No attendance records found.
          </p>
        )}

        {filteredAttendance.length > 0 && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredAttendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {employeeMap[record.employee_id]}
                  </td>
                  <td className="px-6 py-4">{record.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        record.status === "Present"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => openEditModal(record)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => openDelete(record)}
                        disabled={isDeleting}
                        className="text-red-500 hover:text-red-700"
                      >
                        {isDeleting ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h2 className="text-xl font-semibold mb-6">
                {isEditing ? "Edit Attendance" : "Mark Attendance"}
              </h2>

              {formError && (
                <div className="mb-4 text-red-500 text-sm">{formError}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <select
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl px-4 py-2"
                >
                  <option value="">Select Employee</option>
                  {employees?.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  name="date"
                  max={today}
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl px-4 py-2"
                />

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                  >
                    {isSubmitting && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    {isEditing ? "Update" : "Mark"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {isDeleteOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h2 className="text-lg font-semibold mb-4">
                Confirm Delete
              </h2>

              <p className="mb-6">
                Delete attendance for{" "}
                <strong>
                  {employeeMap[recordToDelete?.employee_id]}
                </strong>{" "}
                on {recordToDelete?.date}?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
                >
                  {isDeleting && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Attendance;
import {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useDeleteEmployeeMutation,
  useUpdateEmployeeMutation,
} from "../features/employeeApi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Loader2 } from "lucide-react";

function Employees() {
  const { data: employees, isLoading, isError, error } = useGetEmployeesQuery();

  const [createEmployee, { isLoading: isCreating }] =
    useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();
  const [deleteEmployee, { isLoading: isDeleting }] =
    useDeleteEmployeeMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    employee_id: "",
    name: "",
    email: "",
    department: "",
    role: "",
    salary: "",
  });

  // ---------------- VALIDATION ----------------
  const validateForm = () => {
    const errors = {};

    if (!form.employee_id.trim())
      errors.employee_id = "Employee ID is required";
    else if (form.employee_id.length < 3)
      errors.employee_id = "Employee ID must be at least 3 characters";

    if (!form.name.trim()) errors.name = "Name is required";

    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errors.email = "Invalid email format";

    if (!form.department.trim()) errors.department = "Department is required";

    if (!form.role.trim()) errors.role = "Role is required";

    if (!form.salary) errors.salary = "Salary is required";
    else if (Number(form.salary) <= 0)
      errors.salary = "Salary must be greater than 0";

    return errors;
  };

  const handleChange = (e) => {
    const value =
      e.target.name === "employee_id"
        ? e.target.value.toUpperCase()
        : e.target.value;

    setForm({ ...form, [e.target.name]: value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setFormError(null);
    setFieldErrors({});
    setForm({
      employee_id: "",
      name: "",
      email: "",
      department: "",
      role: "",
      salary: "",
    });
    setIsOpen(true);
  };

  const openEditModal = (emp) => {
    setIsEditing(true);
    setSelectedId(emp.id);
    setFormError(null);
    setFieldErrors({});
    setForm({
      employee_id: emp.employee_id,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      role: emp.role,
      salary: emp.salary,
    });
    setIsOpen(true);
  };

  const openDeleteModal = (emp) => {
    setEmployeeToDelete(emp);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteEmployee(employeeToDelete.id).unwrap();
      setIsDeleteOpen(false);
      setEmployeeToDelete(null);
    } catch (err) {
      alert(err?.data?.detail || "Failed to delete employee");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      if (isEditing) {
        await updateEmployee({
          id: selectedId,
          ...form,
          salary: Number(form.salary),
        }).unwrap();
      } else {
        await createEmployee({
          ...form,
          salary: Number(form.salary),
        }).unwrap();
      }
      setIsOpen(false);
    } catch (err) {
      setFormError(
        err?.data?.detail || "Something went wrong. Please try again.",
      );
    }
  };

  const isSubmitting = isCreating || isUpdating;

  const renderInput = (name, label, type = "text", disabled = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        disabled={disabled}
        placeholder={
          name === "employee_id"
            ? "EMP001"
            : name === "name"
              ? "John Doe"
              : name === "email"
                ? "example@gmail.com"
                : name === "department"
                  ? "Engineering"
                  : name === "role"
                    ? "Software Developer"
                    : name === "salary"
                      ? "50000"
                      : ""
        }
        className={`w-full border rounded-xl px-4 py-2 focus:ring-2 outline-none ${
          fieldErrors[name]
            ? "border-red-500 focus:ring-red-300"
            : "focus:ring-blue-500"
        }`}
      />
      {fieldErrors[name] && (
        <p className="text-red-500 text-sm mt-1">{fieldErrors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Employee Management
        </h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          + Add Employee
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {isLoading && (
          <div className="p-10 flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        )}

        {isError && (
          <p className="p-6 text-red-500 text-center">
            {error?.data?.detail || "Failed to load employees"}
          </p>
        )} 
        {/* Empty State */}
        {!isLoading && employees && employees.length === 0 && (
          <div className="p-16 text-center">
            <h3 className="text-xl font-semibold text-gray-800">
              No Employees Found
            </h3>
            <p className="text-gray-500 mt-2">
              Click “Add Employee” to create your first employee.
            </p>
          </div>
        )}
        {employees && employees.length > 0 && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm uppercase text-gray-600">
              <tr>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Salary</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{emp.employee_id}</td>
                  <td className="px-6 py-4">{emp.name}</td>
                  <td className="px-6 py-4">{emp.email}</td>
                  <td className="px-6 py-4">{emp.department}</td>
                  <td className="px-6 py-4">{emp.role}</td>
                  <td className="px-6 py-4">₹ {emp.salary.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(emp)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
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
        {isOpen && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
              <h2 className="text-xl font-semibold mb-6">
                {isEditing ? "Edit Employee" : "Add New Employee"}
              </h2>

              {formError && (
                <div className="mb-4 text-red-500 text-sm">{formError}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {renderInput("employee_id", "Employee ID", "text", isEditing)}
                {renderInput("name", "Full Name")}
                {renderInput("email", "Email", "email")}
                {renderInput("department", "Department")}
                {renderInput("role", "Role")}
                {renderInput("salary", "Salary", "number")}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
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
                    {isEditing ? "Update" : "Save"}
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
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
              <p className="mb-6">
                Are you sure you want to delete{" "}
                <strong>{employeeToDelete?.name}</strong>?
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
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
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

export default Employees;

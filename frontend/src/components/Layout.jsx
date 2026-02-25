import { Link, useLocation } from "react-router-dom";

function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold tracking-wide mb-10">HRMS Lite</h1>

        <nav className="space-y-3">
          <Link
            to="/"
            className={`block px-4 py-2 rounded-xl transition ${
              location.pathname === "/"
                ? "bg-white text-gray-900 font-semibold"
                : "hover:bg-gray-800"
            }`}
          >
            Dashboard
          </Link>

          <Link
            to="/employees"
            className={`block px-4 py-2 rounded-xl transition ${
              location.pathname === "/employees"
                ? "bg-white text-gray-900 font-semibold"
                : "hover:bg-gray-800"
            }`}
          >
            Employees
          </Link>

          <Link
            to="/attendance"
            className={`block px-4 py-2 rounded-xl transition ${
              location.pathname === "/attendance"
                ? "bg-white text-gray-900 font-semibold"
                : "hover:bg-gray-800"
            }`}
          >
            Attendance
          </Link>
        </nav>

        <div className="mt-auto text-sm text-gray-400 pt-10">© 2026 HRMS</div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Admin Dashboard
          </h2>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}

export default Layout;

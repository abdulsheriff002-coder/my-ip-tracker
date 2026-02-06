import { Link, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clear login state
    navigate("/login"); // redirect to login
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex space-x-4">
          <Link
            to="/"
            className="text-gray-700 font-semibold hover:text-blue-600"
          >
            Dashboard
          </Link>
          <Link
            to="/history"
            className="text-gray-700 font-semibold hover:text-blue-600"
          >
            History
          </Link>
          <Link
            to="/profile"
            className="text-gray-700 font-semibold hover:text-blue-600"
          >
            Profile
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Logout
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;


import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const token = localStorage.getItem("token");
  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
  }
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="navbar bg-base-200 shadow-lg"> 
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          Ticket AI
        </Link>
      </div>
      <div className="flex gap-4 items-center"> 
        {!token ? (
          <>
            <Link to="/signup" className="btn btn-sm">
              Signup
            </Link>
            <Link to="/login" className="btn btn-sm">
              Login
            </Link>
          </>
        ) : (
          <>
            <p className="hidden md:block text-gray-400">Hi, {user?.email}</p> 
            {user && user?.role === "admin" ? (
              <Link to="/admin" className="btn btn-md btn-success text-white font-bold"> 
                <ShieldCheck size={20} /> 
                Open Admin Panel
              </Link>
            ) : null}
            <button onClick={logout} className="btn btn-sm btn-outline btn-primary"> 
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}


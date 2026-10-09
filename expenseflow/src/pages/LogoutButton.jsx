import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login
    navigate("/login", { replace: true });
  };

  return (
    <button
      type="button"
      className="logout-button"
      onClick={handleLogout}
    >
      <LogOut size={18} />
      <span>Logout</span>
    </button>
  );
}

export default LogoutButton;
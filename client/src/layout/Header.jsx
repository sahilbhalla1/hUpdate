import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import logo from "../assets/hisense-logo.svg";
import { isAuth, signout } from "../utils/helpers";

const Header = ({ toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const user = isAuth();
  const handleLogout = async () => {
    try {
      await signout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="bg-#fff text-white shadow-lg fixed top-0 left-0 right-0 z-50 h-12 ">
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="p-2 bg-[#1c2649] rounded-md transition-colors cursor-pointer" aria-label="Toggle menu">
            <Menu size={20} />
          </button>
          <div className="flex items-center space-x-1">
            <img src={logo} alt="Cogent Logo" className="h-4.5 w-auto" />
          </div>
        </div>
        <div className="relative flex items-center gap-4">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-#fff hover:bg-gray-300 px-3 py-1 rounded-md transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 bg-[#1c2649] rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold">{getUserInitials()}</span>
            </div>
            <span className="hidden sm:inline text-sm text-gray-700">{user?.name || "User"}</span>
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

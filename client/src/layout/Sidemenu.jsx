import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Home,
  MessageCircleWarning,
  PackageCheck,
  SquareChartGantt,
  Ticket,
  Users,
  LayoutGrid,
  Layers,
  Settings2,
  Package,ArrowRightLeft
} from "lucide-react";
import { isAuth } from "../utils/helpers";

/* ---------------- ACTIVE CHECK LOGIC ---------------- */

const checkActive = (currentPath, targetPath, { l2, l3 }) => {
  // Direct match
  if (currentPath === targetPath) return true;

  // Special handling when on Create Ticket page
  if (currentPath === "/tickets/create") {
    if (l2 && targetPath === "/service-tracking") return true;
    if (l3 && targetPath === "/complaint-escalation") return true;

    // Default highlight Tickets
    if (!l2 && !l3 && targetPath === "/tickets/create") return true;
  }

  return false;
};

/* ---------------- MENU ITEM COMPONENT ---------------- */

const MenuItem = ({ item, currentPath, isSubitemActive, onClick, isOpen, onToggle, contextFlags }) => {
  const hasSubmenu = item.submenu && item.submenu.length > 0;

  const isCurrentActive = hasSubmenu ? isSubitemActive : checkActive(currentPath, item.path, contextFlags);

  return (
    <div className="mb-1">
      <div
        onClick={hasSubmenu ? onToggle : () => onClick(item.path)}
        className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-all duration-200 rounded-md mx-2 ${
          isCurrentActive ? "bg-gray-300 text-[#1c2649] shadow-md" : "text-gray-200 hover:bg-blue-400/30 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          {item.icon}
          <span className="font-medium text-xs">{item.label}</span>
        </div>

        {hasSubmenu && <span>{isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>}
      </div>

      {hasSubmenu && isOpen && (
        <div className="mt-1 ml-3 space-y-1">
          {item.submenu.map((subItem) => {
            const isSubActive = checkActive(currentPath, subItem.path, contextFlags);

            return (
                <div
                key={subItem.path}
                onClick={() => onClick(subItem.path)}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-all duration-200 rounded-md mx-2 ${isSubActive
                    ? "bg-gray-300 text-[#1c2649] shadow-md"
                    : "text-gray-300 hover:bg-gray-300/30 hover:text-white"
                  }`}
              >
                {subItem.icon && <span>{subItem.icon}</span>} {/* ✅ icon added */}
                {/* <span className={`w-2 h-2 rounded-full ${isSubActive ? "bg-[#1c2649]" : "bg-gray-400"}`}></span> */}
                <span className="text-xs">{subItem.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ---------------- SIDEMENU COMPONENT ---------------- */

const Sidemenu = ({ isOpen }) => {
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const user = isAuth();
  const userRole = user?.role?.toUpperCase() || "";

  // Context flags for highlighting
  const contextFlags = {
    l2: userRole === "L2",
    l3: userRole === "L3",
  };

  /* ---------------- MENU CONFIG ---------------- */

  const menuItems = [
    {
      id: "home",
      label: "Home",
      path: "/home",
      icon: <Home size={16} />,
      allowedRoles: ["ADMIN", "L1", "L2", "L3"],
    },
   {
      id: "tickets",
      label: "Create Ticket",
      icon: <Ticket size={16} />,
      allowedRoles: ["ADMIN", "L1"],
      // submenu: [{ path: "/tickets/create", label: "Create Ticket" }],
      path: "/tickets/create"
    },
           {
      id: "consulting",
      label: "Consulting Tracking",
      path: "/consulting-tracking",
      icon: <Activity size={16} />,
      allowedRoles: ["ADMIN", "L1"],
    },
      {
      id: "transfer-ticket",
      label: "Transfer Ticket",
      path: "/transfer-ticket",
      icon: <ArrowRightLeft size={16} />,
      allowedRoles: ["ADMIN", "L1"],
    },
    {
      id: "service-tracking",
      label: "Service Tracking",
      path: "/service-tracking",
      icon: <Activity size={16} />,
      allowedRoles: ["ADMIN", "L2"],
    },
    {
      id: "complaint-escalation",
      label: "Escalation",
      path: "/complaint-escalation",
      icon: <MessageCircleWarning size={16} />,
      allowedRoles: ["ADMIN", "L3"],
    },
    {
      id: "techvalidationinternal",
      label: "Tech Validation (Internal)",
      path: "/tech-validation-int",
      icon: <ClipboardCheck size={16} />,
      allowedRoles: ["ADMIN", "INTERNAL"],
    },

    {
      id: "techvalidationexternal",
      label: "Tech Validation (External)",
      path: "/tech-validation-ext",
      icon: <PackageCheck size={16} />,
      allowedRoles: ["ADMIN", "EXTERNAL"],
    },
    {
      id: "usermanagement",
      label: "User Management",
      path: "/users",
      icon: <Users size={16} />,
      allowedRoles: ["ADMIN"],
    },
    {
      id: "report",
      label: "Report",
      path: "/report",
      icon: <SquareChartGantt size={16} />,
      allowedRoles: ["ADMIN"],
    },
    {
      id: "product-master",
      label: "Product Master",
      icon: <LayoutGrid size={16} />, // ✅ changed icon
      allowedRoles: ["ADMIN"],
      submenu: [
        {
          path: "/product-master/categories",
          label: "Categories",
          icon: <LayoutGrid size={16} />,
        },
        {
          path: "/product-master/sub-categories",
          label: "Sub Categories",
          icon: <Layers size={16} />,
        },
        {
          path: "/product-master/model-specifications",
          label: "Model Specifications",
          icon: <Settings2 size={16} />,
        },
        {
          path: "/product-master/customer-models",
          label: "Customer Models",
          icon: <Users size={16} />,
        },
        {
          path: "/product-master/products",
          label: "Products",
          icon: <Package size={16} />,
        },
      ],
    }
  ];

  /* ---------------- ROLE FILTER ---------------- */

  const filteredMenu = menuItems.filter((item) => item.allowedRoles.includes(userRole));

  /* ---------------- AUTO EXPAND SUBMENU ---------------- */

  useEffect(() => {
    filteredMenu.forEach((item) => {
      if (item.submenu) {
        const hasActiveSubitem = item.submenu.some((subItem) => checkActive(location.pathname, subItem.path, contextFlags));

        if (hasActiveSubitem) {
          setOpenMenus((prev) => ({ ...prev, [item.id]: true }));
        }
      }
    });
  }, [location.pathname]);

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const isSubitemActive = (item) => {
    if (!item.submenu) return false;
    return item.submenu.some((subItem) => checkActive(location.pathname, subItem.path, contextFlags));
  };

  /* ---------------- RENDER ---------------- */

  return (
    <aside
      className={`fixed top-12 left-0 bottom-0 bg-[#1c2649] shadow-xl z-40 transition-all duration-300 ease-in-out w-64 flex flex-col overflow-hidden ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {filteredMenu.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            currentPath={location.pathname}
            isSubitemActive={isSubitemActive(item)}
            onClick={handleMenuClick}
            isOpen={openMenus[item.id]}
            onToggle={() => toggleMenu(item.id)}
            contextFlags={contextFlags}
          />
        ))}
      </nav>
    </aside>
  );
};

export default Sidemenu;

import { Suspense, useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Header from "./layout/Header";
import Sidemenu from "./layout/Sidemenu";
import Footer from "./layout/Footer";

import { AppLoader } from "./components/AppLoader";
import { setNavigate } from "./services/navigation";
import ProtectedRoute from "./utils/ProtectedRoute";

import { dashboardRoutes } from "./routes/routes.config";
import { renderDashboardRoutes } from "./routes/renderRoutes";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => setNavigate(navigate), [navigate]);

  return (
    <Suspense fallback={<AppLoader />}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header toggleSidebar={() => setIsSidebarOpen((v) => !v)} />

      <div className="flex flex-1 pt-12 overflow-hidden">
        <Sidemenu isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

        <div className={`flex-1 flex flex-col overflow-hidden ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
          <main className="flex-1 overflow-y-auto">
            <div className="p-3 md:p-5 lg:p-6">
              <Routes>{renderDashboardRoutes(dashboardRoutes)}</Routes>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}

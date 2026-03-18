import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../utils/ProtectedRoute";

export const renderDashboardRoutes = (routes) =>
  routes.map(({ path, element, roles }) => (
    <Route
      key={path}
      path={path}
      element={
        roles ? (
          <ProtectedRoute allowedRoles={roles}>
            {element}
          </ProtectedRoute>
        ) : (
          element
        )
      }
    />
  ));

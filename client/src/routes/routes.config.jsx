import Home from "../pages/Home";
import UserManagement from "../pages/user/UserManagement";
import Report from "../pages/report/Report";
import NotFound from "../pages/NotFound";
import { ROLES } from "../utils/roles";
import CreateTicket from "../pages/ticket/CreateTicket";
import ViewTicket from "../pages/ticket/ViewTicket";
import ServiceTracking from "../pages/service_tracking/ServiceTracking";
import ComplaintOrEscalation from "../pages/complaint_escalation/ComplaintOrEscalation";
import TechValidationInternal from "../pages/tech_validation/TechValidationInternal";
import TechValidation from "../pages/tech_validation/TechValidationExternal";

export const dashboardRoutes = [
  {
    path: "/home",
    element: <Home />,
    roles: [ROLES.ADMIN, ROLES.L1, ROLES.L2, ROLES.L3, ROLES.EXTERNAL, ROLES.INTERNAL],
  },

  {
    path: "/users",
    element: <UserManagement />,
    roles: [ROLES.ADMIN],
  },
  {
    path: "/tickets/create",
    element: <CreateTicket />,
    roles: [ROLES.ADMIN, ROLES.L1, ROLES.L2, ROLES.L3, ROLES.EXTERNAL],
  },
  {
    path: "/tickets/view",
    element: <ViewTicket />,
    roles: [ROLES.ADMIN, ROLES.L1],
  },
  {
    path: "/report",
    element: <Report />,
    roles: [ROLES.ADMIN],
  },
  {
    path: "/service-tracking",
    element: <ServiceTracking />,
    roles: [ROLES.ADMIN, ROLES.L2],
  },
  {
    path: "/complaint-escalation",
    element: <ComplaintOrEscalation />,
    roles: [ROLES.ADMIN, ROLES.L3],
  },
  {
    path: "/tech-validation-int",
    element: <TechValidationInternal />,
    roles: [ROLES.ADMIN, ROLES.INTERNAL],
  },
  {
    path: "/tech-validation-ext",
    element: <TechValidation />,
    roles: [ROLES.ADMIN, ROLES.EXTERNAL],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

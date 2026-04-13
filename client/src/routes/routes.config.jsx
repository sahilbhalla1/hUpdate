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
import Categories from "../pages/Product_Master/Categories";
import SubCategories from "../pages/Product_Master/SubCategories";
import ModelSpecifications from "../pages/Product_Master/ModelSpecifications";
import CustomerModels from "../pages/Product_Master/CustomerModels";
import Products from "../pages/Product_Master/Products";
import Consulting_Tracking from "../pages/Consulting_Tracking/Consulting_Tracking";
import Transfer_Ticket from "../pages/Transfer_Tickets/Transfer_Tickets";

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
    path: "/product-master/categories",
    element: <Categories/>,
    roles: [ROLES.ADMIN],
  },
     {
    path: "/product-master/sub-categories",
    element: <SubCategories/>,
    roles: [ROLES.ADMIN],
  },
    {
    path: "/product-master/model-specifications",
    element: <ModelSpecifications/>,
    roles: [ROLES.ADMIN],
  },
    {
    path: "/product-master/customer-models",
    element: <CustomerModels/>,
    roles: [ROLES.ADMIN],
  },
    {
    path: "/product-master/products",
    element: <Products/>,
    roles: [ROLES.ADMIN],
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/consulting-tracking",
    element: <Consulting_Tracking/>,
    roles: [ROLES.ADMIN, ROLES.L1],
  },
   {
    path: "/transfer-ticket",
    element: <Transfer_Ticket/>,
    roles: [ROLES.ADMIN, ROLES.L1],
  },
];

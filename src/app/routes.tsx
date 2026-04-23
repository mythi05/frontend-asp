import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";

// Import các trang của bạn...
import { Dashboard } from "./components/pages/Dashboard";
import { RoomManagement } from "./components/pages/RoomManagement";
import { StudentManagement } from "./components/pages/StudentManagement";
import { CheckInOut } from "./components/pages/CheckInOut";
import { FeeManagement } from "./components/pages/FeeManagement";
import { Reports } from "./components/pages/Reports";
import { EquipmentManagement } from "./components/pages/EquipmentManagement";
import { ViolationsManagement } from "./components/pages/ViolationsManagement";
import { ServicesManagement } from "./components/pages/ServicesManagement";
import { MaintenanceManagement } from "./components/pages/MaintenanceManagement";
import { ContractsManagement } from "./components/pages/ContractsManagement";
import { StaffManagement } from "./components/pages/StaffManagement";
import { ProtectedRoute } from "./components/pages/ProtectedRoute";
import { LoginPage } from "./components/pages/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/", // 👈 THÊM CÁI NÀY
    element: <ProtectedRoute />,
    children: [
      {
        path: "",
        element: <Layout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "rooms", element: <RoomManagement /> },
          { path: "students", element: <StudentManagement /> },
          { path: "checkinout", element: <CheckInOut /> },
          { path: "fees", element: <FeeManagement /> },
          { path: "equipment", element: <EquipmentManagement /> },
          { path: "violations", element: <ViolationsManagement /> },
          { path: "services", element: <ServicesManagement /> },
          { path: "maintenance", element: <MaintenanceManagement /> },
          { path: "contracts", element: <ContractsManagement /> },
          { path: "staff", element: <StaffManagement /> },
          { path: "reports", element: <Reports /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
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
import { VisitorsManagement } from "./components/pages/VisitorsManagement";
import { AnnouncementsManagement } from "./components/pages/AnnouncementsManagement";
import { StaffManagement } from "./components/pages/StaffManagement";
import { NotFound } from "./components/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "rooms", Component: RoomManagement },
      { path: "students", Component: StudentManagement },
      { path: "checkinout", Component: CheckInOut },
      { path: "fees", Component: FeeManagement },
      { path: "equipment", Component: EquipmentManagement },
      { path: "violations", Component: ViolationsManagement },
      { path: "services", Component: ServicesManagement },
      { path: "maintenance", Component: MaintenanceManagement },
      { path: "contracts", Component: ContractsManagement },
      { path: "visitors", Component: VisitorsManagement },
      { path: "announcements", Component: AnnouncementsManagement },
      { path: "staff", Component: StaffManagement },
      { path: "reports", Component: Reports },
      { path: "*", Component: NotFound },
    ],
  },
]);
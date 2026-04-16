import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  UserCheck, 
  DollarSign, 
  FileText,
  Menu,
  X,
  Package,
  AlertTriangle,
  Briefcase,
  Wrench,
  FileSignature,
  UserPlus,
  Bell,
  UsersRound,
  ChevronDown
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

const menuItems = [
  { path: "/", label: "Bảng điều khiển", icon: LayoutDashboard },
  { 
    label: "Quản lý cơ bản",
    items: [
      { path: "/rooms", label: "Quản lý phòng", icon: Building2 },
      { path: "/students", label: "Quản lý sinh viên", icon: Users },
      { path: "/staff", label: "Quản lý nhân viên", icon: UsersRound },
    ]
  },
  {
    label: "Giao dịch",
    items: [
      { path: "/checkinout", label: "Nhận/Trả phòng", icon: UserCheck },
      { path: "/fees", label: "Quản lý phí", icon: DollarSign },
      { path: "/contracts", label: "Quản lý hợp đồng", icon: FileSignature },
    ]
  },
  {
    label: "Dịch vụ & Tiện ích",
    items: [
      { path: "/equipment", label: "Quản lý thiết bị", icon: Package },
      { path: "/services", label: "Quản lý dịch vụ", icon: Briefcase },
      { path: "/maintenance", label: "Bảo trì & Sửa chữa", icon: Wrench },
    ]
  },
  {
    label: "Khác",
    items: [
      { path: "/violations", label: "Quản lý vi phạm", icon: AlertTriangle },
      { path: "/visitors", label: "Quản lý khách", icon: UserPlus },
      { path: "/announcements", label: "Thông báo", icon: Bell },
      { path: "/reports", label: "Báo cáo thống kê", icon: FileText },
    ]
  }
];

export function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["Quản lý cơ bản", "Giao dịch", "Dịch vụ & Tiện ích", "Khác"]);

  const toggleSection = (label: string) => {
    setExpandedSections(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Building2 className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Hệ thống quản lý KTX</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Quản trị viên</p>
              <p className="text-xs text-gray-500">admin@ktx.edu.vn</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-[57px] left-0 bottom-0 w-64 bg-white border-r border-gray-200 
          transition-transform duration-300 z-30
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <ScrollArea className="h-full">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              if ('items' in item) {
                const isExpanded = expandedSections.includes(item.label);
                return (
                  <div key={item.label} className="py-1">
                    <button
                      onClick={() => toggleSection(item.label)}
                      className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      {item.label}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="space-y-1 mt-1">
                        {item.items.map((subItem) => {
                          const Icon = subItem.icon;
                          const isActive = location.pathname === subItem.path;
                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              onClick={() => setSidebarOpen(false)}
                              className={`
                                flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm
                                ${isActive 
                                  ? 'bg-blue-50 text-blue-600 font-medium' 
                                  : 'text-gray-700 hover:bg-gray-50'
                                }
                              `}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              } else {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              }
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden top-[57px]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="pt-[57px] lg:pl-64">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
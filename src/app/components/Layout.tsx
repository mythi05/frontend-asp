import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, Users, UserCheck, DollarSign, FileText,
  Menu, X, Package, AlertTriangle, Briefcase, Wrench, FileSignature,
  UserPlus, Bell, UsersRound, ChevronDown, LogOut, User as UserIcon, Settings, Shield
} from "lucide-react";
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
      { path: "/violations", label: "Quản lý vi phạm", icon: AlertTriangle},
      { path: "/reports", label: "Báo cáo thống kê", icon: FileText },
    ]
  }
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["Quản lý cơ bản", "Giao dịch"]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleSection = (label: string) => {
    setExpandedSections(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* HEADER HIỆN ĐẠI */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 fixed top-0 left-0 right-0 z-40 h-16">
        <div className="flex items-center justify-between px-6 h-full">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
            </Button>
            
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-black text-slate-800 leading-none tracking-tight">HITU <span className="text-blue-600">DORM</span></h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Management System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-5">
            {/* Notification */}
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 pl-3 hover:bg-slate-100 rounded-2xl transition-all border border-transparent hover:border-slate-200"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-700 leading-none">{user.fullName || "Administrator"}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 uppercase tracking-wider">{user.role || "Quản trị viên"}</p>
                </div>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : "A"}
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tài khoản</p>
                    </div>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                      <UserIcon size={18} /> Hồ sơ của tôi
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                      <Settings size={18} /> Cài đặt hệ thống
                    </button>
                    <div className="h-px bg-slate-100 my-1 mx-2"></div>
                    <button 
                      onClick={() => { setShowLogoutConfirm(true); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
                    >
                      <LogOut size={18} /> Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MODAL XÁC NHẬN ĐĂNG XUẤT CHUYÊN NGHIỆP */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"></div>
          <div className="relative bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 rotate-12 group hover:rotate-0 transition-transform">
                <LogOut className="text-red-600" size={36} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Đăng xuất?</h3>
              <p className="text-slate-500 mt-3 leading-relaxed">
                Bạn có chắc chắn muốn kết thúc phiên làm việc tại hệ thống <b>HITU DORM</b> không?
              </p>
              
              <div className="grid grid-cols-2 gap-4 w-full mt-10">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                >
                  Hủy
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3.5 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR TỐI ƯU */}
      <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-200 transition-transform duration-300 z-30 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <ScrollArea className="h-full">
          <nav className="p-4 space-y-1.5">
            {menuItems.map(item => {
              if ("items" in item) {
                const isExpanded = expandedSections.includes(item.label);
                return (
                  <div key={item.label} className="py-2">
                    <button
                      onClick={() => toggleSection(item.label)}
                      className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[2px]"
                    >
                      {item.label}
                      <ChevronDown size={12} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    {isExpanded && (
                      <div className="space-y-1 mt-1">
                        {item.items.map(subItem => {
                          const Icon = subItem.icon;
                          const isActive = location.pathname === subItem.path;
                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all border border-transparent ${
                                isActive 
                                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-200 border-blue-500" 
                                : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                              }`}
                            >
                              <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all border border-transparent ${
                    isActive 
                    ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-200 border-blue-500" 
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  <Icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* CONTENT AREA */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Outlet />
        </div>
      </main>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
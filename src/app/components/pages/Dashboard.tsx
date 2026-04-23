import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { 
  Building2, Users, UserCheck, DollarSign, 
  TrendingUp, AlertCircle, Loader2, RefreshCw 
} from "lucide-react";
import { Badge } from "../ui/badge";
import { apiRequest } from "../../api";
import { toast } from "sonner";

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    stats: [],
    recentActivities: [],
    alerts: [],
    buildings: []
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Gọi đồng thời các API quan trọng
      const [rooms, students, staff, contractDash, maints, invoices] = await Promise.all([
        apiRequest<any[]>("/api/Room"),
        apiRequest<any[]>("/api/Student"),
        apiRequest<any[]>("/api/Staff"),
        apiRequest<any>("/api/ContractApi/dashboard"),
        apiRequest<any[]>("/api/MaintenanceApi"),
        apiRequest<any[]>("/api/InvoiceApi")
      ]);

      // 1. Tính toán các chỉ số (Stats)
      const totalBeds = rooms?.reduce((s, r) => s + (r.maxCapacity || 0), 0) || 0;
      const occupiedBeds = rooms?.reduce((s, r) => s + (r.currentOccupancy || 0), 0) || 0;
      const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

      const statsCards = [
        {
          title: "Tổng số phòng",
          value: rooms?.length || 0,
          change: `Tổng ${totalBeds} giường`,
          icon: Building2,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          title: "Sinh viên đang ở",
          value: students?.length || 0,
          change: `Đã duyệt ${contractDash?.totalActiveContracts || 0} hợp đồng`,
          icon: Users,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
        {
          title: "Tỷ lệ lấp đầy",
          value: `${occupancyRate.toFixed(1)}%`,
          change: "Dựa trên sức chứa tối đa",
          icon: TrendingUp,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
        {
          title: "Doanh thu hệ thống",
          value: `${((contractDash?.totalRevenue || 0) / 1000000).toFixed(1)}M`,
          change: "VNĐ (Tổng cộng)",
          icon: DollarSign,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
        },
      ];

      // 2. Xử lý thông báo (Alerts) từ Maintenance và Invoice
      const maintenanceAlerts = maints
        ?.filter(m => m.status === 1) // Giả sử 1 là Pending
        .map(m => ({ id: `m-${m.id}`, message: `Phòng ${m.roomId}: ${m.description}`, priority: "high" })) || [];

      const unpaidInvoices = invoices
        ?.filter(i => i.status === "Unpaid")
        .map(i => ({ id: `i-${i.id}`, message: `Hóa đơn SV ${i.studentId} chưa đóng`, priority: "medium" })) || [];

      // 3. Tình trạng theo tòa (Building)
      const bldMap: any = {};
      rooms?.forEach(r => {
        const b = r.building || "Khác";
        if (!bldMap[b]) bldMap[b] = { used: 0, total: 0, maint: 0 };
        bldMap[b].total += 1;
        if (r.status === "Đã đầy") bldMap[b].used += 1;
        if (r.status === "Bảo trì") bldMap[b].maint += 1;
      });

      setData({
        stats: statsCards,
        alerts: [...maintenanceAlerts, ...unpaidInvoices].slice(0, 5),
        buildings: Object.keys(bldMap).map(name => ({ name, ...bldMap[name] })),
        recentActivities: [] // Có thể fetch thêm từ RoomTransactionApi nếu cần
      });

    } catch (err) {
      toast.error("Không thể tải dữ liệu Dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-slate-500 font-medium">Đang đồng bộ dữ liệu hệ thống...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Bảng điều khiển</h2>
          <p className="text-gray-500 mt-1">Dữ liệu thời gian thực từ hệ thống quản lý</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl hover:bg-gray-50 transition-all shadow-sm text-sm font-medium"
        >
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.stats.map((stat: any) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-none shadow-sm overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-2">{stat.change}</p>
                  </div>
                  <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts (Thông báo thực tế) */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} /> Sự cố cần xử lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.alerts.length > 0 ? data.alerts.map((alert: any) => (
                <div key={alert.id} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`h-2 w-2 rounded-full mt-2 ${
                    alert.priority === 'high' ? 'bg-red-500' : 'bg-orange-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  </div>
                  <Badge variant={alert.priority === 'high' ? 'destructive' : 'default'} className="rounded-lg">
                    {alert.priority === 'high' ? 'Khẩn cấp' : 'Chờ'}
                  </Badge>
                </div>
              )) : (
                <p className="text-center py-10 text-slate-400 text-sm">Hệ thống đang vận hành tốt, không có sự cố.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Room Status Overview (Theo Tòa thực tế) */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Tình trạng theo tòa nhà</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.buildings.map((b: any) => (
                <div key={b.name} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <h4 className="font-bold text-gray-900">{b.name}</h4>
                    <span className="text-sm font-bold text-blue-600">{b.used}/{b.total} phòng đầy</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-1000" 
                      style={{ width: `${(b.used / b.total) * 100}%` }}
                    />
                  </div>
                  <div className="flex gap-4 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-400" /> Bảo trì: {b.maint}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-100" /> Trống: {b.total - b.used - b.maint}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
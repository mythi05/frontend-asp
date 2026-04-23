import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { Loader2, Users, Home, ShieldCheck, LayoutDashboard, RefreshCw } from "lucide-react";
import { apiRequest } from "../../api";
import { toast } from "sonner";

export function Reports() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalStaff: 0,
    totalRooms: 0,
    totalStudents: 0,
    roomDist: [], 
    buildingDist: [],
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [rooms, staff, students] = await Promise.all([
        apiRequest<any[]>("/api/Room"),
        apiRequest<any[]>("/api/Staff"),
        apiRequest<any[]>("/api/Student")
      ]);

      // 1. THỐNG KÊ THEO SỨC CHỨA (Dùng MaxCapacity từ Model của bạn)
      const roomTypeMap: any = {};
      
      rooms?.forEach(r => {
        // Sử dụng MaxCapacity thay vì capacity
        const capacityLabel = r.maxCapacity ? `Phòng ${r.maxCapacity} người` : "Chưa xác định";
        roomTypeMap[capacityLabel] = (roomTypeMap[capacityLabel] || 0) + 1;
      });

      const roomDistData = Object.keys(roomTypeMap).map(key => ({
        name: key,
        value: roomTypeMap[key]
      })).sort((a, b) => a.name.localeCompare(b.name)); // Sắp xếp cho đẹp

      // 2. THỐNG KÊ THEO TÒA (Dùng trường Building từ Model của bạn)
      const buildingMap: any = {};
      rooms?.forEach(r => {
        const bName = r.building || "Khác";
        buildingMap[bName] = (buildingMap[bName] || 0) + 1;
      });

      const buildingData = Object.keys(buildingMap).map(key => ({
        name: key,
        count: buildingMap[key]
      }));

      setStats({
        totalStaff: staff?.length || 0,
        totalRooms: rooms?.length || 0,
        totalStudents: students?.length || 0,
        roomDist: roomDistData,
        buildingDist: buildingData
      });
    } catch (err) {
      console.error(err);
      toast.error("Lỗi đồng bộ dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-[400px] flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="p-4 space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <LayoutDashboard className="text-blue-600" /> Báo cáo thực tế
        </h1>
        <button onClick={fetchAllData} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Chỉ số chính */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Nhân viên" value={stats.totalStaff} icon={<ShieldCheck />} color="text-blue-600" />
        <MetricCard title="Tổng số phòng" value={stats.totalRooms} icon={<Home />} color="text-green-600" />
        <MetricCard title="Sinh viên" value={stats.totalStudents} icon={<Users />} color="text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ Tròn: Sức chứa */}
        <Card className="rounded-xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-md font-semibold">Phân loại theo sức chứa (Giường)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.roomDist}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.roomDist.map((entry: any, index: number) => (
                      <Cell key={index} fill={["#4F46E5", "#10B981", "#F59E0B", "#EF4444"][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Biểu đồ Cột: Tòa nhà */}
        <Card className="rounded-xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-md font-semibold">Số lượng phòng theo Tòa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.buildingDist}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: any) {
  return (
    <Card className="rounded-xl border border-gray-200 shadow-sm">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gray-50 ${color}`}>{icon}</div>
      </CardContent>
    </Card>
  );
}
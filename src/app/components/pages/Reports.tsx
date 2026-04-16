import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Calendar, Download, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const revenueData = [
  { month: "T9/2025", revenue: 820 },
  { month: "T10/2025", revenue: 850 },
  { month: "T11/2025", revenue: 830 },
  { month: "T12/2025", revenue: 870 },
  { month: "T1/2026", revenue: 845 },
  { month: "T2/2026", revenue: 860 },
  { month: "T3/2026", revenue: 850 },
];

const occupancyData = [
  { month: "T9", rate: 85 },
  { month: "T10", rate: 87 },
  { month: "T11", rate: 86 },
  { month: "T12", rate: 88 },
  { month: "T1", rate: 89 },
  { month: "T2", rate: 90 },
  { month: "T3", rate: 90 },
];

const roomTypeData = [
  { name: "Phòng 2 người", value: 20, color: "#3b82f6" },
  { name: "Phòng 4 người", value: 70, color: "#10b981" },
  { name: "Phòng 6 người", value: 30, color: "#f59e0b" },
];

const buildingData = [
  { building: "Tòa A", occupied: 32, total: 40 },
  { building: "Tòa B", occupied: 35, total: 40 },
  { building: "Tòa C", occupied: 28, total: 40 },
];

export function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Báo cáo thống kê</h2>
          <p className="text-gray-500 mt-1">Phân tích dữ liệu và xu hướng</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="2026">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">Năm 2026</SelectItem>
              <SelectItem value="2025">Năm 2025</SelectItem>
              <SelectItem value="2024">Năm 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng phòng</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">120</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +5 so với năm trước
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng sinh viên</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">287</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +18 so với năm trước
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tỷ lệ lấp đầy TB</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">87.5%</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +2.5% so với năm trước
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Doanh thu TB/tháng</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">850M</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% so với năm trước
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo tháng (triệu VNĐ)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ lấp đầy theo tháng (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="rate" fill="#10b981" name="Tỷ lệ lấp đầy" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Room Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố loại phòng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roomTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roomTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {roomTypeData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value} phòng</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Building Occupancy */}
        <Card>
          <CardHeader>
            <CardTitle>Tình trạng theo tòa nhà</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={buildingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="building" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="occupied" fill="#3b82f6" name="Đã sử dụng" />
                <Bar dataKey="total" fill="#e5e7eb" name="Tổng số" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-3">
              {buildingData.map((building) => (
                <div key={building.building} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{building.building}</span>
                    <span className="text-gray-600">
                      {building.occupied}/{building.total} ({((building.occupied / building.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(building.occupied / building.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê chi tiết theo quý</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Quý</th>
                  <th className="text-right py-3 px-4">Doanh thu (triệu)</th>
                  <th className="text-right py-3 px-4">SV mới</th>
                  <th className="text-right py-3 px-4">SV rời KTX</th>
                  <th className="text-right py-3 px-4">Tỷ lệ lấp đầy</th>
                  <th className="text-right py-3 px-4">Phòng bảo trì</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Quý 1/2026</td>
                  <td className="text-right py-3 px-4">2,555</td>
                  <td className="text-right py-3 px-4">35</td>
                  <td className="text-right py-3 px-4">12</td>
                  <td className="text-right py-3 px-4">89.7%</td>
                  <td className="text-right py-3 px-4">3</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Quý 4/2025</td>
                  <td className="text-right py-3 px-4">2,520</td>
                  <td className="text-right py-3 px-4">28</td>
                  <td className="text-right py-3 px-4">15</td>
                  <td className="text-right py-3 px-4">87.3%</td>
                  <td className="text-right py-3 px-4">5</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Quý 3/2025</td>
                  <td className="text-right py-3 px-4">2,500</td>
                  <td className="text-right py-3 px-4">45</td>
                  <td className="text-right py-3 px-4">8</td>
                  <td className="text-right py-3 px-4">86.0%</td>
                  <td className="text-right py-3 px-4">2</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Quý 2/2025</td>
                  <td className="text-right py-3 px-4">2,450</td>
                  <td className="text-right py-3 px-4">20</td>
                  <td className="text-right py-3 px-4">25</td>
                  <td className="text-right py-3 px-4">82.5%</td>
                  <td className="text-right py-3 px-4">4</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

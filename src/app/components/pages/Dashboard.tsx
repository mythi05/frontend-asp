import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Building2, Users, UserCheck, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "../ui/badge";

const stats = [
  {
    title: "Tổng số phòng",
    value: "120",
    change: "+5 phòng mới",
    icon: Building2,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Sinh viên đang ở",
    value: "287",
    change: "+12 so với tháng trước",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Tỷ lệ lấp đầy",
    value: "89.7%",
    change: "+3.2%",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Doanh thu tháng này",
    value: "850M VNĐ",
    change: "+15% so với tháng trước",
    icon: DollarSign,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
];

const recentActivities = [
  { id: 1, type: "check-in", student: "Nguyễn Văn A", room: "A101", time: "2 giờ trước" },
  { id: 2, type: "payment", student: "Trần Thị B", amount: "3,000,000 VNĐ", time: "3 giờ trước" },
  { id: 3, type: "check-out", student: "Lê Văn C", room: "B205", time: "5 giờ trước" },
  { id: 4, type: "check-in", student: "Phạm Thị D", room: "C301", time: "1 ngày trước" },
  { id: 5, type: "payment", student: "Hoàng Văn E", amount: "3,000,000 VNĐ", time: "1 ngày trước" },
];

const alerts = [
  { id: 1, type: "warning", message: "5 phòng cần bảo trì trong tuần này", priority: "high" },
  { id: 2, type: "info", message: "15 sinh viên chưa thanh toán phí tháng này", priority: "medium" },
  { id: 3, type: "success", message: "Đã hoàn thành bảo trì 8 phòng", priority: "low" },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Bảng điều khiển</h2>
        <p className="text-gray-500 mt-1">Tổng quan về hoạt động ký túc xá</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'check-in' ? 'bg-green-100' :
                    activity.type === 'check-out' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    <UserCheck className={`h-4 w-4 ${
                      activity.type === 'check-in' ? 'text-green-600' :
                      activity.type === 'check-out' ? 'text-red-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.student}</p>
                    <p className="text-sm text-gray-500">
                      {activity.type === 'check-in' && `Nhận phòng ${activity.room}`}
                      {activity.type === 'check-out' && `Trả phòng ${activity.room}`}
                      {activity.type === 'payment' && `Thanh toán ${activity.amount}`}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Thông báo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    alert.priority === 'high' ? 'text-red-600' :
                    alert.priority === 'medium' ? 'text-orange-600' :
                    'text-green-600'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                  </div>
                  <Badge variant={
                    alert.priority === 'high' ? 'destructive' :
                    alert.priority === 'medium' ? 'default' :
                    'secondary'
                  }>
                    {alert.priority === 'high' ? 'Cao' : alert.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tình trạng phòng theo tòa nhà</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Tòa A', 'Tòa B', 'Tòa C'].map((building) => (
              <div key={building} className="space-y-3">
                <h4 className="font-medium text-gray-900">{building}</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Đang sử dụng</span>
                    <span className="font-medium text-green-600">32/40</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Trống: 8</span>
                    <span>Bảo trì: 0</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

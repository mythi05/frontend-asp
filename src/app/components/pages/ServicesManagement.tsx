import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Plus, Search, CheckCircle2, XCircle, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface ServiceRegistration {
  id: string;
  studentId: string;
  studentName: string;
  room: string;
  service: string;
  price: number;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  registrationDate: string;
}

const initialRegistrations: ServiceRegistration[] = [
  { id: "1", studentId: "SV001", studentName: "Nguyễn Văn A", room: "A101", service: "Internet", price: 150000, startDate: "2026-03-01", endDate: "2026-06-01", status: "active", registrationDate: "2026-02-25" },
  { id: "2", studentId: "SV002", studentName: "Trần Thị B", room: "B201", service: "Giặt ủi", price: 200000, startDate: "2026-03-01", endDate: "2026-04-01", status: "active", registrationDate: "2026-02-28" },
  { id: "3", studentId: "SV003", studentName: "Lê Văn C", room: "A102", service: "Đỗ xe", price: 100000, startDate: "2026-01-01", endDate: "2026-03-01", status: "expired", registrationDate: "2025-12-28" },
  { id: "4", studentId: "SV004", studentName: "Phạm Thị D", room: "C301", service: "Internet", price: 150000, startDate: "2026-03-01", endDate: "2026-06-01", status: "active", registrationDate: "2026-02-27" },
  { id: "5", studentId: "SV005", studentName: "Hoàng Văn E", room: "B202", service: "Giặt ủi", price: 200000, startDate: "2026-02-01", endDate: "2026-03-01", status: "cancelled", registrationDate: "2026-01-28" },
];

const services = [
  { name: "Internet", price: 150000, unit: "tháng" },
  { name: "Giặt ủi", price: 200000, unit: "tháng" },
  { name: "Đỗ xe", price: 100000, unit: "tháng" },
  { name: "Thể thao", price: 50000, unit: "tháng" },
];

export function ServicesManagement() {
  const [registrations, setRegistrations] = useState<ServiceRegistration[]>(initialRegistrations);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterService, setFilterService] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    room: "",
    service: "",
    price: "",
    startDate: "",
    endDate: "",
  });

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = 
      reg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || reg.status === filterStatus;
    const matchesService = filterService === "all" || reg.service === filterService;
    return matchesSearch && matchesStatus && matchesService;
  });

  const stats = {
    total: registrations.length,
    active: registrations.filter(r => r.status === "active").length,
    expired: registrations.filter(r => r.status === "expired").length,
    revenue: registrations.filter(r => r.status === "active").reduce((sum, r) => sum + r.price, 0),
  };

  const handleAdd = () => {
    setFormData({
      studentId: "",
      studentName: "",
      room: "",
      service: "",
      price: "",
      startDate: "",
      endDate: "",
    });
    setDialogOpen(true);
  };

  const handleCancel = (id: string) => {
    setRegistrations(registrations.map((reg) =>
      reg.id === id ? { ...reg, status: "cancelled" as const } : reg
    ));
    toast.success("Đã hủy đăng ký dịch vụ");
  };

  const handleSave = () => {
    if (!formData.studentId || !formData.studentName || !formData.service || !formData.startDate) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const newRegistration: ServiceRegistration = {
      id: Date.now().toString(),
      studentId: formData.studentId,
      studentName: formData.studentName,
      room: formData.room,
      service: formData.service,
      price: parseInt(formData.price) || 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: "active",
      registrationDate: new Date().toISOString().split('T')[0],
    };
    setRegistrations([newRegistration, ...registrations]);
    toast.success("Đã đăng ký dịch vụ thành công");
    setDialogOpen(false);
  };

  const handleServiceChange = (serviceName: string) => {
    const service = services.find(s => s.name === serviceName);
    if (service) {
      setFormData({
        ...formData,
        service: serviceName,
        price: service.price.toString(),
      });
    }
  };

  const getStatusBadge = (status: ServiceRegistration["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Đang sử dụng</Badge>;
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800">Hết hạn</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Quản lý dịch vụ</h2>
          <p className="text-gray-500 mt-1">Đăng ký và quản lý các dịch vụ ký túc xá</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Đăng ký dịch vụ
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng đăng ký</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đang sử dụng</p>
                <p className="text-2xl font-semibold text-green-600 mt-2">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hết hạn</p>
                <p className="text-2xl font-semibold text-gray-600 mt-2">{stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Doanh thu</p>
                <p className="text-2xl font-semibold text-blue-600 mt-2">{(stats.revenue / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {services.map((service) => (
          <Card key={service.name}>
            <CardContent className="p-6">
              <div className="text-center">
                <Briefcase className="h-10 w-10 mx-auto text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                <p className="text-2xl font-semibold text-blue-600 mt-2">
                  {service.price.toLocaleString()}đ
                </p>
                <p className="text-sm text-gray-500">/{service.unit}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm sinh viên, phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterService} onValueChange={setFilterService}>
              <SelectTrigger>
                <SelectValue placeholder="Dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả dịch vụ</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.name} value={service.name}>{service.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang sử dụng</SelectItem>
                <SelectItem value="expired">Hết hạn</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MSSV</TableHead>
                <TableHead>Sinh viên</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Ngày bắt đầu</TableHead>
                <TableHead>Ngày kết thúc</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell className="font-medium">{reg.studentId}</TableCell>
                  <TableCell>{reg.studentName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{reg.room}</Badge>
                  </TableCell>
                  <TableCell>{reg.service}</TableCell>
                  <TableCell>{reg.price.toLocaleString()}đ</TableCell>
                  <TableCell>{new Date(reg.startDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{new Date(reg.endDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{getStatusBadge(reg.status)}</TableCell>
                  <TableCell className="text-right">
                    {reg.status === "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleCancel(reg.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Đăng ký dịch vụ mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Mã sinh viên *</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="VD: SV001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentName">Họ và tên *</Label>
                <Input
                  id="studentName"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="room">Phòng</Label>
              <Input
                id="room"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="VD: A101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">Dịch vụ *</Label>
              <Select
                value={formData.service}
                onValueChange={handleServiceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn dịch vụ" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.name} value={service.name}>
                      {service.name} - {service.price.toLocaleString()}đ/{service.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Giá dịch vụ:</span>
                <span className="text-xl font-semibold text-blue-600">
                  {formData.price ? parseInt(formData.price).toLocaleString() : 0}đ
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Đăng ký</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

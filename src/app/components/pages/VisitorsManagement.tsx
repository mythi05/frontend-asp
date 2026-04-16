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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Plus, Search, UserPlus, Clock } from "lucide-react";
import { toast } from "sonner";

interface Visitor {
  id: string;
  visitorName: string;
  visitorId: string;
  phone: string;
  studentName: string;
  room: string;
  visitDate: string;
  checkIn: string;
  checkOut?: string;
  purpose: string;
  status: "in" | "out";
}

const initialVisitors: Visitor[] = [
  { id: "1", visitorName: "Nguyễn Văn X", visitorId: "001234567890", phone: "0987654321", studentName: "Nguyễn Văn A", room: "A101", visitDate: "2026-03-20", checkIn: "09:00", checkOut: "11:30", purpose: "Thăm con", status: "out" },
  { id: "2", visitorName: "Trần Thị Y", visitorId: "001234567891", phone: "0987654322", studentName: "Trần Thị B", room: "B201", visitDate: "2026-03-20", checkIn: "14:00", purpose: "Gửi đồ", status: "in" },
  { id: "3", visitorName: "Lê Văn Z", visitorId: "001234567892", phone: "0987654323", studentName: "Lê Văn C", room: "A102", visitDate: "2026-03-19", checkIn: "16:00", checkOut: "18:00", purpose: "Thăm bạn", status: "out" },
  { id: "4", visitorName: "Phạm Thị K", visitorId: "001234567893", phone: "0987654324", studentName: "Phạm Thị D", room: "C301", visitDate: "2026-03-20", checkIn: "10:30", purpose: "Thăm con", status: "in" },
];

export function VisitorsManagement() {
  const [visitors, setVisitors] = useState<Visitor[]>(initialVisitors);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    visitorName: "",
    visitorId: "",
    phone: "",
    studentName: "",
    room: "",
    visitDate: new Date().toISOString().split('T')[0],
    checkIn: "",
    purpose: "",
  });

  const filteredVisitors = visitors.filter((visitor) => {
    const matchesSearch = 
      visitor.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.phone.includes(searchTerm);
    return matchesSearch;
  });

  const stats = {
    total: visitors.length,
    today: visitors.filter(v => v.visitDate === new Date().toISOString().split('T')[0]).length,
    currentlyIn: visitors.filter(v => v.status === "in").length,
  };

  const handleAdd = () => {
    setFormData({
      visitorName: "",
      visitorId: "",
      phone: "",
      studentName: "",
      room: "",
      visitDate: new Date().toISOString().split('T')[0],
      checkIn: new Date().toTimeString().slice(0, 5),
      purpose: "",
    });
    setDialogOpen(true);
  };

  const handleCheckOut = (id: string) => {
    const currentTime = new Date().toTimeString().slice(0, 5);
    setVisitors(visitors.map((v) =>
      v.id === id ? { ...v, status: "out" as const, checkOut: currentTime } : v
    ));
    toast.success("Đã ghi nhận check-out");
  };

  const handleSave = () => {
    if (!formData.visitorName || !formData.visitorId || !formData.phone || !formData.studentName || !formData.room) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const newVisitor: Visitor = {
      id: Date.now().toString(),
      visitorName: formData.visitorName,
      visitorId: formData.visitorId,
      phone: formData.phone,
      studentName: formData.studentName,
      room: formData.room,
      visitDate: formData.visitDate,
      checkIn: formData.checkIn,
      purpose: formData.purpose,
      status: "in",
    };
    setVisitors([newVisitor, ...visitors]);
    toast.success("Đã đăng ký khách thăm thành công");
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Quản lý khách</h2>
          <p className="text-gray-500 mt-1">Đăng ký và theo dõi khách vào thăm</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Đăng ký khách
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng lượt khách</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Khách hôm nay</p>
                <p className="text-2xl font-semibold text-blue-600 mt-2">{stats.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đang trong KTX</p>
                <p className="text-2xl font-semibold text-green-600 mt-2">{stats.currentlyIn}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên khách, sinh viên, phòng, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Visitors Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên khách</TableHead>
                <TableHead>CMND/CCCD</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Thăm sinh viên</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Mục đích</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisitors.map((visitor) => (
                <TableRow key={visitor.id}>
                  <TableCell className="font-medium">{visitor.visitorName}</TableCell>
                  <TableCell>{visitor.visitorId}</TableCell>
                  <TableCell>{visitor.phone}</TableCell>
                  <TableCell>{visitor.studentName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{visitor.room}</Badge>
                  </TableCell>
                  <TableCell>{new Date(visitor.visitDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{visitor.checkIn}</TableCell>
                  <TableCell>{visitor.checkOut || "-"}</TableCell>
                  <TableCell>{visitor.purpose}</TableCell>
                  <TableCell>
                    {visitor.status === "in" ? (
                      <Badge className="bg-green-100 text-green-800">Đang thăm</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Đã ra</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {visitor.status === "in" && (
                      <Button
                        size="sm"
                        onClick={() => handleCheckOut(visitor.id)}
                      >
                        Check-out
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Đăng ký khách vào thăm</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visitorName">Tên khách *</Label>
                <Input
                  id="visitorName"
                  value={formData.visitorName}
                  onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                  placeholder="VD: Nguyễn Văn X"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitorId">CMND/CCCD *</Label>
                <Input
                  id="visitorId"
                  value={formData.visitorId}
                  onChange={(e) => setFormData({ ...formData, visitorId: e.target.value })}
                  placeholder="VD: 001234567890"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="VD: 0987654321"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Sinh viên được thăm *</Label>
                <Input
                  id="studentName"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Phòng *</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="VD: A101"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visitDate">Ngày thăm</Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkIn">Giờ vào</Label>
                <Input
                  id="checkIn"
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Mục đích</Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="VD: Thăm con, Gửi đồ..."
              />
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

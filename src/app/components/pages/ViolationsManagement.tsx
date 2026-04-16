import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
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
import { Plus, Search, Eye, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Violation {
  id: string;
  studentId: string;
  studentName: string;
  room: string;
  type: string;
  description: string;
  date: string;
  severity: "low" | "medium" | "high";
  penalty: number;
  status: "pending" | "resolved" | "appealed";
  resolvedDate?: string;
  notes: string;
}

const initialViolations: Violation[] = [
  { id: "1", studentId: "SV001", studentName: "Nguyễn Văn A", room: "A101", type: "Gây ồn", description: "Gây ồn vào lúc 23h", date: "2026-03-15", severity: "low", penalty: 100000, status: "resolved", resolvedDate: "2026-03-16", notes: "Đã nhắc nhở" },
  { id: "2", studentId: "SV003", studentName: "Lê Văn C", room: "A102", type: "Vệ sinh", description: "Không giữ vệ sinh phòng", date: "2026-03-18", severity: "medium", penalty: 200000, status: "pending", notes: "" },
  { id: "3", studentId: "SV005", studentName: "Hoàng Văn E", room: "B202", type: "An ninh", description: "Để người lạ vào KTX", date: "2026-03-10", severity: "high", penalty: 500000, status: "resolved", resolvedDate: "2026-03-12", notes: "Đã xử lý kỷ luật" },
  { id: "4", studentId: "SV002", studentName: "Trần Thị B", room: "B201", type: "Trật tự", description: "Vi phạm giờ giấc", date: "2026-03-19", severity: "low", penalty: 100000, status: "pending", notes: "" },
];

export function ViolationsManagement() {
  const [violations, setViolations] = useState<Violation[]>(initialViolations);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    room: "",
    type: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    severity: "low" as const,
    penalty: "",
    notes: "",
  });

  const filteredViolations = violations.filter((violation) => {
    const matchesSearch = 
      violation.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || violation.status === filterStatus;
    const matchesSeverity = filterSeverity === "all" || violation.severity === filterSeverity;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const stats = {
    total: violations.length,
    pending: violations.filter(v => v.status === "pending").length,
    resolved: violations.filter(v => v.status === "resolved").length,
    high: violations.filter(v => v.severity === "high").length,
  };

  const handleAdd = () => {
    setFormData({
      studentId: "",
      studentName: "",
      room: "",
      type: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      severity: "low",
      penalty: "",
      notes: "",
    });
    setDialogOpen(true);
  };

  const handleView = (violation: Violation) => {
    setSelectedViolation(violation);
    setViewDialogOpen(true);
  };

  const handleResolve = (id: string) => {
    setViolations(violations.map((v) =>
      v.id === id
        ? { ...v, status: "resolved" as const, resolvedDate: new Date().toISOString().split('T')[0] }
        : v
    ));
    toast.success("Đã xử lý vi phạm");
  };

  const handleSave = () => {
    if (!formData.studentId || !formData.studentName || !formData.type || !formData.description) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const newViolation: Violation = {
      id: Date.now().toString(),
      studentId: formData.studentId,
      studentName: formData.studentName,
      room: formData.room,
      type: formData.type,
      description: formData.description,
      date: formData.date,
      severity: formData.severity,
      penalty: parseInt(formData.penalty) || 0,
      status: "pending",
      notes: formData.notes,
    };
    setViolations([newViolation, ...violations]);
    toast.success("Đã ghi nhận vi phạm mới");
    setDialogOpen(false);
  };

  const getSeverityBadge = (severity: Violation["severity"]) => {
    switch (severity) {
      case "low":
        return <Badge className="bg-yellow-100 text-yellow-800">Nhẹ</Badge>;
      case "medium":
        return <Badge className="bg-orange-100 text-orange-800">Trung bình</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-800">Nghiêm trọng</Badge>;
    }
  };

  const getStatusBadge = (status: Violation["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800">Chưa xử lý</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Đã xử lý</Badge>;
      case "appealed":
        return <Badge className="bg-purple-100 text-purple-800">Khiếu nại</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Quản lý vi phạm</h2>
          <p className="text-gray-500 mt-1">Ghi nhận và xử lý vi phạm nội quy</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Ghi nhận vi phạm
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng vi phạm</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Chưa xử lý</p>
                <p className="text-2xl font-semibold text-blue-600 mt-2">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đã xử lý</p>
                <p className="text-2xl font-semibold text-green-600 mt-2">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Nghiêm trọng</p>
                <p className="text-2xl font-semibold text-red-600 mt-2">{stats.high}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Mức độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mức độ</SelectItem>
                <SelectItem value="low">Nhẹ</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="high">Nghiêm trọng</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chưa xử lý</SelectItem>
                <SelectItem value="resolved">Đã xử lý</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Violations Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MSSV</TableHead>
                <TableHead>Sinh viên</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Loại vi phạm</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Mức độ</TableHead>
                <TableHead>Phạt</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredViolations.map((violation) => (
                <TableRow key={violation.id}>
                  <TableCell className="font-medium">{violation.studentId}</TableCell>
                  <TableCell>{violation.studentName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{violation.room}</Badge>
                  </TableCell>
                  <TableCell>{violation.type}</TableCell>
                  <TableCell>{new Date(violation.date).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{getSeverityBadge(violation.severity)}</TableCell>
                  <TableCell>{violation.penalty.toLocaleString()}đ</TableCell>
                  <TableCell>{getStatusBadge(violation.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(violation)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {violation.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleResolve(violation.id)}
                        >
                          Xử lý
                        </Button>
                      )}
                    </div>
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
            <DialogTitle>Ghi nhận vi phạm mới</DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="type">Loại vi phạm *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gây ồn">Gây ồn</SelectItem>
                    <SelectItem value="Vệ sinh">Vệ sinh</SelectItem>
                    <SelectItem value="An ninh">An ninh</SelectItem>
                    <SelectItem value="Trật tự">Trật tự</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả vi phạm *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết về vi phạm..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Ngày vi phạm</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Mức độ</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Nhẹ</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Nghiêm trọng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="penalty">Mức phạt (VNĐ)</Label>
                <Input
                  id="penalty"
                  type="number"
                  value={formData.penalty}
                  onChange={(e) => setFormData({ ...formData, penalty: e.target.value })}
                  placeholder="VD: 100000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ghi chú thêm..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Ghi nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết vi phạm</DialogTitle>
          </DialogHeader>
          {selectedViolation && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Sinh viên</p>
                  <p className="font-medium">{selectedViolation.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">MSSV</p>
                  <p className="font-medium">{selectedViolation.studentId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Phòng</p>
                  <p className="font-medium">{selectedViolation.room}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Loại vi phạm</p>
                  <p className="font-medium">{selectedViolation.type}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mô tả</p>
                <p className="font-medium">{selectedViolation.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ngày vi phạm</p>
                  <p className="font-medium">{new Date(selectedViolation.date).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mức độ</p>
                  {getSeverityBadge(selectedViolation.severity)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Mức phạt</p>
                  <p className="font-medium text-red-600">{selectedViolation.penalty.toLocaleString()}đ</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  {getStatusBadge(selectedViolation.status)}
                </div>
              </div>
              {selectedViolation.notes && (
                <div>
                  <p className="text-sm text-gray-500">Ghi chú</p>
                  <p className="font-medium">{selectedViolation.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
import { Plus, Search, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  room: string;
  month: string;
  roomFee: number;
  electricFee: number;
  waterFee: number;
  otherFee: number;
  total: number;
  status: "paid" | "unpaid" | "overdue";
  paidDate?: string;
  dueDate: string;
}

const initialFees: FeeRecord[] = [
  { id: "1", studentId: "SV001", studentName: "Nguyễn Văn A", room: "A101", month: "2026-03", roomFee: 750000, electricFee: 120000, waterFee: 80000, otherFee: 50000, total: 1000000, status: "paid", paidDate: "2026-03-05", dueDate: "2026-03-10" },
  { id: "2", studentId: "SV002", studentName: "Trần Thị B", room: "B201", month: "2026-03", roomFee: 750000, electricFee: 130000, waterFee: 75000, otherFee: 45000, total: 1000000, status: "unpaid", dueDate: "2026-03-10" },
  { id: "3", studentId: "SV003", studentName: "Lê Văn C", room: "A102", month: "2026-03", roomFee: 750000, electricFee: 110000, waterFee: 70000, otherFee: 70000, total: 1000000, status: "paid", paidDate: "2026-03-08", dueDate: "2026-03-10" },
  { id: "4", studentId: "SV004", studentName: "Phạm Thị D", room: "C301", month: "2026-03", roomFee: 750000, electricFee: 150000, waterFee: 85000, otherFee: 15000, total: 1000000, status: "unpaid", dueDate: "2026-03-10" },
  { id: "5", studentId: "SV005", studentName: "Hoàng Văn E", room: "B202", month: "2026-02", roomFee: 1000000, electricFee: 140000, waterFee: 80000, otherFee: 30000, total: 1250000, status: "overdue", dueDate: "2026-02-10" },
];

export function FeeManagement() {
  const [fees, setFees] = useState<FeeRecord[]>(initialFees);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    room: "",
    month: "",
    roomFee: "",
    electricFee: "",
    waterFee: "",
    otherFee: "",
    dueDate: "",
  });

  const filteredFees = fees.filter((fee) => {
    const matchesSearch = 
      fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || fee.status === filterStatus;
    const matchesMonth = filterMonth === "all" || fee.month === filterMonth;
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const stats = {
    totalRevenue: fees.filter(f => f.status === "paid").reduce((sum, f) => sum + f.total, 0),
    unpaidCount: fees.filter(f => f.status === "unpaid").length,
    overdueCount: fees.filter(f => f.status === "overdue").length,
    paidCount: fees.filter(f => f.status === "paid").length,
  };

  const handleAdd = () => {
    setFormData({
      studentId: "",
      studentName: "",
      room: "",
      month: "",
      roomFee: "",
      electricFee: "",
      waterFee: "",
      otherFee: "",
      dueDate: "",
    });
    setDialogOpen(true);
  };

  const handleMarkAsPaid = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setPaymentDialogOpen(true);
  };

  const confirmPayment = () => {
    if (selectedFee) {
      setFees(fees.map((fee) =>
        fee.id === selectedFee.id
          ? { ...fee, status: "paid" as const, paidDate: new Date().toISOString().split('T')[0] }
          : fee
      ));
      toast.success("Đã xác nhận thanh toán thành công");
      setPaymentDialogOpen(false);
      setSelectedFee(null);
    }
  };

  const handleSave = () => {
    if (!formData.studentId || !formData.studentName || !formData.room || !formData.month) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const roomFee = parseInt(formData.roomFee) || 0;
    const electricFee = parseInt(formData.electricFee) || 0;
    const waterFee = parseInt(formData.waterFee) || 0;
    const otherFee = parseInt(formData.otherFee) || 0;
    const total = roomFee + electricFee + waterFee + otherFee;

    const newFee: FeeRecord = {
      id: Date.now().toString(),
      studentId: formData.studentId,
      studentName: formData.studentName,
      room: formData.room,
      month: formData.month,
      roomFee,
      electricFee,
      waterFee,
      otherFee,
      total,
      status: "unpaid",
      dueDate: formData.dueDate,
    };

    setFees([newFee, ...fees]);
    toast.success("Đã tạo phiếu thu mới thành công");
    setDialogOpen(false);
  };

  const getStatusBadge = (status: FeeRecord["status"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>;
      case "unpaid":
        return <Badge className="bg-yellow-100 text-yellow-800">Chưa thanh toán</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Quá hạn</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Quản lý phí</h2>
          <p className="text-gray-500 mt-1">Quản lý thu chi và thanh toán</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo phiếu thu mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng doanh thu</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">
                  {stats.totalRevenue.toLocaleString()}đ
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đã thanh toán</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.paidCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Chưa thanh toán</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.unpaidCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Quá hạn</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.overdueCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
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
                placeholder="Tìm kiếm theo tên, MSSV, phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Tháng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tháng</SelectItem>
                <SelectItem value="2026-03">Tháng 3/2026</SelectItem>
                <SelectItem value="2026-02">Tháng 2/2026</SelectItem>
                <SelectItem value="2026-01">Tháng 1/2026</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                <SelectItem value="overdue">Quá hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fees Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MSSV</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Tháng</TableHead>
                <TableHead className="text-right">Phí phòng</TableHead>
                <TableHead className="text-right">Điện/Nước/Khác</TableHead>
                <TableHead className="text-right">Tổng cộng</TableHead>
                <TableHead>Hạn thanh toán</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-medium">{fee.studentId}</TableCell>
                  <TableCell>{fee.studentName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{fee.room}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(fee.month + "-01").toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right">{fee.roomFee.toLocaleString()}đ</TableCell>
                  <TableCell className="text-right text-sm text-gray-500">
                    {(fee.electricFee + fee.waterFee + fee.otherFee).toLocaleString()}đ
                  </TableCell>
                  <TableCell className="text-right font-medium">{fee.total.toLocaleString()}đ</TableCell>
                  <TableCell>
                    {new Date(fee.dueDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>{getStatusBadge(fee.status)}</TableCell>
                  <TableCell className="text-right">
                    {fee.status !== "paid" && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(fee)}
                      >
                        Xác nhận thanh toán
                      </Button>
                    )}
                    {fee.status === "paid" && (
                      <span className="text-sm text-gray-500">
                        {fee.paidDate && new Date(fee.paidDate).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Fee Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tạo phiếu thu mới</DialogTitle>
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
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room">Phòng *</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="VD: A101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="month">Tháng *</Label>
                <Input
                  id="month"
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Hạn thanh toán *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomFee">Phí phòng (VNĐ) *</Label>
                <Input
                  id="roomFee"
                  type="number"
                  value={formData.roomFee}
                  onChange={(e) => setFormData({ ...formData, roomFee: e.target.value })}
                  placeholder="VD: 750000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="electricFee">Phí điện (VNĐ)</Label>
                <Input
                  id="electricFee"
                  type="number"
                  value={formData.electricFee}
                  onChange={(e) => setFormData({ ...formData, electricFee: e.target.value })}
                  placeholder="VD: 120000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="waterFee">Phí nước (VNĐ)</Label>
                <Input
                  id="waterFee"
                  type="number"
                  value={formData.waterFee}
                  onChange={(e) => setFormData({ ...formData, waterFee: e.target.value })}
                  placeholder="VD: 80000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherFee">Phí khác (VNĐ)</Label>
                <Input
                  id="otherFee"
                  type="number"
                  value={formData.otherFee}
                  onChange={(e) => setFormData({ ...formData, otherFee: e.target.value })}
                  placeholder="VD: 50000"
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Tổng cộng:</span>
                <span className="text-xl font-semibold text-blue-600">
                  {(
                    (parseInt(formData.roomFee) || 0) +
                    (parseInt(formData.electricFee) || 0) +
                    (parseInt(formData.waterFee) || 0) +
                    (parseInt(formData.otherFee) || 0)
                  ).toLocaleString()}đ
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Tạo phiếu thu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Xác nhận thanh toán</DialogTitle>
          </DialogHeader>
          {selectedFee && (
            <div className="space-y-4 py-4">
              <p>Xác nhận đã nhận thanh toán từ:</p>
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sinh viên:</span>
                  <span className="font-medium">{selectedFee.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">MSSV:</span>
                  <span className="font-medium">{selectedFee.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phòng:</span>
                  <span className="font-medium">{selectedFee.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tháng:</span>
                  <span className="font-medium">
                    {new Date(selectedFee.month + "-01").toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Số tiền:</span>
                  <span className="text-xl font-semibold text-green-600">
                    {selectedFee.total.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={confirmPayment} className="bg-green-600 hover:bg-green-700">
              Xác nhận thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

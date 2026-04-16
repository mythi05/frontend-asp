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
import { Plus, Search, Eye, FileText, FileSignature } from "lucide-react";
import { toast } from "sonner";

interface Contract {
  id: string;
  contractNumber: string;
  studentId: string;
  studentName: string;
  room: string;
  startDate: string;
  endDate: string;
  monthlyFee: number;
  deposit: number;
  status: "active" | "expired" | "terminated";
  signDate: string;
  notes: string;
}

const initialContracts: Contract[] = [
  { id: "1", contractNumber: "HD001", studentId: "SV001", studentName: "Nguyễn Văn A", room: "A101", startDate: "2026-01-01", endDate: "2026-06-30", monthlyFee: 750000, deposit: 1500000, status: "active", signDate: "2025-12-28", notes: "" },
  { id: "2", contractNumber: "HD002", studentId: "SV002", studentName: "Trần Thị B", room: "B201", startDate: "2026-01-01", endDate: "2026-06-30", monthlyFee: 750000, deposit: 1500000, status: "active", signDate: "2025-12-29", notes: "" },
  { id: "3", contractNumber: "HD003", studentId: "SV003", studentName: "Lê Văn C", room: "A102", startDate: "2025-09-01", endDate: "2025-12-31", monthlyFee: 750000, deposit: 1500000, status: "expired", signDate: "2025-08-25", notes: "Đã trả phòng đúng hạn" },
  { id: "4", contractNumber: "HD004", studentId: "SV004", studentName: "Phạm Thị D", room: "C301", startDate: "2026-01-01", endDate: "2026-06-30", monthlyFee: 750000, deposit: 1500000, status: "active", signDate: "2025-12-30", notes: "" },
];

export function ContractsManagement() {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState({
    contractNumber: "",
    studentId: "",
    studentName: "",
    room: "",
    startDate: "",
    endDate: "",
    monthlyFee: "",
    deposit: "",
    notes: "",
  });

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = 
      contract.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || contract.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === "active").length,
    expired: contracts.filter(c => c.status === "expired").length,
    totalDeposit: contracts.filter(c => c.status === "active").reduce((sum, c) => sum + c.deposit, 0),
  };

  const handleAdd = () => {
    setFormData({
      contractNumber: "",
      studentId: "",
      studentName: "",
      room: "",
      startDate: "",
      endDate: "",
      monthlyFee: "",
      deposit: "",
      notes: "",
    });
    setDialogOpen(true);
  };

  const handleView = (contract: Contract) => {
    setSelectedContract(contract);
    setViewDialogOpen(true);
  };

  const handleTerminate = (id: string) => {
    setContracts(contracts.map((c) =>
      c.id === id ? { ...c, status: "terminated" as const } : c
    ));
    toast.success("Đã chấm dứt hợp đồng");
  };

  const handleSave = () => {
    if (!formData.contractNumber || !formData.studentId || !formData.studentName || !formData.room || !formData.startDate || !formData.endDate) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const newContract: Contract = {
      id: Date.now().toString(),
      contractNumber: formData.contractNumber,
      studentId: formData.studentId,
      studentName: formData.studentName,
      room: formData.room,
      startDate: formData.startDate,
      endDate: formData.endDate,
      monthlyFee: parseInt(formData.monthlyFee) || 0,
      deposit: parseInt(formData.deposit) || 0,
      status: "active",
      signDate: new Date().toISOString().split('T')[0],
      notes: formData.notes,
    };
    setContracts([newContract, ...contracts]);
    toast.success("Đã tạo hợp đồng mới thành công");
    setDialogOpen(false);
  };

  const getStatusBadge = (status: Contract["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Đang hiệu lực</Badge>;
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800">Hết hạn</Badge>;
      case "terminated":
        return <Badge className="bg-red-100 text-red-800">Đã chấm dứt</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Quản lý hợp đồng</h2>
          <p className="text-gray-500 mt-1">Quản lý hợp đồng thuê phòng ký túc xá</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo hợp đồng mới
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng hợp đồng</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <FileSignature className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đang hiệu lực</p>
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
                <p className="text-sm text-gray-500">Tổng tiền cọc</p>
                <p className="text-2xl font-semibold text-blue-600 mt-2">
                  {(stats.totalDeposit / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên, MSSV, số hợp đồng, phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hiệu lực</SelectItem>
                <SelectItem value="expired">Hết hạn</SelectItem>
                <SelectItem value="terminated">Đã chấm dứt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Số HĐ</TableHead>
                <TableHead>Sinh viên</TableHead>
                <TableHead>MSSV</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Bắt đầu</TableHead>
                <TableHead>Kết thúc</TableHead>
                <TableHead className="text-right">Phí/tháng</TableHead>
                <TableHead className="text-right">Cọc</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                  <TableCell>{contract.studentName}</TableCell>
                  <TableCell>{contract.studentId}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{contract.room}</Badge>
                  </TableCell>
                  <TableCell>{new Date(contract.startDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{new Date(contract.endDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell className="text-right">{contract.monthlyFee.toLocaleString()}đ</TableCell>
                  <TableCell className="text-right">{contract.deposit.toLocaleString()}đ</TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(contract)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {contract.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleTerminate(contract.id)}
                        >
                          Chấm dứt
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
            <DialogTitle>Tạo hợp đồng mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractNumber">Số hợp đồng *</Label>
                <Input
                  id="contractNumber"
                  value={formData.contractNumber}
                  onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                  placeholder="VD: HD001"
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
                <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyFee">Phí thuê/tháng (VNĐ)</Label>
                <Input
                  id="monthlyFee"
                  type="number"
                  value={formData.monthlyFee}
                  onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                  placeholder="VD: 750000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit">Tiền cọc (VNĐ)</Label>
                <Input
                  id="deposit"
                  type="number"
                  value={formData.deposit}
                  onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                  placeholder="VD: 1500000"
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
            <Button onClick={handleSave}>Tạo hợp đồng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết hợp đồng</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-4 py-4">
              <div className="text-center pb-4 border-b">
                <h3 className="text-xl font-semibold">HỢP ĐỒNG THUÊ PHÒNG KTX</h3>
                <p className="text-sm text-gray-500 mt-1">Số: {selectedContract.contractNumber}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Sinh viên</p>
                  <p className="font-medium">{selectedContract.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mã sinh viên</p>
                  <p className="font-medium">{selectedContract.studentId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Phòng</p>
                  <p className="font-medium">{selectedContract.room}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  {getStatusBadge(selectedContract.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ngày bắt đầu</p>
                  <p className="font-medium">{new Date(selectedContract.startDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày kết thúc</p>
                  <p className="font-medium">{new Date(selectedContract.endDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Phí thuê/tháng</p>
                  <p className="font-medium text-blue-600">{selectedContract.monthlyFee.toLocaleString()}đ</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tiền cọc</p>
                  <p className="font-medium text-orange-600">{selectedContract.deposit.toLocaleString()}đ</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày ký hợp đồng</p>
                <p className="font-medium">{new Date(selectedContract.signDate).toLocaleDateString('vi-VN')}</p>
              </div>
              {selectedContract.notes && (
                <div>
                  <p className="text-sm text-gray-500">Ghi chú</p>
                  <p className="font-medium">{selectedContract.notes}</p>
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

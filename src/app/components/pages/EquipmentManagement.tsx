import { useState, useEffect } from "react";
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
import { Plus, Search, Edit, Trash2, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../../api"; // Đảm bảo đường dẫn này đúng với project của bạn

// Mapping Interface với Model Backend
interface Equipment {
  id: number;
  deviceName: string;
  room: string;
  type: string;
  quantity: number;
  conditionId: number;
  condition?: {
    id: number;
    conditionName: string;
  };
  purchaseDate: string;
  value: number;
}

export function EquipmentManagement() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCondition, setFilterCondition] = useState<string>("all");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState({
    deviceName: "",
    room: "",
    type: "",
    quantity: "",
    conditionId: "1", // Mặc định là 1 (thường là 'Tốt')
    purchaseDate: new Date().toISOString().split('T')[0],
    value: "",
  });

  // 1. Fetch dữ liệu từ API
  const fetchEquipment = async () => {
    setLoading(true);
    try {
      // Build query string nếu cần lọc tại server
      const params = new URLSearchParams();
      if (searchTerm) params.append("keyword", searchTerm);
      if (filterCondition !== "all") params.append("conditionId", filterCondition);
      
      const data = await apiRequest<Equipment[]>(`/api/Device?${params.toString()}`);
      setEquipment(data);
    } catch (err) {
      toast.error("Không thể tải danh sách thiết bị");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [searchTerm, filterCondition]);

  // 2. Thống kê
  const stats = {
    total: equipment.length,
    good: equipment.filter(e => e.conditionId === 1).length,
    damaged: equipment.filter(e => e.conditionId === 2).length,
    broken: equipment.filter(e => e.conditionId === 3).length,
  };

  const handleAdd = () => {
    setEditingEquipment(null);
    setFormData({
      deviceName: "",
      room: "",
      type: "",
      quantity: "",
      conditionId: "1",
      purchaseDate: new Date().toISOString().split('T')[0],
      value: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (item: Equipment) => {
    setEditingEquipment(item);
    setFormData({
      deviceName: item.deviceName,
      room: item.room,
      type: item.type,
      quantity: item.quantity.toString(),
      conditionId: item.conditionId.toString(),
      purchaseDate: item.purchaseDate.split('T')[0],
      value: item.value.toString(),
    });
    setDialogOpen(true);
  };

  // 3. Xóa thiết bị
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) return;
    try {
      await apiRequest(`/api/Device/${id}`, { method: "DELETE" });
      toast.success("Đã xóa thiết bị thành công");
      fetchEquipment();
    } catch (err) {
      toast.error("Lỗi khi xóa thiết bị");
    }
  };

  // 4. Lưu (Create hoặc Update)
  const handleSave = async () => {
    if (!formData.deviceName || !formData.room || !formData.quantity) {
      toast.error("Vui lòng điền các trường bắt buộc");
      return;
    }

    const payload = {
      id: editingEquipment ? editingEquipment.id : 0,
      deviceName: formData.deviceName,
      room: formData.room,
      type: formData.type,
      quantity: parseInt(formData.quantity),
      conditionId: parseInt(formData.conditionId),
      purchaseDate: formData.purchaseDate,
      value: parseFloat(formData.value) || 0,
    };

    try {
      const method = editingEquipment ? "PUT" : "POST";
      const url = editingEquipment ? `/api/Device/${editingEquipment.id}` : "/api/Device";
      
      await apiRequest(url, {
        method,
        body: JSON.stringify(payload),
      });

      toast.success(editingEquipment ? "Cập nhật thành công" : "Thêm mới thành công");
      setDialogOpen(false);
      fetchEquipment();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu dữ liệu");
    }
  };

  const getConditionBadge = (conditionId: number) => {
    switch (conditionId) {
      case 1: return <Badge className="bg-green-100 text-green-800 border-none">Tốt</Badge>;
      case 2: return <Badge className="bg-yellow-100 text-yellow-800 border-none">Hư hỏng</Badge>;
      case 3: return <Badge className="bg-red-100 text-red-800 border-none">Hỏng</Badge>;
      default: return <Badge variant="outline">N/A</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý trang thiết bị</h2>
          <p className="text-slate-500 text-sm">Kết nối trực tiếp với hệ thống cơ sở dữ liệu</p>
        </div>
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Thêm thiết bị
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng thiết bị", val: stats.total, color: "text-blue-600", icon: Package },
          { label: "Tình trạng tốt", val: stats.good, color: "text-green-600" },
          { label: "Cần sửa chữa", val: stats.damaged, color: "text-yellow-600" },
          { label: "Đã hỏng", val: stats.broken, color: "text-red-600" },
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-sm bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.val}</p>
              </div>
              {s.icon && <s.icon className="h-8 w-8 text-slate-100" />}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm tên thiết bị, phòng..."
              className="pl-10 bg-slate-50 border-slate-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterCondition} onValueChange={setFilterCondition}>
            <SelectTrigger className="w-[180px] bg-slate-50 border-slate-100">
              <SelectValue placeholder="Tình trạng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tình trạng</SelectItem>
              <SelectItem value="1">Tốt</SelectItem>
              <SelectItem value="2">Hư hỏng</SelectItem>
              <SelectItem value="3">Hỏng hoàn toàn</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Tên thiết bị</TableHead>
              <TableHead>Vị trí</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>SL</TableHead>
              <TableHead>Tình trạng</TableHead>
              <TableHead>Ngày mua</TableHead>
              <TableHead className="text-right">Giá trị (VNĐ)</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-300" />
                </TableCell>
              </TableRow>
            ) : equipment.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-400">
                  Không tìm thấy thiết bị nào
                </TableCell>
              </TableRow>
            ) : (
              equipment.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-semibold text-slate-700">{item.deviceName}</TableCell>
                  <TableCell><Badge variant="secondary" className="font-mono">{item.room}</Badge></TableCell>
                  <TableCell className="text-slate-600">{item.type}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{getConditionBadge(item.conditionId)}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(item.purchaseDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.value.toLocaleString()}đ
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="text-slate-400 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog Thêm/Sửa */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingEquipment ? "Cập nhật thiết bị" : "Thêm thiết bị hệ thống"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên thiết bị *</Label>
                <Input
                  value={formData.deviceName}
                  onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                  placeholder="VD: Điều hòa Samsung"
                />
              </div>
              <div className="space-y-2">
                <Label>Phòng/Vị trí *</Label>
                <Input
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="VD: A.102"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phân loại</Label>
                <Input
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="VD: Điện tử"
                />
              </div>
              <div className="space-y-2">
                <Label>Số lượng *</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tình trạng</Label>
                <Select
                  value={formData.conditionId}
                  onValueChange={(val) => setFormData({ ...formData, conditionId: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Tốt</SelectItem>
                    <SelectItem value="2">Hư hỏng</SelectItem>
                    <SelectItem value="3">Hỏng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ngày mua</Label>
                <Input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Giá trị ước tính (VNĐ)</Label>
              <Input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="VD: 5000000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-slate-900 text-white hover:bg-blue-600">
              {editingEquipment ? "Lưu thay đổi" : "Xác nhận thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
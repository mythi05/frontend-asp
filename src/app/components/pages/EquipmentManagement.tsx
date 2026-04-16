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
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

interface Equipment {
  id: string;
  name: string;
  room: string;
  category: string;
  quantity: number;
  condition: "good" | "damaged" | "broken";
  purchaseDate: string;
  price: number;
  notes: string;
}

const initialEquipment: Equipment[] = [
  { id: "1", name: "Giường tầng", room: "A101", category: "Nội thất", quantity: 2, condition: "good", purchaseDate: "2023-01-15", price: 3000000, notes: "" },
  { id: "2", name: "Tủ quần áo", room: "A101", category: "Nội thất", quantity: 4, condition: "good", purchaseDate: "2023-01-15", price: 1500000, notes: "" },
  { id: "3", name: "Điều hòa", room: "A101", category: "Điện tử", quantity: 1, condition: "good", purchaseDate: "2023-02-20", price: 8000000, notes: "" },
  { id: "4", name: "Quạt trần", room: "B201", category: "Điện tử", quantity: 1, condition: "damaged", purchaseDate: "2022-05-10", price: 1200000, notes: "Cần bảo trì" },
  { id: "5", name: "Bàn học", room: "C301", category: "Nội thất", quantity: 4, condition: "good", purchaseDate: "2023-01-15", price: 500000, notes: "" },
  { id: "6", name: "Ghế", room: "C301", category: "Nội thất", quantity: 4, condition: "broken", purchaseDate: "2022-08-20", price: 300000, notes: "Cần thay thế" },
];

export function EquipmentManagement() {
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCondition, setFilterCondition] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    room: "",
    category: "",
    quantity: "",
    condition: "good" as const,
    purchaseDate: "",
    price: "",
    notes: "",
  });

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCondition = filterCondition === "all" || item.condition === filterCondition;
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCondition && matchesCategory;
  });

  const stats = {
    total: equipment.length,
    good: equipment.filter(e => e.condition === "good").length,
    damaged: equipment.filter(e => e.condition === "damaged").length,
    broken: equipment.filter(e => e.condition === "broken").length,
  };

  const handleAdd = () => {
    setEditingEquipment(null);
    setFormData({
      name: "",
      room: "",
      category: "",
      quantity: "",
      condition: "good",
      purchaseDate: "",
      price: "",
      notes: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (item: Equipment) => {
    setEditingEquipment(item);
    setFormData({
      name: item.name,
      room: item.room,
      category: item.category,
      quantity: item.quantity.toString(),
      condition: item.condition,
      purchaseDate: item.purchaseDate,
      price: item.price.toString(),
      notes: item.notes,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEquipment(equipment.filter((item) => item.id !== id));
    toast.success("Đã xóa thiết bị thành công");
  };

  const handleSave = () => {
    if (!formData.name || !formData.room || !formData.category || !formData.quantity) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (editingEquipment) {
      setEquipment(equipment.map((item) =>
        item.id === editingEquipment.id
          ? {
              ...item,
              ...formData,
              quantity: parseInt(formData.quantity),
              price: parseInt(formData.price) || 0,
            }
          : item
      ));
      toast.success("Đã cập nhật thiết bị thành công");
    } else {
      const newEquipment: Equipment = {
        id: Date.now().toString(),
        name: formData.name,
        room: formData.room,
        category: formData.category,
        quantity: parseInt(formData.quantity),
        condition: formData.condition,
        purchaseDate: formData.purchaseDate,
        price: parseInt(formData.price) || 0,
        notes: formData.notes,
      };
      setEquipment([...equipment, newEquipment]);
      toast.success("Đã thêm thiết bị mới thành công");
    }
    setDialogOpen(false);
  };

  const getConditionBadge = (condition: Equipment["condition"]) => {
    switch (condition) {
      case "good":
        return <Badge className="bg-green-100 text-green-800">Tốt</Badge>;
      case "damaged":
        return <Badge className="bg-yellow-100 text-yellow-800">Hư hỏng</Badge>;
      case "broken":
        return <Badge className="bg-red-100 text-red-800">Hỏng</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Quản lý thiết bị</h2>
          <p className="text-gray-500 mt-1">Theo dõi trang thiết bị trong ký túc xá</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm thiết bị
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng thiết bị</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tình trạng tốt</p>
                <p className="text-2xl font-semibold text-green-600 mt-2">{stats.good}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hư hỏng</p>
                <p className="text-2xl font-semibold text-yellow-600 mt-2">{stats.damaged}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hỏng</p>
                <p className="text-2xl font-semibold text-red-600 mt-2">{stats.broken}</p>
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
                placeholder="Tìm kiếm thiết bị, phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Loại thiết bị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="Nội thất">Nội thất</SelectItem>
                <SelectItem value="Điện tử">Điện tử</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCondition} onValueChange={setFilterCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Tình trạng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="good">Tốt</SelectItem>
                <SelectItem value="damaged">Hư hỏng</SelectItem>
                <SelectItem value="broken">H��ng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên thiết bị</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Tình trạng</TableHead>
                <TableHead>Ngày mua</TableHead>
                <TableHead className="text-right">Giá trị</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.room}</Badge>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{getConditionBadge(item.condition)}</TableCell>
                  <TableCell>{new Date(item.purchaseDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell className="text-right">{item.price.toLocaleString()}đ</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingEquipment ? "Chỉnh sửa thiết bị" : "Thêm thiết bị mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên thiết bị *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Giường tầng"
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
                <Label htmlFor="category">Loại thiết bị *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nội thất">Nội thất</SelectItem>
                    <SelectItem value="Điện tử">Điện tử</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Số lượng *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="VD: 2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Tình trạng</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value: any) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tình trạng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Tốt</SelectItem>
                    <SelectItem value="damaged">Hư hỏng</SelectItem>
                    <SelectItem value="broken">Hỏng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Ngày mua</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Giá trị (VNĐ)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="VD: 3000000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ghi chú về thiết bị..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              {editingEquipment ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

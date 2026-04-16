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
import { Plus, Search, Edit, Trash2, UsersRound, User } from "lucide-react";
import { toast } from "sonner";

interface Staff {
  id: string;
  staffId: string;
  fullName: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  startDate: string;
  status: "active" | "inactive";
}

const initialStaff: Staff[] = [
  { id: "1", staffId: "NV001", fullName: "Trần Văn Minh", position: "Quản lý", department: "Hành chính", phone: "0911234567", email: "minh@ktx.edu.vn", startDate: "2020-01-15", status: "active" },
  { id: "2", staffId: "NV002", fullName: "Nguyễn Thị Hương", position: "Kế toán", department: "Tài chính", phone: "0911234568", email: "huong@ktx.edu.vn", startDate: "2021-03-20", status: "active" },
  { id: "3", staffId: "NV003", fullName: "Lê Văn Hùng", position: "Kỹ thuật viên", department: "Bảo trì", phone: "0911234569", email: "hung@ktx.edu.vn", startDate: "2019-05-10", status: "active" },
  { id: "4", staffId: "NV004", fullName: "Phạm Thị Lan", position: "Lễ tân", department: "Hành chính", phone: "0911234570", email: "lan@ktx.edu.vn", startDate: "2022-08-01", status: "active" },
  { id: "5", staffId: "NV005", fullName: "Hoàng Văn Nam", position: "Bảo vệ", department: "An ninh", phone: "0911234571", email: "nam@ktx.edu.vn", startDate: "2018-02-15", status: "active" },
];

export function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    staffId: "",
    fullName: "",
    position: "",
    department: "",
    phone: "",
    email: "",
    startDate: "",
    status: "active" as const,
  });

  const filteredStaff = staff.filter((s) => {
    const matchesSearch = 
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || s.department === filterDepartment;
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const stats = {
    total: staff.length,
    active: staff.filter(s => s.status === "active").length,
    departments: new Set(staff.map(s => s.department)).size,
  };

  const handleAdd = () => {
    setEditingStaff(null);
    setFormData({
      staffId: "",
      fullName: "",
      position: "",
      department: "",
      phone: "",
      email: "",
      startDate: "",
      status: "active",
    });
    setDialogOpen(true);
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData(staffMember);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setStaff(staff.filter((s) => s.id !== id));
    toast.success("Đã xóa nhân viên thành công");
  };

  const handleSave = () => {
    if (!formData.staffId || !formData.fullName || !formData.position || !formData.department || !formData.phone || !formData.email) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (editingStaff) {
      setStaff(staff.map((s) =>
        s.id === editingStaff.id ? { ...s, ...formData } : s
      ));
      toast.success("Đã cập nhật thông tin nhân viên");
    } else {
      const newStaff: Staff = {
        id: Date.now().toString(),
        ...formData,
      };
      setStaff([...staff, newStaff]);
      toast.success("Đã thêm nhân viên mới thành công");
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Quản lý nhân viên</h2>
          <p className="text-gray-500 mt-1">Quản lý thông tin nhân viên KTX</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng nhân viên</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <UsersRound className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đang làm việc</p>
                <p className="text-2xl font-semibold text-green-600 mt-2">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Số phòng ban</p>
                <p className="text-2xl font-semibold text-blue-600 mt-2">{stats.departments}</p>
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
                placeholder="Tìm kiếm theo tên, mã NV, SĐT, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                <SelectItem value="Hành chính">Hành chính</SelectItem>
                <SelectItem value="Tài chính">Tài chính</SelectItem>
                <SelectItem value="Bảo trì">Bảo trì</SelectItem>
                <SelectItem value="An ninh">An ninh</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang làm việc</SelectItem>
                <SelectItem value="inactive">Đã nghỉ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã NV</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Chức vụ</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ngày vào làm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staffMember) => (
                <TableRow key={staffMember.id}>
                  <TableCell className="font-medium">{staffMember.staffId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <span>{staffMember.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{staffMember.position}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{staffMember.department}</Badge>
                  </TableCell>
                  <TableCell>{staffMember.phone}</TableCell>
                  <TableCell>{staffMember.email}</TableCell>
                  <TableCell>{new Date(staffMember.startDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    {staffMember.status === "active" ? (
                      <Badge className="bg-green-100 text-green-800">Đang làm việc</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Đã nghỉ</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(staffMember)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(staffMember.id)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? "Chỉnh sửa thông tin nhân viên" : "Thêm nhân viên mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staffId">Mã nhân viên *</Label>
                <Input
                  id="staffId"
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  placeholder="VD: NV001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="VD: Trần Văn Minh"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Chức vụ *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="VD: Quản lý"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Phòng ban *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hành chính">Hành chính</SelectItem>
                    <SelectItem value="Tài chính">Tài chính</SelectItem>
                    <SelectItem value="Bảo trì">Bảo trì</SelectItem>
                    <SelectItem value="An ninh">An ninh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="VD: 0911234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="VD: minh@ktx.edu.vn"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày vào làm</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang làm việc</SelectItem>
                    <SelectItem value="inactive">Đã nghỉ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              {editingStaff ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

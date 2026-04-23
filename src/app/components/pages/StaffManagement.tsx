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
import { Plus, Edit, Trash2, Search, Filter, RefreshCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../../api";

// Cấu trúc dữ liệu chuẩn cho Frontend
interface Staff {
  id: string;
  staffId: string; // Mã NV (NV001...)
  fullName: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  startDate: string;
  status: number;
  departmentId: number;
  roleId: number;
}

export function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Bộ lọc
  const [keyword, setKeyword] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    startDate: new Date().toISOString().split("T")[0],
    positionId: "",
    departmentId: "",
    status: "1",
  });

  useEffect(() => {
    fetchStaticData();
    fetchAll();
  }, []);

  const fetchStaticData = async () => {
    try {
      const [d, r] = await Promise.all([
        apiRequest("/api/Department"),
        apiRequest("/api/Role"),
      ]);
      setDepartments(d);
      setRoles(r);
    } catch {
      toast.error("Không thể tải danh mục phòng ban/chức vụ");
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append("keyword", keyword);
      if (filterDept !== "all") params.append("departmentId", filterDept);
      if (filterStatus !== "all") params.append("status", filterStatus);

      const data = await apiRequest(`/api/Staff?${params.toString()}`);
      
      const mapped = data.map((x: any) => ({
        id: x.id.toString(),
        staffId: x.staffCode,
        fullName: x.fullName,
        position: x.roleName,
        department: x.departmentName,
        phone: x.phone || "",
        email: x.email || "",
        startDate: x.hireDate?.split("T")[0] || "",
        status: x.status,
        departmentId: x.departmentId,
        roleId: x.roleId
      }));

      setStaff(mapped);
    } catch (error) {
      toast.error("Lỗi kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s: Staff) => {
    setEditingStaff(s);
    setFormData({
      fullName: s.fullName,
      phone: s.phone,
      email: s.email,
      startDate: s.startDate,
      positionId: s.roleId.toString(),
      departmentId: s.departmentId.toString(),
      status: s.status.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống?")) return;
    
    try {
      await apiRequest(`/api/Staff/${id}`, { method: "DELETE" });
      toast.success("Xóa nhân viên thành công");
      fetchAll();
    } catch (error) {
      toast.error("Không thể xóa nhân viên (có thể do ràng buộc dữ liệu)");
    }
  };

const handleSave = async () => {
  if (!formData.fullName.trim())
    return toast.warning("Họ tên không được để trống");

  if (formData.phone && !/^\d+$/.test(formData.phone)) {
    return toast.warning("SĐT phải là số");
  }

  if (!formData.departmentId || !formData.positionId) {
    return toast.warning("Chọn phòng ban + chức vụ");
  }

  setSubmitting(true);

  // ✅ BODY CHUẨN
  const body: any = {
    id: editingStaff ? Number(editingStaff.id) : 0,
    fullName: formData.fullName,
    phone: formData.phone || "",
    email: formData.email || "",
    hireDate: new Date(formData.startDate).toISOString(),
    status: Number(formData.status),
    departmentId: Number(formData.departmentId),
    roleId: Number(formData.positionId),
  };

  // ✅ CHỈ gửi khi UPDATE
  if (editingStaff) {
    body.staffCode = editingStaff.staffId;
  }

  try {
    const method = editingStaff ? "PUT" : "POST";
    const url = editingStaff
      ? `/api/Staff/${editingStaff.id}`
      : `/api/Staff`;

    await apiRequest(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    toast.success(editingStaff ? "Cập nhật Thành công" : "Thêm Thành công");
    setDialogOpen(false);
    fetchAll();
  } catch (err) {
    console.error(err);
    toast.error("API lỗi — check lại dữ liệu");
  } finally {
    setSubmitting(false);
  }
};

  const resetFilters = () => {
    setKeyword("");
    setFilterDept("all");
    setFilterStatus("all");
    fetchAll();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Quản lý Nhân sự</h2>
          <p className="text-muted-foreground">Quản lý hồ sơ, phòng ban và trạng thái làm việc.</p>
        </div>
        <Button onClick={() => { 
            setEditingStaff(null); 
            setFormData({
                fullName: "", phone: "", email: "", startDate: new Date().toISOString().split("T")[0],
                positionId: "", departmentId: "", status: "1"
            }); 
            setDialogOpen(true); 
        }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Thêm nhân viên
        </Button>
      </div>

      {/* FILTER AREA */}
      <Card className="border-none shadow-sm bg-slate-50/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tên, mã, email..."
                className="pl-9 bg-white"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAll()}
              />
            </div>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="1">Đang hoạt động</SelectItem>
                <SelectItem value="0">Nghỉ việc</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
                <Button variant="default" className="flex-1" onClick={fetchAll}>
                    <Filter className="mr-2 h-4 w-4" /> Lọc
                </Button>
                <Button variant="outline" size="icon" onClick={resetFilters}>
                    <RefreshCcw className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DATA TABLE */}
      <Card className="shadow-sm overflow-hidden border-none">
        <Table>
          <TableHeader className="bg-slate-100">
            <TableRow>
              <TableHead className="font-bold">Mã NV</TableHead>
              <TableHead className="font-bold">Nhân viên</TableHead>
              <TableHead className="font-bold">Phòng ban & Chức vụ</TableHead>
              <TableHead className="font-bold">SĐT</TableHead>
              <TableHead className="font-bold">Ngày vào</TableHead>
              <TableHead className="font-bold">Trạng thái</TableHead>
              <TableHead className="text-right font-bold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  </TableCell>
                </TableRow>
            ) : staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">
                    Không tìm thấy dữ liệu.
                  </TableCell>
                </TableRow>
            ) : (
              staff.map((s) => (
                <TableRow key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="font-bold text-blue-600">{s.staffId}</TableCell>
                  <TableCell>
                    <div className="font-semibold">{s.fullName}</div>
                    <div className="text-xs text-slate-500">{s.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{s.department}</div>
                    <div className="text-xs text-blue-500 font-medium uppercase">{s.position}</div>
                  </TableCell>
                  <TableCell className="text-sm">{s.phone}</TableCell>
                  <TableCell className="text-sm">{new Date(s.startDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === 1 ? "default" : "secondary"} className={s.status === 1 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-600"}>
                      {s.status === 1 ? "Hoạt động" : "Nghỉ việc"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(s)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(s.id)}>
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

      {/* DIALOG ADD/EDIT */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              {editingStaff ? "Cập nhật thông tin" : "Tiếp nhận nhân sự mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label>Mã NV (Hệ thống tự cấp)</Label>
              <Input 
                value={editingStaff ? editingStaff.staffId : "Sẽ tự động sinh mã..."} 
                disabled 
                className="bg-slate-50 italic"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Họ và tên <span className="text-red-500">*</span></Label>
              <Input 
                value={formData.fullName} 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="VD: Nguyễn Văn A" 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Số điện thoại *</Label>
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="0987xxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label>Email công vụ *</Label>
              <Input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="example@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Phòng ban *</Label>
              <Select value={formData.departmentId} onValueChange={(v) => setFormData({...formData, departmentId: v})}>
                <SelectTrigger><SelectValue placeholder="Chọn phòng ban" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Chức vụ *</Label>
              <Select value={formData.positionId} onValueChange={(v) => setFormData({...formData, positionId: v})}>
                <SelectTrigger><SelectValue placeholder="Chọn chức vụ" /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ngày vào làm</Label>
              <Input 
                type="date" 
                value={formData.startDate} 
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Đang làm việc</SelectItem>
                  <SelectItem value="0">Đã nghỉ việc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Hủy bỏ</Button>
            <Button onClick={handleSave} disabled={submitting} className="min-w-[120px] bg-blue-600">
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingStaff ? "Lưu thay đổi" : "Thêm nhân viên"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
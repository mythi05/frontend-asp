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
import { Plus, Search, Edit, Trash2, FileDown, FileUp, FileText, AlertCircle, ArrowLeftRight, Home, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../../api";

const BASE_URL = "https://aspp.onrender.com";
interface Student {
  id: string;
  studentId: string;
  fullName: string;
  gender: string;
  phone: string;
  email: string;
  major: string;
  roomId: number | null;
  room: string;
  status: string;
}

export function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    studentId: "",
    fullName: "",
    gender: "Nam",
    phone: "",
    email: "",
    major: "",
    status: "inactive",
    roomId: "",
  });

  useEffect(() => {
    fetchStudents();
    fetchAvailableRooms();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await apiRequest<any[]>("/api/Student");
      const mapped = data.map((s) => ({
        id: s.id.toString(),
        studentId: s.studentCode,
        fullName: s.fullName,
        gender: s.gender,
        phone: s.phoneNumber || "",
        email: s.email || "",
        major: s.major || "",
        roomId: s.roomId,
        room: s.room?.roomName || "Chưa có",
        status: s.status,
      }));
      setStudents(mapped);
    } catch (error) {
      toast.error("Không thể tải danh sách sinh viên");
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const data = await apiRequest<any[]>("/api/Room/available-rooms");
      setAvailableRooms(data);
    } catch (error) {
      console.error("Lỗi tải phòng:", error);
    }
  };

  const downloadFile = async (endpoint: string, fileName: string) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, { method: "GET" });
      if (!response.ok) throw new Error("Lỗi tải file");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success(`Đã tải xuống ${fileName}`);
    } catch (error: any) {
      toast.error(`Thất bại: ${error.message}`);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    const loadingToast = toast.loading("Đang xử lý dữ liệu import...");

    try {
      const response = await fetch(`${BASE_URL}/api/Student/import`, {
        method: "POST",
        body: fd
      });
      const result = await response.json();

      if (response.ok) {
        toast.success(result.summary, { duration: 5000 });
        fetchStudents();
      } else {
        toast.error(result.message || "File không hợp lệ");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      toast.dismiss(loadingToast);
      e.target.value = "";
    }
  };

  const handleAdd = () => {
    setEditingStudent(null);
    setFormData({
      studentId: "", fullName: "", gender: "Nam", phone: "",
      email: "", major: "", status: "inactive", roomId: ""
    });
    fetchAvailableRooms();
    setDialogOpen(true);
  };

  const handleEdit = (s: Student) => {
    setEditingStudent(s);
    setFormData({
      studentId: s.studentId,
      fullName: s.fullName,
      gender: s.gender,
      phone: s.phone,
      email: s.email,
      major: s.major,
      status: s.status,
      roomId: s.roomId ? s.roomId.toString() : "",
    });
    fetchAvailableRooms();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.studentId.trim() || !formData.fullName.trim()) {
      return toast.error("Vui lòng nhập MSSV và Họ tên");
    }

    const body = {
      id: editingStudent ? Number(editingStudent.id) : 0,
      studentCode: formData.studentId.trim(),
      fullName: formData.fullName.trim(),
      gender: formData.gender,
      phoneNumber: formData.phone || null,
      email: formData.email || null,
      major: formData.major || "N/A",
      status: formData.status,
      roomId: formData.roomId && formData.roomId !== "0" ? Number(formData.roomId) : null
    };

    const method = editingStudent ? "PUT" : "POST";
    const url = editingStudent ? `/api/Student/${editingStudent.id}` : `/api/Student`;

    try {
      await apiRequest(url, { method, body: JSON.stringify(body) });
      toast.success(editingStudent ? "Cập nhật thành công" : "Đã tiếp nhận hồ sơ sinh viên");
      setDialogOpen(false);
      fetchStudents();
      fetchAvailableRooms();
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu dữ liệu");
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý sinh viên</h2>
          <p className="text-sm text-gray-500">Tiếp nhận hồ sơ và quản lý thông tin cư trú</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <input type="file" accept=".xlsx, .xls" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImportExcel} />
            <Button variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
              <FileUp className="mr-2 h-4 w-4" /> Import Excel
            </Button>
          </div>
          <Button variant="outline" onClick={() => downloadFile("/api/Student/export", "students.xlsx")}>
            <FileDown className="mr-2 h-4 w-4" /> Export Excel
          </Button>
          <Button variant="outline" onClick={() => downloadFile("/api/Student/export-pdf", "students.pdf")}>
            <FileText className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Tiếp nhận mới
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Tìm kiếm theo tên hoặc mã sinh viên..." 
          className="pl-10" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      {/* Table */}
      <Card className="shadow-sm border-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>MSSV</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Phòng hiện tại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {filteredStudents.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono font-semibold text-indigo-600">{s.studentId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{s.fullName}</span>
                      <span className="text-[10px] uppercase text-gray-400">{s.major}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{s.phone || "---"}</TableCell>
                  <TableCell>
                    <Badge variant={s.roomId ? "secondary" : "outline"} className="flex w-fit items-center gap-1">
                      <Home className="h-3 w-3" /> {s.room}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {s.status === "active" ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-none hover:bg-emerald-100">
                        <UserCheck size={12} className="mr-1" /> Đang ở
                      </Badge>
                    ) : s.roomId ? (
                      <Badge className="bg-amber-100 text-amber-700 border-none hover:bg-amber-100">
                        <AlertCircle size={12} className="mr-1" /> Chờ nhận phòng
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-400">
                        Chưa xếp phòng
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {s.status === "active" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Chuyển phòng"
                          onClick={() => toast.info("Tính năng Chuyển phòng đang được cập nhật. Vui lòng sử dụng mục Điều phối.")}
                        >
                          <ArrowLeftRight className="h-4 w-4 text-amber-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={async () => {
                        if (confirm("Bạn có chắc chắn muốn xóa sinh viên này khỏi hệ thống?")) {
                          try {
                            await apiRequest(`/api/Student/${s.id}`, { method: "DELETE" });
                            toast.success("Đã xóa sinh viên");
                            fetchStudents();
                          } catch (e: any) {
                            toast.error(e.message);
                          }
                        }
                      }}>
                        <Trash2 className="h-4 w-4 text-red-500" />
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
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingStudent ? "Cập nhật hồ sơ" : "Tiếp nhận hồ sơ mới"}</DialogTitle>
          </DialogHeader>

          {!editingStudent && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-[11px]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>Lưu ý: Bạn có thể xếp phòng ngay tại đây để tạo hợp đồng chờ nhận phòng.</p>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>MSSV</Label>
                <Input value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} placeholder="VD: 2212345" />
              </div>
              <div className="space-y-2">
                <Label>Giới tính</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nam">Nam</SelectItem>
                    <SelectItem value="Nữ">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-indigo-600 font-semibold">Xếp vào phòng (Tùy chọn)</Label>
              <Select value={formData.roomId} onValueChange={(v) => setFormData({ ...formData, roomId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Chọn phòng còn chỗ trống --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">--- Để sau ---</SelectItem>
                  {availableRooms.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.roomName} (Trống: {r.maxCapacity - (r.currentOccupancy || 0)} chỗ)
                    </SelectItem>
                  ))}
                  {editingStudent?.roomId && !availableRooms.find(r => r.id === editingStudent.roomId) && (
                    <SelectItem value={editingStudent.roomId.toString()}>
                      {editingStudent.room} (Phòng hiện tại)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ngành học</Label>
                <Input value={formData.major} onChange={(e) => setFormData({ ...formData, major: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {editingStudent ? "Lưu thay đổi" : "Tiếp nhận hồ sơ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
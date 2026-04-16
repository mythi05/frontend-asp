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
import { Plus, Search, Edit, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../../api";

// ================= INTERFACE =================
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

interface Room {
  id: number;
  roomName: string;
  maxCapacity: number;
  currentOccupancy: number;
}

export function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    studentId: "",
    fullName: "",
    gender: "",
    phone: "",
    email: "",
    major: "",
    roomId: "",
    status: "active",
  });

  // ================= LOAD =================
  useEffect(() => {
    fetchStudents();
    fetchRooms();
  }, []);

  const fetchStudents = async () => {
    const data = await apiRequest<any[]>("/api/Student");

    const mapped = data.map((s) => ({
      id: s.id.toString(),
      studentId: s.studentCode,
      fullName: s.fullName,
      gender: s.gender,
      phone: s.phoneNumber,
      email: s.email,
      major: s.major,
      roomId: s.roomId,
      room: s.room?.roomName || "Chưa có",
      status: s.status,
    }));

    setStudents(mapped);
  };

  const fetchRooms = async () => {
    const data = await apiRequest<any[]>("/api/Room");

    const mapped = data.map((r) => ({
      id: r.id,
      roomName: r.roomName,
      maxCapacity: r.maxCapacity,
      currentOccupancy: r.currentOccupancy,
    }));

    setRooms(mapped);
  };

  // ================= CRUD =================
  const handleAdd = () => {
    setEditingStudent(null);
    setFormData({
      studentId: "",
      fullName: "",
      gender: "",
      phone: "",
      email: "",
      major: "",
      roomId: "",
      status: "active",
    });
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
      roomId: s.roomId?.toString() || "",
      status: s.status,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await apiRequest(`/api/Student/${id}`, { method: "DELETE" });
    toast.success("Đã xóa");
    fetchStudents();
    fetchRooms();
  };

  const handleSave = async () => {
    const body = {
      id: editingStudent ? Number(editingStudent.id) : 0,
      studentCode: formData.studentId,
      fullName: formData.fullName,
      gender: formData.gender,
      phoneNumber: formData.phone,
      email: formData.email,
      major: formData.major,
      status: formData.status,
      roomId:
        formData.status === "inactive"
          ? null
          : formData.roomId
          ? Number(formData.roomId)
          : null,
    };

    if (editingStudent) {
      await apiRequest(`/api/Student/${editingStudent.id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      toast.success("Cập nhật thành công");
    } else {
      await apiRequest(`/api/Student`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      toast.success("Thêm thành công");
    }

    setDialogOpen(false);
    fetchStudents();
    fetchRooms();
  };

  // ================= FILTER =================
  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableRooms = rooms.filter(
    (r) => r.currentOccupancy < r.maxCapacity
  );

  // ================= UI =================
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Quản lý sinh viên</h2>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm sinh viên
        </Button>
      </div>

      <Input
        placeholder="Tìm kiếm..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MSSV</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredStudents.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.studentId}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {s.fullName}
                    </div>
                  </TableCell>

                  <TableCell>{s.phone}</TableCell>

                  <TableCell>
                    <Badge>{s.room}</Badge>
                  </TableCell>

                  <TableCell>
                    {s.status === "active" ? (
                      <Badge className="bg-green-100 text-green-800">
                        🟢 Đang ở
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-200">
                        ⚪ Đã rời
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <Button onClick={() => handleEdit(s)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDelete(s.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* FORM */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Cập nhật sinh viên" : "Thêm sinh viên"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <Label>MSSV</Label>
              <Input
                value={formData.studentId}
                onChange={(e) =>
                  setFormData({ ...formData, studentId: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Họ tên</Label>
              <Input
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>

            <div>
              <Label>SĐT</Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Ngành</Label>
              <Input
                value={formData.major}
                onChange={(e) =>
                  setFormData({ ...formData, major: e.target.value })
                }
              />
            </div>

            {/* 🔥 STATUS */}
            <div>
              <Label>Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang ở</SelectItem>
                  <SelectItem value="inactive">Đã rời</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 🔥 ROOM */}
            <div>
              <Label>Chọn phòng</Label>
              <Select
                disabled={formData.status === "inactive"}
                value={formData.roomId}
                onValueChange={(value) =>
                  setFormData({ ...formData, roomId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng" />
                </SelectTrigger>

                <SelectContent>
                  {availableRooms.map((r) => {
                    const empty = r.maxCapacity - r.currentOccupancy;
                    return (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.roomName} (còn {empty} chỗ)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave}>
              {editingStudent ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
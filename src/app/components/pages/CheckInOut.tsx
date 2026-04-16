import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
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
import { Plus, LogIn, LogOut, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";

interface CheckInOutRecord {
  id: string;
  studentId: string;
  studentName: string;
  room: string;
  type: "check-in" | "check-out";
  date: string;
  notes: string;
  createdBy: string;
}

const initialRecords: CheckInOutRecord[] = [
  { id: "1", studentId: "SV001", studentName: "Nguyễn Văn A", room: "A101", type: "check-in", date: "2024-09-01", notes: "Đã kiểm tra đầy đủ đồ dùng", createdBy: "Admin" },
  { id: "2", studentId: "SV002", studentName: "Trần Thị B", room: "B201", type: "check-in", date: "2024-09-01", notes: "", createdBy: "Admin" },
  { id: "3", studentId: "SV003", studentName: "Lê Văn C", room: "A102", type: "check-out", date: "2024-12-15", notes: "Phòng sạch sẽ, không hư hỏng", createdBy: "Admin" },
  { id: "4", studentId: "SV004", studentName: "Phạm Thị D", room: "C301", type: "check-in", date: "2024-09-10", notes: "", createdBy: "Admin" },
];

export function CheckInOut() {
  const [records, setRecords] = useState<CheckInOutRecord[]>(initialRecords);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recordType, setRecordType] = useState<"check-in" | "check-out">("check-in");
  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    room: "",
    date: new Date().toISOString().split('T')[0],
    notes: "",
  });

  const checkInRecords = records.filter((r) => r.type === "check-in");
  const checkOutRecords = records.filter((r) => r.type === "check-out");

  const handleOpenDialog = (type: "check-in" | "check-out") => {
    setRecordType(type);
    setFormData({
      studentId: "",
      studentName: "",
      room: "",
      date: new Date().toISOString().split('T')[0],
      notes: "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.studentId || !formData.studentName || !formData.room || !formData.date) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const newRecord: CheckInOutRecord = {
      id: Date.now().toString(),
      ...formData,
      type: recordType,
      createdBy: "Admin",
    };

    setRecords([newRecord, ...records]);
    toast.success(
      recordType === "check-in" 
        ? "Đã ghi nhận check-in thành công" 
        : "Đã ghi nhận check-out thành công"
    );
    setDialogOpen(false);
  };

  const RecordsTable = ({ data }: { data: CheckInOutRecord[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>MSSV</TableHead>
          <TableHead>Họ và tên</TableHead>
          <TableHead>Phòng</TableHead>
          <TableHead>Ngày</TableHead>
          <TableHead>Ghi chú</TableHead>
          <TableHead>Người xử lý</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((record) => (
          <TableRow key={record.id}>
            <TableCell className="font-medium">{record.studentId}</TableCell>
            <TableCell>{record.studentName}</TableCell>
            <TableCell>
              <Badge variant="outline">{record.room}</Badge>
            </TableCell>
            <TableCell>{new Date(record.date).toLocaleDateString('vi-VN')}</TableCell>
            <TableCell className="max-w-xs truncate">{record.notes || "-"}</TableCell>
            <TableCell>{record.createdBy}</TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-gray-500 py-8">
              Chưa có dữ liệu
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Quản lý nhận/trả phòng</h2>
        <p className="text-gray-500 mt-1">Theo dõi quá trình check-in và check-out của sinh viên</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Check-in hôm nay</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">0</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <LogIn className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Check-out hôm nay</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">0</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <LogOut className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng giao dịch</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{records.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button onClick={() => handleOpenDialog("check-in")} className="bg-green-600 hover:bg-green-700">
          <LogIn className="h-4 w-4 mr-2" />
          Check-in mới
        </Button>
        <Button onClick={() => handleOpenDialog("check-out")} variant="destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Check-out
        </Button>
      </div>

      {/* Records Tabs */}
      <Tabs defaultValue="check-in" className="space-y-4">
        <TabsList>
          <TabsTrigger value="check-in" className="gap-2">
            <LogIn className="h-4 w-4" />
            Lịch sử check-in ({checkInRecords.length})
          </TabsTrigger>
          <TabsTrigger value="check-out" className="gap-2">
            <LogOut className="h-4 w-4" />
            Lịch sử check-out ({checkOutRecords.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="check-in">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách check-in</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <RecordsTable data={checkInRecords} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="check-out">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách check-out</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <RecordsTable data={checkOutRecords} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {recordType === "check-in" ? "Ghi nhận check-in" : "Ghi nhận check-out"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="date">Ngày {recordType === "check-in" ? "nhận" : "trả"} phòng *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={
                  recordType === "check-in"
                    ? "VD: Đã kiểm tra đầy đủ đồ dùng, phòng sạch sẽ..."
                    : "VD: Phòng sạch sẽ, không hư hỏng..."
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

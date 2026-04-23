import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { 
  Search, Plus, AlertOctagon, Loader2, Trash2, 
  RefreshCcw, UserCircle, MapPin, Calendar, ClipboardCheck,
  AlertTriangle, Hammer, ShieldAlert, CheckCircle2, Edit3, Settings2
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../../api";

const LEVEL_MAP: any = {
  1: { label: "Nhẹ", color: "bg-blue-50 text-blue-600 border-blue-100" },
  2: { label: "Trung bình", color: "bg-amber-50 text-amber-600 border-amber-100" },
  3: { label: "Nghiêm trọng", color: "bg-orange-50 text-orange-600 border-orange-100" },
  4: { label: "Rất nghiêm trọng", color: "bg-red-50 text-red-600 border-red-100" }
};

const STATUS_MAP: any = {
  1: { label: "Đang chờ", color: "bg-slate-100 text-slate-600" },
  2: { label: "Đã xử lý", color: "bg-emerald-100 text-emerald-700" }
};

export function ViolationsManagement() {
  const [violations, setViolations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    room: "",
    violationType: "",
    violationDate: new Date().toISOString().split('T')[0],
    level: 1,
    fine: 0,
    status: 1
  });

  useEffect(() => { fetchViolations(); }, [searchTerm]);

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<any[]>("/api/Violation");
      // Filter tại FE nếu search API chưa hỗ trợ searchString
      const filtered = data.filter(v => 
        v.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        v.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setViolations(filtered);
    } catch (err) { toast.error("Lỗi tải dữ liệu"); }
    finally { setLoading(false); }
  };

  const handleStudentIdChange = async (code: string) => {
    setFormData(prev => ({ ...prev, studentId: code }));
    if (code.length >= 5) {
      setIsValidating(true);
      try {
        const student = await apiRequest<any>(`/api/Student/by-code/${code}`);
        if (student) {
          setFormData(prev => ({ ...prev, studentName: student.fullName, room: student.room?.roomName || "N/A" }));
        }
      } catch (err) { setFormData(prev => ({ ...prev, studentName: "", room: "" })); }
      finally { setIsValidating(false); }
    }
  };

  // Mở Dialog để sửa
  const handleEdit = (v: any) => {
    setEditingId(v.id);
    setFormData({
      studentId: v.studentId,
      studentName: v.studentName,
      room: v.room,
      violationType: v.violationType,
      violationDate: v.violationDate.split('T')[0],
      level: v.level,
      fine: v.fine,
      status: v.status
    });
    setDialogOpen(true);
  };

  // Xử lý nhanh trạng thái (PUT)
  const handleQuickProcess = async (v: any) => {
    try {
      const payload = { ...v, status: 2 }; // Chuyển sang Processed
      await apiRequest(`/api/Violation/${v.id}`, { method: "PUT", body: JSON.stringify(payload) });
      toast.success("Đã cập nhật trạng thái: Đã xử lý");
      fetchViolations();
    } catch (err) { toast.error("Không thể cập nhật trạng thái"); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        level: Number(formData.level),
        fine: Number(formData.fine),
        status: Number(formData.status),
        violationDate: new Date(formData.violationDate).toISOString()
      };

      if (editingId) {
        // CẬP NHẬT (PUT)
        await apiRequest(`/api/Violation/${editingId}`, { 
          method: "PUT", 
          body: JSON.stringify({ ...payload, id: editingId }) 
        });
        toast.success("Cập nhật thành công!");
      } else {
        // TẠO MỚI (POST)
        await apiRequest("/api/Violation", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Đã thêm biên bản mới!");
      }

      setDialogOpen(false);
      setEditingId(null);
      fetchViolations();
      resetForm();
    } catch (err: any) { toast.error("Lỗi dữ liệu. Vui lòng kiểm tra lại."); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setFormData({
      studentId: "", studentName: "", room: "", violationType: "",
      violationDate: new Date().toISOString().split('T')[0],
      level: 1, fine: 0, status: 1
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-lg text-white"><ShieldAlert size={24} /></div>
          Kỷ luật & Vi phạm
        </h2>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-red-600">
          <Plus className="mr-2" size={18} /> Lập biên bản mới
        </Button>
      </div>

      <Card className="border-none shadow-xl rounded-2xl bg-white overflow-hidden">
        <div className="p-5 border-b flex gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input className="pl-10 rounded-xl" placeholder="Tìm MSSV hoặc tên..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Button variant="outline" onClick={fetchViolations} className="rounded-xl"><RefreshCcw size={18}/></Button>
        </div>

        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="pl-6">SINH VIÊN</TableHead>
              <TableHead>VI PHẠM</TableHead>
              <TableHead className="text-center">MỨC ĐỘ</TableHead>
              <TableHead className="text-center">TRẠNG THÁI</TableHead>
              <TableHead className="text-right pr-6">THAO TÁC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {violations.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="pl-6 font-medium">
                    {v.studentName} <br/> <span className="text-xs text-slate-400">{v.studentId}</span>
                </TableCell>
                <TableCell className="max-w-xs truncate">{v.violationType}</TableCell>
                <TableCell className="text-center">
                    <Badge className={LEVEL_MAP[v.level]?.color}>{LEVEL_MAP[v.level]?.label}</Badge>
                </TableCell>
                <TableCell className="text-center">
                    <Badge className={STATUS_MAP[v.status]?.color}>{STATUS_MAP[v.status]?.label}</Badge>
                </TableCell>
                <TableCell className="text-right pr-6 space-x-2">
                  {v.status === 1 && (
                    <Button variant="outline" size="sm" onClick={() => handleQuickProcess(v)} className="text-emerald-600 border-emerald-200">
                        <CheckCircle2 size={14} className="mr-1"/> Xử lý
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(v)} className="text-blue-500"><Edit3 size={16}/></Button>
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if(!open) setEditingId(null); }}>
        <DialogContent className="max-w-3xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-slate-900 text-white">
            <DialogTitle className="flex items-center gap-3">
              {editingId ? <Settings2 /> : <AlertOctagon />}
              {editingId ? "Cập nhật biên bản vi phạm" : "Lập biên bản vi phạm mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label>Mã số sinh viên</Label>
              <Input value={formData.studentId} onChange={e => handleStudentIdChange(e.target.value)} disabled={!!editingId} />
              
              <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-sm">
                <p><b>Họ tên:</b> {formData.studentName || "---"}</p>
                <p><b>Phòng:</b> {formData.room || "---"}</p>
              </div>

              <Label>Trạng thái xử lý</Label>
              <select className="w-full h-11 border rounded-xl px-3" value={formData.status} onChange={e => setFormData({...formData, status: parseInt(e.target.value)})}>
                <option value={1}>Đang chờ (Pending)</option>
                <option value={2}>Đã xử lý (Processed)</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mức độ</Label>
                  <select className="w-full h-10 border rounded-lg px-2" value={formData.level} onChange={e => setFormData({...formData, level: parseInt(e.target.value)})}>
                    <option value={1}>Nhẹ</option>
                    <option value={2}>Trung bình</option>
                    <option value={3}>Nghiêm trọng</option>
                    <option value={4}>Rất nghiêm trọng</option>
                  </select>
                </div>
                <div>
                  <Label>Tiền phạt</Label>
                  <Input type="number" value={formData.fine} onChange={e => setFormData({...formData, fine: parseInt(e.target.value)})} />
                </div>
              </div>

              <Label>Ngày vi phạm</Label>
              <Input type="date" value={formData.violationDate} onChange={e => setFormData({...formData, violationDate: e.target.value})} />

              <Label>Nội dung chi tiết</Label>
              <textarea className="w-full h-24 border rounded-xl p-3 text-sm" value={formData.violationType} onChange={e => setFormData({...formData, violationType: e.target.value})} />
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-red-600 px-8">
              {loading ? <Loader2 className="animate-spin" /> : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
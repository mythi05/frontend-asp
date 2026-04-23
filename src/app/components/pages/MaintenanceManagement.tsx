import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Search, Plus, Wrench, Loader2, Trash2, CheckCircle2, 
  Clock, AlertCircle, RefreshCcw, Construction, 
  Settings2, ClipboardCheck, User, Tag
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../../api";

// Mapping Enum từ Backend
const MaintenanceLevel = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const MaintenanceStatus = { Pending: 1, Processing: 2, Completed: 3 };

export function MaintenanceManagement() {
  const [requests, setRequests] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    Room: "",
    Reporter: "",
    Category: "Điện nước",
    Description: "",
    Level: MaintenanceLevel.Medium,
  });

  useEffect(() => {
    fetchRequests();
    fetchDashboard();
  }, [searchTerm]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<any[]>(`/api/MaintenanceApi${searchTerm ? `?searchString=${searchTerm}` : ""}`);
      setRequests(data);
    } catch (err) { toast.error("Lỗi tải danh sách bảo trì"); }
    finally { setLoading(false); }
  };

  const fetchDashboard = async () => {
    try {
      const data = await apiRequest<any>("/api/MaintenanceApi/dashboard");
      setDashboard(data);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (!formData.Room || !formData.Reporter || !formData.Description) {
      return toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        Level: Number(formData.Level),
        ReportDate: new Date().toISOString(),
        Status: MaintenanceStatus.Pending
      };

      await apiRequest("/api/MaintenanceApi", { 
        method: "POST", 
        body: JSON.stringify(payload) 
      });

      toast.success("Đã gửi yêu cầu thành công!");
      setDialogOpen(false);
      setFormData({ Room: "", Reporter: "", Category: "Điện nước", Description: "", Level: MaintenanceLevel.Medium });
      fetchRequests();
      fetchDashboard();
    } catch (err: any) { toast.error(err.message || "Lỗi gửi dữ liệu"); }
    finally { setLoading(false); }
  };

  const handleUpdateStatus = async (id: number, newStatus: number) => {
    try {
      await apiRequest(`/api/MaintenanceApi/${id}/status`, { 
        method: "PUT", 
        body: JSON.stringify(newStatus) // Gửi trực tiếp số enum
      });
      toast.success("Cập nhật trạng thái thành công");
      fetchRequests();
      fetchDashboard();
    } catch (err) { toast.error("Lỗi cập nhật"); }
  };

  const getStatusBadge = (status: number) => {
    if (status === MaintenanceStatus.Pending) return <Badge className="bg-amber-100 text-amber-700 border-amber-200 uppercase text-[10px]">Chờ xử lý</Badge>;
    if (status === MaintenanceStatus.Processing) return <Badge className="bg-blue-100 text-blue-700 border-blue-200 uppercase text-[10px] animate-pulse">Đang sửa</Badge>;
    if (status === MaintenanceStatus.Completed) return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 uppercase text-[10px]">Hoàn thành</Badge>;
    return <Badge>N/A</Badge>;
  };

  const getLevelLabel = (level: number) => {
    const labels: any = { 1: "Thấp", 2: "Trung bình", 3: "Cao", 4: "Khẩn cấp" };
    const colors: any = { 1: "text-slate-500", 2: "text-blue-500", 3: "text-orange-500", 4: "text-red-600 font-bold" };
    return <span className={`text-[11px] ${colors[level]}`}>{labels[level]}</span>;
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-lg text-white"><Wrench size={24} /></div>
            Hệ thống Bảo trì & Sửa chữa
          </h2>
          <p className="text-slate-500 text-sm mt-1 ml-11">Tiếp nhận và xử lý sự cố cơ sở vật chất</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700 h-11 px-6 rounded-xl shadow-md">
          <Plus className="mr-2 h-5 w-5" /> Báo hỏng mới
        </Button>
      </div>

      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Yêu cầu chờ" value={dashboard?.pendingCount} icon={Clock} color="amber" />
        <StatCard label="Đang thực hiện" value={dashboard?.processingCount} icon={Construction} color="indigo" />
        <StatCard label="Đã hoàn tất" value={dashboard?.completedCount} icon={ClipboardCheck} color="emerald" />
      </div>

      {/* Table */}
      <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white">
        <div className="p-5 border-b flex justify-between items-center bg-white">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input className="pl-10 bg-slate-50 rounded-xl" placeholder="Tìm theo phòng, nội dung..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Button variant="outline" onClick={fetchRequests} className="rounded-xl">
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </Button>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="pl-6 font-bold">PHÒNG</TableHead>
              <TableHead className="font-bold">MÔ TẢ SỰ CỐ</TableHead>
              <TableHead className="font-bold text-center">NGƯỜI BÁO</TableHead>
              <TableHead className="font-bold text-center">MỨC ĐỘ</TableHead>
              <TableHead className="font-bold text-center">TRẠNG THÁI</TableHead>
              <TableHead className="text-right pr-6 font-bold">THAO TÁC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="pl-6 font-bold text-indigo-600">{r.room}</TableCell>
                <TableCell>
                  <div className="font-medium">{r.description}</div>
                  <div className="text-[10px] text-slate-400 uppercase">{r.category}</div>
                </TableCell>
                <TableCell className="text-center text-sm">{r.reporter}</TableCell>
                <TableCell className="text-center">{getLevelLabel(r.level)}</TableCell>
                <TableCell className="text-center">{getStatusBadge(r.status)}</TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2">
                    {r.status === MaintenanceStatus.Pending && (
                      <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200" onClick={() => handleUpdateStatus(r.id, MaintenanceStatus.Processing)}>Duyệt</Button>
                    )}
                    {r.status === MaintenanceStatus.Processing && (
                      <Button variant="outline" size="sm" className="h-8 text-emerald-600 border-emerald-200" onClick={() => handleUpdateStatus(r.id, MaintenanceStatus.Completed)}>Xong</Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600"><Trash2 size={16} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog Add */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-slate-900 text-white">
            <DialogTitle className="flex items-center gap-3"><Settings2 /> Gửi yêu cầu sửa chữa</DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Số phòng</Label>
                <Input placeholder="P.101" value={formData.Room} onChange={e => setFormData({...formData, Room: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Người báo hỏng</Label>
                <Input placeholder="Tên hoặc MSSV" value={formData.Reporter} onChange={e => setFormData({...formData, Reporter: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại hư hỏng</Label>
                <Select value={formData.Category} onValueChange={v => setFormData({...formData, Category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Điện nước">Điện nước</SelectItem>
                    <SelectItem value="Nội thất">Nội thất</SelectItem>
                    <SelectItem value="Internet">Internet</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mức độ ưu tiên</Label>
                <Select value={formData.Level.toString()} onValueChange={v => setFormData({...formData, Level: parseInt(v)})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Thấp</SelectItem>
                    <SelectItem value="2">Trung bình</SelectItem>
                    <SelectItem value="3">Cao</SelectItem>
                    <SelectItem value="4">Khẩn cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mô tả chi tiết</Label>
              <textarea 
                className="w-full min-h-[100px] p-3 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500/20"
                value={formData.Description}
                onChange={e => setFormData({...formData, Description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter className="p-6 bg-slate-50 border-t">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white px-8">
              {loading ? <Loader2 className="animate-spin" /> : "Gửi yêu cầu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colorMap: any = {
    indigo: "border-indigo-500 text-indigo-600 bg-indigo-50/30",
    amber: "border-amber-500 text-amber-600 bg-amber-50/30",
    emerald: "border-emerald-500 text-emerald-600 bg-emerald-50/30",
  };
  return (
    <Card className={`border-none shadow-sm border-l-4 ${colorMap[color]} rounded-2xl overflow-hidden`}>
      <CardContent className="p-6 flex justify-between items-center bg-white">
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-400 mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-800">{value || 0}</p>
        </div>
        <div className={`p-4 rounded-2xl ${colorMap[color]}`}><Icon size={24} /></div>
      </CardContent>
    </Card>
  );
}
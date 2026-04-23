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
import { 
  Plus, Search, Briefcase, 
  Loader2, DollarSign, UserCheck, RefreshCcw, UserSearch,
  Power
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../../api";

const services = [
  { name: "Internet", price: 150000 },
  { name: "Giặt ủi", price: 200000 },
  { name: "Đỗ xe", price: 100000 },
  { name: "Thể thao", price: 50000 },
  { name: "Điện nước", price: 0 }
];

export function ServicesManagement() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterService, setFilterService] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const [formData, setFormData] = useState({
    studentCode: "", 
    studentId: "",   
    studentName: "",
    room: "",
    serviceName: "",
    price: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
  });

  useEffect(() => {
    fetchData();
    fetchDashboard();
  }, [searchTerm, filterService]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterService !== "all") params.append("serviceName", filterService);
      const data = await apiRequest<any[]>(`/api/ServiceApi?${params.toString()}`);
      setRegistrations(data);
    } catch (error) {
      toast.error("Lỗi tải danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const data = await apiRequest<any>("/api/ServiceApi/dashboard");
      setStats(data);
    } catch (err) { console.error(err); }
  };

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await apiRequest(`/api/ServiceApi/${id}/status`, {
        method: "PUT",
        body: JSON.stringify(newStatus)
      });
      toast.success("Cập nhật trạng thái thành công");
      fetchData();
      fetchDashboard();
    } catch (error: any) {
      toast.error("Không thể đổi trạng thái");
    }
  };

  const handleValidateStudent = async () => {
    if (!formData.studentCode) return toast.error("Vui lòng nhập MSSV");
    setIsValidating(true);
    try {
      const student = await apiRequest<any>(`/api/Student/by-code/${formData.studentCode}`);
      if (student) {
        const start = new Date(formData.startDate);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 6);

        setFormData(prev => ({
          ...prev,
          studentId: String(student.id),
          studentName: student.fullName,
          room: student.room?.roomName || "Chưa xếp phòng",
          endDate: end.toISOString().split('T')[0]
        }));
        toast.success("Xác thực sinh viên thành công!");
      }
    } catch (err) { 
      setFormData(prev => ({ ...prev, studentId: "", studentName: "", room: "" }));
      toast.error("MSSV không tồn tại"); 
    } finally { setIsValidating(false); }
  };

  const handleSave = async () => {
    if (!formData.studentId) return toast.error("Vui lòng Xác thực sinh viên trước");
    if (!formData.serviceName) return toast.error("Vui lòng chọn loại dịch vụ");
    
    setLoading(true);
    try {
      const payload = {
        studentId: String(formData.studentId),
        studentName: String(formData.studentName),
        room: String(formData.room),
        serviceName: String(formData.serviceName),
        price: Number(formData.price),
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: 1
      };

      await apiRequest("/api/ServiceApi", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Đăng ký thành công!");
      setDialogOpen(false);
      setFormData({
        studentCode: "", studentId: "", studentName: "", room: "",
        serviceName: "", price: 0, startDate: new Date().toISOString().split('T')[0], endDate: ""
      });
      fetchData();
      fetchDashboard();
    } catch (error: any) {
      toast.error(error.message || "Lỗi dữ liệu (400)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white"><Briefcase size={24} /></div>
            Quản lý Dịch vụ & Tiện ích
          </h2>
          <p className="text-slate-500 text-sm mt-1">Đăng ký & Theo dõi dịch vụ sinh viên</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 rounded-xl shadow-md">
          <Plus className="mr-2 h-5 w-5" /> Đăng ký mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard label="Đang hoạt động" value={stats?.activeServices} icon={UserCheck} color="emerald" />
        <StatCard label="Doanh thu dự kiến" value={`${(stats?.totalRevenue || 0).toLocaleString()} VNĐ`} icon={DollarSign} color="indigo" />
      </div>

      {/* Table */}
      <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white">
        <div className="p-5 border-b flex flex-col md:flex-row gap-4 bg-white">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input className="pl-10 bg-slate-50 border-slate-200 rounded-xl" placeholder="Tìm kiếm sinh viên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select value={filterService} onValueChange={setFilterService}>
            <SelectTrigger className="w-[200px] rounded-xl">
              <SelectValue placeholder="Lọc dịch vụ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả dịch vụ</SelectItem>
              {services.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-bold pl-6">HỌ TÊN SINH VIÊN</TableHead>
                <TableHead className="font-bold text-center">PHÒNG</TableHead>
                <TableHead className="font-bold text-center">DỊCH VỤ</TableHead>
                <TableHead className="font-bold text-right">PHÍ/THÁNG</TableHead>
                <TableHead className="font-bold text-center">THỜI HẠN</TableHead>
                <TableHead className="font-bold text-center">TRẠNG THÁI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((reg) => (
                <TableRow key={reg.id} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6 py-4">
                    <span className="text-sm font-semibold text-slate-800">{reg.studentName}</span>
                  </TableCell>
                  <TableCell className="text-center"><Badge variant="outline" className="bg-slate-50">{reg.room}</Badge></TableCell>
                  <TableCell className="text-center font-bold text-slate-700">{reg.serviceName}</TableCell>
                  <TableCell className="text-right font-black">{reg.price.toLocaleString()}đ</TableCell>
                  <TableCell className="text-center text-[11px]">
                    {new Date(reg.startDate).toLocaleDateString('vi-VN')} <br/>
                    đến {new Date(reg.endDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-center">
                    <button 
                      onClick={() => handleToggleStatus(reg.id, reg.status)}
                      className="group relative flex items-center justify-center w-full focus:outline-none"
                    >
                      {reg.status === 1 ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 transition-colors cursor-pointer pr-2">
                          Đang hiệu lực <Power size={12} className="ml-1 opacity-50 group-hover:opacity-100" />
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer pr-2">
                          Hết hạn <Power size={12} className="ml-1 opacity-50 group-hover:opacity-100" />
                        </Badge>
                      )}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Dialog Đăng ký */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-slate-900 text-white">
            <DialogTitle className="flex items-center gap-3 text-white">
              <div className="p-2 bg-indigo-500 rounded-lg"><Plus size={20} /></div>
              Đăng ký dịch vụ mới
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700 uppercase">1. Xác thực sinh viên</Label>
                <div className="flex gap-2">
                  <Input placeholder="Nhập MSSV..." value={formData.studentCode} onChange={e => setFormData({...formData, studentCode: e.target.value})} className="h-11 rounded-xl" />
                  <Button onClick={handleValidateStudent} disabled={isValidating} className="h-11 bg-indigo-600 text-white rounded-xl">
                    {isValidating ? <Loader2 className="animate-spin" /> : <UserSearch size={18}/>}
                  </Button>
                </div>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Họ tên:</span><span className="font-bold">{formData.studentName || "---"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Phòng:</span><Badge className="bg-indigo-500">{formData.room || "---"}</Badge></div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700 uppercase">2. Chọn dịch vụ</Label>
                <Select onValueChange={(val) => {
                  const s = services.find(x => x.name === val);
                  setFormData({...formData, serviceName: val, price: s?.price || 0});
                }}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Loại dịch vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(s => <SelectItem key={s.name} value={s.name}>{s.name} ({s.price.toLocaleString()}đ)</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Ngày bắt đầu</Label>
                  <Input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="h-10 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Ngày kết thúc</Label>
                  <Input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="h-10 rounded-lg" />
                </div>
              </div>
              <div className="mt-4 p-5 bg-indigo-600 rounded-2xl text-white shadow-lg">
                <p className="text-[10px] font-bold opacity-70 mb-1">PHÍ THANH TOÁN / THÁNG</p>
                <span className="text-2xl font-black">{formData.price.toLocaleString()}đ</span>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-slate-50 p-6 border-t gap-3">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="rounded-xl h-11 px-6">Hủy</Button>
            <Button onClick={handleSave} disabled={loading || !formData.studentId} className="bg-slate-900 hover:bg-black text-white h-11 px-10 rounded-xl shadow-lg transition-all">
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Xác nhận đăng ký"}
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
    emerald: "border-emerald-500 text-emerald-700 bg-emerald-50/30",
  };
  return (
    <Card className={`border-none shadow-sm border-l-4 ${colorMap[color]} rounded-2xl overflow-hidden bg-white`}>
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <p className="text-[11px] font-bold uppercase text-slate-400 tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-800">{value || 0}</p>
        </div>
        <div className={`p-4 rounded-2xl ${colorMap[color]}`}><Icon size={24} /></div>
      </CardContent>
    </Card>
  );
}
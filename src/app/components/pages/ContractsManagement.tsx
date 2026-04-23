import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { 
  Search, Plus, FileSignature, Loader2, Trash2, ShieldCheck, 
  Calendar, AlertTriangle, RefreshCcw, Wallet, CheckCircle2, 
  Clock, DoorOpen, Ban, UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../../api";

export function ContractsManagement() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const [formData, setFormData] = useState({
    contractCode: "",
    studentCode: "",
    studentId: "",
    studentName: "",
    roomId: "",
    roomName: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "", 
    monthlyFee: 0,
    inventoryStatus: "Bàn giao: 01 giường, 01 tủ gỗ, 01 bàn học. Điện nước số đầu: 0",
  });

  useEffect(() => {
    if (dialogOpen) {
      setFormData(prev => ({
        ...prev,
        contractCode: `HD-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
        startDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, [dialogOpen]);

  useEffect(() => {
    fetchContracts();
    fetchDashboard();
  }, [searchTerm]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<any[]>(`/api/ContractApi${searchTerm ? `?searchString=${searchTerm}` : ""}`);
      setContracts(data);
    } catch (err) { toast.error("Lỗi tải dữ liệu hợp đồng"); }
    finally { setLoading(false); }
  };

  const fetchDashboard = async () => {
    try {
      const data = await apiRequest<any>("/api/ContractApi/dashboard");
      setDashboard(data);
    } catch (err) { console.error(err); }
  };

  const handleStartDateChange = (date: string) => {
    const start = new Date(date);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 6);
    setFormData({ ...formData, startDate: date, endDate: end.toISOString().split('T')[0] });
  };

  const handleValidateStudent = async () => {
    if (!formData.studentCode) return toast.error("Nhập MSSV để kiểm tra");
    setIsValidating(true);
    try {
      const student = await apiRequest<any>(`/api/Student/by-code/${formData.studentCode}`);
      if (student) {
        const start = new Date(formData.startDate);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 6);
        
        setFormData(prev => ({
          ...prev,
          studentId: student.id,
          studentName: student.fullName,
          roomId: student.roomId,
          roomName: student.room?.roomName || "Chưa xếp phòng",
          monthlyFee: student.room?.price || 0,
          endDate: end.toISOString().split('T')[0]
        }));
        toast.success("Xác thực thành công!");
      }
    } catch (err) { 
      toast.error("MSSV không tồn tại hoặc chưa được duyệt phòng"); 
    } finally { setIsValidating(false); }
  };

  const handleSave = async () => {
    if (!formData.studentId) return toast.error("Vui lòng Xác thực sinh viên trước");
    setLoading(true);
    try {
      const payload = {
        ...formData,
        deposit: 0,
        monthlyFee: Number(formData.monthlyFee),
        totalAmount: Number(formData.monthlyFee) * 6
      };
      await apiRequest("/api/ContractApi", { method: "POST", body: JSON.stringify(payload) });
      toast.success("Ký kết thành công!");
      setDialogOpen(false);
      fetchContracts();
      fetchDashboard();
    } catch (err: any) { toast.error(err.message || "Lỗi hệ thống"); }
    finally { setLoading(false); }
  };

  const handleRenew = async (contract: any) => {
    if (!confirm(`Gia hạn thêm 06 tháng cho hợp đồng ${contract.contractCode}?`)) return;
    setLoading(true);
    try {
      const currentEnd = new Date(contract.endDate);
      const newEnd = new Date(currentEnd);
      newEnd.setMonth(newEnd.getMonth() + 6);

      const payload = {
        ...contract,
        endDate: newEnd.toISOString().split('T')[0],
        note: (contract.note || "") + " | Gia hạn thêm 6 tháng."
      };

      await apiRequest(`/api/ContractApi/${contract.id}`, { 
        method: "PUT", 
        body: JSON.stringify(payload) 
      });
      toast.success("Gia hạn thành công!");
      fetchContracts();
    } catch (err: any) { toast.error("Lỗi gia hạn: " + err.message); }
    finally { setLoading(false); }
  };

  const handleTerminate = async (id: number) => {
    if (!confirm("Xác nhận thanh lý hợp đồng? Hệ thống sẽ giải phóng chỗ ở của sinh viên trên giấy tờ.")) return;
    setLoading(true);
    try {
      await apiRequest(`/api/ContractApi/terminate/${id}`, { method: "POST" });
      toast.success("Đã thanh lý hợp đồng");
      fetchContracts();
      fetchDashboard();
    } catch (err: any) { toast.error("Lỗi thanh lý: " + err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("CẢNH BÁO: Xóa hợp đồng sẽ xóa vĩnh viễn các dữ liệu liên quan. Bạn có chắc chắn?")) return;
    try {
      await apiRequest(`/api/ContractApi/${id}`, { method: 'DELETE' });
      toast.success("Đã xóa vĩnh viễn");
      fetchContracts();
      fetchDashboard();
    } catch (err) { toast.error("Lỗi khi xóa dữ liệu"); }
  };

  const getStatusBadge = (contract: any) => {
    const isExpired = new Date(contract.endDate) < new Date();
    if (contract.status === 0) return <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200">Đã thanh lý</Badge>;
    if (isExpired) return <Badge className="bg-red-50 text-red-600 border-red-200 animate-pulse">Quá hạn</Badge>;
    return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-medium">Đang hiệu lực</Badge>;
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white"><FileSignature size={24} /></div>
            Quản lý Hợp đồng & Phí Nội trú
          </h2>
          <p className="text-slate-500 text-sm mt-1 ml-11">Kiểm soát thời hạn • Đồng bộ Check-in/out thực tế</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 rounded-xl shadow-md transition-all">
          <Plus className="mr-2 h-5 w-5" /> Ký hợp đồng mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Hợp đồng hiệu lực" value={dashboard?.activeContracts} icon={ShieldCheck} color="indigo" />
        <StatCard label="Cần gia hạn" value={dashboard?.nearExpiry} icon={Clock} color="amber" />
        <StatCard label="Tổng tiền đặt cọc" value={`${(dashboard?.totalDeposit || 0).toLocaleString()}đ`} icon={Wallet} color="emerald" />
      </div>

      {/* Main Table */}
      <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white">
        <div className="p-5 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl" placeholder="MSSV, Tên sinh viên, Số hợp đồng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Button variant="outline" onClick={fetchContracts} className="text-slate-600 border-slate-200 hover:bg-slate-50 rounded-xl">
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Làm mới dữ liệu
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-bold py-4 pl-6 text-slate-600">MÃ HĐ</TableHead>
                <TableHead className="font-bold text-slate-600">SINH VIÊN & TRẠNG THÁI Ở</TableHead>
                <TableHead className="font-bold text-slate-600 text-center">THỜI HẠN</TableHead>
                <TableHead className="font-bold text-slate-600 text-right">TỔNG PHÍ (6T)</TableHead>
                <TableHead className="font-bold text-slate-600 text-center">TRẠNG THÁI HĐ</TableHead>
                <TableHead className="text-right pr-6 font-bold text-slate-600">THAO TÁC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.length === 0 && !loading && (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400">Không tìm thấy dữ liệu phù hợp.</TableCell></TableRow>
              )}
              {contracts.map((c) => {
                // LOGIC PHÂN LOẠI TRẠNG THÁI CƯ TRÚ (Dựa trên đồng bộ Backend)
                const isContractActive = c.status === 1;
                const studentStatus = c.student?.status; 
                
                // QUAN TRỌNG: Kiểm tra checkInDate từ Backend để biết đã từng "Vào phòng" chưa
                const hasCheckedIn = c.checkInDate !== null && c.checkInDate !== undefined;

                return (
                  <TableRow key={c.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                    <TableCell className="pl-6 font-mono font-bold text-indigo-600">{c.contractCode}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{c.student?.fullName || "N/A"}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] uppercase border-slate-200 text-slate-500 font-medium">
                            {c.room?.roomName || "Chưa rõ"}
                          </Badge>
                          
                          {isContractActive && (
                            <>
                              {/* 1. Đang ở thực tế: Có ngày Check-in VÀ Trạng thái SV là active */}
                              {hasCheckedIn && (studentStatus === "active" || studentStatus === "Đã xếp phòng") && (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-medium flex items-center gap-1">
                                  <UserCheck size={10}/> Đang ở thực tế
                                </Badge>
                              )}

                              {/* 2. Đã trả phòng thực tế: Có ngày Check-in NHƯNG Trạng thái SV đã về "Chưa xếp phòng" */}
                              {hasCheckedIn && studentStatus === "Chưa xếp phòng" && (
                                <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[10px] font-medium flex items-center gap-1">
                                  <DoorOpen size={10}/> Đã trả phòng thực tế
                                </Badge>
                              )}

                              {/* 3. Chờ nhận phòng: Chưa hề có ngày Check-in trong Hợp đồng */}
                              {!hasCheckedIn && (
                                <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-medium flex items-center gap-1">
                                  <Clock size={10}/> Chờ nhận phòng
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-[11px]">
                      <div className="font-semibold text-slate-700">{new Date(c.startDate).toLocaleDateString('vi-VN')}</div>
                      <div className="text-slate-400">đến {new Date(c.endDate).toLocaleDateString('vi-VN')}</div>
                    </TableCell>
                    <TableCell className="text-right font-black text-slate-800">
                      {(c.monthlyFee * 6).toLocaleString()}đ
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(c)}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        {c.status === 1 && (
                          <>
                            <Button 
                              variant="outline" size="sm" 
                              className="h-8 border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              onClick={() => handleRenew(c)}
                            >
                              <RefreshCcw size={14} className="mr-1" /> Gia hạn
                            </Button>
                            <Button 
                              variant="outline" size="sm" 
                              className="h-8 border-amber-200 text-amber-600 hover:bg-amber-50 rounded-lg"
                              onClick={() => handleTerminate(c.id)}
                            >
                              <Ban size={14} className="mr-1" /> Thanh lý
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600 transition-colors" onClick={() => handleDelete(c.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Dialog Ký HĐ Mới */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-slate-900 text-white">
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg"><FileSignature size={20} /></div>
              Đăng ký cư trú & Ký kết hợp đồng
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700">1. Xác thực sinh viên</Label>
                <div className="flex gap-2">
                  <Input placeholder="Nhập MSSV cần ký HĐ..." value={formData.studentCode} onChange={e => setFormData({...formData, studentCode: e.target.value})} className="h-11 shadow-sm rounded-xl border-slate-200" />
                  <Button variant="secondary" onClick={handleValidateStudent} disabled={isValidating} className="h-11 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl px-6">
                    {isValidating ? <Loader2 className="animate-spin" /> : "Kiểm tra"}
                  </Button>
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center"><span className="text-slate-500 text-sm">Họ tên:</span><span className="font-bold text-slate-800">{formData.studentName || "---"}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500 text-sm">Xếp phòng:</span><Badge className="bg-indigo-500">{formData.roomName || "CHƯA XÁC ĐỊNH"}</Badge></div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center"><span className="text-slate-500 text-sm italic">Tiền phòng tháng:</span><span className="font-bold text-indigo-600">{formData.monthlyFee.toLocaleString()}đ</span></div>
              </div>
            </div>

            <div className="space-y-6 bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Calendar className="text-indigo-600" size={16} /> 2. Thời hạn & Thanh toán</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Ngày bắt đầu</Label>
                  <Input type="date" value={formData.startDate} onChange={e => handleStartDateChange(e.target.value)} className="h-10 bg-white rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Ngày kết thúc</Label>
                  <Input type="date" value={formData.endDate} readOnly className="h-10 bg-slate-100 text-slate-500 cursor-not-allowed rounded-lg" />
                </div>
              </div>
              <div className="mt-4 p-5 bg-white rounded-2xl shadow-sm border border-indigo-100">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Thu trọn gói (6 tháng)</p>
                    <span className="text-2xl font-black text-indigo-600">{(formData.monthlyFee * 6).toLocaleString()}đ</span>
                  </div>
                  <Badge variant="secondary" className="mb-1 bg-indigo-50 text-indigo-600 text-[10px]">Tiêu chuẩn</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-8 mb-6 bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 text-[11px] text-amber-800 leading-relaxed">
            <AlertTriangle className="text-amber-600 shrink-0" size={18} />
            <p>Hợp đồng này có giá trị pháp lý tạm thời. Sau khi xác nhận, hóa đơn học kỳ sẽ được <b>tự động khởi tạo</b>. Nhắc sinh viên hoàn thiện thủ tục bàn giao tài sản để nhận phòng thực tế.</p>
          </div>

          <DialogFooter className="bg-slate-50 p-6 border-t gap-3">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="rounded-xl h-11 px-6">Hủy bỏ</Button>
            <Button onClick={handleSave} disabled={loading} className="bg-slate-900 hover:bg-black text-white h-11 px-10 rounded-xl shadow-lg transition-all">
              {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" size={18}/>} Ký kết & Tạo hóa đơn
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
          <p className="text-[11px] font-bold uppercase text-slate-400 tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-800">{value || 0}</p>
        </div>
        <div className={`p-4 rounded-2xl ${colorMap[color]}`}><Icon size={24} /></div>
      </CardContent>
    </Card>
  );
}
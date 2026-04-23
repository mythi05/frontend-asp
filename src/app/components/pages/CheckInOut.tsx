import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { toast } from "sonner";
import { apiRequest } from "../../api";
import { Badge } from "../ui/badge";
import { LogIn, LogOut, History, Search, Loader2, UserCheck, ShieldCheck } from "lucide-react";

export function CheckInOut() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [form, setForm] = useState({ studentCode: "", note: "" });

  const loadHistory = async () => {
    try {
      const h = await apiRequest<any[]>("/api/RoomTransactionApi");
      setHistory(h);
    } catch (e) { 
      toast.error("Lỗi tải lịch sử"); 
    }
  };

  useEffect(() => { loadHistory(); }, []);

  const handleValidate = async () => {
    if (!form.studentCode.trim()) return toast.error("Vui lòng nhập MSSV");
    setIsValidating(true);
    try {
      const data = await apiRequest<any>(`/api/RoomTransactionApi/validate/${form.studentCode}`);
      setStudentInfo(data);
      toast.success("Hợp đồng hợp lệ!");
    } catch (e: any) {
      setStudentInfo(null);
      toast.error(e.message || "Không tìm thấy hợp đồng hiệu lực");
    } finally { 
      setIsValidating(false); 
    }
  };

  const handleAction = async (type: "checkin" | "checkout") => {
    setLoading(true);
    try {
      const url = type === "checkin" ? "/api/RoomTransactionApi/checkin" : `/api/RoomTransactionApi/checkout/${form.studentCode}`;
      const body = type === "checkin" ? { studentCode: form.studentCode, note: form.note } : undefined;

      await apiRequest(url, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined
      });

      toast.success(type === "checkin" ? "Đã xác nhận nhận phòng" : "Đã xác nhận trả phòng");
      
      // Xóa ghi chú sau khi xong
      setForm(prev => ({ ...prev, note: "" }));
      
      // Quan trọng: Cập nhật lại thông tin sinh viên để đổi trạng thái nút bấm
      await handleValidate();
      // Tải lại lịch sử
      loadHistory();
    } catch (e: any) {
      toast.error(e.message);
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50/30 min-h-screen">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-600 rounded-lg text-white">
          <UserCheck size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Điều phối Cư trú</h2>
          <p className="text-sm text-slate-500">Quản lý việc nhận/trả phòng thực tế dựa trên hợp đồng</p>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Section 1: Search */}
          <div className="md:col-span-4 p-8 border-r border-slate-100 space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Bước 1: Kiểm tra MSSV</label>
              <div className="relative">
                <Input 
                  placeholder="Nhập MSSV (Vd: 212311...)" 
                  value={form.studentCode} 
                  onChange={e => setForm({...form, studentCode: e.target.value})}
                  className="h-14 pl-12 rounded-2xl border-slate-200 focus:ring-indigo-500 text-lg font-bold"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
              <Button 
                onClick={handleValidate} 
                disabled={isValidating}
                className="w-full h-12 bg-slate-800 hover:bg-black rounded-2xl transition-all"
              >
                {isValidating ? <Loader2 className="animate-spin" /> : "Kiểm tra Hợp đồng"}
              </Button>
            </div>
            
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Bước 2: Ghi chú (nếu có)</label>
              <Input 
                placeholder="Tình trạng bàn giao..."
                value={form.note} 
                onChange={e => setForm({...form, note: e.target.value})} 
                className="h-12 rounded-xl border-slate-100"
              />
            </div>
          </div>

          {/* Section 2: Info & Action */}
          <div className="md:col-span-8 p-8 bg-slate-50/50 flex flex-col justify-center gap-8">
            {studentInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-300">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-100">
                            {studentInfo.fullName[0]}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{studentInfo.fullName}</h3>
                            <p className="text-indigo-600 font-semibold">{studentInfo.roomName}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Badge className="bg-white text-slate-600 border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                            <ShieldCheck size={14} className="mr-1 text-emerald-500" /> Hợp đồng: {studentInfo.contractCode}
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-col gap-3 justify-center">
                    <Button 
                        disabled={loading || studentInfo.isCheckIn}
                        onClick={() => handleAction("checkin")}
                        className="h-14 bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-xl shadow-emerald-100 font-bold text-lg"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <LogIn className="mr-2" />} XÁC NHẬN NHẬN PHÒNG
                    </Button>
                    <Button 
                        disabled={loading || !studentInfo.isCheckIn}
                        onClick={() => handleAction("checkout")}
                        variant="destructive"
                        className="h-14 rounded-2xl shadow-xl shadow-red-100 font-bold text-lg"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <LogOut className="mr-2" />} XÁC NHẬN TRẢ PHÒNG
                    </Button>
                    {studentInfo.isCheckIn ? (
                        <p className="text-center text-xs text-amber-600 font-medium">Sinh viên hiện đang cư trú tại phòng.</p>
                    ) : (
                        <p className="text-center text-xs text-emerald-600 font-medium">Sinh viên đã ký hợp đồng, chờ nhận phòng.</p>
                    )}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 py-10">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <History size={32} className="text-slate-200" />
                </div>
                <p className="text-slate-400 font-medium">Nhập và Check MSSV để thực hiện lệnh điều phối</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Nhật ký giao dịch */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-700 flex items-center gap-2 px-2">
            <History size={18} /> Nhật ký giao dịch gần đây
        </h3>
        <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="font-bold">Thời gian</TableHead>
                        <TableHead className="font-bold">Sinh viên</TableHead>
                        <TableHead className="font-bold">Phòng</TableHead>
                        <TableHead className="font-bold text-center">Loại</TableHead>
                        <TableHead className="font-bold">Ghi chú</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.map((x) => (
                        <TableRow key={x.id}>
                            <TableCell className="text-xs text-slate-500">
                                {new Date(x.transactionDate).toLocaleString('vi-VN')}
                            </TableCell>
                            <TableCell className="font-bold">
                              {x.studentName} 
                              <span className="block text-[10px] text-slate-400 font-normal">{x.studentCode}</span>
                            </TableCell>
                            <TableCell><Badge variant="secondary" className="rounded-md">{x.roomName}</Badge></TableCell>
                            <TableCell className="text-center">
                                <Badge className={x.transactionType === "Check-in" ? "bg-emerald-100 text-emerald-700 border-none" : "bg-rose-100 text-rose-700 border-none"}>
                                    {x.transactionType === "Check-in" ? "Vào phòng" : "Trả phòng"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-slate-500 italic text-sm">{x.note || "-"}</TableCell>
                        </TableRow>
                    ))}
                    {history.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-slate-400">Chưa có giao dịch nào</TableCell>
                      </TableRow>
                    )}
                </TableBody>
            </Table>
        </Card>
      </div>
    </div>
  );
}
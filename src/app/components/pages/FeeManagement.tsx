import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Search, Plus, RefreshCcw, Trash2, CreditCard, Wallet, CheckCircle2, AlertCircle, Loader2, ReceiptText, History } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { apiRequest } from "../../api";

export function FeeManagement() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [formData, setFormData] = useState({
    studentCode: "",
    studentId: 0,
    studentName: "",
    roomName: "",
    roomId: 0,
    reason: "",
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchInvoices();
  }, [filterStatus, searchTerm]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("searchString", searchTerm);
      if (filterStatus !== "all") params.append("statusFilter", filterStatus);

      const data = await apiRequest<any[]>(`/api/InvoiceApi?${params.toString()}`);
      setInvoices(data);
    } catch (err) {
      toast.error("Không thể tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStudent = async () => {
    if (!formData.studentCode) return toast.error("Vui lòng nhập MSSV");
    setIsValidating(true);
    try {
      const student = await apiRequest<any>(`/api/Student/by-code/${formData.studentCode}`);
      if (student) {
        setFormData(prev => ({
          ...prev,
          studentId: student.id,
          studentName: student.fullName,
          roomId: student.roomId,
          roomName: student.room?.roomName || "N/A"
        }));
        toast.success("Đã xác nhận sinh viên");
      }
    } catch (err) {
      toast.error("MSSV không tồn tại hoặc chưa được duyệt phòng");
    } finally { setIsValidating(false); }
  };

  // --- PHẦN SỬA CHÍNH TẠI ĐÂY ---
  const handleCreateExtraInvoice = async () => {
    if (!formData.studentId || formData.amount <= 0) {
      return toast.error("Kiểm tra lại số tiền và thông tin sinh viên");
    }

    setIsSubmitting(true);
    const now = new Date();
    
    try {
      // Ép kiểu dữ liệu để Backend nhận diện chính xác các trường Decimal
      const payload = {
        studentId: Number(formData.studentId),
        roomId: Number(formData.roomId),
        description: formData.reason || "Phí phát sinh ngoài hợp đồng",
        totalAmount: Number(formData.amount), // Đảm bảo là kiểu số
        roomFee: Number(formData.amount),    // Gán vào đây để Backend gán TotalAmount từ RoomFee
        utilityFee: 0,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        dueDate: new Date(formData.dueDate).toISOString(),
        status: "Chưa thanh toán"
      };

      await apiRequest("/api/InvoiceApi", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      toast.success("Đã lập hóa đơn thành công!");
      setIsAddOpen(false);
      fetchInvoices();
      
      // Reset form sạch sẽ
      setFormData({ 
        studentCode: "", 
        studentId: 0, 
        studentName: "", 
        roomName: "", 
        roomId: 0, 
        reason: "", 
        amount: 0, 
        dueDate: new Date().toISOString().split('T')[0] 
      });
    } catch (err) {
      toast.error("Lỗi khi tạo hóa đơn. Vui lòng thử lại.");
    } finally { setIsSubmitting(false); }
  };

  const handleConfirmPayment = async (id: number) => {
    try {
      await apiRequest(`/api/InvoiceApi/confirm-payment/${id}`, { method: "POST" });
      toast.success("Đã xác nhận nộp tiền!");
      fetchInvoices();
    } catch (err) { toast.error("Lỗi cập nhật"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa hóa đơn này sẽ ảnh hưởng đến báo cáo tài chính. Bạn có chắc chắn?")) return;
    try {
      await apiRequest(`/api/InvoiceApi/${id}`, { method: "DELETE" });
      toast.success("Đã xóa hóa đơn");
      fetchInvoices();
    } catch (err) { toast.error("Không thể xóa"); }
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50/50 min-h-screen">
      {/* Banner & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
        <div className="flex gap-4 items-center">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <Wallet size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Kế toán & Lệ phí</h2>
            <p className="text-slate-500 text-sm">Quản lý thu tiền phòng và phí dịch vụ phát sinh</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={fetchInvoices} className="flex-1 md:flex-none border-slate-200">
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Lập hóa đơn lẻ
          </Button>
        </div>
      </div>

      {/* Tìm kiếm & Tabs lọc */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            className="pl-10 bg-white h-11 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500" 
            placeholder="Tìm MSSV hoặc tên sinh viên..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
            {[
              { id: "all", label: "TẤT CẢ", icon: History },
              { id: "Chưa thanh toán", label: "CHỜ THU", icon: AlertCircle },
              { id: "Đã thanh toán", label: "HOÀN TẤT", icon: CheckCircle2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  filterStatus === tab.id ? `bg-white text-indigo-600 shadow-sm` : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
        </div>
      </div>

      {/* Bảng danh sách */}
      <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-bold py-5 pl-6">SINH VIÊN & PHÒNG</TableHead>
              <TableHead className="font-bold">NỘI DUNG THANH TOÁN</TableHead>
              <TableHead className="font-bold text-right">SỐ TIỀN</TableHead>
              <TableHead className="font-bold text-center">TRẠNG THÁI</TableHead>
              <TableHead className="text-right font-bold pr-6">THAO TÁC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-24"><Loader2 className="animate-spin mx-auto h-10 w-10 text-indigo-400" /></TableCell></TableRow>
            ) : invoices.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-24 text-slate-400">Không có dữ liệu hóa đơn</TableCell></TableRow>
            ) : invoices.map((inv) => (
              <TableRow key={inv.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                <TableCell className="pl-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{inv.student?.fullName}</span>
                    <span className="text-[11px] font-mono text-indigo-600 font-semibold">{inv.student?.studentCode} • {inv.room?.roomName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${inv.description?.includes("phát sinh") ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        <ReceiptText size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700">{inv.description || "Hóa đơn dịch vụ"}</span>
                        <span className="text-[10px] text-slate-400 font-medium italic">Hạn: {new Date(inv.dueDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-base font-black text-slate-800">{inv.totalAmount?.toLocaleString('vi-VN')}₫</span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`px-3 py-1 rounded-full border-none font-bold text-[10px] ${
                    inv.status === "Đã thanh toán" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                  }`}>
                    {inv.status === "Đã thanh toán" ? "ĐÃ THU TIỀN" : "CHƯA THANH TOÁN"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2">
                    {inv.status !== "Đã thanh toán" ? (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8" onClick={() => handleConfirmPayment(inv.id)}>
                        <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Thu tiền
                      </Button>
                    ) : (
                      <div className="flex items-center text-emerald-600 font-black text-xs px-2 h-8">
                        <CheckCircle2 className="h-4 w-4 mr-1.5" /> HOÀN TẤT
                      </div>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={() => handleDelete(inv.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog tạo hóa đơn lẻ */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <ReceiptText className="text-indigo-600" /> Lập hóa đơn mới
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-slate-500 uppercase">1. MSSV cần lập hóa đơn</Label>
              <div className="flex gap-2">
                <Input placeholder="Nhập MSSV..." value={formData.studentCode} onChange={e => setFormData({...formData, studentCode: e.target.value})} />
                <Button variant="secondary" onClick={handleCheckStudent} disabled={isValidating}>
                    {isValidating ? <Loader2 className="animate-spin h-4 w-4" /> : "Kiểm tra"}
                </Button>
              </div>
            </div>

            {formData.studentName && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Họ tên:</span><span className="font-bold">{formData.studentName}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Phòng:</span><Badge variant="outline">{formData.roomName}</Badge></div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-slate-500 uppercase">2. Nội dung & Lý do</Label>
              <Input placeholder="VD: Tiền phòng trọn kỳ, Tiền phạt..." value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-slate-500 uppercase">Số tiền (VNĐ)</Label>
                <Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="text-indigo-600 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-slate-500 uppercase">Hạn thanh toán</Label>
                <Input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Hủy</Button>
            <Button className="bg-indigo-600 h-11 px-8 shadow-lg" onClick={handleCreateExtraInvoice} disabled={isSubmitting || !formData.studentId}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Xác nhận lập hóa đơn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
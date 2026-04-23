import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
  Plus, Edit2, Trash2, Building2, Users2, 
  Layers, Eye, Search, User
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../../api";

// --- INTERFACES ---
interface Student {
  id: number;
  fullName: string;
  studentCode: string;
  gender: string;
}

interface Room {
  id: string;
  roomNumber: string;
  building: string;
  floor: string;
  capacity: number;
  occupied: number;
  price: number;
  status: string;
  type: string;
}

export function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    roomNumber: "", building: "", floor: "", capacity: "", price: "", type: "",
  });

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<any[]>("/api/Room");
      const mapped = data.map((r) => ({
        id: r.id.toString(),
        roomNumber: r.roomName,
        building: r.building,
        floor: r.floor.toString(),
        capacity: r.maxCapacity,
        occupied: r.currentOccupancy || 0,
        price: r.price,
        status: r.status,
        type: r.roomType,
      }));
      setRooms(mapped);
    } catch (err) {
      toast.error("Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (room: Room) => {
    try {
      setViewingRoom(room);
      const data = await apiRequest<Student[]>(`/api/Room/${room.id}/students`);
      setSelectedStudents(data);
      setDetailsDialogOpen(true);
    } catch (err) {
      toast.error("Lỗi khi kết nối");
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      building: room.building,
      floor: room.floor,
      capacity: room.capacity.toString(),
      price: room.price.toString(),
      type: room.type,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phòng này không?")) return;
    try {
      await apiRequest(`/api/Room/${id}`, { method: "DELETE" });
      toast.success("Đã xóa phòng thành công");
      fetchRooms();
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa phòng");
    }
  };

  const handleSave = async () => {
    try {
      const body = {
        id: editingRoom ? Number(editingRoom.id) : 0,
        roomName: formData.roomNumber,
        building: formData.building,
        floor: formData.floor,
        roomType: formData.type,
        maxCapacity: parseInt(formData.capacity),
        price: parseInt(formData.price),
      };

      const url = editingRoom ? `/api/Room/${editingRoom.id}` : `/api/Room`;
      await apiRequest(url, {
        method: editingRoom ? "PUT" : "POST",
        body: JSON.stringify(body),
      });

      toast.success(editingRoom ? "Cập nhật thành công" : "Đã thêm phòng mới");
      setDialogOpen(false);
      fetchRooms();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredRooms = rooms.filter(r =>
    r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.building.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Sơ đồ phòng ở</h2>
          <p className="text-slate-500 text-sm">Quản lý và theo dõi tình trạng cư trú</p>
        </div>
        <Button onClick={() => { setEditingRoom(null); setDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 h-10 px-5 rounded-lg transition-all">
          <Plus className="mr-2 h-4 w-4" /> Thêm phòng mới
        </Button>
      </div>

      {/* Tìm kiếm */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input
          placeholder="Tìm phòng hoặc tòa nhà..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 bg-white border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Danh sách phòng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room) => {
          const isFull = room.occupied >= room.capacity;
          const percent = room.capacity > 0 ? (room.occupied / room.capacity) * 100 : 0;
          
          return (
            <Card key={room.id} className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all rounded-xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{room.building}</p>
                    <CardTitle className="text-xl font-bold text-slate-700">{room.roomNumber}</CardTitle>
                  </div>
                  <Badge className={`font-normal rounded-md ${isFull ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`} variant="outline">
                    {isFull ? 'Đã đầy' : 'Còn trống'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 space-y-5">
                <div className="flex justify-between text-sm text-slate-600">
                  <div className="flex items-center gap-1.5"><Layers size={14} className="text-slate-400" /> Tầng {room.floor}</div>
                  <div className="flex items-center gap-1.5 font-medium tracking-tight">
                    <Users2 size={14} className="text-slate-400" /> {room.occupied}/{room.capacity} Người
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-bold text-slate-900">{room.price.toLocaleString()}đ</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(room)} className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                      <Eye size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(room)} className="h-9 w-9 text-slate-500 hover:text-amber-600 hover:bg-amber-50">
                      <Edit2 size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(room.id)} className="h-9 w-9 text-slate-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog Chi tiết sinh viên */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-xl p-0 overflow-hidden">
          <DialogHeader className="bg-slate-50 px-6 py-4 border-b">
            <DialogTitle className="text-lg font-semibold text-slate-800">
              Sinh viên phòng {viewingRoom?.roomNumber}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6">
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedStudents.length === 0 ? (
                <div className="text-center py-10">
                  <User size={40} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-slate-400 text-sm">Phòng hiện đang trống</p>
                </div>
              ) : (
                selectedStudents.map((st) => (
                  <div key={st.id} className="flex items-center gap-4 p-3 border border-slate-100 rounded-lg bg-white">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                      {st.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 text-sm">{st.fullName}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-tighter">{st.studentCode} • {st.gender}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button className="w-full mt-6 bg-slate-900 text-white" onClick={() => setDetailsDialogOpen(false)}>Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Thêm/Sửa */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-xl p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-slate-800">
              {editingRoom ? "Chỉnh sửa phòng" : "Tạo phòng mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tên phòng</Label>
                <Input placeholder="Vd: A.101" value={formData.roomNumber} onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tòa nhà</Label>
                <Input placeholder="Vd: Tòa A" value={formData.building} onChange={(e) => setFormData({ ...formData, building: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tầng</Label>
                <Input type="number" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Giá thuê (đ)</Label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Loại phòng</Label>
              <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val, capacity: val.includes("2") ? "2" : val.includes("4") ? "4" : "6" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại phòng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Phòng 2 người">Phòng 2 người</SelectItem>
                  <SelectItem value="Phòng 4 người">Phòng 4 người</SelectItem>
                  <SelectItem value="Phòng 6 người">Phòng 6 người</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Lưu dữ liệu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
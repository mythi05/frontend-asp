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
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../../api";

interface Room {
  id: string;
  roomNumber: string;
  building: string;
  floor: number;
  capacity: number;
  occupied: number;
  price: number;
  status: "available" | "full";
  type: string;
}

export function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [formData, setFormData] = useState({
    roomNumber: "",
    building: "",
    floor: "",
    capacity: "",
    price: "",
    type: "",
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const data = await apiRequest<any[]>("/api/Room");

    const mapped = data.map((r) => ({
      id: r.id.toString(),
      roomNumber: r.roomName,
      building: r.building,
      floor: parseInt(r.floor) || 0,
      capacity: r.maxCapacity,
      occupied: r.currentOccupancy,
      price: r.price,
      status:
        r.currentOccupancy >= r.maxCapacity ? "full" : "available",
      type: r.roomType,
    }));

    setRooms(mapped);
  };

  const handleAdd = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: "",
      building: "",
      floor: "",
      capacity: "",
      price: "",
      type: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);

    setFormData({
      roomNumber: room.roomNumber,
      building: room.building,
      floor: room.floor.toString(),
      capacity: room.capacity.toString(),
      price: room.price.toString(),
      type: room.type,
    });

    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await apiRequest(`/api/Room/${id}`, { method: "DELETE" });
    toast.success("Đã xóa");
    fetchRooms();
  };

  const handleSave = async () => {
    try {
      if (editingRoom) {
        const body = {
          id: Number(editingRoom.id),
          roomName: formData.roomNumber,
          building: formData.building,
          floor: formData.floor,
          roomType: formData.type,
          maxCapacity: parseInt(formData.capacity),
          price: parseInt(formData.price),
        };

        await apiRequest(`/api/Room/${editingRoom.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });

        toast.success("Cập nhật thành công");
      } else {
        const body = {
          roomName: formData.roomNumber,
          building: formData.building,
          floor: formData.floor,
          roomType: formData.type,
          maxCapacity: parseInt(formData.capacity),
          price: parseInt(formData.price),
        };

        await apiRequest(`/api/Room`, {
          method: "POST",
          body: JSON.stringify(body),
        });

        toast.success("Thêm thành công");
      }

      setDialogOpen(false);
      fetchRooms();
    } catch (err: any) {
      toast.error(err.message || "Lỗi");
    }
  };

  const filteredRooms = rooms.filter(
    (r) =>
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.building.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Room["status"]) => {
    if (status === "available")
      return <Badge className="bg-green-100 text-green-800">Còn trống</Badge>;
    return <Badge className="bg-red-100 text-red-800">Đã đầy</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Quản lý phòng</h2>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm phòng
        </Button>
      </div>

      <Input
        placeholder="Tìm kiếm..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="grid grid-cols-3 gap-4">
        {filteredRooms.map((room) => {
          const percent =
            room.capacity > 0
              ? Math.round((room.occupied / room.capacity) * 100)
              : 0;

          return (
            <Card key={room.id}>
              <CardHeader>
                <CardTitle>{room.roomNumber}</CardTitle>
                {getStatusBadge(room.status)}
              </CardHeader>

              <CardContent>
                <p>{room.building}</p>

                {/* 🔥 HIỂN THỊ SỐ NGƯỜI */}
                <p className="text-sm mt-2">
                  👤 Đang ở: <b>{room.occupied}</b>
                </p>

                <p className="text-sm text-green-600">
                  🛏️ Còn trống:{" "}
                  <b>{room.capacity - room.occupied}</b>
                </p>

                <p className="text-xs text-gray-500">
                  Tổng: {room.capacity}
                </p>

                {/* 🔥 PROGRESS BAR */}
                <div className="w-full bg-gray-200 h-2 rounded mt-2">
                  <div
                    className="bg-blue-500 h-2 rounded"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {percent}% đã sử dụng
                </p>

                <p className="mt-2 font-semibold">
                  {room.price.toLocaleString()}đ
                </p>

                <div className="flex gap-2 mt-3">
                  <Button onClick={() => handleEdit(room)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDelete(room.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? "Cập nhật phòng" : "Thêm phòng"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <Label>Tên phòng</Label>
              <Input
                value={formData.roomNumber}
                onChange={(e) =>
                  setFormData({ ...formData, roomNumber: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Tòa nhà</Label>
              <Input
                value={formData.building}
                onChange={(e) =>
                  setFormData({ ...formData, building: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Tầng</Label>
              <Input
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Loại phòng</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  let capacity = "0";
                  if (value === "Phòng 2 người") capacity = "2";
                  if (value === "Phòng 4 người") capacity = "4";
                  if (value === "Phòng 6 người") capacity = "6";

                  setFormData({
                    ...formData,
                    type: value,
                    capacity: capacity,
                  });
                }}
              >
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

            <div>
              <Label>Sức chứa</Label>
              <Input value={formData.capacity} disabled />
            </div>

            <div>
              <Label>Giá</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave}>
              {editingRoom ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
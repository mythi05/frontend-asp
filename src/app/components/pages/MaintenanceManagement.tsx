import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
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
import { Plus, Search, Eye, Wrench } from "lucide-react";
import { toast } from "sonner";

interface MaintenanceRequest {
  id: string;
  room: string;
  reportedBy: string;
  category: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in-progress" | "completed" | "cancelled";
  reportDate: string;
  assignedTo?: string;
  completedDate?: string;
  cost: number;
  notes: string;
}

const initialRequests: MaintenanceRequest[] = [
  { id: "1", room: "A101", reportedBy: "Nguyễn Văn A", category: "Điện", description: "Đèn không sáng", priority: "high", status: "in-progress", reportDate: "2026-03-18", assignedTo: "Kỹ thuật viên Minh", cost: 200000, notes: "" },
  { id: "2", room: "B201", reportedBy: "Trần Thị B", category: "Nước", description: "Vòi nước bị rỉ", priority: "medium", status: "pending", reportDate: "2026-03-19", cost: 0, notes: "" },
  { id: "3", room: "C301", reportedBy: "Lê Văn C", category: "Nội thất", description: "Tủ quần áo bị gãy", priority: "low", status: "completed", reportDate: "2026-03-10", assignedTo: "Kỹ thuật viên Hùng", completedDate: "2026-03-15", cost: 500000, notes: "Đã thay thế cánh tủ mới" },
  { id: "4", room: "A102", reportedBy: "Phạm Thị D", category: "Điện tử", description: "Điều hòa không mát", priority: "urgent", status: "in-progress", reportDate: "2026-03-20", assignedTo: "Kỹ thuật viên Minh", cost: 0, notes: "" },
];

export function MaintenanceManagement() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(initialRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [formData, setFormData] = useState({
    room: "",
    reportedBy: "",
    category: "",
    description: "",
    priority: "medium" as const,
  });

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = 
      req.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    const matchesPriority = filterPriority === "all" || req.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    inProgress: requests.filter(r => r.status === "in-progress").length,
    completed: requests.filter(r => r.status === "completed").length,
  };

  const handleAdd = () => {
    setFormData({
      room: "",
      reportedBy: "",
      category: "",
      description: "",
      priority: "medium",
    });
    setDialogOpen(true);
  };

  const handleView = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleUpdateStatus = (id: string, newStatus: MaintenanceRequest["status"]) => {
    setRequests(requests.map((req) =>
      req.id === id
        ? { 
            ...req, 
            status: newStatus,
            completedDate: newStatus === "completed" ? new Date().toISOString().split('T')[0] : req.completedDate
          }
        : req
    ));
    toast.success("Đã cập nhật trạng thái");
  };

  const handleSave = () => {
    if (!formData.room || !formData.reportedBy || !formData.category || !formData.description) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const newRequest: MaintenanceRequest = {
      id: Date.now().toString(),
      room: formData.room,
      reportedBy: formData.reportedBy,
      category: formData.category,
      description: formData.description,
      priority: formData.priority,
      status: "pending",
      reportDate: new Date().toISOString().split('T')[0],
      cost: 0,
      notes: "",
    };
    setRequests([newRequest, ...requests]);
    toast.success("Đã tạo yêu cầu bảo trì mới");
    setDialogOpen(false);
  };

  const getPriorityBadge = (priority: MaintenanceRequest["priority"]) => {
    switch (priority) {
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Thấp</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Trung bình</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">Cao</Badge>;
      case "urgent":
        return <Badge className="bg-red-100 text-red-800">Khẩn cấp</Badge>;
    }
  };

  const getStatusBadge = (status: MaintenanceRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800">Chờ xử lý</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">Đang xử lý</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Quản lý bảo trì & Sửa chữa</h2>
          <p className="text-gray-500 mt-1">Theo dõi yêu cầu bảo trì và sửa chữa</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo yêu cầu mới
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng yêu cầu</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <Wrench className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Chờ xử lý</p>
                <p className="text-2xl font-semibold text-gray-600 mt-2">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đang xử lý</p>
                <p className="text-2xl font-semibold text-blue-600 mt-2">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hoàn thành</p>
                <p className="text-2xl font-semibold text-green-600 mt-2">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm phòng, người báo cáo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Mức độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mức độ</SelectItem>
                <SelectItem value="low">Thấp</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="high">Cao</SelectItem>
                <SelectItem value="urgent">Khẩn cấp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="in-progress">Đang xử lý</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phòng</TableHead>
                <TableHead>Người báo cáo</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Mức độ</TableHead>
                <TableHead>Ngày báo cáo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">{req.room}</Badge>
                  </TableCell>
                  <TableCell>{req.reportedBy}</TableCell>
                  <TableCell>{req.category}</TableCell>
                  <TableCell className="max-w-xs truncate">{req.description}</TableCell>
                  <TableCell>{getPriorityBadge(req.priority)}</TableCell>
                  <TableCell>{new Date(req.reportDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(req)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {req.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(req.id, "in-progress")}
                        >
                          Bắt đầu
                        </Button>
                      )}
                      {req.status === "in-progress" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleUpdateStatus(req.id, "completed")}
                        >
                          Hoàn thành
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tạo yêu cầu bảo trì mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                <Label htmlFor="reportedBy">Người báo cáo *</Label>
                <Input
                  id="reportedBy"
                  value={formData.reportedBy}
                  onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Loại sự cố *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Điện">Điện</SelectItem>
                    <SelectItem value="Nước">Nước</SelectItem>
                    <SelectItem value="Điện tử">Điện tử</SelectItem>
                    <SelectItem value="Nội thất">Nội thất</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Mức độ ưu tiên</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="urgent">Khẩn cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả sự cố *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết sự cố cần xử lý..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Tạo yêu cầu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu bảo trì</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Phòng</p>
                  <p className="font-medium">{selectedRequest.room}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Người báo cáo</p>
                  <p className="font-medium">{selectedRequest.reportedBy}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Loại sự cố</p>
                  <p className="font-medium">{selectedRequest.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mức độ</p>
                  {getPriorityBadge(selectedRequest.priority)}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mô tả</p>
                <p className="font-medium">{selectedRequest.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ngày báo cáo</p>
                  <p className="font-medium">{new Date(selectedRequest.reportDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>
              {selectedRequest.assignedTo && (
                <div>
                  <p className="text-sm text-gray-500">Phân công cho</p>
                  <p className="font-medium">{selectedRequest.assignedTo}</p>
                </div>
              )}
              {selectedRequest.cost > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Chi phí</p>
                  <p className="font-medium text-blue-600">{selectedRequest.cost.toLocaleString()}đ</p>
                </div>
              )}
              {selectedRequest.notes && (
                <div>
                  <p className="text-sm text-gray-500">Ghi chú</p>
                  <p className="font-medium">{selectedRequest.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

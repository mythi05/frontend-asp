import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
import { Plus, Bell, Eye, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "urgent";
  target: "all" | "building-a" | "building-b" | "building-c";
  createdBy: string;
  createdDate: string;
  expiryDate?: string;
  status: "active" | "expired";
}

const initialAnnouncements: Announcement[] = [
  { id: "1", title: "Thông báo cúp nước", content: "Ngày 25/03/2026 sẽ cúp nước từ 8h-12h để bảo trì hệ thống. Đề nghị sinh viên dự trữ nước.", type: "warning", target: "all", createdBy: "Admin", createdDate: "2026-03-20", expiryDate: "2026-03-25", status: "active" },
  { id: "2", title: "Thanh toán phí tháng 3", content: "Sinh viên vui lòng thanh toán phí ký túc xá tháng 3 trước ngày 10/03/2026.", type: "urgent", target: "all", createdBy: "Admin", createdDate: "2026-03-01", expiryDate: "2026-03-10", status: "expired" },
  { id: "3", title: "Kiểm tra phòng định kỳ", content: "Ban quản lý sẽ tiến hành kiểm tra vệ sinh phòng Tòa A vào ngày 22/03/2026.", type: "info", target: "building-a", createdBy: "Admin", createdDate: "2026-03-18", expiryDate: "2026-03-22", status: "active" },
  { id: "4", title: "Hoạt động văn hóa", content: "Chương trình giao lưu văn hóa sẽ được tổ chức vào tối 30/03/2026 tại sân sau KTX.", type: "info", target: "all", createdBy: "Admin", createdDate: "2026-03-15", expiryDate: "2026-03-30", status: "active" },
];

export function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTarget, setFilterTarget] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info" as const,
    target: "all" as const,
    expiryDate: "",
  });

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesType = filterType === "all" || ann.type === filterType;
    const matchesTarget = filterTarget === "all" || ann.target === filterTarget;
    return matchesType && matchesTarget;
  });

  const stats = {
    total: announcements.length,
    active: announcements.filter(a => a.status === "active").length,
    urgent: announcements.filter(a => a.type === "urgent" && a.status === "active").length,
  };

  const handleAdd = () => {
    setFormData({
      title: "",
      content: "",
      type: "info",
      target: "all",
      expiryDate: "",
    });
    setDialogOpen(true);
  };

  const handleView = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setViewDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
    toast.success("Đã xóa thông báo");
  };

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      type: formData.type,
      target: formData.target,
      createdBy: "Admin",
      createdDate: new Date().toISOString().split('T')[0],
      expiryDate: formData.expiryDate,
      status: "active",
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    toast.success("Đã đăng thông báo mới");
    setDialogOpen(false);
  };

  const getTypeBadge = (type: Announcement["type"]) => {
    switch (type) {
      case "info":
        return <Badge className="bg-blue-100 text-blue-800">Thông tin</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Cảnh báo</Badge>;
      case "urgent":
        return <Badge className="bg-red-100 text-red-800">Khẩn cấp</Badge>;
    }
  };

  const getTargetText = (target: Announcement["target"]) => {
    switch (target) {
      case "all":
        return "Tất cả sinh viên";
      case "building-a":
        return "Tòa A";
      case "building-b":
        return "Tòa B";
      case "building-c":
        return "Tòa C";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Quản lý thông báo</h2>
          <p className="text-gray-500 mt-1">Đăng và quản lý thông báo cho sinh viên</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo thông báo
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng thông báo</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đang hiệu lực</p>
                <p className="text-2xl font-semibold text-green-600 mt-2">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Khẩn cấp</p>
                <p className="text-2xl font-semibold text-red-600 mt-2">{stats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Loại thông báo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="info">Thông tin</SelectItem>
                <SelectItem value="warning">Cảnh báo</SelectItem>
                <SelectItem value="urgent">Khẩn cấp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTarget} onValueChange={setFilterTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Đối tượng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="all">Tất cả sinh viên</SelectItem>
                <SelectItem value="building-a">Tòa A</SelectItem>
                <SelectItem value="building-b">Tòa B</SelectItem>
                <SelectItem value="building-c">Tòa C</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement.id} className={`${
            announcement.type === "urgent" ? "border-red-300 border-2" : ""
          }`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeBadge(announcement.type)}
                    {announcement.status === "expired" && (
                      <Badge className="bg-gray-100 text-gray-800">Hết hạn</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                </div>
                <Bell className={`h-5 w-5 ${
                  announcement.type === "urgent" ? "text-red-600" :
                  announcement.type === "warning" ? "text-yellow-600" :
                  "text-blue-600"
                }`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700 line-clamp-3">{announcement.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(announcement.createdDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <span>{getTargetText(announcement.target)}</span>
              </div>
              {announcement.expiryDate && (
                <p className="text-xs text-gray-500">
                  Hết hạn: {new Date(announcement.expiryDate).toLocaleDateString('vi-VN')}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleView(announcement)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Xem
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(announcement.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tạo thông báo mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="VD: Thông báo cúp nước"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Nội dung *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Nội dung chi tiết của thông báo..."
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Loại thông báo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Thông tin</SelectItem>
                    <SelectItem value="warning">Cảnh báo</SelectItem>
                    <SelectItem value="urgent">Khẩn cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Đối tượng</Label>
                <Select
                  value={formData.target}
                  onValueChange={(value: any) => setFormData({ ...formData, target: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đối tượng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả sinh viên</SelectItem>
                    <SelectItem value="building-a">Tòa A</SelectItem>
                    <SelectItem value="building-b">Tòa B</SelectItem>
                    <SelectItem value="building-c">Tòa C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Ngày hết hạn (tùy chọn)</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Đăng thông báo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết thông báo</DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                {getTypeBadge(selectedAnnouncement.type)}
                {selectedAnnouncement.status === "expired" && (
                  <Badge className="bg-gray-100 text-gray-800">Hết hạn</Badge>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{selectedAnnouncement.title}</h3>
              </div>
              <div>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedAnnouncement.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Đối tượng</p>
                  <p className="font-medium">{getTargetText(selectedAnnouncement.target)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Người đăng</p>
                  <p className="font-medium">{selectedAnnouncement.createdBy}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ngày đăng</p>
                  <p className="font-medium">{new Date(selectedAnnouncement.createdDate).toLocaleDateString('vi-VN')}</p>
                </div>
                {selectedAnnouncement.expiryDate && (
                  <div>
                    <p className="text-sm text-gray-500">Ngày hết hạn</p>
                    <p className="font-medium">{new Date(selectedAnnouncement.expiryDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                )}
              </div>
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

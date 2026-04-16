import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="space-y-4">
        <h1 className="text-6xl font-semibold text-gray-900">404</h1>
        <h2 className="text-2xl font-medium text-gray-700">Không tìm thấy trang</h2>
        <p className="text-gray-500 max-w-md">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>
        <div className="flex gap-3 justify-center pt-4">
          <Link to="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
}

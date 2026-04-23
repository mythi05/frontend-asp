import { useState } from "react";
import { apiRequest } from "../../api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, User, Loader2, Landmark } from "lucide-react";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await apiRequest<any>("/api/Auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem("user", JSON.stringify(user));
      toast.success("Đăng nhập hệ thống thành công!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Tài khoản hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  // Hình ảnh cổng trường hoặc khuôn viên   Quận 9
  const  Bg = "https:// .edu.vn/wp-content/uploads/2022/07/truong-cao-dang-cong-thuong-tphcm.jpg";

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      
      {/* CỘT TRÁI - HÌNH ẢNH TRƯỜNG   & OVERLAY XANH DƯƠNG */}
      <div className="hidden lg:block lg:w-[65%] h-full relative">
       
        {/* Lớp phủ màu Xanh Dương đặc trưng của   */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/40 to-transparent"></div>
        
        {/* Nội dung chào mừng */}
        <div className="absolute top-20 left-20 z-10 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white rounded-xl shadow-lg">
               <Landmark size={40} className="text-blue-700" />
            </div>
            <div>
              <h1 className="text-3xl font-black leading-none tracking-tight"> </h1>
              <p className="text-sm font-bold opacity-80 uppercase">HCMC Industry and Trade College</p>
            </div>
          </div>
          
          <div className="mt-20">
            <h2 className="text-6xl font-extrabold leading-tight">
              Hệ Thống Quản Lý <br />
              <span className="text-yellow-400">Kí Túc Xá</span>
            </h2>
            <div className="h-2 w-32 bg-yellow-400 mt-6 rounded-full"></div>
            <p className="mt-8 text-xl text-blue-50 max-w-lg font-light leading-relaxed">
              Quản lý thông minh, hỗ trợ sinh viên kịp thời và tối ưu hóa vận hành kí túc xá  .
            </p>
          </div>
        </div>

        {/* Footer phía dưới ảnh */}
        <div className="absolute bottom-10 left-20 text-white/60 text-sm">
            © 2024 Trường Cao đẳng Công thương TP.HCM - 20 Tăng Nhơn Phú, P. Phước Long B, TP. Thủ Đức
        </div>
      </div>

      {/* CỘT PHẢI - FORM ĐĂNG NHẬP (TRẮNG TINH KHÔI) */}
      <div className="w-full lg:w-[35%] h-full flex items-center justify-center p-8 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.05)] z-20">
        <div className="w-full max-w-sm">
          
          <div className="mb-10">
            <h3 className="text-4xl font-bold text-blue-900 tracking-tight">Đăng nhập</h3>
            <p className="text-slate-500 mt-3 font-medium">Cổng thông tin dành cho Quản lý / Giám thị</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Tên đăng nhập */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-blue-900/70 uppercase ml-1">Mã cán bộ / Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <User size={20} />
                </div>
                <input
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Nhập tài khoản"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-blue-900/70 uppercase">Mật khẩu</label>
                <a href="#" className="text-xs text-blue-600 hover:underline font-semibold">Quên mật khẩu?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <LockKeyhole size={20} />
                </div>
                <input
                  required
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 disabled:bg-blue-400"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                "VÀO HỆ THỐNG"
              )}
            </button>
          </form>

          {/* Hotline / Support */}
          <div className="mt-16 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-xs text-blue-800 text-center leading-relaxed">
              Cần hỗ trợ kỹ thuật? Vui lòng liên hệ <br />
              <span className="font-bold">Trung tâm CNTT  </span> hoặc Hotline KTX.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
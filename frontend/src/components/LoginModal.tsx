import { useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react';
import { useAuth } from '../context/AuthContext';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
}

const LoginModal = () => {
  const { isLoginOpen, closeLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false
  });

  if (!isLoginOpen) return null;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(isLogin ? 'Login attempt:' : 'Register attempt:', formData);
    closeLogin();
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  const handleLineLogin = () => {
    console.log('LINE login clicked');
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.classList.contains('login-modal-overlay')) {
      closeLogin();
    }
  };

  const resetAndClose = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false
    });
    setIsLogin(true);
    closeLogin();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex justify-end animate-[fadeIn_0.3s_ease] login-modal-overlay" onClick={handleBackdropClick}>
      <div className="w-1/3 min-w-[320px] h-full bg-white flex flex-col animate-[slideIn_0.3s_ease] overflow-y-auto md:w-1/2 sm:w-full">
        <div className="flex justify-between items-center py-6 px-8 border-b border-[#e5e5e5] sm:px-6">
          <h2 className="text-xl font-normal tracking-[0.1em] m-0 font-heading">{isLogin ? '會員登入' : '註冊帳號'}</h2>
          <button className="bg-transparent border-0 cursor-pointer p-2 flex items-center justify-center text-black transition-opacity duration-300 hover:opacity-60" onClick={resetAndClose} aria-label="關閉登入">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex-1 p-8 sm:p-6">
          <p className="text-sm text-gray m-0 mb-8 text-center">
            {isLogin ? '歡迎回來，請登入您的帳號' : '建立帳號，開始您的購物體驗'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-black tracking-[0.02em]">電子郵件</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="請輸入電子郵件"
                className="py-3.5 px-4 border border-[#e0e0e0] text-[0.95rem] font-body transition-colors duration-300 bg-white focus:outline-none focus:border-black placeholder:text-[#aaaaaa]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-black tracking-[0.02em]">密碼</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="請輸入密碼"
                className="py-3.5 px-4 border border-[#e0e0e0] text-[0.95rem] font-body transition-colors duration-300 bg-white focus:outline-none focus:border-black placeholder:text-[#aaaaaa]"
                required
              />
            </div>

            {!isLogin && (
              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-black tracking-[0.02em]">確認密碼</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="請再次輸入密碼"
                  className="py-3.5 px-4 border border-[#e0e0e0] text-[0.95rem] font-body transition-colors duration-300 bg-white focus:outline-none focus:border-black placeholder:text-[#aaaaaa]"
                  required
                />
              </div>
            )}

            {isLogin && (
              <div className="flex justify-between items-center -mt-2">
                <label className="flex items-center gap-2 text-sm text-gray cursor-pointer relative pl-7 checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="absolute opacity-0 cursor-pointer h-0 w-0"
                  />
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 border border-[#cccccc] bg-white transition-all duration-200 checkmark hover:border-black"></span>
                  記住我
                </label>
                <button type="button" className="text-sm text-gray bg-transparent border-0 cursor-pointer p-0 transition-colors duration-300 hover:text-black">
                  忘記密碼？
                </button>
              </div>
            )}

            <button type="submit" className="w-full py-4 bg-black text-white text-[0.95rem] font-medium tracking-[0.1em] uppercase border-0 cursor-pointer transition-colors duration-300 mt-2 hover:bg-[#333333]">
              {isLogin ? '登入' : '註冊'}
            </button>
          </form>

          <div className="flex items-center my-6 divider">
            <div className="flex-1 h-px bg-[#e0e0e0]"></div>
            <span className="px-4 text-sm text-[#999999]">或</span>
            <div className="flex-1 h-px bg-[#e0e0e0]"></div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={handleGoogleLogin} className="w-full py-3.5 px-4 flex items-center justify-center gap-3 text-sm font-medium border border-[#e0e0e0] cursor-pointer transition-all duration-300 bg-white text-[#333333] hover:bg-gray-light hover:border-[#cccccc] social-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" className="flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              使用 Google 帳號登入
            </button>

            <button onClick={handleLineLogin} className="w-full py-3.5 px-4 flex items-center justify-center gap-3 text-sm font-medium border border-[#00B900] cursor-pointer transition-all duration-300 bg-[#00B900] text-white hover:bg-[#00a000] hover:border-[#00a000] social-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" className="flex-shrink-0">
                <path fill="#ffffff" d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              使用 LINE 帳號登入
            </button>
          </div>
        </div>

        <div className="py-6 px-8 border-t border-[#e5e5e5] text-center sm:px-6">
          <p className="text-sm text-gray m-0">
            {isLogin ? '還沒有帳號？' : '已經有帳號？'}
            <button
              type="button"
              className="bg-transparent border-0 text-black font-semibold cursor-pointer p-0 ml-1 transition-opacity duration-300 hover:opacity-60"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? '立即註冊' : '立即登入'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;


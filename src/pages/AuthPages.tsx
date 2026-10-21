import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import { PageRoute, UserProfile } from '../types';
import { loginUser, registerUser, requestForgotPassword } from '../api';

// =================== LOGIN PAGE ===================
interface LoginPageProps {
  onNavigate: (page: PageRoute) => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Lütfen e-posta adresinizi ve parolanızı giriniz.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser({ email: email.trim(), password });
      onLoginSuccess(res.user);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-md">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">LexiMind'e Giriş Yap</h1>
        <p className="text-xs text-slate-400">
          Akademik makale analizlerinize ve geçmişinize erişmek için oturum açın.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">E-posta Adresi</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@universite.edu.tr"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F121A] border border-[#232A3B] text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-400">Parola</label>
            <button
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              Parolamı Unuttum
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0F121A] border border-[#232A3B] text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Giriş Yap</span>
        </button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Hesabınız yok mu?{' '}
        <button
          type="button"
          onClick={() => onNavigate('register')}
          className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline underline-offset-4"
        >
          Hemen Kaydolun
        </button>
      </div>
    </div>
  );
};

// =================== REGISTER PAGE ===================
interface RegisterPageProps {
  onNavigate: (page: PageRoute) => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Lütfen tüm zorunlu alanları doldurunuz.');
      return;
    }
    if (password.length < 6) {
      setError('Parola en az 6 karakter olmalıdır.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Girdiğiniz parolalar birbiriyle eşleşmiyor.');
      return;
    }
    if (!termsAccepted) {
      setError('Kullanım Koşulları ve Gizlilik Politikasını onaylamanız gerekmektedir.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await registerUser({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        terms_accepted: termsAccepted,
      });
      onLoginSuccess(res.user);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err?.message || 'Kayıt işlemi gerçekleştirilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-md">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Yeni Hesap Oluştur</h1>
        <p className="text-xs text-slate-400">
          LexiMind üzerinde akademik makale analizlerinizi kaydedin ve yönetin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Ad Soyad</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ahmet Yılmaz"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F121A] border border-[#232A3B] text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">E-posta Adresi</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ahmet@universite.edu.tr"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F121A] border border-[#232A3B] text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Parola (Min 6)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0F121A] border border-[#232A3B] text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Parola Tekrarı</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0F121A] border border-[#232A3B] text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Terms & Privacy Checkbox */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            id="termsCheckbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="w-4 h-4 mt-0.5 text-indigo-600 rounded bg-[#0F121A] border-[#2D3748] focus:ring-0 cursor-pointer"
          />
          <label htmlFor="termsCheckbox" className="text-[11px] text-slate-400 leading-snug cursor-pointer">
            <button
              type="button"
              onClick={() => onNavigate('terms')}
              className="text-indigo-400 hover:underline inline"
            >
              Kullanım Koşulları
            </button>
            'nı ve{' '}
            <button
              type="button"
              onClick={() => onNavigate('privacy')}
              className="text-indigo-400 hover:underline inline"
            >
              Gizlilik Politikası
            </button>
            'nı okudum, kabul ediyorum.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Hesabımı Oluştur</span>
        </button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Zaten bir hesabınız var mı?{' '}
        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline underline-offset-4"
        >
          Giriş Yapın
        </button>
      </div>
    </div>
  );
};

// =================== FORGOT PASSWORD PAGE ===================
interface ForgotPasswordPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await requestForgotPassword(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'İşlem gerçekleştirilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Parolanızı mı Unuttunuz?</h1>
        <p className="text-xs text-slate-400">
          Kayıtlı e-posta adresinizi girerek parola sıfırlama yönergelerini alın.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-4">
        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white">Sıfırlama Yönergesi Hazırlandı</h2>
            <div className="p-3.5 rounded-xl bg-[#0F121A] border border-[#1E2433] text-xs text-slate-300 text-left leading-relaxed">
              <strong>Geliştirici ve Proje Notu:</strong> Harici bir SMTP e-posta sunucusu yapılandırılmadığı bu yerel/akademik ortamda, 
              parola sıfırlama talebiniz başarıyla simüle edilmiş ve veritabanı loglarına kaydedilmiştir. Doğrudan yeni bir hesap oluşturabilir 
              veya profil sayfasından parolanızı güncelleyebilirsiniz.
            </div>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Giriş Ekranına Dön
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">E-posta Adresi</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ahmet@universite.edu.tr"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F121A] border border-[#232A3B] text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Sıfırlama Bağlantısı Gönder</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="w-full text-center text-xs text-slate-400 hover:text-white cursor-pointer pt-2 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Giriş ekranına geri dön</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

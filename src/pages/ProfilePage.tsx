import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Lock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  ArrowRight
} from 'lucide-react';
import { PageRoute, UserProfile } from '../types';
import { updateUserProfile, changeUserPassword, deleteUserAccount } from '../api';

interface ProfilePageProps {
  currentUser: UserProfile | null;
  onNavigate: (page: PageRoute) => void;
  onUserUpdated: (user: UserProfile | null) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onNavigate,
  onUserUpdated,
}) => {
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // Account Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Giriş Yapılmadı</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Profil bilgilerinizi görüntülemek, parola güncellemek veya analiz geçmişinizi hesabınıza bağlamak için lütfen giriş yapın veya ücretsiz kayıt olun.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="px-5 py-2.5 rounded-xl bg-[#1A202C] hover:bg-[#232B3B] text-slate-200 border border-[#2D3748] font-semibold text-sm transition-colors cursor-pointer"
          >
            Hesap Oluştur
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setProfileError('Ad Soyad alanı boş bırakılamaz.');
      return;
    }
    setUpdatingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const updated = await updateUserProfile({ full_name: fullName.trim() });
      onUserUpdated(updated);
      setProfileSuccess('Profil bilgileriniz başarıyla güncellendi.');
    } catch (err: any) {
      setProfileError(err?.message || 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPassError('Lütfen mevcut ve yeni parolanızı giriniz.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('Yeni parola en az 6 karakter olmalıdır.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Yeni parolalar eşleşmiyor.');
      return;
    }
    setChangingPass(true);
    setPassError(null);
    setPassSuccess(null);
    try {
      await changeUserPassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPassSuccess('Parolanız başarıyla değiştirildi.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err?.message || 'Parola değiştirilemedi.');
    } finally {
      setChangingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteUserAccount();
      onUserUpdated(null);
      onNavigate('dashboard');
    } catch (err: any) {
      alert(err?.message || 'Hesap silinirken hata oluştu.');
      setDeleting(false);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts * 1000).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-[#1E2433] pb-6">
        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
          <User className="w-4 h-4" />
          <span>Hesap Yönetimi</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Kullanıcı Profili
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Hesap bilgilerinizi yönetin, güvenlik ayarlarınızı ve parolanızı güncelleyin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sol Kart: Kullanıcı Bilgi Özeti */}
        <div className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-4 self-start">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-2xl">
            {currentUser.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{currentUser.full_name}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{currentUser.email}</span>
            </p>
          </div>
          <div className="pt-3 border-t border-[#232A3B] space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Kayıt Tarihi: {formatDate(currentUser.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Güvenli Bcrypt Oturumu</span>
            </div>
          </div>
        </div>

        {/* Sağ Kartlar: Güncelleme Formları */}
        <div className="md:col-span-2 space-y-6">
          {/* Profil Güncelle Formu */}
          <form onSubmit={handleUpdateProfile} className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-4">
            <h3 className="text-base font-bold text-white">Profil Bilgilerini Güncelle</h3>

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Ad Soyad
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F121A] border border-[#232A3B] text-white text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Adınız ve Soyadınız"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                E-posta Adresi (Değiştirilemez)
              </label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-[#1E2433] text-slate-500 text-sm cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              {updatingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Bilgileri Kaydet</span>
            </button>
          </form>

          {/* Parola Değiştir Formu */}
          <form onSubmit={handleChangePassword} className="p-6 rounded-2xl bg-[#151923] border border-[#232A3B] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Parola Değiştir</span>
            </h3>

            {passSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}
            {passError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Mevcut Parola
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F121A] border border-[#232A3B] text-white text-sm focus:outline-none focus:border-indigo-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Yeni Parola (Min 6 karakter)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F121A] border border-[#232A3B] text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Yeni Parola (Tekrar)
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F121A] border border-[#232A3B] text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={changingPass}
              className="px-5 py-2.5 rounded-xl bg-[#1A202C] hover:bg-[#232B3B] text-slate-200 border border-[#2D3748] font-semibold text-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              {changingPass && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Parolayı Güncelle</span>
            </button>
          </form>

          {/* Tehlikeli Alan: Hesap Silme */}
          <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
            <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Hesabı ve Verileri Tamamen Sil</span>
            </h3>
            <p className="text-xs text-slate-400">
              Hesabınızı sildiğinizde analiz geçmişiniz, anahtar kelime kayıtlarınız ve profiliniz veritabanından kalıcı olarak silinir. Bu işlem geri alınamaz.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors cursor-pointer"
            >
              Hesabımı Sil...
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#151923] border border-[#2D3748] shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Hesabınızı Silmek İstediğinize Emin Misiniz?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bu işlem ile kullanıcı profiliniz ve sisteme kayıtlı tüm akademik analizleriniz kalıcı olarak silinecektir.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-[#1E2433] hover:bg-[#2A3347] text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                İptal Et
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Evet, Hesabımı Sil</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

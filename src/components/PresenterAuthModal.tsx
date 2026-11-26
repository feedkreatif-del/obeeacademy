import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { ViewRole } from '../types';
import { db, formatGoogleAuthError } from '../firebase';
import {
  clearFailedPinAttempts,
  getPinCooldownRemainingMs,
  isAuthorizedMentorUser,
  PresenterPinConfig,
  recordFailedPinAttempt,
  setPresenterPin,
  subscribePresenterPinConfig,
  verifyPresenterPin,
} from '../utils/presenterPin';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Monitor,
  Presentation,
  Smartphone,
  Sliders,
  Edit3,
  BookOpen,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
  Copy,
  Check,
  CalendarCheck,
  UserCheck,
} from 'lucide-react';

interface PresenterAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: ViewRole;
  onSelectRole: (role: ViewRole) => void;
  isUnlocked: boolean;
  onUnlockSuccess: () => void;
  onLock: () => void;
  onOpenGuide: () => void;
  isPublicContext?: boolean;
  mentorUser?: User | null;
  onLoginMentorGoogle?: () => Promise<void>;
  onLoginMentorRedirect?: () => Promise<void>;
}

export const PresenterAuthModal: React.FC<PresenterAuthModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  isUnlocked,
  onUnlockSuccess,
  onLock,
  onOpenGuide,
  isPublicContext = false,
  mentorUser = null,
  onLoginMentorGoogle,
  onLoginMentorRedirect,
}) => {
  const [pinConfig, setPinConfig] = useState<PresenterPinConfig | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [changePinSuccess, setChangePinSuccess] = useState(false);
  const [copiedPreviewLink, setCopiedPreviewLink] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [cooldownSec, setCooldownSec] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribePresenterPinConfig(db, (cfg) => {
      setPinConfig(cfg);
    });
    const rem = getPinCooldownRemainingMs();
    setCooldownSec(rem > 0 ? Math.ceil(rem / 1000) : 0);
    return () => unsub();
  }, [isOpen]);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const timer = window.setInterval(() => {
      const rem = getPinCooldownRemainingMs();
      setCooldownSec(rem > 0 ? Math.ceil(rem / 1000) : 0);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownSec]);

  if (!isOpen) return null;

  const isMentorVerified = isAuthorizedMentorUser(mentorUser);
  const canClaimInitialPin = !isPublicContext || isMentorVerified;

  const markSessionUnlocked = () => {
    try {
      window.sessionStorage.setItem('partnerup_presenter_unlocked_v1', 'true');
      window.sessionStorage.setItem('partnerup_remote_unlocked_v1', 'true');
    } catch {
      // ignore storage errors
    }
    clearFailedPinAttempts();
    setCooldownSec(0);
    setErrorMsg('');
    setPinInput('');
    onUnlockSuccess();
  };

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinConfig) return;

    const remMs = getPinCooldownRemainingMs();
    if (remMs > 0) {
      const sec = Math.ceil(remMs / 1000);
      setCooldownSec(sec);
      setErrorMsg(`Terlalu banyak percobaan gagal. Tunggu ${sec} detik sebelum mencoba lagi.`);
      return;
    }

    setIsVerifying(true);
    try {
      const ok = await verifyPresenterPin(pinInput, pinConfig);
      if (ok) {
        markSessionUnlocked();
      } else {
        const res = recordFailedPinAttempt();
        if (res.locked) {
          const sec = Math.ceil(res.remainingMs / 1000);
          setCooldownSec(sec);
          setErrorMsg(`PIN salah 5 kali. Akses PIN dikunci sementara selama ${sec} detik.`);
        } else {
          setErrorMsg(
            `PIN pemateri tidak cocok. Sisa percobaan sebelum jeda keamanan: ${res.attemptsLeft} kali.`
          );
        }
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInitialPinSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canClaimInitialPin) return;
    const cleaned = newPin.trim();
    if (cleaned.length < 6 || cleaned.length > 16) {
      setErrorMsg('PIN keamanan baru wajib minimal 6 hingga 16 karakter/angka.');
      return;
    }
    if (cleaned !== confirmPin.trim()) {
      setErrorMsg('Konfirmasi PIN baru tidak cocok.');
      return;
    }
    setIsVerifying(true);
    try {
      const saved = await setPresenterPin(db, cleaned, mentorUser?.email || 'presenter_host');
      setPinConfig(saved);
      setNewPin('');
      setConfirmPin('');
      markSessionUnlocked();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan PIN keamanan ke Cloud.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newPin.trim();
    if (cleaned.length < 6 || cleaned.length > 16) {
      setErrorMsg('PIN baru wajib minimal 6 hingga 16 karakter/angka.');
      return;
    }
    if (cleaned !== confirmPin.trim()) {
      setErrorMsg('Konfirmasi PIN baru tidak cocok.');
      return;
    }
    setIsVerifying(true);
    try {
      const saved = await setPresenterPin(db, cleaned, mentorUser?.email || 'presenter_host');
      setPinConfig(saved);
      setChangePinSuccess(true);
      setErrorMsg('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => {
        setChangePinSuccess(false);
        setShowChangePin(false);
      }, 1500);
    } catch {
      setErrorMsg('Gagal menyimpan PIN baru ke Cloud Firestore.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGoogleLoginClick = async (mode: 'popup' | 'redirect') => {
    setGoogleError('');
    setIsGoogleLoading(true);
    try {
      if (mode === 'redirect' && onLoginMentorRedirect) {
        await onLoginMentorRedirect();
      } else if (onLoginMentorGoogle) {
        await onLoginMentorGoogle();
      }
    } catch (err) {
      setGoogleError(formatGoogleAuthError(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const roleOptions: {
    role: ViewRole;
    label: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      role: 'projector',
      label: 'Layar Proyektor Panggung',
      desc: 'Tampilan panggung interaktif untuk layar lebar / infokus',
      icon: <Monitor className="w-5 h-5 text-[#F28C28]" />,
      color: 'border-amber-200 hover:border-[#F28C28]',
    },
    {
      role: 'slides',
      label: 'Materi Slide Presentasi',
      desc: 'Slide kurikulum & materi aktif kelas obeeAcademy',
      icon: <Presentation className="w-5 h-5 text-blue-500" />,
      color: 'border-blue-200 hover:border-blue-500',
    },
    {
      role: 'remote',
      label: 'Remote HP Pemateri',
      desc: 'Kontrol slide, catatan pemateri, dan live cue dari HP',
      icon: <Smartphone className="w-5 h-5 text-emerald-500" />,
      color: 'border-emerald-200 hover:border-emerald-500',
    },
    {
      role: 'moderation',
      label: 'Panel Moderasi',
      desc: 'Saring dan approve jawaban worksheet serta pertanyaan Q&A',
      icon: <Sliders className="w-5 h-5 text-purple-500" />,
      color: 'border-purple-200 hover:border-purple-500',
    },
    {
      role: 'editor',
      label: 'Editor Materi & Tema Warna',
      desc: 'Edit judul, pertanyaan, dan sesuaikan palet warna brand',
      icon: <Edit3 className="w-5 h-5 text-rose-500" />,
      color: 'border-rose-200 hover:border-rose-500',
    },
    {
      role: 'preview',
      label: 'Preview Materi Panitia (Read-Only)',
      desc: 'Tampilan aman khusus panitia/EO tanpa tombol edit materi & proyektor',
      icon: <Eye className="w-5 h-5 text-teal-600" />,
      color: 'border-teal-200 hover:border-teal-500 hover:bg-teal-50/40',
    },
    {
      role: 'bursa',
      label: 'Bursa Kelas & Voting Kuota',
      desc: 'Poster materi PNG, voting topik & jadwal minimal 15 peserta',
      icon: <CalendarCheck className="w-5 h-5 text-[#F28C28]" />,
      color: 'border-amber-200 hover:border-[#F28C28]',
    },
    {
      role: 'participant',
      label: 'Simulasi HP Peserta',
      desc: 'Lihat persis apa yang sedang dilihat dan diisi oleh peserta',
      icon: <Smartphone className="w-5 h-5 text-slate-500" />,
      color: 'border-slate-200 hover:border-slate-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#1F3A5F] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              {isUnlocked ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <Lock className="w-5 h-5 text-[#F28C28]" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {isUnlocked ? 'Panel Navigasi Pemateri & Developer' : 'Keamanan Akses Pemateri'}
              </h3>
              <p className="text-xs text-white/70">
                {isUnlocked
                  ? 'Pilih peran atau tampilan yang ingin diakses'
                  : 'Area khusus pemateri dan mentor terverifikasi'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!isUnlocked ? (
            <div className="space-y-4">
              {/* Primary Verified Google Mentor Unlock */}
              <div className="rounded-xl border border-[#1F3A5F]/15 bg-[#F6F8FB] p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[#1F3A5F] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#2A9D8F]" />
                    <span>Verifikasi Akun Google Mentor</span>
                  </span>
                  {isMentorVerified && (
                    <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Terverifikasi
                    </span>
                  )}
                </div>

                {isMentorVerified ? (
                  <button
                    type="button"
                    onClick={markSessionUnlocked}
                    className="w-full py-2.5 px-4 bg-[#2A9D8F] hover:bg-[#218276] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Masuk sebagai Mentor ({mentorUser?.email})</span>
                  </button>
                ) : (
                  <>
                    <p className="text-[11px] text-[#1F3A5F]/75 leading-relaxed">
                      {mentorUser?.email
                        ? `Akun Google saat ini (${mentorUser.email}) bukan akun mentor resmi. Ganti ke akun mentor terdaftar atau gunakan PIN rahasia pemateri.`
                        : 'Masuk cepat menggunakan Akun Google Mentor resmi tanpa perlu mengetik PIN.'}
                    </p>
                    {onLoginMentorGoogle && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={isGoogleLoading}
                          onClick={() => handleGoogleLoginClick('popup')}
                          className="flex-1 py-2 px-3 bg-[#1F3A5F] hover:bg-[#162a45] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isGoogleLoading ? 'Menghubungkan...' : 'Login Google Mentor'}
                        </button>
                        {onLoginMentorRedirect && (
                          <button
                            type="button"
                            disabled={isGoogleLoading}
                            onClick={() => handleGoogleLoginClick('redirect')}
                            className="py-2 px-3 bg-white hover:bg-slate-50 text-[#1F3A5F] border border-[#1F3A5F]/20 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Mode Redirect
                          </button>
                        )}
                      </div>
                    )}
                    {googleError && (
                      <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5 leading-relaxed">
                        {googleError}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* PIN Verification OR First-Run Setup (Strictly Blocked on Unauthenticated Public Context) */}
              {pinConfig ? (
                <form onSubmit={handleUnlock} className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-[#F28C28] shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 leading-relaxed">
                      <span className="font-bold block text-sm mb-0.5 text-amber-950">
                        Akses Terlindungi PIN Rahasia
                      </span>
                      Panel ini khusus untuk pemateri & pengelola kelas. Masukkan PIN rahasia yang telah Anda atur untuk membuka kendali penuh.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Masukkan PIN Pemateri
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={pinInput}
                        onChange={(e) => {
                          setPinInput(e.target.value);
                          setErrorMsg('');
                        }}
                        placeholder="Masukkan PIN rahasia pemateri"
                        maxLength={16}
                        autoComplete="off"
                        autoFocus
                        className="w-full pl-10 pr-10 py-2.5 text-sm font-mono tracking-widest bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28] focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying || cooldownSec > 0 || !pinInput.trim()}
                    className="w-full py-2.5 px-4 bg-[#1F3A5F] hover:bg-[#162a45] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Unlock className="w-4 h-4 text-[#F28C28]" />
                    <span>
                      {cooldownSec > 0
                        ? `Tunggu ${cooldownSec} detik...`
                        : isVerifying
                        ? 'Memverifikasi...'
                        : 'Buka Kunci Akses Pemateri'}
                    </span>
                  </button>
                </form>
              ) : canClaimInitialPin ? (
                <form onSubmit={handleInitialPinSetup} className="space-y-3.5">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                    <KeyRound className="w-5 h-5 text-[#F28C28] shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 leading-relaxed">
                      <span className="font-bold block text-sm mb-0.5 text-amber-950">
                        Atur PIN Rahasia Pertama Kali
                      </span>
                      Belum ada PIN keamanan yang tersimpan di Cloud. Buat PIN rahasia pribadi Anda (minimal 6 karakter/angka) agar tidak ada PIN standar yang bisa ditebak publik.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="password"
                      value={newPin}
                      onChange={(e) => {
                        setNewPin(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="PIN Baru (min 6 karakter)"
                      maxLength={16}
                      autoComplete="new-password"
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                    />
                    <input
                      type="password"
                      value={confirmPin}
                      onChange={(e) => {
                        setConfirmPin(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="Ulangi PIN Baru"
                      maxLength={16}
                      autoComplete="new-password"
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                    />
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying || newPin.trim().length < 6}
                    className="w-full py-2.5 px-4 bg-[#F28C28] hover:bg-[#d97719] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isVerifying ? 'Menyimpan...' : 'Simpan PIN Rahasia & Buka Panel'}</span>
                  </button>
                </form>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#1F3A5F] mb-0.5">
                      PIN Pemateri Belum Diaktifkan
                    </strong>
                    Demi keamanan tampilan publik, pengaturan PIN awal tidak dapat dilakukan dari halaman publik. Silakan login menggunakan <strong>Akun Google Mentor</strong> di atas atau atur PIN dari layar proyektor utama.
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Role Switcher & Developer Tools */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900">
                    Status: Akses Pemateri Aktif
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowChangePin(!showChangePin);
                      setErrorMsg('');
                    }}
                    className="text-[11px] text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                  >
                    {pinConfig ? 'Ganti PIN' : 'Atur PIN'}
                  </button>
                  <span className="text-emerald-300">•</span>
                  <button
                    onClick={() => {
                      onLock();
                      onClose();
                    }}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    Kunci
                  </button>
                </div>
              </div>

              {/* Change PIN Form (Accordion) */}
              {showChangePin && (
                <form
                  onSubmit={handleChangePin}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-fade-in"
                >
                  <div className="text-xs font-bold text-slate-800">
                    Ubah PIN Keamanan Cloud (Minimal 6 Karakter)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="password"
                      value={newPin}
                      onChange={(e) => {
                        setNewPin(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="PIN Baru (min 6)"
                      maxLength={16}
                      autoComplete="new-password"
                      className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F28C28]"
                    />
                    <input
                      type="password"
                      value={confirmPin}
                      onChange={(e) => {
                        setConfirmPin(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="Ulangi PIN"
                      maxLength={16}
                      autoComplete="new-password"
                      className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F28C28]"
                    />
                  </div>
                  {errorMsg && (
                    <div className="text-[11px] text-rose-600 font-semibold">{errorMsg}</div>
                  )}
                  {changePinSuccess ? (
                    <div className="text-[11px] text-emerald-600 font-bold">
                      ✓ PIN baru terenkripsi & tersinkron ke semua perangkat!
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowChangePin(false)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isVerifying}
                        className="px-3 py-1 text-xs bg-[#F28C28] text-white font-bold rounded hover:bg-[#d97719] cursor-pointer disabled:opacity-50"
                      >
                        {isVerifying ? 'Menyimpan...' : 'Simpan PIN'}
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* Role Navigation Grid */}
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Pindah Tampilan & Peran
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {roleOptions.map((opt) => {
                    const isSelected = currentRole === opt.role;
                    return (
                      <button
                        key={opt.role}
                        onClick={() => {
                          onSelectRole(opt.role);
                          onClose();
                        }}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                          opt.color
                        } ${
                          isSelected
                            ? 'bg-amber-50/80 border-[#F28C28] ring-2 ring-[#F28C28]/20 shadow-xs'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                          {opt.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {opt.label}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-extrabold text-[#F28C28] bg-amber-100 px-1.5 py-0.2 rounded shrink-0">
                                Aktif
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bagikan Link Preview Panitia (Read-Only) */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-950">
                      Bagikan Materi ke Panitia (Aman / Read-Only)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white">
                    Tanpa Edit
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                  Tautan ini aman dibagikan ke panitia atau tim EO. Mereka dapat mempelajari seluruh slide, pertanyaan, dan polling tanpa tombol edit serta tidak mengganggu layar proyektor.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      const url = `${window.location.origin}/?view=preview`;
                      await navigator.clipboard.writeText(url);
                      setCopiedPreviewLink(true);
                      setTimeout(() => setCopiedPreviewLink(false), 2500);
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    {copiedPreviewLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Link Preview Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Link Preview Panitia</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRole('preview');
                      onClose();
                    }}
                    className="py-2 px-3 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Buka
                  </button>
                </div>
              </div>

              {/* Special Guide Book & Manual Duplication */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    onClose();
                    onOpenGuide();
                  }}
                  className="w-full p-3 bg-gradient-to-r from-[#1F3A5F] to-[#2B4C7E] text-white rounded-xl flex items-center justify-between hover:opacity-95 transition-opacity cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-[#F28C28]" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>Buku Panduan & Manual Duplikasi</span>
                        <span className="text-[9px] bg-[#F28C28] text-white px-1.5 py-0.2 rounded font-extrabold">
                          PDF
                        </span>
                      </div>
                      <p className="text-[10px] text-white/70">
                        Latar belakang, arsitektur engine, glosarium teknis & cara gandakan app
                      </p>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#F28C28]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

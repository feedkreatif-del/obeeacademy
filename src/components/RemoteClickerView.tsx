import React, { useState, useMemo, useCallback } from 'react';
import {
  SlideDefinition,
  WorksheetQuestion,
  LivePollConfig,
} from '../data/seminarData';
import {
  AnswerDoc,
  PollVoteDoc,
  InteractiveMode,
  SlideTransitionStyle,
  SlideDrawerMode,
} from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  Layers,
  Eye,
  QrCode,
  MessageSquare,
  BarChart3,
  Star,
  Store,
  Smartphone,
  Sparkles,
  CheckCircle2,
  FileText,
  KeyRound,
} from 'lucide-react';

interface RemoteStepDetail {
  stepNumber: number;
  label: string;
  previewText: string;
}

interface RemoteClickerViewProps {
  slides: SlideDefinition[];
  questions: WorksheetQuestion[];
  polls: LivePollConfig[];
  pollVotes: PollVoteDoc[];
  seminarTitle: string;
  activeSlideIndex: number;
  activeSlideStep: number;
  stepByStepEnabled: boolean;
  transitionStyle: SlideTransitionStyle;
  activeSlideDrawer: SlideDrawerMode;
  approvedAnswers: AnswerDoc[];
  allAnswers: AnswerDoc[];
  onUpdateSlideState: (partial: {
    activeSlide?: number;
    activeSlideStep?: number;
    stepByStepEnabled?: boolean;
    transitionStyle?: SlideTransitionStyle;
    activeSlideDrawer?: SlideDrawerMode;
    activeQuestion?: number;
    activePollId?: string;
    activeMode?: InteractiveMode;
  }) => void;
  onSyncQuestionOnly: (questionIndex: number) => void;
  onSyncPollOnly: (pollId: string) => void;
  onToggleStarAnswer: (ans: AnswerDoc) => Promise<void>;
  onApproveAnswer: (ans: AnswerDoc) => Promise<void>;
}

const DEFAULT_PIN = '2026';

export const RemoteClickerView: React.FC<RemoteClickerViewProps> = ({
  slides,
  questions,
  polls,
  pollVotes,
  seminarTitle,
  activeSlideIndex,
  activeSlideStep,
  stepByStepEnabled,
  activeSlideDrawer,
  approvedAnswers,
  allAnswers,
  onUpdateSlideState,
  onSyncQuestionOnly,
  onSyncPollOnly,
  onToggleStarAnswer,
  onApproveAnswer,
}) => {
  // PIN Security State
  const [savedPin, setSavedPin] = useState<string>(() => {
    try {
      return window.localStorage.getItem('partnerup_remote_pin_v1') || DEFAULT_PIN;
    } catch {
      return DEFAULT_PIN;
    }
  });

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return window.sessionStorage.getItem('partnerup_remote_unlocked_v1') === 'true';
    } catch {
      return false;
    }
  });

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [pinSavedToast, setPinSavedToast] = useState(false);

  // Speaker Notes synced from localStorage
  const [customNote, setCustomNote] = useState<string>(() => {
    try {
      const saved = window.localStorage.getItem('partnerup_speaker_notes_v1');
      const parsed = saved ? JSON.parse(saved) : {};
      return parsed[activeSlideIndex] || '';
    } catch {
      return '';
    }
  });

  const triggerHaptic = (pattern: number | number[] = 35) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore on unsupported devices
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === savedPin) {
      triggerHaptic([30, 50, 30]);
      setIsUnlocked(true);
      setPinError(false);
      setPinInput('');
      try {
        window.sessionStorage.setItem('partnerup_remote_unlocked_v1', 'true');
      } catch {
        // ignore
      }
    } else {
      triggerHaptic([80, 50, 80]);
      setPinError(true);
    }
  };

  const handleDigitTap = (digit: string) => {
    triggerHaptic(20);
    setPinError(false);
    const next = (pinInput + digit).slice(0, 6);
    setPinInput(next);
    if (next === savedPin) {
      triggerHaptic([30, 50, 30]);
      setIsUnlocked(true);
      setPinInput('');
      try {
        window.sessionStorage.setItem('partnerup_remote_unlocked_v1', 'true');
      } catch {
        // ignore
      }
    }
  };

  const handleLockRemote = () => {
    triggerHaptic(30);
    setIsUnlocked(false);
    try {
      window.sessionStorage.removeItem('partnerup_remote_unlocked_v1');
    } catch {
      // ignore
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newPinInput.trim().slice(0, 6);
    if (cleaned.length < 4) return;
    setSavedPin(cleaned);
    try {
      window.localStorage.setItem('partnerup_remote_pin_v1', cleaned);
    } catch {
      // ignore
    }
    setNewPinInput('');
    setShowChangePin(false);
    setPinSavedToast(true);
    setTimeout(() => setPinSavedToast(false), 2500);
  };

  const totalSlides = slides.length;
  const safeSlideIndex = Math.min(activeSlideIndex, Math.max(0, totalSlides - 1));
  const slide = slides[safeSlideIndex] || slides[0];
  const nextSlide = safeSlideIndex + 1 < totalSlides ? slides[safeSlideIndex + 1] : null;

  const linkedQuestion =
    slide?.linkedQuestionIndex !== undefined ? questions[slide.linkedQuestionIndex] : null;

  const questionAnswers =
    slide?.linkedQuestionIndex !== undefined
      ? approvedAnswers
          .filter((a) => a.q === slide.linkedQuestionIndex)
          .sort((a, b) => (a.star !== b.star ? (a.star ? -1 : 1) : b.ts - a.ts))
      : [];

  const pendingQuestionAnswers =
    slide?.linkedQuestionIndex !== undefined
      ? allAnswers.filter((a) => a.q === slide.linkedQuestionIndex && a.status === 'pending')
      : [];

  const linkedPoll = slide?.linkedPollId
    ? polls.find((p) => p.id === slide.linkedPollId)
    : undefined;

  const currentPollVotes = linkedPoll
    ? pollVotes.filter((v) => v.pollId === linkedPoll.id)
    : [];

  // Calculate step details for current slide
  const slideStepAssignments = useMemo(() => {
    if (!slide || slide.type === 'cover') {
      return {
        totalSteps: 0,
        stepDetails: [] as RemoteStepDetail[],
      };
    }

    let counter = 0;
    const stepDetails: RemoteStepDetail[] = [];

    (slide.cards || []).forEach((c, idx) => {
      const sNum = ++counter;
      stepDetails.push({
        stepNumber: sNum,
        label: `Kartu Poin #${idx + 1}`,
        previewText: `${c.title} — ${c.body}`,
      });
    });

    if (slide.comparison) {
      const leftStep = ++counter;
      stepDetails.push({
        stepNumber: leftStep,
        label: `Perbandingan Kiri (${slide.comparison.leftTitle})`,
        previewText: slide.comparison.leftBody,
      });
      const rightStep = ++counter;
      stepDetails.push({
        stepNumber: rightStep,
        label: `Perbandingan Kanan (${slide.comparison.rightTitle})`,
        previewText: slide.comparison.rightBody,
      });
    }

    if (slide.bottomBanner) {
      const bStep = ++counter;
      stepDetails.push({
        stepNumber: bStep,
        label: 'Pita Kesimpulan Bawah',
        previewText: slide.bottomBanner,
      });
    }

    const hasDictionary = slide.linkedQuestionIndex === 2 || slide.linkedQuestionIndex === 3;
    if (hasDictionary) {
      const dStep = ++counter;
      stepDetails.push({
        stepNumber: dStep,
        label:
          slide.linkedQuestionIndex === 3
            ? 'Kamus Konversi Kata -> Angka'
            : 'Daftar 3 Kata Terlarang',
        previewText:
          slide.linkedQuestionIndex === 3
            ? 'Tabel 5 Kategori UMKM (Kuliner, Fashion, Jasa, Agribisnis, Kerajinan)'
            : 'Hindari kata "Berkualitas, Murah, Terpercaya"',
      });
    }

    const hasPrompt =
      Boolean(slide.promptLines && slide.promptLines.length > 0) ||
      slide.linkedQuestionIndex !== undefined ||
      Boolean(slide.linkedPollId);
    if (hasPrompt) {
      const pStep = ++counter;
      stepDetails.push({
        stepNumber: pStep,
        label: 'Kotak Interaktif "TULIS DI SINI"',
        previewText:
          linkedQuestion?.questionText ||
          slide.promptLines?.[0] ||
          'Instruksi latihan di HP peserta',
      });
    }

    return {
      totalSteps: counter,
      stepDetails,
    };
  }, [slide, linkedQuestion]);

  const maxSteps = slideStepAssignments.totalSteps;
  const revealedStep = stepByStepEnabled
    ? Math.min(activeSlideStep ?? 0, maxSteps)
    : maxSteps;

  const currentRevealedStepInfo =
    stepByStepEnabled && revealedStep > 0
      ? slideStepAssignments.stepDetails[revealedStep - 1]
      : null;

  const nextUpcomingStepInfo =
    stepByStepEnabled && revealedStep < maxSteps
      ? slideStepAssignments.stepDetails[revealedStep]
      : null;

  const handleNextTap = useCallback(() => {
    if (stepByStepEnabled && revealedStep < maxSteps) {
      triggerHaptic(35);
      onUpdateSlideState({
        activeSlideStep: revealedStep + 1,
      });
    } else if (safeSlideIndex < totalSlides - 1) {
      triggerHaptic([30, 45, 30]);
      const nextIdx = safeSlideIndex + 1;
      const nextSlideObj = slides[nextIdx];
      onUpdateSlideState({
        activeSlide: nextIdx,
        activeSlideStep: 0,
        activeSlideDrawer: 'none',
        ...(nextSlideObj?.linkedQuestionIndex !== undefined
          ? { activeQuestion: nextSlideObj.linkedQuestionIndex, activeMode: 'worksheet' }
          : {}),
      });
    }
  }, [stepByStepEnabled, revealedStep, maxSteps, safeSlideIndex, totalSlides, slides, onUpdateSlideState]);

  const handlePrevTap = useCallback(() => {
    triggerHaptic(25);
    if (stepByStepEnabled && revealedStep > 0) {
      onUpdateSlideState({
        activeSlideStep: revealedStep - 1,
      });
    } else if (safeSlideIndex > 0) {
      const prevIdx = safeSlideIndex - 1;
      const prevSlideObj = slides[prevIdx];
      onUpdateSlideState({
        activeSlide: prevIdx,
        activeSlideStep: 0,
        activeSlideDrawer: 'none',
        ...(prevSlideObj?.linkedQuestionIndex !== undefined
          ? { activeQuestion: prevSlideObj.linkedQuestionIndex, activeMode: 'worksheet' }
          : {}),
      });
    }
  }, [stepByStepEnabled, revealedStep, safeSlideIndex, slides, onUpdateSlideState]);

  const handleRevealAll = () => {
    triggerHaptic([25, 40, 25]);
    onUpdateSlideState({
      activeSlideStep: maxSteps,
    });
  };

  const handleToggleDrawer = (drawer: SlideDrawerMode) => {
    triggerHaptic(30);
    const nextDrawer = activeSlideDrawer === drawer ? 'none' : drawer;
    if (nextDrawer === 'answers' && slide?.linkedQuestionIndex !== undefined) {
      onSyncQuestionOnly(slide.linkedQuestionIndex);
    } else if (nextDrawer === 'poll' && slide?.linkedPollId) {
      onSyncPollOnly(slide.linkedPollId);
    }
    onUpdateSlideState({ activeSlideDrawer: nextDrawer });
  };

  // PIN LOCK SCREEN
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-[#1F3A5F] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-center border-2 border-[#F28C28]">
          <div className="w-16 h-16 rounded-2xl bg-[#F28C28] text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F28C28]">
              POINTER PANGGUNG PEMATERI
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
              Masukkan PIN Remote HP
            </h1>
            <p className="text-xs sm:text-sm text-white/75">
              Mencegah peserta seminar menggeser slide secara tidak sengaja. (PIN bawaan: <strong>2026</strong>)
            </p>
          </div>

          {/* PIN Dots Display */}
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              value={pinInput}
              onChange={(e) => {
                setPinError(false);
                setPinInput(e.target.value.slice(0, 6));
              }}
              placeholder="••••"
              className="w-full text-center font-mono text-3xl tracking-[0.5em] py-3 rounded-2xl bg-white/10 border border-white/25 text-white focus:outline-none focus:border-[#F28C28]"
            />

            {pinError && (
              <p className="text-xs font-bold text-red-300">
                PIN belum sesuai. Coba masukkan {savedPin === DEFAULT_PIN ? '2026' : 'PIN Pemateri Anda'}.
              </p>
            )}

            {/* Quick Numeric Keypad for Fast One-Handed Entry */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigitTap(num)}
                  className="py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-[#F28C28] font-display text-2xl font-bold text-white transition-colors cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPinInput('')}
                className="py-3.5 rounded-2xl bg-white/5 hover:bg-white/15 text-xs font-bold text-white/70 cursor-pointer"
              >
                Hapus
              </button>
              <button
                type="button"
                onClick={() => handleDigitTap('0')}
                className="py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-[#F28C28] font-display text-2xl font-bold text-white transition-colors cursor-pointer"
              >
                0
              </button>
              <button
                type="submit"
                className="py-3.5 rounded-2xl bg-[#F28C28] hover:bg-[#d97719] text-xs font-extrabold text-white cursor-pointer"
              >
                Buka
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-3.5 sm:px-5 py-4 pb-24 space-y-4 select-none">
      {/* 1. Top Status & Security Strip */}
      <div className="bg-[#1F3A5F] text-white rounded-2xl p-4 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#2A9D8F] flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#F28C28]">
                REMOTE POINTER AKTIF
              </span>
            </div>
            <p className="text-xs font-semibold text-white/85 truncate">{seminarTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowChangePin(!showChangePin)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
            title="Ubah PIN Pengaman"
          >
            <KeyRound className="w-4 h-4" />
          </button>
          <button
            onClick={handleLockRemote}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="Kunci Remote HP"
          >
            <Unlock className="w-3.5 h-3.5 text-[#F28C28]" />
            <span>Kunci</span>
          </button>
        </div>
      </div>

      {pinSavedToast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-300 px-4 py-2.5 text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>PIN Pengaman Remote berhasil diperbarui!</span>
        </div>
      )}

      {showChangePin && (
        <form
          onSubmit={handleSaveNewPin}
          className="bg-white border border-[#1F3A5F]/20 rounded-2xl p-4 flex items-center gap-2"
        >
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={newPinInput}
            onChange={(e) => setNewPinInput(e.target.value)}
            placeholder="PIN baru (min 4 angka)"
            className="flex-1 rounded-xl border border-[#1F3A5F]/25 px-3 py-2 text-xs font-mono font-bold text-[#1F3A5F]"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-[#1F3A5F] text-white text-xs font-bold cursor-pointer"
          >
            Simpan PIN
          </button>
        </form>
      )}

      {/* 2. Current Slide & Point Status Card */}
      <div className="bg-white border-2 border-[#1F3A5F]/15 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full bg-[#1F3A5F] text-white font-mono text-xs font-bold tabular-nums">
            Slide {slide.pageNumber} / {totalSlides} · {slide.badge}
          </span>
          <span className="font-mono text-xs font-extrabold text-[#2A9D8F] tabular-nums">
            {stepByStepEnabled && maxSteps > 0
              ? `Poin: ${revealedStep} / ${maxSteps}`
              : 'Semua Poin Tampil'}
          </span>
        </div>

        <div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#1F3A5F] leading-snug">
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="text-xs sm:text-sm text-[#1F3A5F]/75 mt-1">{slide.subtitle}</p>
          )}
        </div>

        {/* Currently Revealed Point Indicator */}
        {currentRevealedStepInfo && (
          <div className="rounded-xl bg-[#FFF7EC] border border-[#F28C28]/40 p-3 space-y-0.5">
            <span className="text-[11px] font-bold text-[#F28C28] uppercase">
              Sedang Tampil di Proyektor ({currentRevealedStepInfo.label}):
            </span>
            <p className="text-xs sm:text-sm font-bold text-[#1F3A5F]">
              {currentRevealedStepInfo.previewText}
            </p>
          </div>
        )}

        {/* Next Point / Next Slide Cue Box */}
        <div className="rounded-xl bg-[#E3F5F2] border border-[#2A9D8F]/40 p-3.5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2A9D8F] block">
            BOCORAN KETUKAN JEMPOL BERIKUTNYA:
          </span>
          {nextUpcomingStepInfo ? (
            <>
              <p className="text-xs font-bold text-[#1F3A5F]">
                Muncul Poin {nextUpcomingStepInfo.stepNumber}/{maxSteps}: {nextUpcomingStepInfo.label}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#1F3A5F]/85">
                "{nextUpcomingStepInfo.previewText}"
              </p>
            </>
          ) : nextSlide ? (
            <p className="text-xs sm:text-sm font-bold text-[#1F3A5F]">
              Pindah ke Slide #{nextSlide.pageNumber}: {nextSlide.title}
            </p>
          ) : (
            <p className="text-xs font-bold text-[#1F3A5F]/70">
              Sudah berada di poin terakhir pada slide penutup.
            </p>
          )}
        </div>
      </div>

      {/* 3. GIANT ONE-HANDED THUMB CLICKER ZONE */}
      <div className="space-y-2.5">
        {/* Primary Giant NEXT Button */}
        <button
          type="button"
          onClick={handleNextTap}
          disabled={safeSlideIndex === totalSlides - 1 && revealedStep >= maxSteps}
          className="w-full min-h-[124px] rounded-3xl bg-[#F28C28] hover:bg-[#d97719] active:scale-[0.98] disabled:opacity-40 text-white p-5 shadow-lg flex flex-col items-center justify-center gap-2 transition-all cursor-pointer border-b-4 border-[#c56810]"
        >
          <div className="flex items-center gap-2 font-display text-xl sm:text-2xl font-extrabold tracking-tight">
            <span>
              {stepByStepEnabled && revealedStep < maxSteps
                ? `MUNCULKAN POIN ${revealedStep + 1} / ${maxSteps}`
                : safeSlideIndex < totalSlides - 1
                ? `LANJUT KE SLIDE #${safeSlideIndex + 2}`
                : 'SELESAI DI SLIDE TERAKHIR'}
            </span>
            <ChevronRight className="w-7 h-7 stroke-[3]" />
          </div>
          <span className="text-xs font-semibold text-white/90">
            {nextUpcomingStepInfo
              ? `Berikutnya: ${nextUpcomingStepInfo.label}`
              : nextSlide
              ? `Slide Selanjutnya: ${nextSlide.title}`
              : 'Semua poin telah ditampilkan'}
          </span>
        </button>

        {/* Secondary Thumb Row: PREV + REVEAL ALL + TOGGLE PPT ANIMATION */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={handlePrevTap}
            disabled={safeSlideIndex === 0 && revealedStep === 0}
            className="min-h-[56px] rounded-2xl bg-white border-2 border-[#1F3A5F]/20 active:bg-[#1F3A5F]/10 disabled:opacity-40 text-[#1F3A5F] font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Mundur 1x</span>
          </button>

          <button
            type="button"
            onClick={handleRevealAll}
            disabled={!stepByStepEnabled || revealedStep >= maxSteps}
            className="min-h-[56px] rounded-2xl bg-[#1F3A5F] active:bg-[#162944] disabled:opacity-40 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#F28C28]" />
            <span>Buka Semua Poin</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(25);
              onUpdateSlideState({
                stepByStepEnabled: !stepByStepEnabled,
                activeSlideStep: !stepByStepEnabled ? 0 : maxSteps,
              });
            }}
            className={`min-h-[56px] rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer border-2 ${
              stepByStepEnabled
                ? 'bg-[#FFF7EC] border-[#2A9D8F] text-[#1F3A5F]'
                : 'bg-white border-[#1F3A5F]/20 text-[#1F3A5F]/70'
            }`}
          >
            <Layers className="w-4 h-4 text-[#2A9D8F]" />
            <span>PPT: {stepByStepEnabled ? 'ON (1-per-1)' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* 4. REMOTE POP-UP OVERLAY SWITCHES FOR PROJECTOR */}
      <div className="bg-white border border-[#1F3A5F]/15 rounded-2xl p-4 space-y-3 shadow-xs">
        <p className="text-xs font-bold uppercase tracking-wider text-[#1F3A5F]/70">
          TAMPILKAN POP-UP DI LAYAR PROYEKTOR:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleToggleDrawer('qr')}
            className={`py-3 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              activeSlideDrawer === 'qr'
                ? 'bg-[#F28C28] text-white'
                : 'bg-[#FFF7EC] text-[#1F3A5F] border border-[#1F3A5F]/20'
            }`}
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span>{activeSlideDrawer === 'qr' ? 'Tutup QR Proyektor' : 'Buka QR Peserta'}</span>
          </button>

          {slide.linkedQuestionIndex !== undefined && (
            <button
              type="button"
              onClick={() => handleToggleDrawer('answers')}
              className={`py-3 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                activeSlideDrawer === 'answers'
                  ? 'bg-[#F28C28] text-white'
                  : 'bg-[#FFF7EC] text-[#1F3A5F] border border-[#1F3A5F]/20'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>
                {activeSlideDrawer === 'answers'
                  ? 'Tutup Jawaban'
                  : `Layar Jawaban (${questionAnswers.length})`}
              </span>
            </button>
          )}

          {slide.linkedPollId && (
            <button
              type="button"
              onClick={() => handleToggleDrawer('poll')}
              className={`py-3 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                activeSlideDrawer === 'poll'
                  ? 'bg-[#2A9D8F] text-white'
                  : 'bg-[#FFF7EC] text-[#1F3A5F] border border-[#1F3A5F]/20'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>
                {activeSlideDrawer === 'poll'
                  ? 'Tutup Grafik Poll'
                  : `Grafik Poll (${currentPollVotes.length})`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 5. LIVE PARTICIPANT ANSWERS MONITOR IN PRESENTER'S HAND */}
      {slide.linkedQuestionIndex !== undefined && (
        <div className="bg-white border border-[#1F3A5F]/15 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F3A5F]">
              JAWABAN PESERTA DI SLIDE INI ({questionAnswers.length})
            </span>
            {pendingQuestionAnswers.length > 0 && (
              <button
                type="button"
                onClick={async () => {
                  triggerHaptic(30);
                  for (const pAns of pendingQuestionAnswers) {
                    await onApproveAnswer(pAns);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
              >
                Setujui {pendingQuestionAnswers.length} Pending
              </button>
            )}
          </div>

          {questionAnswers.length === 0 ? (
            <p className="text-xs text-[#1F3A5F]/60 py-2">
              Belum ada jawaban peserta untuk bagian ini.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {questionAnswers.map((ans) => (
                <div
                  key={ans.id}
                  className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-2.5 ${
                    ans.star
                      ? 'bg-[#FFF7EC] border-2 border-[#F28C28]'
                      : 'bg-white border-[#1F3A5F]/15'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    {ans.businessName && (
                      <p className="font-bold text-[#2A9D8F] flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{ans.businessName}</span>
                      </p>
                    )}
                    <p className="font-bold text-[#1F3A5F] text-sm">"{ans.text}"</p>
                    {ans.subText && <p className="text-[#1F3A5F]/75">{ans.subText}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      triggerHaptic(35);
                      await onToggleStarAnswer(ans);
                      if (activeSlideDrawer !== 'answers') {
                        onUpdateSlideState({ activeSlideDrawer: 'answers' });
                      }
                    }}
                    className={`px-3 py-2 rounded-xl font-bold shrink-0 flex items-center gap-1 cursor-pointer ${
                      ans.star
                        ? 'bg-[#F28C28] text-white'
                        : 'bg-[#FFF7EC] text-[#1F3A5F] border border-[#F28C28]/40'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>{ans.star ? 'Disorot' : 'Sorot'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. SPEAKER NOTES IN HAND */}
      {(linkedQuestion || customNote) && (
        <div className="bg-white border border-[#1F3A5F]/15 rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F28C28]">
            <FileText className="w-3.5 h-3.5" />
            <span>CONTEKAN PEMATERI DI SLIDE INI</span>
          </div>
          {linkedQuestion && (
            <div className="text-xs text-[#1F3A5F] space-y-1">
              <p className="font-bold">Inti: {linkedQuestion.coreLearning}</p>
              {linkedQuestion.helperTips.map((t, i) => (
                <p key={i} className="text-[#1F3A5F]/80">
                  • {t}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. QUICK SLIDE JUMPER */}
      <div className="bg-white border border-[#1F3A5F]/15 rounded-2xl p-4 space-y-2.5 shadow-xs">
        <p className="text-xs font-bold uppercase tracking-wider text-[#1F3A5F]/70">
          LOMPAT CEPAT KE SLIDE TERTENTU:
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {slides.map((s, idx) => {
            const isCurrent = idx === safeSlideIndex;
            const hasInteractive =
              s.linkedQuestionIndex !== undefined || s.linkedPollId !== undefined;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  triggerHaptic(25);
                  onUpdateSlideState({
                    activeSlide: idx,
                    activeSlideStep: 0,
                    activeSlideDrawer: 'none',
                  });
                }}
                className={`px-3 py-2 rounded-xl border text-left shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#1F3A5F] text-white border-[#1F3A5F]'
                    : 'bg-[#FFF7EC] text-[#1F3A5F] border-[#1F3A5F]/15'
                }`}
              >
                <div className="flex items-center gap-1 text-[10px] font-mono tabular-nums opacity-80">
                  <span>#{s.pageNumber}</span>
                  {hasInteractive && <Sparkles className="w-3 h-3 text-[#F28C28]" />}
                </div>
                <p className="text-xs font-bold truncate max-w-[110px]">{s.title}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

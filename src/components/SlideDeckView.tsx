import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  SlideDefinition,
  WorksheetQuestion,
  LivePollConfig,
  RATIONAL_CONVERSION_DICTIONARY,
  FORBIDDEN_VAGUE_WORDS,
} from '../data/seminarData';
import { AnswerDoc, PollVoteDoc, InteractiveMode } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Maximize2,
  Minimize2,
  QrCode,
  Star,
  Store,
  X,
  Layers,
  Eye,
} from 'lucide-react';

type TransitionStyle = 'slide' | 'zoom' | 'fade';

interface SlideDeckViewProps {
  slides: SlideDefinition[];
  questions: WorksheetQuestion[];
  polls: LivePollConfig[];
  pollVotes: PollVoteDoc[];
  organizerName: string;
  joinUrl: string;
  activeSlideIndex: number;
  onChangeSlide: (newIndex: number) => void;
  onLaunchWorksheetQuestion: (questionIndex: number) => void;
  onLaunchPoll: (pollId: string) => void;
  onLaunchQna: () => void;
  onSyncQuestionOnly: (questionIndex: number) => void;
  onSyncPollOnly: (pollId: string) => void;
  onToggleStarAnswer: (ans: AnswerDoc) => Promise<void>;
  onApproveAnswer: (ans: AnswerDoc) => Promise<void>;
  approvedAnswers: AnswerDoc[];
  allAnswers: AnswerDoc[];
  activeMode: InteractiveMode;
}

export const SlideDeckView: React.FC<SlideDeckViewProps> = ({
  slides,
  questions,
  polls,
  pollVotes,
  organizerName,
  joinUrl,
  activeSlideIndex,
  onChangeSlide,
  onLaunchWorksheetQuestion,
  onLaunchPoll,
  onLaunchQna,
  onSyncQuestionOnly,
  onSyncPollOnly,
  onToggleStarAnswer,
  onApproveAnswer,
  approvedAnswers,
  allAnswers,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLiveDrawer, setShowLiveDrawer] = useState<'answers' | 'poll' | 'qr' | null>(null);

  // Step-by-Step PPT Reveal State & Slide Transition Style
  const [stepByStepEnabled, setStepByStepEnabled] = useState<boolean>(true);
  const [revealedStep, setRevealedStep] = useState<number>(0);
  const [transitionStyle, setTransitionStyle] = useState<TransitionStyle>('slide');
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  const totalSlides = slides.length;
  const safeSlideIndex = Math.min(activeSlideIndex, Math.max(0, totalSlides - 1));
  const slide = slides[safeSlideIndex] || slides[0];

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

  // Calculate all sequential animation steps for the current slide
  const slideStepAssignments = useMemo(() => {
    if (!slide) {
      return {
        totalSteps: 0,
        cardSteps: [] as number[],
        comparisonLeftStep: 0,
        comparisonRightStep: 0,
        bannerStep: 0,
        dictionaryStep: 0,
        promptStep: 0,
      };
    }

    if (slide.type === 'cover') {
      return {
        totalSteps: 0,
        cardSteps: [] as number[],
        comparisonLeftStep: 0,
        comparisonRightStep: 0,
        bannerStep: 0,
        dictionaryStep: 0,
        promptStep: 0,
      };
    }

    let counter = 0;
    const cardSteps = (slide.cards || []).map(() => ++counter);
    const comparisonLeftStep = slide.comparison ? ++counter : 0;
    const comparisonRightStep = slide.comparison ? ++counter : 0;
    const bannerStep = slide.bottomBanner ? ++counter : 0;
    const hasDictionary = slide.linkedQuestionIndex === 2 || slide.linkedQuestionIndex === 3;
    const dictionaryStep = hasDictionary ? ++counter : 0;
    const hasPrompt =
      Boolean(slide.promptLines && slide.promptLines.length > 0) ||
      slide.linkedQuestionIndex !== undefined ||
      Boolean(slide.linkedPollId);
    const promptStep = hasPrompt ? ++counter : 0;

    return {
      totalSteps: counter,
      cardSteps,
      comparisonLeftStep,
      comparisonRightStep,
      bannerStep,
      dictionaryStep,
      promptStep,
    };
  }, [slide]);

  const maxSteps = slideStepAssignments.totalSteps;

  // Reset revealedStep whenever active slide changes or mode toggles
  useEffect(() => {
    if (!stepByStepEnabled) {
      setRevealedStep(maxSteps);
    } else {
      setRevealedStep(0);
    }
  }, [safeSlideIndex, stepByStepEnabled, maxSteps]);

  // Step-aware Next & Previous handlers (like PowerPoint clicker)
  const handleStepNext = useCallback(() => {
    if (stepByStepEnabled && revealedStep < maxSteps) {
      setRevealedStep((prev) => prev + 1);
    } else if (safeSlideIndex < totalSlides - 1) {
      setSlideDirection(1);
      onChangeSlide(safeSlideIndex + 1);
      setShowLiveDrawer(null);
    }
  }, [stepByStepEnabled, revealedStep, maxSteps, safeSlideIndex, totalSlides, onChangeSlide]);

  const handleStepPrev = useCallback(() => {
    if (stepByStepEnabled && revealedStep > 0) {
      setRevealedStep((prev) => prev - 1);
    } else if (safeSlideIndex > 0) {
      setSlideDirection(-1);
      onChangeSlide(safeSlideIndex - 1);
      setShowLiveDrawer(null);
    }
  }, [stepByStepEnabled, revealedStep, safeSlideIndex, onChangeSlide]);

  const handleJumpToSlide = (targetIdx: number) => {
    setSlideDirection(targetIdx >= safeSlideIndex ? 1 : -1);
    onChangeSlide(targetIdx);
    setShowLiveDrawer(null);
  };

  // Helper to check if a given step number should be visible
  const isStepVisible = (stepNumber: number) => {
    if (!stepByStepEnabled || stepNumber === 0) return true;
    return revealedStep >= stepNumber;
  };

  // Native Fullscreen API sync + CSS Fixed Fallback
  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        if (stageRef.current && stageRef.current.requestFullscreen) {
          await stageRef.current.requestFullscreen();
        }
      } catch {
        // Fallback to CSS fixed fullscreen inside sandboxed iframe
      }
    } else {
      setIsFullscreen(false);
      setShowLiveDrawer(null);
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch {
        // Ignore
      }
    }
  };

  // Keyboard Navigation (Right Arrow, Space, PageDown -> Next Point/Slide | Left Arrow, PageUp -> Prev Point/Slide)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleStepNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handleStepPrev();
      } else if (e.key === 'Escape') {
        if (showLiveDrawer) {
          setShowLiveDrawer(null);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'a' || e.key === 'A') {
        // Shortcut 'A' to reveal all points on current slide immediately
        setRevealedStep(maxSteps);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStepNext, handleStepPrev, isFullscreen, showLiveDrawer, maxSteps]);

  // Slide transition motion variants using compositor-only transform & opacity
  const getSlideVariants = () => {
    if (transitionStyle === 'zoom') {
      return {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.03 },
      };
    }
    if (transitionStyle === 'fade') {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }
    // Default 'slide'
    return {
      initial: { opacity: 0, x: slideDirection * 48 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: slideDirection * -48 },
    };
  };

  const itemRevealProps = {
    initial: { opacity: 0, y: 18, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  };

  if (!slide) return null;

  return (
    <div className={isFullscreen ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'}>
      {/* Slide Controller Strip (Hidden when in Fullscreen Mode) */}
      {!isFullscreen && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white border border-[#1F3A5F]/15 rounded-xl px-5 py-3.5 shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs font-semibold text-[#1F3A5F]/70 tabular-nums">
              Slide {slide.pageNumber} / {totalSlides}
            </span>
            <span aria-hidden="true" className="text-[#1F3A5F]/30">·</span>

            {/* Toggle PPT Step-by-Step Animation */}
            <button
              type="button"
              onClick={() => setStepByStepEnabled(!stepByStepEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                stepByStepEnabled
                  ? 'bg-[#1F3A5F] text-white'
                  : 'bg-[#FFF7EC] text-[#1F3A5F] border border-[#1F3A5F]/20'
              }`}
              title="Munculkan poin materi satu per satu seperti animasi PowerPoint"
            >
              <Layers className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>Animasi Poin PPT: {stepByStepEnabled ? 'ON (Satu per Satu)' : 'OFF (Tampil Semua)'}</span>
            </button>

            {stepByStepEnabled && maxSteps > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#2A9D8F] tabular-nums">
                  Poin {revealedStep} / {maxSteps}
                </span>
                {revealedStep < maxSteps && (
                  <button
                    type="button"
                    onClick={() => setRevealedStep(maxSteps)}
                    className="text-xs font-semibold text-[#1F3A5F]/70 hover:text-[#1F3A5F] underline cursor-pointer"
                  >
                    Buka Semua Poin
                  </button>
                )}
              </div>
            )}

            <span aria-hidden="true" className="text-[#1F3A5F]/30 hidden sm:inline">·</span>

            {/* Slide Transition Effect Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-[#1F3A5F]/70">Transisi:</span>
              <select
                value={transitionStyle}
                onChange={(e) => setTransitionStyle(e.target.value as TransitionStyle)}
                className="rounded-lg border border-[#1F3A5F]/20 bg-[#FFF7EC] px-2.5 py-1 text-xs font-bold text-[#1F3A5F] cursor-pointer"
              >
                <option value="slide">Geser Halus (Slide)</option>
                <option value="zoom">Dimensi (Zoom Smooth)</option>
                <option value="fade">Pudar Lembut (Fade)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {slide.linkedQuestionIndex !== undefined && (
              <button
                onClick={() => onLaunchWorksheetQuestion(slide.linkedQuestionIndex!)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#F28C28] text-white hover:bg-[#d97719] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Layar Proyektor ({questionAnswers.length})</span>
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#1F3A5F] text-white hover:bg-[#162944] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Tampilkan Slide Layar Penuh (Tekan F)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Layar Penuh (Fullscreen)</span>
            </button>

            <div className="flex items-center gap-1.5 ml-1">
              <button
                onClick={handleStepPrev}
                disabled={safeSlideIndex === 0 && revealedStep === 0}
                className="p-2 rounded-lg border border-[#1F3A5F]/20 text-[#1F3A5F] hover:bg-[#1F3A5F]/5 disabled:opacity-40 cursor-pointer"
                title="Poin / Slide Sebelumnya (←)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleStepNext}
                disabled={safeSlideIndex === totalSlides - 1 && revealedStep >= maxSteps}
                className="px-3 py-2 rounded-lg bg-[#F28C28] text-white font-bold text-xs hover:bg-[#d97719] disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                title="Munculkan Poin Berikutnya / Slide Berikutnya (→ atau Spasi)"
              >
                <span>
                  {stepByStepEnabled && revealedStep < maxSteps
                    ? `Munculkan Poin ${revealedStep + 1}`
                    : 'Slide Berikutnya'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Slide Stage (Expands to 100vw x 100vh in Fullscreen Mode) */}
      <div
        ref={stageRef}
        className={
          isFullscreen
            ? 'fixed inset-0 z-50 bg-[#FFF7EC] flex flex-col justify-between overflow-hidden select-none'
            : 'rounded-2xl overflow-hidden border border-[#1F3A5F]/20 shadow-md bg-[#FFF7EC] min-h-[560px] flex flex-col justify-between relative select-none'
        }
      >
        {/* Animated Slide Body Wrapper */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={safeSlideIndex}
            variants={getSlideVariants()}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => {
              // Allow clicking empty canvas area to advance next point like PPT!
              const target = e.target as HTMLElement;
              if (
                target.tagName !== 'BUTTON' &&
                target.tagName !== 'A' &&
                target.tagName !== 'SELECT' &&
                !target.closest('button')
              ) {
                handleStepNext();
              }
            }}
            className="flex-1 flex flex-col justify-between cursor-pointer"
            title="Klik area kosong atau tekan Panah Kanan (→) untuk memunculkan poin berikutnya"
          >
            {slide.type === 'cover' ? (
              <div className="flex-1 bg-[#1F3A5F] text-white p-10 sm:p-20 flex flex-col justify-center">
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[#F28C28] font-bold tracking-wider text-base sm:text-xl mb-4"
                >
                  {slide.badge}
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.06 }}
                  className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight max-w-5xl mb-6"
                >
                  {slide.title}
                </motion.h1>
                {slide.subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.12 }}
                    className="text-xl sm:text-3xl text-white/85 max-w-4xl font-normal"
                  >
                    {slide.subtitle}
                  </motion.p>
                )}
              </div>
            ) : slide.type === 'closing' ? (
              <div className="flex-1 bg-[#1F3A5F] text-white p-10 sm:p-16 flex flex-col justify-between">
                <div>
                  <p className="text-[#F28C28] font-bold text-xl sm:text-3xl mb-8">{slide.title}</p>
                  <div className="space-y-6 max-w-4xl">
                    {slide.cards?.map((card, idx) => {
                      const stepNum = slideStepAssignments.cardSteps[idx];
                      if (!isStepVisible(stepNum)) return null;
                      return (
                        <motion.div
                          key={idx}
                          {...itemRevealProps}
                          className="flex items-start gap-5"
                        >
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F28C28] text-white font-display font-bold text-xl sm:text-2xl flex items-center justify-center shrink-0 tabular-nums">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="font-display text-2xl sm:text-4xl font-bold text-white">
                              {card.title.replace(/^\d+\.\s*/, '')}
                            </h3>
                            <p className="text-white/80 text-base sm:text-xl mt-1">{card.body}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
                <div className="pt-8 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xl sm:text-2xl font-medium text-white">
                      {slide.subtitle || 'Terima kasih! Tanya jawab dipersilakan.'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isFullscreen) setIsFullscreen(false);
                      onLaunchQna();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#F28C28] text-white font-bold text-sm sm:text-base hover:bg-[#d97719] transition-colors cursor-pointer"
                  >
                    Tampilkan Papan Q&A Interaktif
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Slide Header Bar */}
                <div className="bg-[#1F3A5F] text-white px-8 sm:px-12 py-5 sm:py-6 flex items-center justify-between gap-4">
                  <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                    {slide.title}
                  </h2>
                  <span className="px-5 py-2 rounded-full bg-[#F28C28] text-white text-xs sm:text-base font-bold tracking-wide shrink-0">
                    {slide.badge}
                  </span>
                </div>

                {/* Slide Body Content */}
                <div className="flex-1 p-8 sm:p-12 flex flex-col justify-between gap-6">
                  <div>
                    {slide.subtitle && (
                      <p className="text-xl sm:text-3xl font-bold text-[#1F3A5F] max-w-5xl leading-snug">
                        {slide.subtitle}
                      </p>
                    )}

                    {/* Subtle hint when waiting for first click on a step-by-step slide */}
                    {stepByStepEnabled && revealedStep === 0 && maxSteps > 0 && (
                      <div className="mt-8 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F3A5F]/5 border border-[#1F3A5F]/15 text-xs sm:text-sm font-semibold text-[#1F3A5F]/75">
                        <Layers className="w-4 h-4 text-[#F28C28]" />
                        <span>
                          Klik layar atau tekan tombol <strong>Panah Kanan (→) / Spasi</strong> untuk menampilkan poin pertama (1 dari {maxSteps})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Agenda Steps Layout */}
                  {slide.type === 'agenda' && slide.cards && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
                      {slide.cards.map((item, idx) => {
                        const stepNum = slideStepAssignments.cardSteps[idx];
                        if (!isStepVisible(stepNum)) return null;
                        return (
                          <motion.div
                            key={idx}
                            {...itemRevealProps}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (idx < questions.length) {
                                if (isFullscreen) {
                                  onSyncQuestionOnly(idx);
                                  setShowLiveDrawer('answers');
                                } else {
                                  onLaunchWorksheetQuestion(idx);
                                }
                              }
                            }}
                            className="flex items-center gap-4 p-4 sm:p-5 rounded-xl bg-white border border-[#1F3A5F]/15 hover:border-[#F28C28] transition-colors cursor-pointer group"
                          >
                            <div
                              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full text-white font-display font-bold text-lg sm:text-xl flex items-center justify-center shrink-0 tabular-nums ${
                                item.accent === 'orange' ? 'bg-[#F28C28]' : 'bg-[#2A9D8F]'
                              }`}
                            >
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-lg sm:text-xl text-[#1F3A5F] group-hover:text-[#F28C28] transition-colors">
                                {item.title.replace(/^\d+\.\s*/, '')}
                              </p>
                              <p className="text-sm sm:text-base text-[#1F3A5F]/70">{item.body}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Concept horizontal rows (ARTINYA / CONTOHNYA / GAMPANG DIINGAT) */}
                  {slide.type === 'concept' &&
                    slide.cards &&
                    slide.cards[0]?.title === 'ARTINYA' && (
                      <div className="space-y-4 my-auto">
                        {slide.cards.map((card, i) => {
                          const stepNum = slideStepAssignments.cardSteps[i];
                          if (!isStepVisible(stepNum)) return null;
                          return (
                            <motion.div
                              key={i}
                              {...itemRevealProps}
                              className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch"
                            >
                              <div
                                className={`md:col-span-3 rounded-xl p-5 flex items-center justify-center text-white font-display font-bold text-lg sm:text-xl text-center ${
                                  card.accent === 'orange' ? 'bg-[#F28C28]' : 'bg-[#2A9D8F]'
                                }`}
                              >
                                {card.title}
                              </div>
                              <div
                                className={`md:col-span-9 rounded-xl bg-white p-6 flex items-center text-lg sm:text-2xl text-[#1F3A5F] border ${
                                  card.accent === 'orange' ? 'border-[#F28C28]' : 'border-[#2A9D8F]'
                                }`}
                              >
                                {card.body}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                  {/* Standard Multi-Column Cards */}
                  {slide.cards &&
                    slide.type !== 'agenda' &&
                    slide.cards[0]?.title !== 'ARTINYA' && (
                      <div
                        className={`grid grid-cols-1 gap-4 ${
                          slide.cards.length === 5
                            ? ' sm:grid-cols-2 lg:grid-cols-5'
                            : slide.cards.length === 4
                            ? ' sm:grid-cols-2 lg:grid-cols-4'
                            : ' md:grid-cols-3'
                        }`}
                      >
                        {slide.cards.map((card, i) => {
                          const stepNum = slideStepAssignments.cardSteps[i];
                          if (!isStepVisible(stepNum)) return null;
                          return (
                            <motion.div
                              key={i}
                              {...itemRevealProps}
                              className={`rounded-xl bg-white p-5 sm:p-6 border flex flex-col justify-between ${
                                card.accent === 'orange' ? 'border-[#F28C28]' : 'border-[#2A9D8F]'
                              }`}
                            >
                              <div>
                                <div
                                  className={`w-10 h-1.5 rounded-full mb-3 ${
                                    card.accent === 'orange' ? 'bg-[#F28C28]' : 'bg-[#2A9D8F]'
                                  }`}
                                />
                                <h3 className="font-display text-lg sm:text-2xl font-bold text-[#1F3A5F] mb-2">
                                  {card.title}
                                </h3>
                                <p className="text-sm sm:text-lg text-[#1F3A5F]/85 leading-relaxed">
                                  {card.body}
                                </p>
                              </div>
                              {card.extra && (
                                <p className="text-sm sm:text-base font-medium text-[#1F3A5F]/75 mt-3 pt-3 border-t border-[#1F3A5F]/10">
                                  {card.extra}
                                </p>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                  {/* Comparison boxes (Left revealed first, then Right revealed on next click!) */}
                  {slide.comparison && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {isStepVisible(slideStepAssignments.comparisonLeftStep) && (
                        <motion.div
                          {...itemRevealProps}
                          className="rounded-xl p-6 sm:p-8 bg-[#FDE8E8] border border-red-200"
                        >
                          <p className="text-sm sm:text-base font-bold text-red-800 mb-2">
                            {slide.comparison.leftTitle}
                          </p>
                          <p className="text-lg sm:text-2xl font-medium text-[#1F3A5F] whitespace-pre-line">
                            {slide.comparison.leftBody}
                          </p>
                        </motion.div>
                      )}
                      {isStepVisible(slideStepAssignments.comparisonRightStep) && (
                        <motion.div
                          {...itemRevealProps}
                          className="rounded-xl p-6 sm:p-8 bg-[#E3F5F2] border border-[#2A9D8F]/40"
                        >
                          <p className="text-sm sm:text-base font-bold text-[#1d6f65] mb-2">
                            {slide.comparison.rightTitle}
                          </p>
                          <p className="text-lg sm:text-2xl font-medium text-[#1F3A5F] whitespace-pre-line">
                            {slide.comparison.rightBody}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Bottom Banner Callout */}
                  {slide.bottomBanner && isStepVisible(slideStepAssignments.bannerStep) && (
                    <motion.div
                      {...itemRevealProps}
                      className="rounded-xl bg-[#1F3A5F] text-white px-6 py-4 sm:py-5 text-center font-display text-lg sm:text-2xl font-bold"
                    >
                      {slide.bottomBanner}
                    </motion.div>
                  )}

                  {/* Kamus Konversi Kata Sifat Jadi Angka (Slide Bagian 4) */}
                  {slide.linkedQuestionIndex === 3 &&
                    isStepVisible(slideStepAssignments.dictionaryStep) && (
                      <motion.div
                        {...itemRevealProps}
                        className="rounded-xl bg-white border border-[#2A9D8F]/40 p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2A9D8F]">
                            KAMUS TERJEMAHAN: UBAH KATA KOSONG JADI BUKTI ANGKA (SEMUA JENIS UMKM)
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                          {RATIONAL_CONVERSION_DICTIONARY.map((item, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg bg-[#FFF7EC] border border-[#1F3A5F]/10 p-3 flex flex-col justify-between"
                            >
                              <div>
                                <span className="text-[11px] font-bold text-[#1F3A5F]/60">
                                  {item.category}
                                </span>
                                <p className="text-xs font-bold text-red-700 line-through mt-0.5">
                                  Jangan: {item.vagueWord}
                                </p>
                              </div>
                              <p className="text-xs font-bold text-[#2A9D8F] mt-2 pt-2 border-t border-[#1F3A5F]/10">
                                Pakai: {item.concreteProof}
                              </p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                  {/* Daftar 3 Kata Terlarang (Slide Bagian 3) */}
                  {slide.linkedQuestionIndex === 2 &&
                    isStepVisible(slideStepAssignments.dictionaryStep) && (
                      <motion.div
                        {...itemRevealProps}
                        className="rounded-xl bg-white border border-[#F28C28]/40 p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
                      >
                        {FORBIDDEN_VAGUE_WORDS.map((fw, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-[#FFF7EC] p-3 border border-[#1F3A5F]/10"
                          >
                            <p className="text-xs font-bold text-red-700">
                              Hindari Kata: {fw.vague}
                            </p>
                            <p className="text-[11px] text-[#1F3A5F]/75 mt-1">{fw.reason}</p>
                            <p className="text-xs font-bold text-[#2A9D8F] mt-1.5">
                              Ganti jadi: {fw.better}
                            </p>
                          </div>
                        ))}
                      </motion.div>
                    )}

                  {/* "TULIS DI SINI" Interactive Box */}
                  {(slide.promptLines ||
                    slide.linkedQuestionIndex !== undefined ||
                    slide.linkedPollId) &&
                    isStepVisible(slideStepAssignments.promptStep) && (
                      <motion.div
                        {...itemRevealProps}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-xl bg-[#FDE6C4]/70 border-2 border-dashed border-[#F28C28] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-default"
                      >
                        <div className="space-y-2.5">
                          <p className="text-xs sm:text-sm font-bold tracking-wider text-[#F28C28] uppercase">
                            TULIS DI SINI (TERHUBUNG KE HP PESERTA)
                          </p>
                          {slide.promptLines?.map((line, idx) => (
                            <p key={idx} className="text-base sm:text-xl font-medium text-[#1F3A5F]">
                              {line}
                            </p>
                          ))}
                          {linkedQuestion && (
                            <p className="text-xs sm:text-sm text-[#1F3A5F]/75 pt-1">
                              Pertanyaan Aktif: <strong>{linkedQuestion.questionText}</strong> — Contoh:{' '}
                              <span className="italic">{linkedQuestion.exampleAnswer}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                          {slide.linkedQuestionIndex !== undefined && (
                            <button
                              onClick={() => {
                                if (isFullscreen) {
                                  onSyncQuestionOnly(slide.linkedQuestionIndex!);
                                  setShowLiveDrawer('answers');
                                } else {
                                  onLaunchWorksheetQuestion(slide.linkedQuestionIndex!);
                                }
                              }}
                              className="px-5 py-3 rounded-xl bg-[#F28C28] text-white font-bold text-sm sm:text-base hover:bg-[#d97719] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>
                                {isFullscreen
                                  ? `Aktifkan & Tampilkan Jawaban (${questionAnswers.length})`
                                  : `Aktifkan & Lihat ${questionAnswers.length} Jawaban Peserta`}
                              </span>
                            </button>
                          )}
                          {slide.linkedPollId && (
                            <button
                              onClick={() => {
                                if (isFullscreen) {
                                  onSyncPollOnly(slide.linkedPollId!);
                                  setShowLiveDrawer('poll');
                                } else {
                                  onLaunchPoll(slide.linkedPollId!);
                                }
                              }}
                              className="px-5 py-3 rounded-xl bg-[#2A9D8F] text-white font-bold text-sm sm:text-base hover:bg-[#218276] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                            >
                              <BarChart3 className="w-4 h-4" />
                              <span>Buka Grafik Polling Live</span>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Brand Strip + Fullscreen Presentation Controls */}
        <div className="bg-[#F28C28] text-white px-6 sm:px-10 py-3 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-3">
            <span>{organizerName}</span>
            {stepByStepEnabled && maxSteps > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-black/20 font-mono text-xs tabular-nums">
                Langkah Poin: {revealedStep} / {maxSteps}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isFullscreen && (
              <>
                <button
                  onClick={() => setStepByStepEnabled(!stepByStepEnabled)}
                  className="px-3 py-1 rounded-lg bg-black/20 hover:bg-black/30 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Sakelar Animasi Poin Satu per Satu"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{stepByStepEnabled ? 'Animasi Poin: ON' : 'Animasi Poin: OFF'}</span>
                </button>

                {stepByStepEnabled && revealedStep < maxSteps && (
                  <button
                    onClick={() => setRevealedStep(maxSteps)}
                    className="px-3 py-1 rounded-lg bg-black/20 hover:bg-black/30 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Tampilkan seluruh poin di slide ini (Tekan A)"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Buka Semua</span>
                  </button>
                )}

                <button
                  onClick={() => setShowLiveDrawer(showLiveDrawer === 'qr' ? null : 'qr')}
                  className="px-3 py-1 rounded-lg bg-[#1F3A5F] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#162944]"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Peserta</span>
                </button>

                {slide.linkedQuestionIndex !== undefined && (
                  <button
                    onClick={() => {
                      onSyncQuestionOnly(slide.linkedQuestionIndex!);
                      setShowLiveDrawer(showLiveDrawer === 'answers' ? null : 'answers');
                    }}
                    className="px-3 py-1 rounded-lg bg-[#1F3A5F] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#162944]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Jawaban Masuk ({questionAnswers.length})</span>
                  </button>
                )}

                {slide.linkedPollId && (
                  <button
                    onClick={() => {
                      onSyncPollOnly(slide.linkedPollId!);
                      setShowLiveDrawer(showLiveDrawer === 'poll' ? null : 'poll');
                    }}
                    className="px-3 py-1 rounded-lg bg-[#2A9D8F] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#218276]"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Grafik Polling ({currentPollVotes.length})</span>
                  </button>
                )}

                <div className="flex items-center gap-1 bg-black/20 rounded-lg p-0.5">
                  <button
                    onClick={handleStepPrev}
                    disabled={safeSlideIndex === 0 && revealedStep === 0}
                    className="px-2 py-1 rounded hover:bg-black/20 disabled:opacity-40 cursor-pointer"
                    title="Poin / Slide Sebelumnya (←)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono px-2 tabular-nums">
                    {slide.pageNumber} / {totalSlides}
                  </span>
                  <button
                    onClick={handleStepNext}
                    disabled={safeSlideIndex === totalSlides - 1 && revealedStep >= maxSteps}
                    className="px-2 py-1 rounded hover:bg-black/20 disabled:opacity-40 cursor-pointer"
                    title="Poin / Slide Berikutnya (→ atau Spasi)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="px-3 py-1 rounded-lg bg-white text-[#1F3A5F] text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-[#FFF7EC]"
                  title="Keluar dari Layar Penuh (Esc)"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Keluar (Esc)</span>
                </button>
              </>
            )}

            {!isFullscreen && (
              <span className="font-mono tabular-nums">
                Slide {slide.pageNumber} / {totalSlides}
              </span>
            )}
          </div>
        </div>

        {/* FULLSCREEN OVERLAY DRAWERS */}
        {isFullscreen && showLiveDrawer && (
          <div
            onClick={() => setShowLiveDrawer(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-6"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FFF7EC] border-4 border-[#F28C28] rounded-3xl max-w-5xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[#1F3A5F]/15 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F28C28]">
                    LAYAR INTERAKTIF LANGSUNG DI DALAM SLIDE
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F3A5F]">
                    {showLiveDrawer === 'answers' &&
                      (linkedQuestion?.questionText || 'Jawaban Peserta UMKM')}
                    {showLiveDrawer === 'poll' && (linkedPoll?.title || 'Hasil Live Polling')}
                    {showLiveDrawer === 'qr' && 'Scan QR Code di HP Anda'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowLiveDrawer(null)}
                  className="p-2 rounded-xl bg-[#1F3A5F] text-white hover:bg-[#162944] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content: QR */}
              {showLiveDrawer === 'qr' && (
                <div className="text-center py-6 space-y-4">
                  <div className="bg-white p-6 rounded-2xl border-2 border-[#1F3A5F]/15 inline-block mx-auto">
                    <QRCodeSVG value={joinUrl} size={260} fgColor="#1F3A5F" />
                  </div>
                  <p className="font-mono text-base font-bold text-[#1F3A5F]">{joinUrl}</p>
                </div>
              )}

              {/* Drawer Content: Live Answers */}
              {showLiveDrawer === 'answers' && (
                <div className="space-y-4">
                  {pendingQuestionAnswers.length > 0 && (
                    <div className="rounded-2xl bg-amber-50 border border-amber-300 p-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-bold text-amber-900">
                        Ada {pendingQuestionAnswers.length} jawaban peserta yang masih tertahan di Mode Saringan Moderasi:
                      </p>
                      <button
                        onClick={async () => {
                          for (const pAns of pendingQuestionAnswers) {
                            await onApproveAnswer(pAns);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Setujui & Tampilkan Semua ({pendingQuestionAnswers.length})
                      </button>
                    </div>
                  )}

                  {questionAnswers.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center text-[#1F3A5F]/60 font-display text-xl font-bold">
                      Menunggu jawaban peserta masuk dari HP...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {questionAnswers.map((ans) => (
                        <div
                          key={ans.id}
                          className={`bg-white rounded-2xl p-5 border flex flex-col justify-between gap-3 ${
                            ans.star
                              ? 'border-3 border-[#F28C28] md:col-span-2'
                              : 'border-[#1F3A5F]/15'
                          }`}
                        >
                          <div className="space-y-2">
                            {ans.businessName && (
                              <div className="flex items-center gap-1.5 text-sm font-bold text-[#2A9D8F]">
                                <Store className="w-4 h-4" />
                                <span>{ans.businessName}</span>
                              </div>
                            )}
                            <p
                              className={`font-display font-bold text-[#1F3A5F] ${
                                ans.star ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
                              }`}
                            >
                              "{ans.text}"
                            </p>
                            {ans.subText && (
                              <p className="text-sm text-[#1F3A5F]/75">{ans.subText}</p>
                            )}
                          </div>
                          <div className="flex justify-end pt-2 border-t border-[#1F3A5F]/10">
                            <button
                              onClick={() => onToggleStarAnswer(ans)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                                ans.star
                                  ? 'bg-[#F28C28] text-white'
                                  : 'bg-[#FFF7EC] text-[#1F3A5F] border border-[#F28C28]/40'
                              }`}
                            >
                              <Star className="w-3.5 h-3.5" />
                              <span>{ans.star ? 'Lepas Sorot' : 'Sorot Besar'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Drawer Content: Live Poll */}
              {showLiveDrawer === 'poll' && linkedPoll && (
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <p className="font-mono text-sm font-bold text-[#2A9D8F] tabular-nums">
                    Total Suara Masuk: {currentPollVotes.length}
                  </p>
                  {linkedPoll.options.map((opt) => {
                    const count = currentPollVotes.filter((v) => v.optionId === opt.id).length;
                    const pct =
                      currentPollVotes.length > 0
                        ? Math.round((count / currentPollVotes.length) * 100)
                        : 0;
                    return (
                      <div key={opt.id} className="space-y-1.5">
                        <div className="flex justify-between text-base font-bold text-[#1F3A5F]">
                          <span>{opt.label}</span>
                          <span className="font-mono tabular-nums">
                            {count} suara ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-5 bg-[#FFF7EC] rounded-xl overflow-hidden">
                          <div
                            className="h-full bg-[#2A9D8F] transition-all duration-300"
                            style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Slide Thumbnail Strip (Hidden in Fullscreen) */}
      {!isFullscreen && (
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
          {slides.map((s, idx) => {
            const isCurrent = idx === safeSlideIndex;
            const hasInteractive =
              s.linkedQuestionIndex !== undefined || s.linkedPollId !== undefined;
            return (
              <button
                key={idx}
                onClick={() => handleJumpToSlide(idx)}
                className={`px-3 py-2 rounded-lg border text-left transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#1F3A5F] text-white border-[#1F3A5F] shadow-xs'
                    : 'bg-white text-[#1F3A5F] border-[#1F3A5F]/15 hover:border-[#F28C28]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-mono tabular-nums opacity-75">
                  <span>#{s.pageNumber}</span>
                  {hasInteractive && <Sparkles className="w-3 h-3 text-[#F28C28]" />}
                </div>
                <p className="text-xs font-semibold truncate max-w-[130px]">{s.title}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

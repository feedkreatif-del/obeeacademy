import React, { useState } from 'react';
import {
  CustomContentDoc,
} from '../types';
import {
  Presentation,
  BookOpen,
  BarChart3,
  MessageSquare,
  Lock,
  Printer,
  Copy,
  Check,
  Share2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  Store,
  Tag,
  Lightbulb,
} from 'lucide-react';
import { printSlideDeckHandout } from '../utils/handoutExport';

interface CommitteePreviewViewProps {
  customContent: CustomContentDoc;
  onOpenPresenterPanel?: () => void;
}

export const CommitteePreviewView: React.FC<CommitteePreviewViewProps> = ({
  customContent,
  onOpenPresenterPanel,
}) => {
  const { slides, questions, polls, qnaTopics, seminarTitle, organizerName, brandTheme } =
    customContent;

  const [activeTab, setActiveTab] = useState<'slides' | 'questions' | 'polls' | 'qna'>('slides');
  const [selectedSlideIdx, setSelectedSlideIdx] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const currentSlide = slides[selectedSlideIdx] || slides[0];
  const previewUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?view=preview`
    : '/?view=preview';

  const handleCopyPreviewLink = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Halo Tim Panitia PartnerUp! 👋\n\nBerikut tautan *Preview Materi Seminar (Read-Only)*:\n${previewUrl}\n\nSilakan dipelajari untuk kesiapan acara. Tautan ini aman (mode baca-saja tanpa akses edit). Terima kasih!`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#FFF7EC] text-[#1F3A5F]">
      {/* Top Banner: Protected Read-Only Notice for Committee */}
      <div className="bg-[#1F3A5F] text-white border-b border-white/10 px-4 sm:px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  Read-Only Preview
                </span>
                <span className="font-bold text-xs sm:text-sm text-white">
                  Pratinjau Materi Khusus Panitia & Tim Acara
                </span>
              </div>
              <p className="text-[11px] text-white/75 mt-0.5">
                Tampilan materi terlindungi penuh: panitia bebas membaca dan mempelajari materi tanpa tombol edit & tidak mengganggu proyektor panggung.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={handleCopyPreviewLink}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Salin link khusus pratinjau panitia"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-200">Link Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white/80" />
                  <span>Salin Link Panitia</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Bagikan link preview materi ke grup WhatsApp panitia"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share WA Panitia</span>
            </button>

            <button
              type="button"
              onClick={() => printSlideDeckHandout({ slides, seminarTitle, organizerName, brandTheme })}
              className="px-3 py-1.5 rounded-lg bg-[#2A9D8F] hover:bg-[#218276] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Cetak atau unduh dokumen materi sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>

            {onOpenPresenterPanel && (
              <button
                type="button"
                onClick={onOpenPresenterPanel}
                className="px-3 py-1.5 rounded-lg bg-[#F28C28] hover:bg-[#d97719] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Buka panel navigasi pemateri (dilindungi PIN)"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Panel Pemateri</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
        {/* Seminar Title & Navigation Tabs */}
        <div className="bg-white p-5 rounded-2xl border border-[#1F3A5F]/15 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#F28C28]">
              {organizerName}
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-[#1F3A5F] mt-0.5">
              {seminarTitle}
            </h1>
            <p className="text-xs text-[#1F3A5F]/70 mt-1">
              Panduan lengkap materi presentasi, tahapan lembar kerja, dan simulasi interaktif.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#FFF7EC] p-1.5 rounded-xl border border-[#1F3A5F]/15 shrink-0">
            <button
              onClick={() => setActiveTab('slides')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'slides'
                  ? 'bg-[#1F3A5F] text-white shadow-xs'
                  : 'text-[#1F3A5F]/75 hover:bg-white'
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>17 Slide Presentasi</span>
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'questions'
                  ? 'bg-[#1F3A5F] text-white shadow-xs'
                  : 'text-[#1F3A5F]/75 hover:bg-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>7 Pertanyaan Materi</span>
            </button>

            <button
              onClick={() => setActiveTab('polls')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'polls'
                  ? 'bg-[#1F3A5F] text-white shadow-xs'
                  : 'text-[#1F3A5F]/75 hover:bg-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Live Polling ({polls.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('qna')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'qna'
                  ? 'bg-[#1F3A5F] text-white shadow-xs'
                  : 'text-[#1F3A5F]/75 hover:bg-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Topik Q&A ({qnaTopics.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: 17 SLIDES PRESENTASI */}
        {activeTab === 'slides' && (
          <div className="space-y-6">
            {/* Slide Navigation Controls */}
            <div className="bg-white p-4 rounded-2xl border border-[#1F3A5F]/15 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={selectedSlideIdx === 0}
                  onClick={() => setSelectedSlideIdx((prev) => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 rounded-lg border border-[#1F3A5F]/20 bg-white hover:bg-[#FFF7EC] disabled:opacity-30 text-[#1F3A5F] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <span className="font-mono text-xs font-bold text-[#1F3A5F] px-2">
                  Slide {selectedSlideIdx + 1} dari {slides.length}
                </span>

                <button
                  type="button"
                  disabled={selectedSlideIdx === slides.length - 1}
                  onClick={() => setSelectedSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))}
                  className="px-3 py-1.5 rounded-lg border border-[#1F3A5F]/20 bg-white hover:bg-[#FFF7EC] disabled:opacity-30 text-[#1F3A5F] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Connected interactive note */}
              <div className="flex items-center gap-2 text-xs">
                {currentSlide.linkedQuestionIndex !== undefined && (
                  <span className="px-2.5 py-1 rounded-md bg-[#F28C28]/15 border border-[#F28C28]/30 text-[#F28C28] font-bold">
                    Terhubung Pertanyaan #{currentSlide.linkedQuestionIndex + 1}
                  </span>
                )}
                {currentSlide.linkedPollId && (
                  <span className="px-2.5 py-1 rounded-md bg-[#2A9D8F]/15 border border-[#2A9D8F]/30 text-[#2A9D8F] font-bold">
                    Terhubung Live Polling
                  </span>
                )}
                {currentSlide.type === 'concept' && (
                  <span className="px-2.5 py-1 rounded-md bg-[#1F3A5F]/15 border border-[#1F3A5F]/30 text-[#1F3A5F] font-bold">
                    Konsep Utama
                  </span>
                )}
              </div>
            </div>

            {/* Slide Stage Preview */}
            <div className="bg-gradient-to-br from-[#1F3A5F] to-[#162944] text-white p-6 sm:p-10 rounded-3xl shadow-xl border-2 border-[#1F3A5F]/20 relative overflow-hidden min-h-[460px] flex flex-col justify-between">
              {/* Slide Number Watermark */}
              <div className="absolute top-4 right-6 font-mono text-6xl sm:text-8xl font-black text-white/5 pointer-events-none select-none">
                {String(selectedSlideIdx + 1).padStart(2, '0')}
              </div>

              {/* Slide Header */}
              <div className="relative z-10 space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F28C28] text-white font-mono text-xs font-bold tracking-wider">
                    SLIDE {selectedSlideIdx + 1} / {slides.length}
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="text-xs text-white/70 font-semibold">{currentSlide.subtitle}</span>
                </div>
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  {currentSlide.title}
                </h2>
              </div>

              {/* Slide Content: Cards, Comparison, Prompts, and Images */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                {/* Left/Main Column: Content Cards or Prompts */}
                <div className="space-y-3">
                  {/* Cards */}
                  {currentSlide.cards && currentSlide.cards.length > 0 && (
                    <div className="grid grid-cols-1 gap-2.5">
                      {currentSlide.cards.map((card, cIdx) => (
                        <div
                          key={cIdx}
                          className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15 space-y-1"
                        >
                          <p className="font-bold text-xs sm:text-sm text-[#F28C28]">{card.title}</p>
                          <p className="text-xs text-white/90 leading-relaxed">{card.body}</p>
                          {card.extra && (
                            <p className="text-[11px] text-white/60 italic pt-0.5">{card.extra}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comparison Box */}
                  {currentSlide.comparison && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div className="bg-red-950/40 border border-red-400/30 p-3 rounded-xl space-y-1">
                        <p className="font-bold text-xs text-red-300">
                          {currentSlide.comparison.leftTitle}
                        </p>
                        <p className="text-xs text-white/80 leading-relaxed">
                          {currentSlide.comparison.leftBody}
                        </p>
                      </div>
                      <div className="bg-emerald-950/40 border border-emerald-400/30 p-3 rounded-xl space-y-1">
                        <p className="font-bold text-xs text-emerald-300">
                          {currentSlide.comparison.rightTitle}
                        </p>
                        <p className="text-xs text-white/90 leading-relaxed">
                          {currentSlide.comparison.rightBody}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Prompt Lines */}
                  {currentSlide.promptLines && currentSlide.promptLines.length > 0 && (
                    <div className="space-y-2 bg-white/10 p-3.5 rounded-xl border border-white/15">
                      <p className="text-xs font-bold text-white/80 uppercase tracking-wider">
                        Aktivitas Latihan Peserta:
                      </p>
                      {currentSlide.promptLines.map((line, lIdx) => (
                        <p key={lIdx} className="text-xs text-white/90 font-medium">
                          • {line}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Bottom Banner if present */}
                  {currentSlide.bottomBanner && (
                    <div className="bg-amber-400/20 border border-amber-400/40 p-3 rounded-xl">
                      <p className="text-xs font-bold text-amber-200">
                        {currentSlide.bottomBanner}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column: Illustration / Photo or Speaker Guidance Note */}
                <div className="space-y-3">
                  {currentSlide.imageUrl ? (
                    <div className="flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10 p-4">
                      <img
                        src={currentSlide.imageUrl}
                        alt={currentSlide.title}
                        className="max-h-60 object-contain rounded-xl shadow-lg border border-white/20"
                      />
                      {currentSlide.imageCaption && (
                        <p className="text-[11px] text-white/60 text-center mt-2 italic">
                          {currentSlide.imageCaption}
                        </p>
                      )}
                    </div>
                  ) : null}

                  {currentSlide.speakerNotes && (
                    <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#2A9D8F]">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Catatan Alur Pemateri:</span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">
                        {currentSlide.speakerNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Slide Footer Info for Committee */}
              <div className="relative z-10 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between text-xs text-white/70 gap-2">
                <span className="font-medium">
                  Seminar PartnerUp UMKM • Obeecreatives
                </span>
                <span className="italic text-white/50">
                  Mode Pratinjau Mandiri Panitia (Tidak Mempengaruhi Layar Proyektor)
                </span>
              </div>
            </div>

            {/* Thumbnail Strip: Jump to Any Slide */}
            <div className="bg-white p-4 rounded-2xl border border-[#1F3A5F]/15 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F3A5F]">
                  Daftar 17 Slide Presentasi (Klik untuk Loncat):
                </span>
                <span className="text-xs text-[#1F3A5F]/60 font-mono">
                  {selectedSlideIdx + 1} / {slides.length}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-1">
                {slides.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedSlideIdx(idx)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      selectedSlideIdx === idx
                        ? 'bg-[#1F3A5F] text-white border-[#1F3A5F] shadow-sm ring-2 ring-[#F28C28]/40'
                        : 'bg-[#FFF7EC]/70 hover:bg-[#FFF7EC] text-[#1F3A5F] border-[#1F3A5F]/15'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="font-bold">SLIDE {idx + 1}</span>
                      {s.linkedQuestionIndex !== undefined && (
                        <span className="px-1 rounded bg-[#F28C28] text-white font-bold">P{s.linkedQuestionIndex + 1}</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold line-clamp-2 leading-tight">
                      {s.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 7 PERTANYAAN LEMBAR KERJA */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-[#1F3A5F]/15 shadow-xs">
              <h2 className="font-display text-lg font-bold text-[#1F3A5F] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#F28C28]" />
                <span>Susunan 7 Tahapan Lembar Kerja Value Proposition UMKM</span>
              </h2>
              <p className="text-xs text-[#1F3A5F]/75 mt-1 leading-relaxed">
                Di bawah ini adalah 7 pertanyaan bertahap yang akan dijawab oleh peserta di HP mereka. Panitia dapat membaca tujuan tiap tahapan dan contoh jawaban yang diharapkan.
              </p>
            </div>

            <div className="space-y-3.5">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-[#1F3A5F]/15 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1F3A5F]/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-[#1F3A5F] text-white font-mono text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#F28C28]">
                          Tahap {q.sectionNumber}: {q.sectionTitle}
                        </span>
                        <h3 className="font-display font-bold text-base text-[#1F3A5F]">
                          {q.questionText}
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#FFF7EC] border border-[#1F3A5F]/15 text-[#1F3A5F]">
                      Slide Terhubung: #{q.linkedSlideIndex + 1}
                    </span>
                  </div>

                  {q.coreLearning && (
                    <p className="text-xs text-[#1F3A5F]/85 leading-relaxed bg-[#FFF7EC]/60 p-3 rounded-xl border border-[#1F3A5F]/10">
                      💡 <strong>Konsep Pembelajaran:</strong> {q.coreLearning}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Guidance / Helper Tips */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <p className="font-bold text-[#1F3A5F] flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-[#2A9D8F]" />
                        <span>Panduan & Kriteria Jawaban:</span>
                      </p>
                      <ul className="space-y-1 text-slate-700">
                        {q.helperTips.map((tip, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-1.5">
                            <span className="text-[#2A9D8F] font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                      {q.secondaryPrompt && (
                        <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 mt-2">
                          Kolom input tambahan: <em>"{q.secondaryPrompt}"</em>
                        </p>
                      )}
                    </div>

                    {/* Sample Answers */}
                    <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                      <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Contoh Jawaban Ideal UMKM:</span>
                      </p>
                      {q.exampleBusiness && (
                        <p className="text-[11px] font-semibold text-emerald-800">
                          Kasus: {q.exampleBusiness}
                        </p>
                      )}
                      <p className="p-2.5 rounded-lg bg-white border border-emerald-300 text-emerald-950 font-medium leading-relaxed">
                        "{q.exampleAnswer}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LIVE POLLING */}
        {activeTab === 'polls' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-[#1F3A5F]/15 shadow-xs">
              <h2 className="font-display text-lg font-bold text-[#1F3A5F] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#2A9D8F]" />
                <span>Daftar Sesi Live Polling & Voting Interaktif</span>
              </h2>
              <p className="text-xs text-[#1F3A5F]/75 mt-1">
                Polling akan diluncurkan oleh pemateri di sela-sela paparan slide untuk menguji pemahaman peserta UMKM.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {polls.map((poll, pIdx) => (
                <div
                  key={poll.id}
                  className="bg-white p-5 rounded-2xl border border-[#1F3A5F]/15 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#1F3A5F]/10 pb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2A9D8F]">
                      Polling #{pIdx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-[#1F3A5F]/60">
                      ID: {poll.id}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-[#1F3A5F]">
                    {poll.title}
                  </h3>
                  <p className="text-xs text-[#1F3A5F]/80">
                    {poll.subtitle}
                  </p>

                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-bold text-[#1F3A5F]/70 uppercase tracking-wider">
                      Pilihan Jawaban Peserta:
                    </p>
                    {poll.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="p-2.5 rounded-xl bg-[#FFF7EC] border border-[#1F3A5F]/15 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-medium text-[#1F3A5F]">{opt.label}</span>
                          {opt.subtitle && (
                            <p className="text-[11px] text-[#1F3A5F]/60">{opt.subtitle}</p>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          opt.category === 'rational'
                            ? 'bg-[#2A9D8F] text-white'
                            : 'bg-[#F28C28] text-white'
                        }`}>
                          {opt.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Q&A TOPICS */}
        {activeTab === 'qna' && (
          <div className="bg-white p-5 rounded-2xl border border-[#1F3A5F]/15 shadow-xs space-y-4">
            <div className="border-b border-[#1F3A5F]/10 pb-3">
              <h2 className="font-display text-lg font-bold text-[#1F3A5F] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#F28C28]" />
                <span>Kategori Sesi Tanya Jawab (Q&A Anonim & Upvoting)</span>
              </h2>
              <p className="text-xs text-[#1F3A5F]/75 mt-1">
                Peserta dapat mengajukan pertanyaan anonim atau atas nama usaha UMKM mereka. Panitia dapat membantu menyaring pertanyaan via Dasbor Moderasi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {qnaTopics.map((topic, tIdx) => (
                <div
                  key={tIdx}
                  className="p-4 rounded-xl bg-[#FFF7EC] border border-[#1F3A5F]/15 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F28C28]/20 text-[#F28C28] font-bold text-xs flex items-center justify-center shrink-0">
                    #{tIdx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#1F3A5F]">{topic}</p>
                    <p className="text-[11px] text-[#1F3A5F]/60">Kategori Pertanyaan Seminar</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

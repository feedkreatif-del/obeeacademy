import React from 'react';
import { SlideDefinition, WorksheetQuestion } from '../data/seminarData';
import { AnswerDoc, InteractiveMode } from '../types';
import { ChevronLeft, ChevronRight, MessageSquare, BarChart3, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface SlideDeckViewProps {
  slides: SlideDefinition[];
  questions: WorksheetQuestion[];
  organizerName: string;
  activeSlideIndex: number;
  onChangeSlide: (newIndex: number) => void;
  onLaunchWorksheetQuestion: (questionIndex: number) => void;
  onLaunchPoll: (pollId: string) => void;
  onLaunchQna: () => void;
  approvedAnswers: AnswerDoc[];
  activeMode: InteractiveMode;
}

export const SlideDeckView: React.FC<SlideDeckViewProps> = ({
  slides,
  questions,
  organizerName,
  activeSlideIndex,
  onChangeSlide,
  onLaunchWorksheetQuestion,
  onLaunchPoll,
  onLaunchQna,
  approvedAnswers,
}) => {
  const slide = slides[activeSlideIndex] || slides[0];
  const totalSlides = slides.length;

  const linkedQuestion =
    slide?.linkedQuestionIndex !== undefined ? questions[slide.linkedQuestionIndex] : null;

  const questionAnswers =
    slide?.linkedQuestionIndex !== undefined
      ? approvedAnswers.filter((a) => a.q === slide.linkedQuestionIndex)
      : [];

  if (!slide) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Slide Controller Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white border border-[#1F3A5F]/15 rounded-xl px-5 py-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold text-[#1F3A5F]/70 tabular-nums">
            Halaman {slide.pageNumber} dari {totalSlides}
          </span>
          <span aria-hidden="true" className="text-[#1F3A5F]/30">·</span>
          <span className="text-sm font-semibold text-[#1F3A5F]">{slide.badge}</span>
          <span aria-hidden="true" className="text-[#1F3A5F]/30">·</span>
          <span className="text-sm text-[#1F3A5F]/80 hidden sm:inline">{slide.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {slide.linkedQuestionIndex !== undefined && (
            <button
              onClick={() => onLaunchWorksheetQuestion(slide.linkedQuestionIndex!)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#F28C28] text-white hover:bg-[#d97719] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Buka Pertanyaan #{slide.linkedQuestionIndex + 1} di HP Peserta ({questionAnswers.length} Jawaban)
            </button>
          )}
          {slide.linkedPollId && (
            <button
              onClick={() => onLaunchPoll(slide.linkedPollId!)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#2A9D8F] text-white hover:bg-[#218276] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Aktifkan Live Polling Ini
            </button>
          )}
          {slide.type === 'closing' && (
            <button
              onClick={onLaunchQna}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#F28C28] text-white hover:bg-[#d97719] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Buka Sesi Q&A Voting di Layar Utama
            </button>
          )}

          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => onChangeSlide(Math.max(0, activeSlideIndex - 1))}
              disabled={activeSlideIndex === 0}
              className="p-2 rounded-lg border border-[#1F3A5F]/20 text-[#1F3A5F] hover:bg-[#1F3A5F]/5 disabled:opacity-40 cursor-pointer"
              title="Slide Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChangeSlide(Math.min(totalSlides - 1, activeSlideIndex + 1))}
              disabled={activeSlideIndex === totalSlides - 1}
              className="p-2 rounded-lg border border-[#1F3A5F]/20 text-[#1F3A5F] hover:bg-[#1F3A5F]/5 disabled:opacity-40 cursor-pointer"
              title="Slide Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Stage (16:9 Projector Presentation Canvas) */}
      <div className="rounded-2xl overflow-hidden border border-[#1F3A5F]/20 shadow-md bg-[#FFF7EC] min-h-[540px] flex flex-col justify-between">
        {slide.type === 'cover' ? (
          <div className="flex-1 bg-[#1F3A5F] text-white p-10 sm:p-16 flex flex-col justify-center">
            <p className="text-[#F28C28] font-bold tracking-wider text-base sm:text-lg mb-4">
              {slide.badge}
            </p>
            <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight leading-tight max-w-4xl mb-6">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="text-xl sm:text-2xl text-white/85 max-w-3xl font-normal">
                {slide.subtitle}
              </p>
            )}
          </div>
        ) : slide.type === 'closing' ? (
          <div className="flex-1 bg-[#1F3A5F] text-white p-10 sm:p-14 flex flex-col justify-between">
            <div>
              <p className="text-[#F28C28] font-bold text-xl sm:text-2xl mb-8">{slide.title}</p>
              <div className="space-y-6 max-w-3xl">
                {slide.cards?.map((card, idx) => (
                  <div key={idx} className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-full bg-[#F28C28] text-white font-display font-bold text-xl flex items-center justify-center shrink-0 tabular-nums">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                        {card.title.replace(/^\d+\.\s*/, '')}
                      </h3>
                      <p className="text-white/80 text-base sm:text-lg mt-1">{card.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-8 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xl font-medium text-white">
                  {slide.subtitle || 'Terima kasih! Tanya jawab dipersilakan.'}
                </p>
              </div>
              <button
                onClick={onLaunchQna}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#F28C28] text-white font-bold text-sm hover:bg-[#d97719] transition-colors cursor-pointer"
              >
                Tampilkan Papan Q&A Interaktif
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Slide Header Bar */}
            <div className="bg-[#1F3A5F] text-white px-8 py-5 flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">
                {slide.title}
              </h2>
              <span className="px-5 py-2 rounded-full bg-[#F28C28] text-white text-xs sm:text-sm font-bold tracking-wide shrink-0">
                {slide.badge}
              </span>
            </div>

            {/* Slide Body Content */}
            <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between gap-6">
              {slide.subtitle && (
                <p className="text-xl sm:text-2xl font-bold text-[#1F3A5F] max-w-4xl leading-snug">
                  {slide.subtitle}
                </p>
              )}

              {/* Agenda Steps Layout */}
              {slide.type === 'agenda' && slide.cards && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
                  {slide.cards.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (idx < questions.length) onLaunchWorksheetQuestion(idx);
                      }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#1F3A5F]/15 hover:border-[#F28C28] transition-colors cursor-pointer group"
                    >
                      <div
                        className={`w-11 h-11 rounded-full text-white font-display font-bold text-lg flex items-center justify-center shrink-0 tabular-nums ${
                          item.accent === 'orange' ? 'bg-[#F28C28]' : 'bg-[#2A9D8F]'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg text-[#1F3A5F] group-hover:text-[#F28C28] transition-colors">
                          {item.title.replace(/^\d+\.\s*/, '')}
                        </p>
                        <p className="text-sm text-[#1F3A5F]/70">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Concept horizontal rows */}
              {slide.type === 'concept' && slide.cards && slide.cards[0]?.title === 'ARTINYA' && (
                <div className="space-y-4 my-auto">
                  {slide.cards.map((card, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                      <div
                        className={`md:col-span-3 rounded-xl p-5 flex items-center justify-center text-white font-display font-bold text-lg text-center ${
                          card.accent === 'orange' ? 'bg-[#F28C28]' : 'bg-[#2A9D8F]'
                        }`}
                      >
                        {card.title}
                      </div>
                      <div
                        className={`md:col-span-9 rounded-xl bg-white p-6 flex items-center text-lg sm:text-xl text-[#1F3A5F] border ${
                          card.accent === 'orange' ? 'border-[#F28C28]' : 'border-[#2A9D8F]'
                        }`}
                      >
                        {card.body}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Standard Multi-Column Cards */}
              {slide.cards && slide.type !== 'agenda' && slide.cards[0]?.title !== 'ARTINYA' && (
                <div
                  className={`grid grid-cols-1 gap-4 ${
                    slide.cards.length === 5
                      ? ' sm:grid-cols-2 lg:grid-cols-5'
                      : slide.cards.length === 4
                      ? ' sm:grid-cols-2 lg:grid-cols-4'
                      : ' md:grid-cols-3'
                  }`}
                >
                  {slide.cards.map((card, i) => (
                    <div
                      key={i}
                      className={`rounded-xl bg-white p-5 border flex flex-col justify-between ${
                        card.accent === 'orange' ? 'border-[#F28C28]' : 'border-[#2A9D8F]'
                      }`}
                    >
                      <div>
                        <div
                          className={`w-10 h-1.5 rounded-full mb-3 ${
                            card.accent === 'orange' ? 'bg-[#F28C28]' : 'bg-[#2A9D8F]'
                          }`}
                        />
                        <h3 className="font-display text-lg sm:text-xl font-bold text-[#1F3A5F] mb-2">
                          {card.title}
                        </h3>
                        <p className="text-sm sm:text-base text-[#1F3A5F]/85 leading-relaxed">{card.body}</p>
                      </div>
                      {card.extra && (
                        <p className="text-sm font-medium text-[#1F3A5F]/75 mt-3 pt-3 border-t border-[#1F3A5F]/10">
                          {card.extra}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Comparison boxes */}
              {slide.comparison && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="rounded-xl p-6 bg-[#FDE8E8] border border-red-200">
                    <p className="text-sm font-bold text-red-800 mb-2">{slide.comparison.leftTitle}</p>
                    <p className="text-lg sm:text-xl font-medium text-[#1F3A5F] whitespace-pre-line">
                      {slide.comparison.leftBody}
                    </p>
                  </div>
                  <div className="rounded-xl p-6 bg-[#E3F5F2] border border-[#2A9D8F]/40">
                    <p className="text-sm font-bold text-[#1d6f65] mb-2">{slide.comparison.rightTitle}</p>
                    <p className="text-lg sm:text-xl font-medium text-[#1F3A5F] whitespace-pre-line">
                      {slide.comparison.rightBody}
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Banner Callout */}
              {slide.bottomBanner && (
                <div className="rounded-xl bg-[#1F3A5F] text-white px-6 py-4 text-center font-display text-lg sm:text-xl font-bold">
                  {slide.bottomBanner}
                </div>
              )}

              {/* "TULIS DI SINI" Interactive Box */}
              {(slide.promptLines || slide.linkedQuestionIndex !== undefined || slide.linkedPollId) && (
                <div className="rounded-xl bg-[#FDE6C4]/70 border-2 border-dashed border-[#F28C28] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold tracking-wider text-[#F28C28] uppercase">
                      TULIS DI SINI (TERHUBUNG KE HP PESERTA)
                    </p>
                    {slide.promptLines?.map((line, idx) => (
                      <p key={idx} className="text-base sm:text-lg font-medium text-[#1F3A5F]">
                        {line}
                      </p>
                    ))}
                    {linkedQuestion && (
                      <p className="text-xs text-[#1F3A5F]/70 pt-1">
                        Pertanyaan Aktif: <strong>{linkedQuestion.questionText}</strong> — Contoh:{' '}
                        <span className="italic">{linkedQuestion.exampleAnswer}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    {slide.linkedQuestionIndex !== undefined && (
                      <button
                        onClick={() => onLaunchWorksheetQuestion(slide.linkedQuestionIndex!)}
                        className="px-5 py-3 rounded-xl bg-[#F28C28] text-white font-bold text-sm hover:bg-[#d97719] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Aktifkan & Lihat {questionAnswers.length} Jawaban Peserta
                      </button>
                    )}
                    {slide.linkedPollId && (
                      <button
                        onClick={() => onLaunchPoll(slide.linkedPollId!)}
                        className="px-5 py-3 rounded-xl bg-[#2A9D8F] text-white font-bold text-sm hover:bg-[#218276] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Buka Grafik Polling Live
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Bottom Brand Strip */}
        <div className="bg-[#F28C28] text-white px-8 py-3 flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span>{organizerName}</span>
          <span className="font-mono tabular-nums">Slide {slide.pageNumber} / {totalSlides}</span>
        </div>
      </div>

      {/* Quick Slide Thumbnail Strip */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
        {slides.map((s) => {
          const isCurrent = s.index === activeSlideIndex;
          const hasInteractive = s.linkedQuestionIndex !== undefined || s.linkedPollId !== undefined;
          return (
            <button
              key={s.index}
              onClick={() => onChangeSlide(s.index)}
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
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { WorksheetQuestion, LivePollConfig } from '../data/seminarData';
import { AnswerDoc, QnaDoc, PollVoteDoc, SessionStateDoc, InteractiveMode } from '../types';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  Sparkles,
  BookOpen,
  BarChart3,
  MessageSquare,
  Download,
  UserCheck,
  EyeOff,
  Store,
} from 'lucide-react';

interface ParticipantViewProps {
  questions: WorksheetQuestion[];
  polls: LivePollConfig[];
  qnaTopics: string[];
  sessionState: SessionStateDoc;
  participantId: string;
  myAnswers: AnswerDoc[];
  approvedQna: QnaDoc[];
  pollVotes: PollVoteDoc[];
  onSubmitAnswer: (qIndex: number, text: string, subText: string, businessName: string) => Promise<void>;
  onSubmitQna: (text: string, authorName: string, isAnonymous: boolean, topicTag: string) => Promise<void>;
  onUpvoteQna: (qnaId: string) => Promise<void>;
  onSubmitPollVote: (pollId: string, optionId: string, customWord: string, businessName: string) => Promise<void>;
}

export const ParticipantView: React.FC<ParticipantViewProps> = ({
  questions,
  polls,
  qnaTopics,
  sessionState,
  participantId,
  myAnswers,
  approvedQna,
  pollVotes,
  onSubmitAnswer,
  onSubmitQna,
  onUpvoteQna,
  onSubmitPollVote,
}) => {
  const [localTab, setLocalTab] = useState<InteractiveMode | 'summary'>(sessionState.activeMode);

  useEffect(() => {
    setLocalTab(sessionState.activeMode);
  }, [sessionState.activeMode, sessionState.activeQuestion, sessionState.activePollId]);

  const [businessName, setBusinessName] = useState<string>(() => {
    try {
      return window.localStorage.getItem('partnerup_umkm_name') || '';
    } catch {
      return '';
    }
  });

  const handleBusinessNameChange = (val: string) => {
    const trimmed = val.slice(0, 40);
    setBusinessName(trimmed);
    try {
      window.localStorage.setItem('partnerup_umkm_name', trimmed);
    } catch {
      // ignore
    }
  };

  const activeQIndex = Math.min(sessionState.activeQuestion, Math.max(0, questions.length - 1));
  const currentQuestion = questions[activeQIndex] || questions[0];

  const [answerText, setAnswerText] = useState('');
  const [subAnswerText, setSubAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    setAnswerText('');
    setSubAnswerText('');
    setSubmitSuccess(false);
    setSubmitError(false);
  }, [activeQIndex]);

  const getMyPreviousAnswer = (qIdx: number) => {
    const found = myAnswers.find((a) => a.q === qIdx);
    return found ? found.text : '';
  };

  const handleAutoFillPart6Formula = () => {
    const prod = getMyPreviousAnswer(0) || '[Nama Produk Andalan]';
    const buyer = getMyPreviousAnswer(1) || '[Target Pembeli Spesifik]';
    const rational = getMyPreviousAnswer(3) || '[Bukti Angka / Keunggulan]';
    const emotional = getMyPreviousAnswer(4) || '[Perasaan Pembeli]';
    const drafted = `${prod} untuk ${buyer} yang ingin ${emotional}, karena ${rational}.`.slice(0, 200);
    setAnswerText(drafted);
  };

  const handleWorksheetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || submitting) return;
    setSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(false);
    try {
      await onSubmitAnswer(
        activeQIndex,
        answerText.trim().slice(0, 200),
        subAnswerText.trim().slice(0, 180),
        businessName.trim().slice(0, 40)
      );
      setAnswerText('');
      setSubAnswerText('');
      setSubmitSuccess(true);
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Q&A Form State
  const [qnaText, setQnaText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [topicTag, setTopicTag] = useState(qnaTopics[0] || 'Umum');
  const [qnaSubmitting, setQnaSubmitting] = useState(false);
  const [qnaSuccess, setQnaSuccess] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (qnaTopics.length > 0 && !qnaTopics.includes(topicTag)) {
      setTopicTag(qnaTopics[0]);
    }
  }, [qnaTopics, topicTag]);

  const handleQnaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qnaText.trim() || qnaSubmitting) return;
    setQnaSubmitting(true);
    setQnaSuccess(false);
    try {
      const displayAuthor = isAnonymous ? 'Peserta Anonim' : businessName.trim() || 'Peserta UMKM';
      await onSubmitQna(qnaText.trim().slice(0, 240), displayAuthor, isAnonymous, topicTag);
      setQnaText('');
      setQnaSuccess(true);
    } finally {
      setQnaSubmitting(false);
    }
  };

  const handleUpvoteTap = async (id: string) => {
    if (upvotedIds[id]) return;
    setUpvotedIds((prev) => ({ ...prev, [id]: true }));
    await onUpvoteQna(id);
  };

  // Poll State
  const currentPoll = polls.find((p) => p.id === sessionState.activePollId) || polls[0];
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [customEmotionWord, setCustomEmotionWord] = useState<string>('');
  const [pollSubmitted, setPollSubmitted] = useState(false);

  const myExistingVote = currentPoll
    ? pollVotes.find((v) => v.pollId === currentPoll.id && v.participantId === participantId)
    : undefined;

  const handlePollVoteSubmit = async (optionId: string, customWord = '') => {
    if (!currentPoll) return;
    setSelectedOption(optionId);
    await onSubmitPollVote(currentPoll.id, optionId, customWord.slice(0, 35), businessName);
    setPollSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Top Mode Selector Bar for Participant */}
      <div className="bg-white border border-[#1F3A5F]/15 rounded-2xl p-2 mb-6 flex items-center justify-between gap-1 overflow-x-auto shadow-xs">
        <button
          onClick={() => setLocalTab('worksheet')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            localTab === 'worksheet'
              ? 'bg-[#1F3A5F] text-white'
              : 'text-[#1F3A5F]/75 hover:bg-[#1F3A5F]/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Lembar Kerja ({activeQIndex + 1}/{questions.length})</span>
        </button>

        <button
          onClick={() => setLocalTab('poll')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            localTab === 'poll'
              ? 'bg-[#2A9D8F] text-white'
              : 'text-[#1F3A5F]/75 hover:bg-[#1F3A5F]/5'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Polling Live</span>
        </button>

        <button
          onClick={() => setLocalTab('qna')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            localTab === 'qna'
              ? 'bg-[#F28C28] text-white'
              : 'text-[#1F3A5F]/75 hover:bg-[#1F3A5F]/5'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Tanya Anonim & Vote</span>
        </button>

        <button
          onClick={() => setLocalTab('summary')}
          className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            localTab === 'summary'
              ? 'bg-[#1F3A5F] text-white'
              : 'text-[#1F3A5F]/75 hover:bg-[#1F3A5F]/5'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Rekap Usahaku</span>
        </button>
      </div>

      {/* MODE 1: WORKSHEET */}
      {localTab === 'worksheet' && currentQuestion && (
        <div className="bg-white border border-[#1F3A5F]/15 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-[#1F3A5F]/10">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#F28C28]">
              <span>Pertanyaan {activeQIndex + 1} dari {questions.length}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#1F3A5F]">{currentQuestion.sectionTitle}</span>
            </div>
            <span className="text-xs text-[#1F3A5F]/65">{currentQuestion.coreLearning}</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F3A5F] leading-snug mb-3">
            {currentQuestion.questionText}
          </h1>

          {currentQuestion.secondaryPrompt && (
            <p className="text-base sm:text-lg text-[#1F3A5F]/80 font-medium mb-5">
              {currentQuestion.secondaryPrompt}
            </p>
          )}

          <div className="rounded-xl bg-[#FFF7EC] border border-[#F28C28]/40 p-4 mb-6">
            <p className="text-xs font-bold text-[#F28C28] uppercase tracking-wider mb-1">
              Contoh Jawaban Sederhana:
            </p>
            <p className="text-base sm:text-lg font-medium text-[#1F3A5F]">
              "{currentQuestion.exampleAnswer}"
            </p>
          </div>

          {activeQIndex === 5 && questions.length >= 6 && (
            <div className="rounded-xl bg-[#E3F5F2] border border-[#2A9D8F]/40 p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-[#1F3A5F] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#2A9D8F]" />
                  Bantuan Gabungkan Kalimat dari Jawabanmu Sebelumnya
                </p>
                <button
                  type="button"
                  onClick={handleAutoFillPart6Formula}
                  className="px-3 py-1.5 rounded-lg bg-[#2A9D8F] text-white text-xs font-bold hover:bg-[#218276] transition-colors cursor-pointer"
                >
                  Susun Otomatis ke Kolom
                </button>
              </div>
              <div className="text-xs text-[#1F3A5F]/80 space-y-1">
                <p>
                  <strong>Bagian 1:</strong> {getMyPreviousAnswer(0) || 'Belum diisi'}
                </p>
                <p>
                  <strong>Bagian 2:</strong> {getMyPreviousAnswer(1) || 'Belum diisi'}
                </p>
                <p>
                  <strong>Bagian 4:</strong> {getMyPreviousAnswer(3) || 'Belum diisi'}
                </p>
                <p>
                  <strong>Bagian 5:</strong> {getMyPreviousAnswer(4) || 'Belum diisi'}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleWorksheetSubmit} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="answer-textarea" className="block text-base font-bold text-[#1F3A5F]">
                  Jawabanmu
                </label>
                <span className="font-mono text-xs text-[#1F3A5F]/60 tabular-nums">
                  {answerText.length} / 200 karakter
                </span>
              </div>
              <textarea
                id="answer-textarea"
                rows={3}
                maxLength={200}
                required
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Ketik jawaban singkat di sini (1 kalimat sudah cukup)..."
                className="w-full rounded-xl border-2 border-[#1F3A5F]/25 bg-[#FFF7EC]/50 px-4 py-3.5 text-lg text-[#1F3A5F] placeholder:text-[#1F3A5F]/40 focus:border-[#F28C28] focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="sub-answer-input" className="block text-sm font-semibold text-[#1F3A5F]/85 mb-1.5">
                Keterangan Tambahan (Opsional)
              </label>
              <input
                id="sub-answer-input"
                type="text"
                maxLength={180}
                value={subAnswerText}
                onChange={(e) => setSubAnswerText(e.target.value)}
                placeholder={currentQuestion.secondaryPrompt || 'Tambahan penjelasan singkat...'}
                className="w-full rounded-xl border border-[#1F3A5F]/20 bg-white px-4 py-3 text-base text-[#1F3A5F] placeholder:text-[#1F3A5F]/40 focus:border-[#F28C28] focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="business-name-input" className="block text-base font-bold text-[#1F3A5F] flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-[#F28C28]" />
                  Nama Usaha (Opsional)
                </label>
                <span className="font-mono text-xs text-[#1F3A5F]/60 tabular-nums">
                  {businessName.length} / 40
                </span>
              </div>
              <input
                id="business-name-input"
                type="text"
                maxLength={40}
                value={businessName}
                onChange={(e) => handleBusinessNameChange(e.target.value)}
                placeholder="Contoh: Keripik Apel Bu Sari (Jangan tulis nomor HP)"
                className="w-full rounded-xl border border-[#1F3A5F]/25 bg-white px-4 py-3.5 text-base sm:text-lg text-[#1F3A5F] placeholder:text-[#1F3A5F]/40 focus:border-[#F28C28] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !answerText.trim()}
              className="w-full min-h-[56px] rounded-xl bg-[#F28C28] hover:bg-[#d97719] disabled:opacity-50 text-white font-display font-bold text-lg sm:text-xl flex items-center justify-center gap-2.5 shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-5 h-5" />
              <span>{submitting ? 'Mengirim...' : 'Kirim jawaban'}</span>
            </button>

            {submitSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 flex items-center gap-3 text-emerald-900">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-base">
                    Terkirim! Jawabanmu akan muncul di layar.
                  </p>
                  {sessionState.moderationEnabled && (
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Jawaban sedang diperiksa panitia sebentar sebelum tampil di proyektor.
                    </p>
                  )}
                </div>
              </div>
            )}

            {submitError && (
              <div className="rounded-xl bg-red-50 border border-red-300 p-4 flex items-center gap-3 text-red-900">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                <p className="font-bold text-base">
                  Gagal mengirim. Cek sinyal atau coba lagi.
                </p>
              </div>
            )}
          </form>
        </div>
      )}

      {/* MODE 2: LIVE POLLING & WORD CLOUD */}
      {localTab === 'poll' && currentPoll && (
        <div className="bg-white border border-[#1F3A5F]/15 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2A9D8F]">
              Polling Interaktif Real-Time
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1F3A5F] mt-1">
              {currentPoll.title}
            </h2>
            <p className="text-base text-[#1F3A5F]/80 mt-2">{currentPoll.subtitle}</p>
          </div>

          <div className="space-y-3">
            {currentPoll.options.map((opt) => {
              const isChosen =
                selectedOption === opt.id || myExistingVote?.optionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handlePollVoteSubmit(opt.id)}
                  className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isChosen
                      ? 'border-[#2A9D8F] bg-[#E3F5F2]'
                      : 'border-[#1F3A5F]/15 bg-[#FFF7EC]/50 hover:border-[#F28C28]'
                  }`}
                >
                  <div>
                    <p className="font-display font-bold text-lg text-[#1F3A5F]">{opt.label}</p>
                    <p className="text-sm text-[#1F3A5F]/75 mt-0.5">{opt.subtitle}</p>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isChosen ? 'bg-[#2A9D8F] text-white' : 'border border-[#1F3A5F]/30'
                    }`}
                  >
                    {isChosen && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>

          {currentPoll.type === 'wordcloud' && (
            <div className="pt-4 border-t border-[#1F3A5F]/10 space-y-3">
              <label className="block text-sm font-bold text-[#1F3A5F]">
                Atau tulis 1–2 kata singkat lain yang sesuai usahamu:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={30}
                  value={customEmotionWord}
                  onChange={(e) => setCustomEmotionWord(e.target.value)}
                  placeholder="Ketik 1-2 kata di sini..."
                  className="flex-1 rounded-xl border border-[#1F3A5F]/25 px-4 py-3 text-base"
                />
                <button
                  type="button"
                  disabled={!customEmotionWord.trim()}
                  onClick={() => {
                    handlePollVoteSubmit(customEmotionWord.trim(), customEmotionWord.trim());
                    setCustomEmotionWord('');
                  }}
                  className="px-5 py-3 rounded-xl bg-[#2A9D8F] text-white font-bold text-sm hover:bg-[#218276] disabled:opacity-50 cursor-pointer"
                >
                  Kirim Kata
                </button>
              </div>
            </div>
          )}

          {(pollSubmitted || myExistingVote) && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 flex items-center gap-3 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="font-semibold text-sm">
                Pilihanmu sudah tercatat secara live di grafik proyektor depan!
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: Q&A ANONIM & LIVE VOTING */}
      {localTab === 'qna' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#1F3A5F]/15 rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-display text-2xl font-bold text-[#1F3A5F] mb-1">
              Tanya Pemateri & Voting Pertanyaan
            </h2>
            <p className="text-sm sm:text-base text-[#1F3A5F]/75 mb-5">
              Malu bertanya langsung? Tulis pertanyaanmu secara <strong>Anonim</strong> atau klik tombol <strong>Setuju (👍)</strong> pada pertanyaan teman UMKM lain agar dibahas lebih dulu.
            </p>

            <form onSubmit={handleQnaSubmit} className="space-y-4">
              <div>
                <textarea
                  rows={3}
                  maxLength={240}
                  required
                  value={qnaText}
                  onChange={(e) => setQnaText(e.target.value)}
                  placeholder="Tulis pertanyaanmu di sini..."
                  className="w-full rounded-xl border-2 border-[#1F3A5F]/20 bg-[#FFF7EC]/50 px-4 py-3 text-base sm:text-lg text-[#1F3A5F] focus:border-[#F28C28] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 bg-[#FFF7EC] p-1.5 rounded-xl border border-[#1F3A5F]/15">
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(true)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      isAnonymous ? 'bg-[#1F3A5F] text-white' : 'text-[#1F3A5F]/70'
                    }`}
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    Tanya sebagai Anonim
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(false)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      !isAnonymous ? 'bg-[#2A9D8F] text-white' : 'text-[#1F3A5F]/70'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Tampilkan Nama Usaha
                  </button>
                </div>

                <select
                  value={topicTag}
                  onChange={(e) => setTopicTag(e.target.value)}
                  className="rounded-xl border border-[#1F3A5F]/20 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#1F3A5F]"
                >
                  {qnaTopics.map((topic, idx) => (
                    <option key={idx} value={topic}>
                      Topik: {topic}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={qnaSubmitting || !qnaText.trim()}
                className="w-full min-h-[52px] rounded-xl bg-[#F28C28] hover:bg-[#d97719] disabled:opacity-50 text-white font-display font-bold text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{qnaSubmitting ? 'Mengirim Pertanyaan...' : 'Kirim Pertanyaan'}</span>
              </button>

              {qnaSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-3.5 text-sm font-semibold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Pertanyaan terkirim! {sessionState.moderationEnabled ? 'Menunggu persetujuan moderator untuk tampil.' : 'Sudah tampil di daftar voting.'}
                  </span>
                </div>
              )}
            </form>
          </div>

          {/* Live Upvote List */}
          <div className="bg-white border border-[#1F3A5F]/15 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#1F3A5F]">
                Daftar Pertanyaan Peserta ({approvedQna.length})
              </h3>
              <span className="text-xs text-[#1F3A5F]/65">Diurutkan dari Vote Tertinggi</span>
            </div>

            {approvedQna.length === 0 ? (
              <p className="text-center py-8 text-[#1F3A5F]/60 text-sm">
                Belum ada pertanyaan yang tampil. Jadilah yang pertama bertanya!
              </p>
            ) : (
              <div className="space-y-3">
                {approvedQna.map((item) => {
                  const hasVoted = Boolean(upvotedIds[item.id]);
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                        item.star
                          ? 'bg-[#FFF7EC] border-[#F28C28] border-2'
                          : 'bg-white border-[#1F3A5F]/15'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-[#1F3A5F]/65">
                          <span className="font-semibold text-[#1F3A5F]">{item.authorName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.topicTag}</span>
                          {item.star && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-bold text-[#F28C28]">Sedang Dibahas di Layar</span>
                            </>
                          )}
                        </div>
                        <p className="text-base sm:text-lg font-medium text-[#1F3A5F] leading-snug">
                          {item.text}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUpvoteTap(item.id)}
                        disabled={hasVoted}
                        className={`min-w-[64px] min-h-[52px] px-3 py-2 rounded-xl border flex flex-col items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          hasVoted
                            ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]'
                            : 'bg-[#FFF7EC] text-[#1F3A5F] border-[#1F3A5F]/20 hover:border-[#F28C28]'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4 mb-0.5" />
                        <span className="font-mono text-sm font-bold tabular-nums">{item.upvotes}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 4: REKAP USAHAKU */}
      {localTab === 'summary' && (
        <div className="bg-white border border-[#1F3A5F]/15 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#1F3A5F]/10 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F28C28]">
              Lembar Rekap Seminar
            </span>
            <h2 className="font-display text-2xl font-bold text-[#1F3A5F] mt-1">
              Rangkuman Jawaban Usahaku
            </h2>
            <p className="text-sm text-[#1F3A5F]/75 mt-1">
              Simpan atau salin rangkuman jawabanmu dari setiap bagian materi untuk langsung diterapkan di usahamu.
            </p>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => {
              const myAns = myAnswers.find((a) => a.q === idx);
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    idx === questions.length - 2
                      ? 'bg-[#FFF7EC] border-[#F28C28] border-2'
                      : 'bg-white border-[#1F3A5F]/15'
                  }`}
                >
                  <p className="text-xs font-bold text-[#1F3A5F]/65">{q.sectionTitle}</p>
                  <p className="text-sm font-semibold text-[#1F3A5F] mt-0.5">{q.questionText}</p>
                  {myAns ? (
                    <div className="mt-2 pt-2 border-t border-[#1F3A5F]/10">
                      <p className="text-base font-bold text-[#2A9D8F]">{myAns.text}</p>
                      {myAns.subText && (
                        <p className="text-xs text-[#1F3A5F]/75 mt-0.5">{myAns.subText}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs italic text-[#1F3A5F]/45 mt-2">
                      Belum diisi pada sesi ini.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

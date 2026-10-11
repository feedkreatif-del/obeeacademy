/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  db,
  OperationType,
  handleFirestoreError,
  getOrCreateParticipantId,
} from './firebase';
import {
  PARTNERUP_QUESTIONS,
  INITIAL_SEED_ANSWERS,
  INITIAL_SEED_QNA,
} from './data/seminarData';
import {
  SessionStateDoc,
  AnswerDoc,
  QnaDoc,
  PollVoteDoc,
  InteractiveMode,
  ViewRole,
} from './types';
import { ProjectorView } from './components/ProjectorView';
import { ParticipantView } from './components/ParticipantView';
import { ModerationView } from './components/ModerationView';
import { SlideDeckView } from './components/SlideDeckView';
import { Download } from 'lucide-react';

const DEFAULT_SESSION_STATE: SessionStateDoc = {
  activeQuestion: 0,
  activeSlide: 0,
  activeMode: 'worksheet',
  activePollId: 'rational_4types',
  moderationEnabled: false,
  externalEmbedUrl: '',
  externalPlatform: 'slido',
  sessionName: 'Seminar Value Proposition PartnerUp | Obeecreatives',
  updatedAt: Date.now(),
};

export default function App() {
  // Determine initial view role from URL query (?view=participant) or screen width
  const [viewRole, setViewRole] = useState<ViewRole>(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view');
    if (v === 'participant' || v === 'moderation' || v === 'slides' || v === 'projector') {
      return v;
    }
    return window.innerWidth < 768 ? 'participant' : 'projector';
  });

  const [participantId] = useState<string>(() => getOrCreateParticipantId());
  const [sessionState, setSessionState] = useState<SessionStateDoc>(DEFAULT_SESSION_STATE);
  const [answers, setAnswers] = useState<AnswerDoc[]>([]);
  const [qnaList, setQnaList] = useState<QnaDoc[]>([]);
  const [pollVotes, setPollVotes] = useState<PollVoteDoc[]>([]);
  const [hasSeededInitial, setHasSeededInitial] = useState<boolean>(false);

  // Join URL that automatically opens Participant View on mobile QR scan
  const joinUrl = `${window.location.origin}${window.location.pathname}?view=participant`;

  // Subscribe once to Session State, Answers, Q&A, and Poll Votes (Per PDF: "Berlangganan onSnapshot sekali saja, bukan di dalam fungsi render")
  useEffect(() => {
    const stateRef = doc(db, 'state', 'session');
    const unsubState = onSnapshot(
      stateRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as SessionStateDoc;
          setSessionState({
            activeQuestion: typeof data.activeQuestion === 'number' ? data.activeQuestion : 0,
            activeSlide: typeof data.activeSlide === 'number' ? data.activeSlide : 0,
            activeMode: data.activeMode || 'worksheet',
            activePollId: data.activePollId || 'rational_4types',
            moderationEnabled: Boolean(data.moderationEnabled),
            externalEmbedUrl: data.externalEmbedUrl || '',
            externalPlatform: data.externalPlatform || 'slido',
            sessionName: data.sessionName || DEFAULT_SESSION_STATE.sessionName,
            updatedAt: data.updatedAt || Date.now(),
          });
        }
      },
      (err) => {
        console.warn('Session listener warning:', err);
      }
    );

    const answersQuery = query(collection(db, 'answers'), orderBy('ts', 'desc'), limit(500));
    const unsubAnswers = onSnapshot(
      answersQuery,
      (snap) => {
        const list: AnswerDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AnswerDoc, 'id'>),
        }));
        setAnswers(list);
      },
      (err) => {
        console.warn('Answers listener warning:', err);
      }
    );

    const qnaQuery = query(collection(db, 'qna'), orderBy('ts', 'desc'), limit(300));
    const unsubQna = onSnapshot(
      qnaQuery,
      (snap) => {
        const list: QnaDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<QnaDoc, 'id'>),
        }));
        setQnaList(list);
      },
      (err) => {
        console.warn('QnA listener warning:', err);
      }
    );

    const votesQuery = query(collection(db, 'poll_votes'), orderBy('ts', 'desc'), limit(500));
    const unsubVotes = onSnapshot(
      votesQuery,
      (snap) => {
        const list: PollVoteDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<PollVoteDoc, 'id'>),
        }));
        setPollVotes(list);
      },
      (err) => {
        console.warn('Poll votes listener warning:', err);
      }
    );

    return () => {
      unsubState();
      unsubAnswers();
      unsubQna();
      unsubVotes();
    };
  }, []);

  // Auto-seed realistic UMKM examples if database is completely empty on first launch
  useEffect(() => {
    const checkAndSeed = async () => {
      if (hasSeededInitial) return;
      const seededFlag = window.localStorage.getItem('partnerup_initial_seeded_v1');
      if (seededFlag) {
        setHasSeededInitial(true);
        return;
      }
      if (answers.length === 0 && qnaList.length === 0) {
        setHasSeededInitial(true);
        window.localStorage.setItem('partnerup_initial_seeded_v1', 'true');
        try {
          await setDoc(doc(db, 'state', 'session'), {
            ...DEFAULT_SESSION_STATE,
            updatedAt: Date.now(),
          });
          for (const item of INITIAL_SEED_ANSWERS) {
            await addDoc(collection(db, 'answers'), item);
          }
          for (const qItem of INITIAL_SEED_QNA) {
            await addDoc(collection(db, 'qna'), qItem);
          }
        } catch (e) {
          console.warn('Initial seed skipped:', e);
        }
      }
    };
    const timer = setTimeout(checkAndSeed, 1200);
    return () => clearTimeout(timer);
  }, [answers.length, qnaList.length, hasSeededInitial]);

  // Helper to update global session state
  const updateSessionState = async (partial: Partial<SessionStateDoc>) => {
    const nextState: SessionStateDoc = {
      ...sessionState,
      ...partial,
      updatedAt: Date.now(),
    };
    setSessionState(nextState);
    try {
      await setDoc(doc(db, 'state', 'session'), nextState);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'state/session');
    }
  };

  // Worksheet Answer Handlers
  const handleSubmitAnswer = async (
    qIndex: number,
    text: string,
    subText: string,
    businessName: string
  ) => {
    const payload: Omit<AnswerDoc, 'id'> = {
      q: qIndex,
      text: text.slice(0, 250),
      subText: subText.slice(0, 200),
      businessName: businessName.slice(0, 60),
      participantId,
      status: sessionState.moderationEnabled ? 'pending' : 'approved',
      star: false,
      likes: 0,
      mentorNote: '',
      ts: Date.now(),
    };
    try {
      await addDoc(collection(db, 'answers'), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'answers');
    }
  };

  const handleToggleStarAnswer = async (ans: AnswerDoc) => {
    try {
      await updateDoc(doc(db, 'answers', ans.id), {
        star: !ans.star,
        status: 'approved',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `answers/${ans.id}`);
    }
  };

  const handleHideAnswer = async (ans: AnswerDoc) => {
    try {
      await updateDoc(doc(db, 'answers', ans.id), {
        status: 'hidden',
        star: false,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `answers/${ans.id}`);
    }
  };

  const handleApproveAnswer = async (ans: AnswerDoc) => {
    try {
      await updateDoc(doc(db, 'answers', ans.id), {
        status: 'approved',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `answers/${ans.id}`);
    }
  };

  const handleUpdateAnswerDetails = async (
    ans: AnswerDoc,
    newText: string,
    newMentorNote: string
  ) => {
    try {
      await updateDoc(doc(db, 'answers', ans.id), {
        text: newText.slice(0, 250),
        mentorNote: newMentorNote.slice(0, 200),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `answers/${ans.id}`);
    }
  };

  const handleDeleteAnswer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'answers', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `answers/${id}`);
    }
  };

  // Q&A Handlers
  const handleSubmitQna = async (
    text: string,
    authorName: string,
    isAnonymous: boolean,
    topicTag: string
  ) => {
    const payload: Omit<QnaDoc, 'id'> = {
      text: text.slice(0, 250),
      authorName: authorName.slice(0, 60),
      isAnonymous,
      topicTag: topicTag.slice(0, 40),
      upvotes: 1,
      status: sessionState.moderationEnabled ? 'pending' : 'approved',
      star: false,
      participantId,
      ts: Date.now(),
    };
    try {
      await addDoc(collection(db, 'qna'), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'qna');
    }
  };

  const handleUpvoteQna = async (qnaId: string) => {
    const target = qnaList.find((q) => q.id === qnaId);
    if (!target) return;
    try {
      await updateDoc(doc(db, 'qna', qnaId), {
        upvotes: target.upvotes + 1,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `qna/${qnaId}`);
    }
  };

  const handleApproveQna = async (qna: QnaDoc) => {
    try {
      await updateDoc(doc(db, 'qna', qna.id), {
        status: 'approved',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `qna/${qna.id}`);
    }
  };

  const handleHideQna = async (qna: QnaDoc) => {
    try {
      await updateDoc(doc(db, 'qna', qna.id), {
        status: 'hidden',
        star: false,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `qna/${qna.id}`);
    }
  };

  const handleToggleStarQna = async (qna: QnaDoc) => {
    try {
      await updateDoc(doc(db, 'qna', qna.id), {
        star: !qna.star,
        status: 'approved',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `qna/${qna.id}`);
    }
  };

  const handleDeleteQna = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'qna', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `qna/${id}`);
    }
  };

  // Poll Vote Handler
  const handleSubmitPollVote = async (
    pollId: string,
    optionId: string,
    customWord: string,
    businessName: string
  ) => {
    const existing = pollVotes.find(
      (v) => v.pollId === pollId && v.participantId === participantId && !customWord
    );
    try {
      if (existing) {
        await updateDoc(doc(db, 'poll_votes', existing.id), {
          optionId: optionId.slice(0, 64),
          customWord: customWord.slice(0, 40),
          businessName: businessName.slice(0, 60),
          ts: Date.now(),
        });
      } else {
        await addDoc(collection(db, 'poll_votes'), {
          pollId: pollId.slice(0, 64),
          optionId: optionId.slice(0, 64),
          customWord: customWord.slice(0, 40),
          businessName: businessName.slice(0, 60),
          participantId,
          ts: Date.now(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'poll_votes');
    }
  };

  // Export CSV (Per PDF: "menyimpan CSV dengan kolom Pertanyaan, Jawaban, Nama usaha. Lewati jawaban yang disembunyikan.")
  const handleDownloadCsv = () => {
    try {
      const visibleAnswers = answers
        .filter((a) => a.status !== 'hidden')
        .sort((a, b) => a.q - b.q || a.ts - b.ts);

      const header = ['Pertanyaan', 'Jawaban', 'Keterangan Tambahan', 'Nama usaha', 'Status', 'Waktu'];
      const escapeCsv = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;

      const rows = visibleAnswers.map((a) => {
        const qTitle = PARTNERUP_QUESTIONS[a.q]?.questionText || `Pertanyaan ${a.q + 1}`;
        return [
          escapeCsv(`${a.q + 1}. ${qTitle}`),
          escapeCsv(a.text),
          escapeCsv(a.subText || ''),
          escapeCsv(a.businessName || 'Tanpa Nama Usaha'),
          escapeCsv(a.status),
          escapeCsv(new Date(a.ts).toLocaleString('id-ID')),
        ].join(',');
      });

      const csvContent = '\uFEFF' + [header.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `Rekap_Jawaban_Seminar_PartnerUp_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Pengguna menolak atau gagal mengunduh CSV:', err);
    }
  };

  // Clear test data before seminar day
  const handleClearAllDemoData = async () => {
    for (const a of answers) {
      await deleteDoc(doc(db, 'answers', a.id));
    }
    for (const q of qnaList) {
      await deleteDoc(doc(db, 'qna', q.id));
    }
    for (const v of pollVotes) {
      await deleteDoc(doc(db, 'poll_votes', v.id));
    }
  };

  const handleSeedSampleData = async () => {
    for (const item of INITIAL_SEED_ANSWERS) {
      await addDoc(collection(db, 'answers'), { ...item, ts: Date.now() });
    }
    for (const qItem of INITIAL_SEED_QNA) {
      await addDoc(collection(db, 'qna'), { ...qItem, ts: Date.now() });
    }
  };

  const approvedAnswers = answers.filter((a) => a.status === 'approved');
  const approvedQna = qnaList.filter((q) => q.status === 'approved');
  const myAnswers = answers.filter((a) => a.participantId === participantId);
  const pendingCount =
    answers.filter((a) => a.status === 'pending').length +
    qnaList.filter((q) => q.status === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7EC] text-[#1F3A5F]">
      {/* Strict 3-Zone Top Navigation Bar following Universal Design Constitution */}
      <header className="flex items-center justify-between gap-8 px-4 sm:px-8 py-4 bg-[#1F3A5F] text-white border-b border-white/10 sticky top-0 z-30">
        {/* Zone 1: Single text element Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setViewRole('projector');
          }}
          className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          PartnerUp Live
        </a>

        {/* Zone 2: 4 Concise Single-Line Navigation Links */}
        <nav className="flex items-center gap-4 sm:gap-7 text-xs sm:text-sm font-medium text-white/80 overflow-x-auto">
          <button
            onClick={() => setViewRole('projector')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
              viewRole === 'projector'
                ? 'text-[#F28C28] font-bold border-b-2 border-[#F28C28]'
                : ''
            }`}
          >
            Layar Proyektor
          </button>

          <button
            onClick={() => setViewRole('slides')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
              viewRole === 'slides'
                ? 'text-[#F28C28] font-bold border-b-2 border-[#F28C28]'
                : ''
            }`}
          >
            Materi 17 Slide
          </button>

          <button
            onClick={() => setViewRole('participant')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
              viewRole === 'participant'
                ? 'text-[#F28C28] font-bold border-b-2 border-[#F28C28]'
                : ''
            }`}
          >
            HP Peserta
          </button>

          <button
            onClick={() => setViewRole('moderation')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
              viewRole === 'moderation'
                ? 'text-[#F28C28] font-bold border-b-2 border-[#F28C28]'
                : ''
            }`}
          >
            Moderasi {pendingCount > 0 ? `(${pendingCount})` : ''}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center shrink-0">
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 text-xs font-bold text-white bg-[#F28C28] rounded-lg hover:bg-[#d97719] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unduh Rekap CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="flex-1">
        {viewRole === 'projector' && (
          <ProjectorView
            sessionState={sessionState}
            approvedAnswers={approvedAnswers}
            approvedQna={approvedQna}
            pollVotes={pollVotes}
            joinUrl={joinUrl}
            onChangeQuestion={(newQ) =>
              updateSessionState({ activeQuestion: newQ, activeMode: 'worksheet' })
            }
            onChangeMode={(newMode: InteractiveMode) =>
              updateSessionState({ activeMode: newMode })
            }
            onChangePoll={(pollId: string) =>
              updateSessionState({ activePollId: pollId, activeMode: 'poll' })
            }
            onToggleStarAnswer={handleToggleStarAnswer}
            onHideAnswer={handleHideAnswer}
            onToggleStarQna={handleToggleStarQna}
            onHideQna={handleHideQna}
            onDownloadCsv={handleDownloadCsv}
            onSwitchToParticipantPreview={() => setViewRole('participant')}
          />
        )}

        {viewRole === 'slides' && (
          <SlideDeckView
            activeSlideIndex={sessionState.activeSlide}
            onChangeSlide={(newSlide) => updateSessionState({ activeSlide: newSlide })}
            onLaunchWorksheetQuestion={(qIdx) => {
              updateSessionState({ activeQuestion: qIdx, activeMode: 'worksheet' });
              setViewRole('projector');
            }}
            onLaunchPoll={(pollId) => {
              updateSessionState({ activePollId: pollId, activeMode: 'poll' });
              setViewRole('projector');
            }}
            onLaunchQna={() => {
              updateSessionState({ activeMode: 'qna' });
              setViewRole('projector');
            }}
            approvedAnswers={approvedAnswers}
            activeMode={sessionState.activeMode}
          />
        )}

        {viewRole === 'participant' && (
          <div>
            {/* Quick banner to jump back to Presenter if presenter clicked "Lihat sebagai peserta" */}
            <div className="bg-[#FFF7EC] border-b border-[#1F3A5F]/10 px-4 py-2 text-center text-xs text-[#1F3A5F]/75 flex items-center justify-center gap-3">
              <span>Anda sedang berada di tampilan <strong>HP Peserta UMKM</strong>.</span>
              <button
                onClick={() => setViewRole('projector')}
                className="font-bold text-[#F28C28] hover:underline cursor-pointer"
              >
                Kembali ke presenter →
              </button>
            </div>
            <ParticipantView
              sessionState={sessionState}
              participantId={participantId}
              myAnswers={myAnswers}
              approvedQna={approvedQna}
              pollVotes={pollVotes}
              onSubmitAnswer={handleSubmitAnswer}
              onSubmitQna={handleSubmitQna}
              onUpvoteQna={handleUpvoteQna}
              onSubmitPollVote={handleSubmitPollVote}
            />
          </div>
        )}

        {viewRole === 'moderation' && (
          <ModerationView
            sessionState={sessionState}
            allAnswers={answers}
            allQna={qnaList}
            onToggleModerationGate={(enabled) =>
              updateSessionState({ moderationEnabled: enabled })
            }
            onUpdateExternalEmbed={(platform, url) =>
              updateSessionState({
                externalPlatform: platform,
                externalEmbedUrl: url,
                activeMode: url ? 'external' : 'worksheet',
              })
            }
            onApproveAnswer={handleApproveAnswer}
            onHideAnswer={handleHideAnswer}
            onToggleStarAnswer={handleToggleStarAnswer}
            onUpdateAnswerDetails={handleUpdateAnswerDetails}
            onDeleteAnswer={handleDeleteAnswer}
            onApproveQna={handleApproveQna}
            onHideQna={handleHideQna}
            onToggleStarQna={handleToggleStarQna}
            onDeleteQna={handleDeleteQna}
            onClearAllDemoData={handleClearAllDemoData}
            onSeedSampleData={handleSeedSampleData}
            onDownloadCsv={handleDownloadCsv}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#1F3A5F]/10 py-4 px-6 text-center text-xs text-[#1F3A5F]/60 bg-[#FFF7EC]">
        <span>Seminar Value Proposition PartnerUp · Obeecreatives · Platform Tanya-Jawab & Lembar Kerja Interaktif UMKM</span>
      </footer>
    </div>
  );
}

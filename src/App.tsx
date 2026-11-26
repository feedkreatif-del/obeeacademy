/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  doc,
  collection,
  getDocFromServer,
  getDocs,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  db,
  auth,
  loginWithGoogle,
  logoutUser,
  OperationType,
  handleFirestoreError,
  getOrCreateParticipantId,
  sanitizeForFirestore,
  fetchFirestoreDocRest,
} from './firebase';
import {
  PARTNERUP_QUESTIONS,
  LIVE_POLLS,
  SEMINAR_SLIDES,
  DEFAULT_QNA_TOPICS,
  getSeedDataForCurriculum,
} from './data/seminarData';
import {
  SessionStateDoc,
  CustomContentDoc,
  AnswerDoc,
  QnaDoc,
  PollVoteDoc,
  InteractiveMode,
  ViewRole,
  SavedMaterial,
  FlipchartBoardDoc,
  UnlockCampaignDoc,
  UnlockVoteDoc,
  UnlockVoteStatus,
  UnlockContactDoc,
  UnlockLeadStage,
  UnlockPaymentStatus,
} from './types';
import {
  DEFAULT_GOPAY_MERCHANT_NAME,
  DEFAULT_GOPAY_MERCHANT_NMID,
  DEFAULT_GOPAY_QRIS_IMAGE,
  DEFAULT_GOPAY_QRIS_PAYLOAD,
} from './utils/qris';
import {
  buildOfferingVoteSlug,
  parseTierOfferingKey,
  resolveOfferingByKey,
} from './utils/programTier';
import { ProjectorView } from './components/ProjectorView';
import { ParticipantView } from './components/ParticipantView';
import { ModerationView } from './components/ModerationView';
import { SlideDeckView } from './components/SlideDeckView';
import { RemoteClickerView } from './components/RemoteClickerView';
import { ContentEditorView } from './components/ContentEditorView';
import { OfflineBanner, PWAInstallModalTrigger } from './components/PWAInstallButton';
import { DEFAULT_BRAND_THEME, sanitizeBrandTheme, useApplyBrandTheme } from './brandTheme';
import {
  getSavedMaterialsLocal,
  getActiveMaterialIdLocal,
  setActiveMaterialIdLocal,
  syncMaterialsFromFirestore,
  persistMaterial,
  removeMaterial,
  INITIAL_PRESET_MATERIALS,
  DEFAULT_PARTNERUP_CURRICULUM,
  SESI_2_ACTION_PLAN_CURRICULUM,
  SESI_3_BRANDING_MARKETING_SELLING_CURRICULUM,
} from './utils/materialsManager';
import { VISUAL_IDENTITY_CURRICULUM } from './data/visualIdentity';
import { FOTO_PRODUK_DASAR_CURRICULUM } from './data/fotoProdukDasar';
import { MaterialsBankModal } from './components/MaterialsBankModal';
import { Download, BookOpen, Lock, Unlock, ShieldCheck, Settings, Layers, CalendarCheck } from 'lucide-react';
import { SystemGuideModal } from './components/SystemGuideModal';
import { PresenterAuthModal } from './components/PresenterAuthModal';
import { CommitteePreviewView } from './components/CommitteePreviewView';
import { ClassUnlockPortalView } from './components/ClassUnlockPortalView';

const DEFAULT_SESSION_STATE: SessionStateDoc = {
  activeQuestion: 0,
  activeSlide: 0,
  activeSlideStep: 0,
  stepByStepEnabled: true,
  transitionStyle: 'slide',
  activeSlideDrawer: 'none',
  allowParticipantSlideAccess: false,
  answersLocked: false,
  lockedNotice: 'Pengiriman jawaban sedang dinonaktifkan sementara oleh pemateri. Pelatihan akan dilanjutkan pada sesi berikutnya minggu depan.',
  activeMode: 'worksheet',
  activePollId: 'rational_4types',
  moderationEnabled: false,
  externalEmbedUrl: '',
  externalPlatform: 'slido',
  sessionName: 'Kelas Interaktif obeeAcademy | Obeecreatives',
  updatedAt: Date.now(),
};

const DEFAULT_CUSTOM_CONTENT: CustomContentDoc = {
  seminarTitle: 'Kenapa Pembeli Harus Pilih Kamu? (Value Proposition UMKM)',
  organizerName: 'obeeAcademy | Obeecreatives',
  questions: PARTNERUP_QUESTIONS,
  polls: LIVE_POLLS,
  slides: SEMINAR_SLIDES,
  qnaTopics: DEFAULT_QNA_TOPICS,
  brandTheme: DEFAULT_BRAND_THEME,
  materialId: 'partnerup_sesi_1_curriculum',
  updatedAt: Date.now(),
};

const VI_POSTER_SEEDED_KEY = 'obee_seeded_vi_poster_v1';
const FP_POSTER_SEEDED_KEY = 'obee_seeded_fp_poster_v1';

const LEGACY_CAMPAIGN_TITLES = new Set([
  'Bursa Kelas UMKM obeeAcademy — Vote Topik & Jadwal',
  'Bursa Kelas UMKM obeeAcademy - Vote Topik & Jadwal',
  'Bursa Kelas UMKM obeeAcademy',
]);

const DEFAULT_UNLOCK_CAMPAIGN: UnlockCampaignDoc = {
  id: 'active',
  title: 'Bursa Kelas Pelatihan obeeAcademy - Vote Topik & Jadwal',
  subtitle:
    'Pilih topik materi yang paling kamu butuhkan dan centang semua jadwal yang kamu bisa hadiri. Kelas resmi dibuka (GO!) begitu terkumpul minimal 15 peserta berkomitmen pada topik & jam yang cocok.',
  organizerName: 'obeeAcademy',
  minQuota: 15,
  status: 'open',
  deadlineLabel: 'Voting dibuka s.d. Kamis 20.00 WIB',
  candidateMaterialIds: INITIAL_PRESET_MATERIALS.map((m) => m.id).slice(0, 20),
  timeSlots: [
    {
      id: 'slot_rabu_malam',
      label: 'Rabu Malam',
      dateText: 'Rabu Pekan Depan',
      timeText: '19.30 - 21.00 WIB',
    },
    {
      id: 'slot_sabtu_pagi',
      label: 'Sabtu Pagi',
      dateText: 'Sabtu Pekan Depan',
      timeText: '09.30 - 11.30 WIB',
    },
    {
      id: 'slot_minggu_siang',
      label: 'Minggu Siang',
      dateText: 'Minggu Pekan Depan',
      timeText: '13.30 - 15.30 WIB',
    },
  ],
  winningMaterialId: '',
  winningSlotId: '',
  confirmedScheduleNote: '',
  materialPricing: {},
  materialProgram: {},
  qrisPayload: DEFAULT_GOPAY_QRIS_PAYLOAD,
  qrisMerchantName: DEFAULT_GOPAY_MERCHANT_NAME,
  qrisMerchantNmid: DEFAULT_GOPAY_MERCHANT_NMID,
  qrisFallbackImageUrl: DEFAULT_GOPAY_QRIS_IMAGE,
  mentorWhatsapp: '',
  updatedAt: Date.now(),
};

export default function App() {
  const [isPresenterUnlocked, setIsPresenterUnlocked] = useState<boolean>(() => {
    try {
      return window.sessionStorage.getItem('partnerup_presenter_unlocked_v1') === 'true';
    } catch {
      return false;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [tapCounter, setTapCounter] = useState<{ count: number; lastTime: number }>({ count: 0, lastTime: 0 });

  const [viewRole, setViewRole] = useState<ViewRole>(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view');
    const isMobile = window.innerWidth < 768;
    const isUnlocked = (() => {
      try {
        return window.sessionStorage.getItem('partnerup_presenter_unlocked_v1') === 'true';
      } catch {
        return false;
      }
    })();

    // On mobile devices, require unlock to access internal presenter tools
    if (isMobile && !isUnlocked && (v === 'editor' || v === 'moderation' || v === 'projector' || v === 'slides')) {
      return 'participant';
    }

    if (
      v === 'participant' ||
      v === 'moderation' ||
      v === 'slides' ||
      v === 'projector' ||
      v === 'editor' ||
      v === 'extend' ||
      v === 'remote' ||
      v === 'guide' ||
      v === 'preview' ||
      v === 'bursa'
    ) {
      return v;
    }
    return isMobile ? 'participant' : 'projector';
  });

  const [forcePublicBursa, setForcePublicBursa] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'bursa';
  });

  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'guide';
  });

  const handleSecretTrigger = () => {
    const now = Date.now();
    if (now - tapCounter.lastTime < 1500) {
      const nextCount = tapCounter.count + 1;
      if (nextCount >= 3) {
        setTapCounter({ count: 0, lastTime: 0 });
        setIsAuthModalOpen(true);
        return;
      }
      setTapCounter({ count: nextCount, lastTime: now });
    } else {
      setTapCounter({ count: 1, lastTime: now });
    }
  };

  const handleLockPresenter = () => {
    try {
      window.sessionStorage.removeItem('partnerup_presenter_unlocked_v1');
      window.sessionStorage.removeItem('partnerup_remote_unlocked_v1');
    } catch {
      // ignore
    }
    setIsPresenterUnlocked(false);
    setViewRole('participant');
  };

  const initialQrTargetRef = useRef<{
    materialId: string | null;
    mode: InteractiveMode | null;
    questionIndex: number | null;
    pollId: string | null;
  }>(
    (() => {
      const params = new URLSearchParams(window.location.search);
      const mid = params.get('mid');
      const modeParam = params.get('mode');
      const qParam = params.get('q');
      const pollParam = params.get('poll');
      const validMode: InteractiveMode | null =
        modeParam === 'worksheet' ||
        modeParam === 'poll' ||
        modeParam === 'qna' ||
        modeParam === 'external'
          ? modeParam
          : null;
      const parsedQ =
        qParam !== null && qParam.trim() !== '' && !Number.isNaN(Number(qParam))
          ? Math.max(0, parseInt(qParam, 10))
          : null;
      return {
        materialId: mid,
        mode: validMode,
        questionIndex: parsedQ,
        pollId: pollParam,
      };
    })()
  );

  const [materials, setMaterials] = useState<SavedMaterial[]>(() => getSavedMaterialsLocal());
  const [activeMaterialId, setActiveMaterialId] = useState<string>(() => {
    const qrMid = initialQrTargetRef.current.materialId;
    if (qrMid) return qrMid;
    if (viewRole === 'participant') return '';
    return getActiveMaterialIdLocal();
  });

  const [participantId] = useState<string>(() => getOrCreateParticipantId());
  const [sessionState, setSessionState] = useState<SessionStateDoc>(() => {
    const target = initialQrTargetRef.current;
    return {
      ...DEFAULT_SESSION_STATE,
      ...(target.mode ? { activeMode: target.mode } : {}),
      ...(target.questionIndex !== null ? { activeQuestion: target.questionIndex } : {}),
      ...(target.pollId ? { activePollId: target.pollId } : {}),
    };
  });
  const sessionStateRef = useRef<SessionStateDoc>(sessionState);
  sessionStateRef.current = sessionState;

  const [customContent, setCustomContent] = useState<CustomContentDoc>(() => {
    const qrMid = initialQrTargetRef.current.materialId;
    if (qrMid) {
      const matched = getSavedMaterialsLocal().find((m) => m.id === qrMid);
      if (matched) {
        return {
          ...matched.content,
          seminarTitle: matched.seminarTitle,
          organizerName: matched.organizerName,
          materialId: matched.id,
          description: matched.description,
          category: matched.category,
          isDefault: matched.isDefault,
        };
      }
    }
    return DEFAULT_CUSTOM_CONTENT;
  });

  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  const [answers, setAnswers] = useState<AnswerDoc[]>([]);
  const [qnaList, setQnaList] = useState<QnaDoc[]>([]);
  const [pollVotes, setPollVotes] = useState<PollVoteDoc[]>([]);
  const [flipchartRemote, setFlipchartRemote] = useState<FlipchartBoardDoc | null>(null);
  const [mentorUser, setMentorUser] = useState<User | null>(() => auth.currentUser);
  const [unlockCampaign, setUnlockCampaign] = useState<UnlockCampaignDoc>(DEFAULT_UNLOCK_CAMPAIGN);
  const [unlockVotes, setUnlockVotes] = useState<UnlockVoteDoc[]>([]);
  const [unlockContacts, setUnlockContacts] = useState<UnlockContactDoc[]>([]);
  const [dismissedFlipchartTs, setDismissedFlipchartTs] = useState<number>(() => {
    try {
      const saved = window.localStorage.getItem('partnerup_flipchart_dismissed_ts_v1');
      const parsed = saved ? Number(saved) : 0;
      return Number.isFinite(parsed) ? parsed : 0;
    } catch {
      return 0;
    }
  });
  const appStartedAtRef = useRef<number>(Date.now());
  const flipchartRevisionRef = useRef<number>(0);

  const handleDismissFlipchartRemote = useCallback((updatedAt: number) => {
    setDismissedFlipchartTs((prev) => {
      const next = Math.max(prev, updatedAt);
      try {
        window.localStorage.setItem('partnerup_flipchart_dismissed_ts_v1', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);
  const [boardDeviceId] = useState<string>(() => {
    const fallback = `board_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      const existing = window.sessionStorage.getItem('partnerup_board_device_id_v1');
      if (existing && /^[a-zA-Z0-9_-]+$/.test(existing)) {
        return existing;
      }
      window.sessionStorage.setItem('partnerup_board_device_id_v1', fallback);
      return fallback;
    } catch {
      return fallback;
    }
  });
  const [hasSeededInitial, setHasSeededInitial] = useState<boolean>(false);
  const [hasRemoteState, setHasRemoteState] = useState<boolean>(false);
  const [hasRemoteContent, setHasRemoteContent] = useState<boolean>(false);
  const [hasRemoteCollectionsLoaded, setHasRemoteCollectionsLoaded] = useState<boolean>(false);
  const [syncWaitTimedOut, setSyncWaitTimedOut] = useState<boolean>(false);

  const remoteStateExistsRef = useRef<boolean | null>(null);
  const remoteContentExistsRef = useRef<boolean | null>(null);
  const answersLoadedRef = useRef<boolean>(false);
  const qnaLoadedRef = useRef<boolean>(false);
  const seedSyncLockRef = useRef<boolean>(false);
  const sesiSeedHealDoneRef = useRef<boolean>(false);
  const sesi2ContentUpgradeDoneRef = useRef<boolean>(false);
  const sesi3ContentUpgradeDoneRef = useRef<boolean>(false);

  const isHostRole =
    viewRole === 'projector' ||
    viewRole === 'slides' ||
    viewRole === 'editor' ||
    viewRole === 'moderation' ||
    viewRole === 'remote';
  const isHostRoleRef = useRef<boolean>(isHostRole);
  isHostRoleRef.current = isHostRole;

  const replaceSimulationSeeds = async (
    materialId?: string,
    seminarTitle?: string
  ) => {
    if (seedSyncLockRef.current) return;
    seedSyncLockRef.current = true;
    try {
      const [ansSnap, qnaSnap] = await Promise.all([
        getDocs(collection(db, 'answers')),
        getDocs(collection(db, 'qna')),
      ]);

      const deletePromises: Promise<void>[] = [];
      ansSnap.forEach((d) => {
        const pid = (d.data() as { participantId?: string })?.participantId || '';
        if (pid.startsWith('seed_')) {
          deletePromises.push(deleteDoc(doc(db, 'answers', d.id)));
        }
      });
      qnaSnap.forEach((d) => {
        const pid = (d.data() as { participantId?: string })?.participantId || '';
        if (pid.startsWith('seed_qna_')) {
          deletePromises.push(deleteDoc(doc(db, 'qna', d.id)));
        }
      });
      await Promise.all(deletePromises);

      const { answers: nextSeedAnswers, qna: nextSeedQna } =
        getSeedDataForCurriculum(materialId, seminarTitle);
      const baseTs = Date.now();
      await Promise.all([
        ...nextSeedAnswers.map((item, idx) =>
          addDoc(collection(db, 'answers'), {
            ...item,
            ts: baseTs - (nextSeedAnswers.length - idx) * 60000,
          })
        ),
        ...nextSeedQna.map((qItem, idx) =>
          addDoc(collection(db, 'qna'), {
            ...qItem,
            ts: baseTs - (nextSeedQna.length - idx) * 60000,
          })
        ),
      ]);
    } catch (err) {
      console.warn('Gagal menyinkronkan data simulasi kurikulum:', err);
    } finally {
      seedSyncLockRef.current = false;
    }
  };

  // Track Firebase Google Auth state for protected admin contact queries
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setMentorUser(u);
    });
    return () => unsub();
  }, []);

  const isVerifiedMentorAdmin = Boolean(
    mentorUser?.email === 'feedkreatif@gmail.com' && mentorUser?.emailVerified
  );

  // Sync saved materials library from Firestore on startup
  useEffect(() => {
    let isMounted = true;
    syncMaterialsFromFirestore(db).then((synced) => {
      if (isMounted && synced.length > 0) {
        setMaterials(synced);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Subscribe to Bursa Kelas Campaign & Public Votes
  useEffect(() => {
    const campRef = doc(db, 'unlock_campaigns', 'active');
    const unsubCampaign = onSnapshot(
      campRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<UnlockCampaignDoc>;
          const normalizedTitle =
            !data.title || LEGACY_CAMPAIGN_TITLES.has(data.title.trim())
              ? DEFAULT_UNLOCK_CAMPAIGN.title
              : data.title;
          const normalizedOrganizer =
            !data.organizerName || data.organizerName.trim() === 'obeeAcademy | PartnerUp'
              ? DEFAULT_UNLOCK_CAMPAIGN.organizerName
              : data.organizerName;
          const baseCandidateIds =
            Array.isArray(data.candidateMaterialIds) && data.candidateMaterialIds.length > 0
              ? data.candidateMaterialIds
              : DEFAULT_UNLOCK_CAMPAIGN.candidateMaterialIds;
          let alreadySeededVi = false;
          let alreadySeededFp = false;
          try {
            alreadySeededVi = window.localStorage.getItem(VI_POSTER_SEEDED_KEY) === '1';
            alreadySeededFp = window.localStorage.getItem(FP_POSTER_SEEDED_KEY) === '1';
          } catch {
            alreadySeededVi = false;
            alreadySeededFp = false;
          }
          const hasViPoster = baseCandidateIds.includes(VISUAL_IDENTITY_CURRICULUM.id);
          const hasFpPoster = baseCandidateIds.includes(FOTO_PRODUK_DASAR_CURRICULUM.id);
          let nextCandidateIds = [...baseCandidateIds];
          if (!hasViPoster && !alreadySeededVi && nextCandidateIds.length < 20) {
            nextCandidateIds.push(VISUAL_IDENTITY_CURRICULUM.id);
          }
          if (!hasFpPoster && !alreadySeededFp && nextCandidateIds.length < 20) {
            nextCandidateIds.push(FOTO_PRODUK_DASAR_CURRICULUM.id);
          }

          const nextCampaignState: UnlockCampaignDoc = {
            id: snap.id,
            title: normalizedTitle,
            subtitle: data.subtitle || DEFAULT_UNLOCK_CAMPAIGN.subtitle,
            organizerName: normalizedOrganizer,
            minQuota: typeof data.minQuota === 'number' ? data.minQuota : 15,
            status: data.status || 'open',
            deadlineLabel: data.deadlineLabel || DEFAULT_UNLOCK_CAMPAIGN.deadlineLabel,
            candidateMaterialIds: nextCandidateIds,
            timeSlots:
              Array.isArray(data.timeSlots) && data.timeSlots.length > 0
                ? data.timeSlots
                : DEFAULT_UNLOCK_CAMPAIGN.timeSlots,
            winningMaterialId: data.winningMaterialId || '',
            winningSlotId: data.winningSlotId || '',
            confirmedScheduleNote: data.confirmedScheduleNote || '',
            materialPricing: data.materialPricing || {},
            materialProgram: data.materialProgram || {},
            qrisPayload: data.qrisPayload || DEFAULT_GOPAY_QRIS_PAYLOAD,
            qrisMerchantName: data.qrisMerchantName || DEFAULT_GOPAY_MERCHANT_NAME,
            qrisMerchantNmid: data.qrisMerchantNmid || DEFAULT_GOPAY_MERCHANT_NMID,
            qrisFallbackImageUrl: data.qrisFallbackImageUrl || DEFAULT_GOPAY_QRIS_IMAGE,
            mentorWhatsapp: data.mentorWhatsapp || '',
            updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
          };
          setUnlockCampaign(nextCampaignState);

          const seededNewPoster =
            (!hasViPoster && !alreadySeededVi && nextCandidateIds.includes(VISUAL_IDENTITY_CURRICULUM.id)) ||
            (!hasFpPoster && !alreadySeededFp && nextCandidateIds.includes(FOTO_PRODUK_DASAR_CURRICULUM.id));

          if (isHostRoleRef.current && seededNewPoster) {
            try {
              if (!hasViPoster && !alreadySeededVi) {
                window.localStorage.setItem(VI_POSTER_SEEDED_KEY, '1');
              }
              if (!hasFpPoster && !alreadySeededFp) {
                window.localStorage.setItem(FP_POSTER_SEEDED_KEY, '1');
              }
            } catch {
              // noop
            }
            const { id: _id, ...syncPayload } = sanitizeForFirestore({
              ...nextCampaignState,
              updatedAt: Date.now(),
            });
            setDoc(campRef, syncPayload).catch((err) =>
              console.warn('Auto-add new curriculum poster skipped:', err)
            );
          }
        } else if (isHostRoleRef.current) {
          const { id: _id, ...payload } = DEFAULT_UNLOCK_CAMPAIGN;
          setDoc(campRef, sanitizeForFirestore({ ...payload, updatedAt: Date.now() })).catch(
            (err) => console.warn('Default unlock campaign init skipped:', err)
          );
        }
      },
      (err) => {
        console.warn('Unlock campaign listener warning:', err);
      }
    );

    const unlockVotesQuery = query(
      collection(db, 'unlock_votes'),
      orderBy('ts', 'desc'),
      limit(300)
    );
    const unsubUnlockVotes = onSnapshot(
      unlockVotesQuery,
      (snap) => {
        const list: UnlockVoteDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<UnlockVoteDoc, 'id'>),
        }));
        setUnlockVotes(list);
      },
      (err) => {
        console.warn('Unlock votes listener warning:', err);
      }
    );

    return () => {
      unsubCampaign();
      unsubUnlockVotes();
    };
  }, []);

  // Conditionally subscribe to PII-isolated unlock_contacts ONLY when verified mentor admin is signed in
  useEffect(() => {
    if (!isVerifiedMentorAdmin) {
      setUnlockContacts([]);
      return;
    }
    const unsubContacts = onSnapshot(
      collection(db, 'unlock_contacts'),
      (snap) => {
        const list: UnlockContactDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<UnlockContactDoc, 'id'>),
        }));
        setUnlockContacts(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'unlock_contacts');
      }
    );
    return () => unsubContacts();
  }, [isVerifiedMentorAdmin]);

  // Dynamically apply organization brand color theme across all views (default: PartnerUp | Obeecreatives)
  useApplyBrandTheme(customContent.brandTheme);

  const buildJoinUrl = (opts?: {
    mode?: InteractiveMode;
    questionIndex?: number;
    pollId?: string;
  }) => {
    const params = new URLSearchParams();
    params.set('view', 'participant');
    const inferredMatId =
      customContent.materialId ||
      materials.find((m) => m.seminarTitle === customContent.seminarTitle)?.id ||
      activeMaterialId ||
      DEFAULT_PARTNERUP_CURRICULUM.id;
    if (inferredMatId) {
      params.set('mid', inferredMatId);
    }
    const targetMode = opts?.mode ?? sessionState.activeMode;
    const targetQ = opts?.questionIndex ?? sessionState.activeQuestion;
    const targetPoll = opts?.pollId ?? sessionState.activePollId;
    params.set('mode', targetMode);
    params.set('q', String(Math.max(0, targetQ)));
    if (targetPoll) {
      params.set('poll', targetPoll);
    }
    const versionStamp = Math.floor(
      Math.max(customContent.updatedAt || 0, sessionState.updatedAt || 0, 1) / 1000
    ).toString(36);
    params.set('v', versionStamp);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  const joinUrl = buildJoinUrl();
  const extendUrl = `${window.location.origin}${window.location.pathname}?view=extend`;

  // Subscribe once to Session State, Custom Content, Answers, Q&A, and Poll Votes
  // Plus direct getDocFromServer + zero-cache REST fallback so mobile QR scans never use stale cache
  useEffect(() => {
    let isMounted = true;
    let resolvedStateFromNetwork = false;
    let resolvedContentFromNetwork = false;

    const applyRemoteSession = (data: Partial<SessionStateDoc>) => {
      if (!isMounted) return;
      const nextState: SessionStateDoc = {
        activeQuestion: typeof data.activeQuestion === 'number' ? data.activeQuestion : 0,
        activeSlide: typeof data.activeSlide === 'number' ? data.activeSlide : 0,
        activeSlideStep: typeof data.activeSlideStep === 'number' ? data.activeSlideStep : 0,
        stepByStepEnabled:
          typeof data.stepByStepEnabled === 'boolean' ? data.stepByStepEnabled : true,
        transitionStyle: data.transitionStyle || 'slide',
        activeSlideDrawer: data.activeSlideDrawer || 'none',
        allowParticipantSlideAccess: Boolean(data.allowParticipantSlideAccess),
        answersLocked: Boolean(data.answersLocked),
        lockedNotice:
          typeof data.lockedNotice === 'string'
            ? data.lockedNotice
            : DEFAULT_SESSION_STATE.lockedNotice,
        activeMode: data.activeMode || 'worksheet',
        activePollId: data.activePollId || 'rational_4types',
        moderationEnabled: Boolean(data.moderationEnabled),
        externalEmbedUrl: data.externalEmbedUrl || '',
        externalPlatform: data.externalPlatform || 'slido',
        sessionName: data.sessionName || DEFAULT_SESSION_STATE.sessionName,
        updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
      };
      sessionStateRef.current = nextState;
      setSessionState(nextState);
    };

    const applyRemoteContent = (data: Partial<CustomContentDoc>) => {
      if (!isMounted) return;
      setCustomContent({
        seminarTitle: data.seminarTitle || DEFAULT_CUSTOM_CONTENT.seminarTitle,
        organizerName: data.organizerName || DEFAULT_CUSTOM_CONTENT.organizerName,
        questions:
          Array.isArray(data.questions) && data.questions.length > 0
            ? data.questions
            : PARTNERUP_QUESTIONS,
        polls:
          Array.isArray(data.polls) && data.polls.length > 0 ? data.polls : LIVE_POLLS,
        slides:
          Array.isArray(data.slides) && data.slides.length > 0
            ? data.slides.map((s) => ({
                ...s,
                imageUrl: s.imageUrl?.startsWith('/src/assets/images/')
                  ? s.imageUrl.replace('/src/assets/images/', '/assets/images/')
                  : s.imageUrl,
              }))
            : SEMINAR_SLIDES,
        qnaTopics:
          Array.isArray(data.qnaTopics) && data.qnaTopics.length > 0
            ? data.qnaTopics
            : DEFAULT_QNA_TOPICS,
        brandTheme: sanitizeBrandTheme(data.brandTheme),
        updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
        materialId: data.materialId,
        description: data.description,
        category: data.category,
        isDefault: Boolean(data.isDefault),
        createdAt: data.createdAt,
      });
      if (data.materialId) {
        setActiveMaterialId(data.materialId);
        // Only host roles persist activeMaterialId to localStorage; participants always follow live server
        if (isHostRoleRef.current) {
          setActiveMaterialIdLocal(data.materialId);
        }
      }
      // Auto-upgrade active Sesi 2 curriculum once if missing the 5 new slide visuals (HOST ONLY - never run from participant phones!)
      const isSesi2ActiveDoc =
        data.materialId === SESI_2_ACTION_PLAN_CURRICULUM.id ||
        (data.seminarTitle || '').toLowerCase().includes('target penjualan');
      if (
        isHostRoleRef.current &&
        isSesi2ActiveDoc &&
        !sesi2ContentUpgradeDoneRef.current &&
        (!data.slides?.[1]?.imageUrl || (data.updatedAt || 0) < 1732500000000)
      ) {
        sesi2ContentUpgradeDoneRef.current = true;
        setDoc(
          doc(db, 'custom_content', 'active'),
          sanitizeForFirestore({
            ...SESI_2_ACTION_PLAN_CURRICULUM.content,
            brandTheme: sanitizeBrandTheme(data.brandTheme),
            updatedAt: Date.now(),
          })
        ).catch((err) => {
          console.warn('Sesi 2 visual upgrade skipped:', err);
        });
      }

      // Auto-upgrade active Sesi 3 curriculum once if running pre-audit slide/poll version
      const isSesi3ActiveDoc =
        data.materialId === SESI_3_BRANDING_MARKETING_SELLING_CURRICULUM.id ||
        ((data.seminarTitle || '').toLowerCase().includes('branding') &&
          (data.seminarTitle || '').toLowerCase().includes('selling'));
      if (
        isHostRoleRef.current &&
        isSesi3ActiveDoc &&
        !sesi3ContentUpgradeDoneRef.current &&
        (data.updatedAt || 0) < 1733100000000
      ) {
        sesi3ContentUpgradeDoneRef.current = true;
        setDoc(
          doc(db, 'custom_content', 'active'),
          sanitizeForFirestore({
            ...SESI_3_BRANDING_MARKETING_SELLING_CURRICULUM.content,
            brandTheme: sanitizeBrandTheme(data.brandTheme),
            updatedAt: Date.now(),
          })
        ).catch((err) => {
          console.warn('Sesi 3 curriculum sync upgrade skipped:', err);
        });
      }
    };

    const syncFailsafeTimer = setTimeout(() => {
      if (isMounted) setSyncWaitTimedOut(true);
    }, 5500);

    const stateRef = doc(db, 'state', 'session');
    const contentRef = doc(db, 'custom_content', 'active');

    // Direct zero-cache server fetch (SDK getDocFromServer + REST fallback) so QR scans never stall on cache
    const fetchServerDirect = async () => {
      try {
        const [srvStateSnap, srvContentSnap] = await Promise.all([
          getDocFromServer(stateRef).catch(() => null),
          getDocFromServer(contentRef).catch(() => null),
        ]);

        if (srvStateSnap?.exists()) {
          resolvedStateFromNetwork = true;
          remoteStateExistsRef.current = true;
          setHasRemoteState(true);
          applyRemoteSession(srvStateSnap.data() as SessionStateDoc);
        }
        if (srvContentSnap?.exists()) {
          resolvedContentFromNetwork = true;
          remoteContentExistsRef.current = true;
          setHasRemoteContent(true);
          applyRemoteContent(srvContentSnap.data() as CustomContentDoc);
        }
      } catch {
        // Fallback to REST below
      }

      if (!resolvedStateFromNetwork || !resolvedContentFromNetwork) {
        const [restState, restContent] = await Promise.all([
          resolvedStateFromNetwork
            ? Promise.resolve(null)
            : fetchFirestoreDocRest<SessionStateDoc>('state', 'session'),
          resolvedContentFromNetwork
            ? Promise.resolve(null)
            : fetchFirestoreDocRest<CustomContentDoc>('custom_content', 'active'),
        ]);

        if (restState && !resolvedStateFromNetwork) {
          resolvedStateFromNetwork = true;
          remoteStateExistsRef.current = true;
          setHasRemoteState(true);
          applyRemoteSession(restState);
        }
        if (restContent && !resolvedContentFromNetwork) {
          resolvedContentFromNetwork = true;
          remoteContentExistsRef.current = true;
          setHasRemoteContent(true);
          applyRemoteContent(restContent);
        } else if (!restContent && !resolvedContentFromNetwork && initialQrTargetRef.current.materialId) {
          const qrMatRest = await fetchFirestoreDocRest<CustomContentDoc>(
            'custom_content',
            initialQrTargetRef.current.materialId
          );
          if (qrMatRest) {
            resolvedContentFromNetwork = true;
            setHasRemoteContent(true);
            applyRemoteContent(qrMatRest);
          }
        }
      }
    };

    fetchServerDirect();
    const restRetryTimer = setTimeout(() => {
      if (!resolvedStateFromNetwork || !resolvedContentFromNetwork) {
        fetchServerDirect();
      }
    }, 1200);

    const unsubState = onSnapshot(
      stateRef,
      (snap) => {
        remoteStateExistsRef.current = snap.exists();
        setHasRemoteState(true);
        if (snap.exists()) {
          resolvedStateFromNetwork = true;
          applyRemoteSession(snap.data() as SessionStateDoc);
        }
      },
      (err) => {
        setHasRemoteState(true);
        console.warn('Session listener warning:', err);
      }
    );

    const unsubContent = onSnapshot(
      contentRef,
      (snap) => {
        remoteContentExistsRef.current = snap.exists();
        setHasRemoteContent(true);
        if (snap.exists()) {
          resolvedContentFromNetwork = true;
          applyRemoteContent(snap.data() as CustomContentDoc);
        }
      },
      (err) => {
        setHasRemoteContent(true);
        console.warn('Custom content listener warning:', err);
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
        answersLoadedRef.current = true;
        if (qnaLoadedRef.current) {
          setHasRemoteCollectionsLoaded(true);
        }
      },
      (err) => {
        answersLoadedRef.current = true;
        if (qnaLoadedRef.current) {
          setHasRemoteCollectionsLoaded(true);
        }
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
        qnaLoadedRef.current = true;
        if (answersLoadedRef.current) {
          setHasRemoteCollectionsLoaded(true);
        }
      },
      (err) => {
        qnaLoadedRef.current = true;
        if (answersLoadedRef.current) {
          setHasRemoteCollectionsLoaded(true);
        }
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
      isMounted = false;
      clearTimeout(syncFailsafeTimer);
      clearTimeout(restRetryTimer);
      unsubState();
      unsubContent();
      unsubAnswers();
      unsubQna();
      unsubVotes();
    };
  }, []);

  // Subscribe to shared Flipchart board ONLY on host/presenter/remote/extend screens (NEVER participant phones)
  useEffect(() => {
    if (viewRole === 'participant' || viewRole === 'preview' || viewRole === 'guide') {
      setFlipchartRemote(null);
      return;
    }
    const boardRef = doc(db, 'flipchart', 'active');
    const unsubBoard = onSnapshot(
      boardRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as FlipchartBoardDoc;
          const incomingUpdatedAt =
            typeof data.updatedAt === 'number' ? data.updatedAt : Date.now();
          flipchartRevisionRef.current = Math.max(
            flipchartRevisionRef.current,
            incomingUpdatedAt
          );
          // Abaikan sisa sesi Flipchart lama (>2 menit sebelum tab ini dibuka) agar tidak muncul sendiri saat pindah tab
          if (
            data.isOpen &&
            incomingUpdatedAt < appStartedAtRef.current - 2 * 60 * 1000
          ) {
            handleDismissFlipchartRemote(incomingUpdatedAt);
          }
          setFlipchartRemote({
            isOpen: Boolean(data.isOpen),
            syncToProjector:
              typeof data.syncToProjector === 'boolean' ? data.syncToProjector : true,
            activePageIndex: typeof data.activePageIndex === 'number' ? data.activePageIndex : 0,
            pagesJson: typeof data.pagesJson === 'string' ? data.pagesJson : '[]',
            sourceDeviceId: typeof data.sourceDeviceId === 'string' ? data.sourceDeviceId : '',
            updatedAt: incomingUpdatedAt,
          });
        } else {
          setFlipchartRemote(null);
        }
      },
      (err) => {
        console.warn('Flipchart board listener warning:', err);
      }
    );
    return () => unsubBoard();
  }, [viewRole, handleDismissFlipchartRemote]);

  const handlePublishFlipchart = useCallback(
    async (payload: {
      isOpen: boolean;
      syncToProjector: boolean;
      activePageIndex: number;
      pagesJson: string;
      revision?: number;
    }) => {
      const monotonicUpdatedAt = Math.max(
        flipchartRevisionRef.current + 1,
        typeof payload.revision === 'number' ? payload.revision : 0,
        Date.now()
      );
      flipchartRevisionRef.current = monotonicUpdatedAt;
      const nextDoc: FlipchartBoardDoc = {
        isOpen: payload.isOpen,
        syncToProjector: payload.syncToProjector,
        activePageIndex: Math.max(0, Math.min(25, payload.activePageIndex)),
        pagesJson: payload.pagesJson.slice(0, 450000),
        sourceDeviceId: boardDeviceId,
        updatedAt: monotonicUpdatedAt,
      };
      try {
        await setDoc(doc(db, 'flipchart', 'active'), nextDoc);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'flipchart/active');
      }
    },
    [boardDeviceId]
  );

  // Auto-seed & auto-heal simulation answers ONLY on host/presenter roles after remote snapshots resolve.
  // Participant/extend/preview phones NEVER overwrite custom_content/active or state/session.
  useEffect(() => {
    if (!isHostRole || !hasRemoteState || !hasRemoteContent || !hasRemoteCollectionsLoaded) {
      return;
    }

    const checkAndSeed = async () => {
      if (!hasSeededInitial) {
        setHasSeededInitial(true);
        try {
          if (remoteStateExistsRef.current === false) {
            const firstPollId = customContent.polls[0]?.id || DEFAULT_SESSION_STATE.activePollId;
            await setDoc(doc(db, 'state', 'session'), {
              ...DEFAULT_SESSION_STATE,
              activePollId: firstPollId,
              sessionName: (customContent.seminarTitle || DEFAULT_SESSION_STATE.sessionName).slice(0, 120),
              updatedAt: Date.now(),
            });
          }

          if (remoteContentExistsRef.current === false) {
            await setDoc(doc(db, 'custom_content', 'active'), {
              ...DEFAULT_CUSTOM_CONTENT,
              updatedAt: Date.now(),
            });
          }

          const seededFlag = window.localStorage.getItem('partnerup_initial_seeded_v1');
          if (!seededFlag && answers.length === 0 && qnaList.length === 0) {
            window.localStorage.setItem('partnerup_initial_seeded_v1', 'true');
            await replaceSimulationSeeds(
              customContent.materialId,
              customContent.seminarTitle
            );
            return;
          }
        } catch (e) {
          console.warn('Initial seed check skipped:', e);
        }
      }

      // Auto-clean duplicated or mismatched simulation seeds (never touches real attendee answers)
      if (!sesiSeedHealDoneRef.current && answers.length > 0) {
        const seedAnswers = answers.filter((a) => a.participantId?.startsWith('seed_'));
        if (seedAnswers.length > 0) {
          const seenKeys = new Set<string>();
          let hasDuplicates = false;
          for (const sa of seedAnswers) {
            const key = `${sa.participantId}_${sa.q}`;
            if (seenKeys.has(key)) {
              hasDuplicates = true;
              break;
            }
            seenKeys.add(key);
          }

          const titleLower = (customContent.seminarTitle || '').toLowerCase();
          const isSesi2 =
            customContent.materialId === SESI_2_ACTION_PLAN_CURRICULUM.id ||
            titleLower.includes('target penjualan') ||
            titleLower.includes('margin ideal');
          const isSesi3 =
            customContent.materialId === SESI_3_BRANDING_MARKETING_SELLING_CURRICULUM.id ||
            (titleLower.includes('branding') && titleLower.includes('selling')) ||
            titleLower.includes('sesi 3');
          const isPackaging =
            customContent.materialId === 'desain_kemasan_pemasaran_umkm' ||
            titleLower.includes('desain kemasan');
          const isCopywriting =
            customContent.materialId === 'copywriting_foto_sosmed_umkm' ||
            titleLower.includes('caption & foto produk');

          const hasSesi1Seed =
            seedAnswers.some(
              (sa) =>
                sa.participantId === 'seed_busari' ||
                sa.participantId === 'seed_kemuning' ||
                sa.participantId === 'seed_berkah'
            ) && seedAnswers.some((sa) => sa.q === 6);
          const hasSesi2Seed =
            seedAnswers.some((sa) => sa.participantId?.startsWith('seed_s2_')) &&
            seedAnswers.some((sa) => sa.q === 6 && sa.participantId === 'seed_s2_dita');
          const hasSesi3Seed =
            seedAnswers.some((sa) => sa.participantId?.startsWith('seed_s3_')) &&
            seedAnswers.some((sa) => sa.q === 6 && sa.participantId === 'seed_s3_dita');
          const hasPkgSeed =
            seedAnswers.some((sa) => sa.participantId?.startsWith('seed_pkg_')) &&
            seedAnswers.some((sa) => sa.q === 4);
          const hasCwSeed = seedAnswers.some((sa) =>
            sa.participantId?.startsWith('seed_cw_')
          );

          const isMismatched =
            (isSesi2 && !hasSesi2Seed) ||
            (isSesi3 && !hasSesi3Seed) ||
            (isPackaging && !hasPkgSeed) ||
            (isCopywriting && !hasCwSeed) ||
            (!isSesi2 && !isSesi3 && !isPackaging && !isCopywriting && !hasSesi1Seed);

          if (hasDuplicates || isMismatched) {
            sesiSeedHealDoneRef.current = true;
            await replaceSimulationSeeds(
              customContent.materialId,
              customContent.seminarTitle
            );
          } else {
            sesiSeedHealDoneRef.current = true;
          }
        }
      }
    };
    const timer = setTimeout(checkAndSeed, 400);
    return () => clearTimeout(timer);
  }, [
    isHostRole,
    hasRemoteState,
    hasRemoteContent,
    hasRemoteCollectionsLoaded,
    answers,
    qnaList.length,
    hasSeededInitial,
    customContent.materialId,
    customContent.seminarTitle,
    customContent.polls,
  ]);

  const updateSessionState = async (partial: Partial<SessionStateDoc>) => {
    const nextState: SessionStateDoc = sanitizeForFirestore({
      ...sessionStateRef.current,
      ...partial,
      updatedAt: Date.now(),
    });
    sessionStateRef.current = nextState;
    setSessionState(nextState);
    try {
      await setDoc(doc(db, 'state', 'session'), nextState);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'state/session');
    }
  };

  // Custom Content Save & Reset Handlers
  const handleSaveCustomContent = async (updated: CustomContentDoc) => {
    const cleanUpdated = sanitizeForFirestore(updated);
    setCustomContent(cleanUpdated);
    try {
      await setDoc(doc(db, 'custom_content', 'active'), cleanUpdated);
      
      // Update saved material entry in Bank Materi as well
      const currentMatId = cleanUpdated.materialId || activeMaterialId || DEFAULT_PARTNERUP_CURRICULUM.id;
      const existingMat = materials.find((m) => m.id === currentMatId);
      const updatedMaterial: SavedMaterial = {
        id: currentMatId,
        seminarTitle: cleanUpdated.seminarTitle,
        organizerName: cleanUpdated.organizerName,
        description: cleanUpdated.description || existingMat?.description || '',
        category: cleanUpdated.category || existingMat?.category || 'Materi Kustom',
        isDefault: existingMat?.isDefault ?? false,
        createdAt: existingMat?.createdAt || Date.now(),
        updatedAt: Date.now(),
        content: cleanUpdated,
      };
      const nextList = await persistMaterial(db, updatedMaterial, false);
      setMaterials(nextList);

      // Ensure activeQuestion and activeSlide are within new bounds
      const maxQ = Math.max(0, cleanUpdated.questions.length - 1);
      const maxSlide = Math.max(0, cleanUpdated.slides.length - 1);
      const firstPollId = cleanUpdated.polls[0]?.id || 'rational_4types';
      await updateSessionState({
        activeQuestion: Math.min(sessionState.activeQuestion, maxQ),
        activeSlide: Math.min(sessionState.activeSlide, maxSlide),
        activePollId: cleanUpdated.polls.some((p) => p.id === sessionState.activePollId)
          ? sessionState.activePollId
          : firstPollId,
        sessionName: cleanUpdated.seminarTitle.slice(0, 120),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'custom_content/active');
    }
  };

  const handleSelectActiveMaterial = async (material: SavedMaterial) => {
    setActiveMaterialId(material.id);
    setActiveMaterialIdLocal(material.id);

    const contentToApply: CustomContentDoc = sanitizeForFirestore({
      ...material.content,
      seminarTitle: material.seminarTitle,
      organizerName: material.organizerName,
      materialId: material.id,
      description: (material.description || material.content.description || '').slice(0, 300),
      category: (material.category || material.content.category || 'Materi Kustom').slice(0, 60),
      isDefault: Boolean(material.isDefault),
      createdAt: material.createdAt || material.content.createdAt || Date.now(),
      updatedAt: Date.now(),
    });
    setCustomContent(contentToApply);

    try {
      await setDoc(doc(db, 'custom_content', 'active'), contentToApply);
      const firstPollId = contentToApply.polls[0]?.id || 'rational_4types';
      await updateSessionState({
        activeQuestion: 0,
        activeSlide: 0,
        activeSlideStep: 0,
        activeSlideDrawer: 'none',
        activeMode: 'worksheet',
        activePollId: firstPollId,
        sessionName: material.seminarTitle.slice(0, 120),
      });
      // Sinkronkan contoh simulasi demo agar sesuai dengan materi yang baru dipilih (tanpa menghapus jawaban peserta asli)
      const hasSeedAnswers = answers.some((a) => a.participantId?.startsWith('seed_'));
      if (hasSeedAnswers || answers.length === 0) {
        sesiSeedHealDoneRef.current = true;
        await replaceSimulationSeeds(material.id, material.seminarTitle);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'custom_content/active');
    }
  };

  const handleSaveNewMaterial = async (newMaterial: SavedMaterial, setAsActive: boolean = false) => {
    const nextList = await persistMaterial(db, newMaterial, setAsActive);
    setMaterials(nextList);
    if (setAsActive) {
      await handleSelectActiveMaterial(newMaterial);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    const { nextList } = await removeMaterial(db, materialId);
    setMaterials(nextList);
  };

  const handleResetToPartnerUpDefault = async () => {
    const resetDoc: CustomContentDoc = {
      ...DEFAULT_CUSTOM_CONTENT,
      updatedAt: Date.now(),
    };
    await handleSaveCustomContent(resetDoc);
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

  const handleToggleStarAnswer = async (
    ans: AnswerDoc,
    targetSize: 'besar' | 'kecil' = 'besar'
  ) => {
    try {
      const currentActiveSize = ans.spotlightSize || 'besar';
      if (ans.star && currentActiveSize === targetSize) {
        await updateDoc(doc(db, 'answers', ans.id), {
          star: false,
          spotlightSize: 'kecil',
        });
      } else {
        await updateDoc(doc(db, 'answers', ans.id), {
          star: true,
          spotlightSize: targetSize,
          status: 'approved',
        });
      }
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

  // Export CSV using dynamic custom questions
  const handleDownloadCsv = () => {
    try {
      const visibleAnswers = answers
        .filter((a) => a.status !== 'hidden')
        .sort((a, b) => a.q - b.q || a.ts - b.ts);

      const header = ['Pertanyaan', 'Jawaban', 'Keterangan Tambahan', 'Nama usaha', 'Status', 'Waktu'];
      const escapeCsv = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;

      const rows = visibleAnswers.map((a) => {
        const qTitle = customContent.questions[a.q]?.questionText || `Pertanyaan ${a.q + 1}`;
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
        `Rekap_Jawaban_Seminar_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Pengguna menolak atau gagal mengunduh CSV:', err);
    }
  };

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
    sesiSeedHealDoneRef.current = true;
    await replaceSimulationSeeds(customContent.materialId, customContent.seminarTitle);
  };

  // Bursa Kelas & Voting Kuota Handlers
  const handleSaveUnlockCampaign = async (nextCampaign: UnlockCampaignDoc) => {
    try {
      window.localStorage.setItem(VI_POSTER_SEEDED_KEY, '1');
    } catch {
      // noop
    }
    const safeCandidateIds =
      Array.isArray(nextCampaign.candidateMaterialIds) && nextCampaign.candidateMaterialIds.length > 0
        ? nextCampaign.candidateMaterialIds.slice(0, 20)
        : INITIAL_PRESET_MATERIALS.map((m) => m.id).slice(0, 20);
    const { id: _id, ...cleanPayload } = sanitizeForFirestore({
      ...nextCampaign,
      candidateMaterialIds: safeCandidateIds,
      winningMaterialId: nextCampaign.winningMaterialId || '',
      winningSlotId: nextCampaign.winningSlotId || '',
      confirmedScheduleNote: nextCampaign.confirmedScheduleNote || '',
      updatedAt: Date.now(),
    });
    try {
      await setDoc(doc(db, 'unlock_campaigns', 'active'), cleanPayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'unlock_campaigns/active');
    }
  };

  const handleSubmitUnlockVoteAndContact = async (
    voteData: Omit<UnlockVoteDoc, 'id'>,
    contactDetails: {
      whatsapp: string;
      instagram: string;
      businessCategory: string;
      interestedTopicTitle: string;
    }
  ) => {
    const safeCampId = (voteData.campaignId || 'active').replace(/[^a-zA-Z0-9_\-]/g, '');
    const safePartId = voteData.participantId.replace(/[^a-zA-Z0-9_\-]/g, '');
    const parsedIncoming = parseTierOfferingKey(voteData.primaryMaterialId);
    const resolvedIncoming = resolveOfferingByKey(
      voteData.primaryMaterialId,
      materials,
      unlockCampaign
    );
    const effectiveFormat = resolvedIncoming?.format || parsedIncoming.format || 'seminar';
    const canonicalOfferingKey = `${parsedIncoming.anchorMaterialId}::${effectiveFormat}`;
    const offeringSlug = buildOfferingVoteSlug(canonicalOfferingKey);
    const scopedVoteId = `${safeCampId}__${safePartId}__${offeringSlug}`.slice(0, 128);
    const legacyVoteId = `${safeCampId}__${safePartId}`.slice(0, 128);

    const legacyMatch = unlockVotes.find((v) => {
      if (v.id !== legacyVoteId) return false;
      const p = parseTierOfferingKey(v.primaryMaterialId);
      const r = resolveOfferingByKey(v.primaryMaterialId, materials, unlockCampaign);
      const fmt = r?.format || p.format || 'seminar';
      return p.anchorMaterialId === parsedIncoming.anchorMaterialId && fmt === effectiveFormat;
    });

    const deterministicVoteId = legacyMatch ? legacyVoteId : scopedVoteId;

    const voteRef = doc(db, 'unlock_votes', deterministicVoteId);
    const contactRef = doc(db, 'unlock_contacts', deterministicVoteId);

    const existingVote = unlockVotes.find((v) => v.id === deterministicVoteId);
    const isAlreadyPaid = existingVote?.paymentStatus === 'paid';

    const votePayload = sanitizeForFirestore({
      ...voteData,
      campaignId: safeCampId,
      participantId: safePartId,
      mainChallenge: (voteData.mainChallenge || '').slice(0, 220),
      secondaryMaterialIds: (voteData.secondaryMaterialIds || []).slice(0, 3),
      availableSlotIds: (voteData.availableSlotIds || []).slice(0, 8),
      ...(isAlreadyPaid ? { paymentStatus: undefined } : {}),
    });

    const contactPayload = sanitizeForFirestore({
      campaignId: safeCampId,
      voteId: deterministicVoteId,
      participantId: safePartId,
      displayName: voteData.displayName.slice(0, 60),
      businessName: voteData.businessName.slice(0, 60),
      whatsapp: contactDetails.whatsapp.slice(0, 24),
      instagram: contactDetails.instagram.slice(0, 64),
      businessCategory: contactDetails.businessCategory.slice(0, 40),
      interestedTopicId: voteData.primaryMaterialId.slice(0, 100),
      interestedTopicTitle: contactDetails.interestedTopicTitle.slice(0, 120),
      ...(typeof voteData.paymentUniqueCode === 'number'
        ? { paymentUniqueCode: voteData.paymentUniqueCode }
        : {}),
      ...(typeof voteData.paymentAmount === 'number'
        ? { paymentAmount: voteData.paymentAmount }
        : {}),
      ...(!isAlreadyPaid && voteData.paymentStatus
        ? { paymentStatus: voteData.paymentStatus }
        : {}),
      ts: voteData.ts,
    });

    const batch = writeBatch(db);
    batch.set(voteRef, votePayload, { merge: true });
    batch.set(contactRef, contactPayload, { merge: true });

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `unlock_votes/${deterministicVoteId}`);
    }
  };

  const handleConfirmParticipantPayment = async (
    voteId: string,
    paymentUniqueCode: number,
    paymentAmount: number
  ) => {
    const existingVote = unlockVotes.find((v) => v.id === voteId);
    if (existingVote?.paymentStatus === 'paid') return;
    const nowTs = Date.now();
    const batch = writeBatch(db);
    batch.update(doc(db, 'unlock_votes', voteId), {
      paymentStatus: 'confirming',
      paymentUniqueCode,
      paymentAmount,
      ts: nowTs,
    });
    batch.update(doc(db, 'unlock_contacts', voteId), {
      paymentStatus: 'confirming',
      paymentUniqueCode,
      paymentAmount,
      ts: nowTs,
    });
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `unlock_votes/${voteId}`);
    }
  };

  const handleUpdateLeadCrm = async (
    contactId: string,
    updates: {
      leadStage?: UnlockLeadStage;
      mentorNotes?: string;
      paymentStatus?: UnlockPaymentStatus;
      paidAt?: number;
    }
  ) => {
    try {
      const batch = writeBatch(db);
      const contactUpdate = sanitizeForFirestore({
        ...(updates.leadStage ? { leadStage: updates.leadStage } : {}),
        ...(typeof updates.mentorNotes === 'string'
          ? { mentorNotes: updates.mentorNotes.slice(0, 300) }
          : {}),
        ...(updates.paymentStatus ? { paymentStatus: updates.paymentStatus } : {}),
        ...(typeof updates.paidAt === 'number' ? { paidAt: updates.paidAt } : {}),
      });
      batch.update(doc(db, 'unlock_contacts', contactId), contactUpdate);
      if (updates.paymentStatus) {
        batch.update(doc(db, 'unlock_votes', contactId), {
          paymentStatus: updates.paymentStatus,
        });
      }
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `unlock_contacts/${contactId}`);
    }
  };

  const handleUpdateUnlockVoteStatus = async (voteId: string, status: UnlockVoteStatus) => {
    try {
      await updateDoc(doc(db, 'unlock_votes', voteId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `unlock_votes/${voteId}`);
    }
  };

  const handleDeleteUnlockVote = async (voteId: string) => {
    try {
      await deleteDoc(doc(db, 'unlock_votes', voteId));
      if (isVerifiedMentorAdmin) {
        await deleteDoc(doc(db, 'unlock_contacts', voteId)).catch(() => null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `unlock_votes/${voteId}`);
    }
  };

  const handleSeedBursaDemoVotes = async () => {
    const campId = (unlockCampaign.id || 'active').replace(/[^a-zA-Z0-9_\-]/g, '');
    const candidateIds =
      unlockCampaign.candidateMaterialIds.length > 0
        ? unlockCampaign.candidateMaterialIds
        : [DEFAULT_PARTNERUP_CURRICULUM.id];
    const slotIds =
      unlockCampaign.timeSlots.length > 0
        ? unlockCampaign.timeSlots.map((s) => s.id)
        : ['slot_sabtu_pagi'];
    const leadTopic = candidateIds[0];
    const altTopic1 = candidateIds[1] || leadTopic;
    const altTopic2 = candidateIds[2] || leadTopic;
    const mainSlot = slotIds[1] || slotIds[0];
    const altSlot = slotIds[0];
    const altSlot2 = slotIds[2] || slotIds[0];

    const demoParticipants: {
      name: string;
      biz: string;
      cat: string;
      wa: string;
      ig: string;
      topic: string;
      slots: string[];
      flex: boolean;
      status: UnlockVoteStatus;
      stage: UnlockLeadStage;
      note: string;
    }[] = [
      { name: 'Rina Kusuma', biz: 'Keripik Apel Makmur', cat: 'F&B / Kuliner', wa: '081234560101', ig: '@keripikapel.makmur', topic: leadTopic, slots: [mainSlot, altSlot], flex: true, status: 'confirmed_h1', stage: 'prospek_klien', note: 'Feed IG masih gelap, tertarik foto katalog 10 SKU.' },
      { name: 'Budi Santoso', biz: 'Kopi Tubruk Nusantara', cat: 'F&B / Kuliner', wa: '081234560102', ig: '@kopitubruk.nusantara', topic: leadTopic, slots: [mainSlot], flex: true, status: 'confirmed_h1', stage: 'hadir_kelas', note: 'Sudah punya kemasan pouch bagus, butuh foto hero.' },
      { name: 'Dita Anggraini', biz: 'Tas Rajut Dita', cat: 'Kriya / Handmade', wa: '081234560103', ig: '@tasrajut.dita', topic: leadTopic, slots: [mainSlot, altSlot2], flex: true, status: 'committed', stage: 'sudah_dihubungi', note: '' },
      { name: 'Hendra Wijaya', biz: 'Sambal Roa Manado', cat: 'F&B / Kuliner', wa: '081234560104', ig: '@sambalroa.hendra', topic: leadTopic, slots: [mainSlot], flex: false, status: 'confirmed_h1', stage: 'prospek_klien', note: 'Botol kaca sering memantul lampu saat difoto sendiri.' },
      { name: 'Nisa Pratiwi', biz: 'Yoghurt Segar Mbak Nisa', cat: 'F&B / Kuliner', wa: '081234560105', ig: '@yoghurt.mbaknisa', topic: leadTopic, slots: [mainSlot, altSlot], flex: true, status: 'confirmed_h1', stage: 'klien_deal', note: 'Deal paket foto + desain stiker kemasan baru.' },
      { name: 'Fajar Ramadhan', biz: 'Tumbler Grafir Jogja', cat: 'Kriya / Handmade', wa: '081234560106', ig: '@tumblergrafir.jogja', topic: leadTopic, slots: [mainSlot, altSlot2], flex: true, status: 'committed', stage: 'lead_baru', note: '' },
      { name: 'Sari Wulandari', biz: 'Cookies Gula Aren', cat: 'F&B / Kuliner', wa: '081234560107', ig: '@cookiesaren.sari', topic: leadTopic, slots: [mainSlot], flex: true, status: 'committed', stage: 'lead_baru', note: '' },
      { name: 'Agus Setiawan', biz: 'Kulit Asli Garut', cat: 'Fashion / Busana', wa: '081234560108', ig: '@kulitasli.garut', topic: leadTopic, slots: [mainSlot, altSlot], flex: true, status: 'confirmed_h1', stage: 'sudah_dihubungi', note: 'Potensial untuk sesi foto studio produk kulit hitam.' },
      { name: 'Maya Lestari', biz: 'Madu Hutan Asli', cat: 'F&B / Kuliner', wa: '081234560109', ig: '@maduhutan.maya', topic: leadTopic, slots: [mainSlot], flex: false, status: 'committed', stage: 'lead_baru', note: '' },
      { name: 'Rizky Pratama', biz: 'Parfum Lokal Wangi', cat: 'Kecantikan / Herbal', wa: '081234560110', ig: '@parfumlokal.wangi', topic: leadTopic, slots: [mainSlot, altSlot2], flex: true, status: 'confirmed_h1', stage: 'prospek_klien', note: 'Butuh foto high-speed splash + botol transparan.' },
      { name: 'Dewi Kartika', biz: 'Batik Tulis Dewi', cat: 'Fashion / Busana', wa: '081234560111', ig: '@batiktulis.dewi', topic: altTopic1, slots: [mainSlot, altSlot], flex: true, status: 'committed', stage: 'lead_baru', note: '' },
      { name: 'Andi Firmansyah', biz: 'Frozen Dimsum Enak', cat: 'F&B / Kuliner', wa: '081234560112', ig: '@frozendimsum.andi', topic: altTopic1, slots: [mainSlot], flex: true, status: 'committed', stage: 'sudah_dihubungi', note: '' },
      { name: 'Putri Melati', biz: 'Skincare Herbal Putri', cat: 'Kecantikan / Herbal', wa: '081234560113', ig: '@skincare.putrimelati', topic: altTopic1, slots: [mainSlot, altSlot2], flex: true, status: 'committed', stage: 'hadir_kelas', note: '' },
      { name: 'Wahyu Nugroho', biz: 'Berkah Event Rental', cat: 'Jasa / Event', wa: '081234560114', ig: '@berkahevent.id', topic: altTopic2, slots: [mainSlot, altSlot], flex: true, status: 'committed', stage: 'lead_baru', note: '' },
      { name: 'Lina Marlina', biz: 'Hampers Kue Kering', cat: 'F&B / Kuliner', wa: '081234560115', ig: '@hampers.linamarlina', topic: altTopic2, slots: [mainSlot], flex: true, status: 'committed', stage: 'lead_baru', note: '' },
      { name: 'Tono Suhartono', biz: 'Abon Sapi Asli', cat: 'F&B / Kuliner', wa: '081234560116', ig: '@abonsapi.tono', topic: altTopic1, slots: [altSlot], flex: false, status: 'committed', stage: 'lead_baru', note: '' },
    ];

    try {
      const batch = writeBatch(db);
      const baseTs = Date.now();
      demoParticipants.forEach((p, idx) => {
        const pId = `seed_bursa_${String(idx + 1).padStart(2, '0')}`;
        const vId = `${campId}__${pId}`;
        const tsVal = baseTs - (demoParticipants.length - idx) * 45000;
        const topicTitle =
          materials.find((m) => m.id === p.topic)?.seminarTitle || p.topic;

        batch.set(
          doc(db, 'unlock_votes', vId),
          sanitizeForFirestore({
            campaignId: campId,
            participantId: pId,
            displayName: p.name,
            businessName: p.biz,
            primaryMaterialId: p.topic,
            secondaryMaterialIds: [],
            availableSlotIds: p.slots,
            flexibleTopic: p.flex,
            mainChallenge: 'Ingin meningkatkan kompetensi tim & praktik terukur bersama peserta lain.',
            status: p.status,
            ts: tsVal,
          })
        );

        if (isVerifiedMentorAdmin) {
          batch.set(
            doc(db, 'unlock_contacts', vId),
            sanitizeForFirestore({
              campaignId: campId,
              voteId: vId,
              participantId: pId,
              displayName: p.name,
              businessName: p.biz,
              whatsapp: p.wa,
              instagram: p.ig,
              businessCategory: p.cat,
              interestedTopicId: p.topic,
              interestedTopicTitle: topicTitle.slice(0, 120),
              leadStage: p.stage,
              mentorNotes: p.note,
              ts: tsVal,
            })
          );
        }
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'unlock_votes');
    }
  };

  const handleClearBursaDemoVotes = async () => {
    const demoVotes = unlockVotes.filter((v) => v.participantId.startsWith('seed_bursa_'));
    const demoContacts = unlockContacts.filter((c) => c.participantId.startsWith('seed_bursa_'));
    try {
      await Promise.all([
        ...demoVotes.map((v) => deleteDoc(doc(db, 'unlock_votes', v.id))),
        ...(isVerifiedMentorAdmin
          ? demoContacts.map((c) => deleteDoc(doc(db, 'unlock_contacts', c.id)))
          : []),
      ]);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'unlock_votes');
    }
  };

  const approvedAnswers = answers.filter((a) => a.status === 'approved');
  const approvedQna = qnaList.filter((q) => q.status === 'approved');
  const myAnswers = answers.filter((a) => a.participantId === participantId);
  const pendingCount =
    answers.filter((a) => a.status === 'pending').length +
    qnaList.filter((q) => q.status === 'pending').length;

  if (viewRole === 'extend') {
    return (
      <SlideDeckView
        slides={customContent.slides}
        questions={customContent.questions}
        polls={customContent.polls}
        pollVotes={pollVotes}
        seminarTitle={customContent.seminarTitle}
        organizerName={customContent.organizerName}
        brandTheme={customContent.brandTheme}
        joinUrl={joinUrl}
        extendUrl={extendUrl}
        activeSlideIndex={sessionState.activeSlide}
        activeSlideStep={sessionState.activeSlideStep ?? 0}
        stepByStepEnabled={sessionState.stepByStepEnabled ?? true}
        transitionStyle={sessionState.transitionStyle || 'slide'}
        activeSlideDrawer={sessionState.activeSlideDrawer || 'none'}
        allowParticipantSlideAccess={Boolean(sessionState.allowParticipantSlideAccess)}
        activeQuestionIndex={sessionState.activeQuestion}
        activePollId={sessionState.activePollId}
        isAudienceExtendWindow={true}
        onUpdateSlideState={(partial) => updateSessionState(partial)}
        onLaunchWorksheetQuestion={(qIdx) => {
          updateSessionState({ activeQuestion: qIdx, activeMode: 'worksheet' });
        }}
        onLaunchPoll={(pollId) => {
          updateSessionState({ activePollId: pollId, activeMode: 'poll' });
        }}
        onLaunchQna={() => {
          updateSessionState({ activeMode: 'qna' });
        }}
        onSyncQuestionOnly={(qIdx) => {
          updateSessionState({ activeQuestion: qIdx, activeMode: 'worksheet' });
        }}
        onSyncPollOnly={(pollId) => {
          updateSessionState({ activePollId: pollId, activeMode: 'poll' });
        }}
        onToggleStarAnswer={handleToggleStarAnswer}
        onApproveAnswer={handleApproveAnswer}
        onToggleStarQna={handleToggleStarQna}
        onExitExtendWindow={() => setViewRole('slides')}
        approvedAnswers={approvedAnswers}
        allAnswers={answers}
        approvedQna={approvedQna}
        activeMode={sessionState.activeMode}
        flipchartRemote={flipchartRemote}
        boardDeviceId={boardDeviceId}
        dismissedFlipchartTs={dismissedFlipchartTs}
        onDismissFlipchartRemote={handleDismissFlipchartRemote}
        onPublishFlipchart={handlePublishFlipchart}
      />
    );
  }

  if (viewRole === 'preview') {
    return (
      <CommitteePreviewView
        customContent={customContent}
        onOpenPresenterPanel={() => setIsAuthModalOpen(true)}
      />
    );
  }

  const isPublicBursaHeader =
    viewRole === 'bursa' && forcePublicBursa && !isPresenterUnlocked;
  const isPublicHeaderOnly = viewRole === 'participant' || isPublicBursaHeader;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#FFF7EC] text-[#1F3A5F]">
      {/* Conditional Header: Clean Participant/Public Header vs Presenter/Organizer 3-Zone Navigation */}
      {isPublicHeaderOnly ? (
        <header className="w-full max-w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-[#1F3A5F] text-white border-b border-white/10 sticky top-0 z-30 shadow-xs">
          <div
            onClick={handleSecretTrigger}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer select-none active:opacity-85 transition-opacity"
            title={isPresenterUnlocked ? "Klik untuk menu peran pemateri" : undefined}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Terkoneksi Live" />
            <div className="min-w-0">
              <h1 className="font-display text-sm sm:text-base font-extrabold tracking-tight text-white truncate leading-tight">
                {isPublicBursaHeader
                  ? unlockCampaign.title
                  : customContent.seminarTitle || 'obeeAcademy'}
              </h1>
              <p className="text-[11px] text-white/70 truncate leading-none mt-0.5">
                {isPublicBursaHeader
                  ? unlockCampaign.organizerName || 'obeeAcademy'
                  : customContent.organizerName || 'obeeAcademy | Obeecreatives'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallModalTrigger variant="light" />
            {/* If Presenter is unlocked, show developer role switcher pill */}
            {isPresenterUnlocked && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-[11px] font-bold text-[#F28C28] hover:text-[#ff9d3b] bg-white/10 hover:bg-white/15 border border-[#F28C28]/40 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="Panel Pengembang & Pemateri (Terbuka)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Panel Presenter</span>
              </button>
            )}
          </div>
        </header>
      ) : (
        /* Strict 3-Zone Top Navigation Bar for Presenter / Developer / Moderator */
        <header className="w-full max-w-full flex flex-wrap lg:flex-nowrap items-center justify-between gap-x-3 gap-y-2 sm:gap-4 px-3 sm:px-6 py-2.5 sm:py-3 bg-[#1F3A5F] text-white border-b border-white/10 sticky top-0 z-30">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setViewRole('projector');
            }}
            className="font-display text-sm sm:text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 order-1"
          >
            obeeAcademy
          </a>

          {/* Zone 2: Concise Single-Line Navigation Links (Full row on HP/Tablet, middle row on Desktop) */}
          <nav className="order-3 lg:order-2 w-full lg:w-auto lg:flex-1 min-w-0 flex items-center justify-start gap-3 sm:gap-4 lg:gap-5 text-xs sm:text-[13px] font-medium text-white/85 overflow-x-auto no-scrollbar py-1 border-t border-white/10 lg:border-t-0">
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
              Materi Slide
            </button>

            <button
              onClick={() => setViewRole('remote')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                viewRole === 'remote'
                  ? 'text-[#F28C28] font-bold border-b-2 border-[#F28C28]'
                  : ''
              }`}
            >
              Remote HP
            </button>

            <button
              onClick={() => setViewRole('participant')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5"
            >
              Simulasi HP Peserta
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

            <button
              onClick={() => setViewRole('editor')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                viewRole === 'editor'
                  ? 'text-[#F28C28] font-bold border-b-2 border-[#F28C28]'
                  : ''
              }`}
            >
              Editor Materi
            </button>

            <button
              onClick={() => {
                setForcePublicBursa(false);
                setViewRole('bursa');
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 flex items-center gap-1 ${
                viewRole === 'bursa'
                  ? 'text-[#F28C28] font-bold border-b-2 border-[#F28C28]'
                  : ''
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>Bursa Kelas</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action Buttons + Presenter Lock */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 order-2 lg:order-3 ml-auto lg:ml-0">
            <button
              onClick={() => setIsBankModalOpen(true)}
              className="px-2 sm:px-2.5 py-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-xs"
              title="Kelola Bank Materi, buat modul baru, atau beralih sesi"
            >
              <Layers className="w-3.5 h-3.5 text-[#F28C28]" />
              <span className="hidden md:inline">Bank Materi</span>
              <span className="text-[10px] font-extrabold bg-[#2A9D8F] text-white px-1.5 py-0.5 rounded">
                {materials.length}
              </span>
            </button>

            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="px-2 sm:px-2.5 py-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-xs"
              title="Buku Panduan Teknis, Glosarium & Duplikasi (PDF)"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#F28C28]" />
              <span className="hidden lg:inline">Buku Panduan</span>
              <span className="text-[10px] font-extrabold bg-[#F28C28] text-white px-1.5 py-0.5 rounded">PDF</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-2 sm:px-3 py-1.5 text-xs font-bold text-white bg-[#F28C28] rounded-lg hover:bg-[#d97719] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 sm:gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Unduh Rekap CSV</span>
              <span className="xl:hidden">CSV</span>
            </button>

            <button
              onClick={handleLockPresenter}
              className="p-1.5 text-white/70 hover:text-white bg-white/5 hover:bg-white/15 border border-white/15 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Kunci Akses Presenter & Kembali ke Tampilan Peserta"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      )}

      {/* Main Content Stage */}
      <main className="flex-1">
        {viewRole === 'projector' && (
          <ProjectorView
            questions={customContent.questions}
            polls={customContent.polls}
            seminarTitle={customContent.seminarTitle}
            organizerName={customContent.organizerName}
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
            onToggleLockAnswers={(locked, notice) =>
              updateSessionState({
                answersLocked: locked,
                ...(notice ? { lockedNotice: notice } : {}),
              })
            }
            flipchartRemote={flipchartRemote}
            boardDeviceId={boardDeviceId}
            dismissedFlipchartTs={dismissedFlipchartTs}
            onDismissFlipchartRemote={handleDismissFlipchartRemote}
            onPublishFlipchart={handlePublishFlipchart}
          />
        )}

        {viewRole === 'slides' && (
          <SlideDeckView
            slides={customContent.slides}
            questions={customContent.questions}
            polls={customContent.polls}
            pollVotes={pollVotes}
            seminarTitle={customContent.seminarTitle}
            organizerName={customContent.organizerName}
            brandTheme={customContent.brandTheme}
            joinUrl={joinUrl}
            extendUrl={extendUrl}
            activeSlideIndex={sessionState.activeSlide}
            activeSlideStep={sessionState.activeSlideStep ?? 0}
            stepByStepEnabled={sessionState.stepByStepEnabled ?? true}
            transitionStyle={sessionState.transitionStyle || 'slide'}
            activeSlideDrawer={sessionState.activeSlideDrawer || 'none'}
            allowParticipantSlideAccess={Boolean(sessionState.allowParticipantSlideAccess)}
            answersLocked={Boolean(sessionState.answersLocked)}
            lockedNotice={sessionState.lockedNotice}
            onToggleLockAnswers={(locked, notice) =>
              updateSessionState({
                answersLocked: locked,
                ...(notice ? { lockedNotice: notice } : {}),
              })
            }
            activeQuestionIndex={sessionState.activeQuestion}
            activePollId={sessionState.activePollId}
            onUpdateSlideState={(partial) => updateSessionState(partial)}
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
            onSyncQuestionOnly={(qIdx) => {
              updateSessionState({ activeQuestion: qIdx, activeMode: 'worksheet' });
            }}
            onSyncPollOnly={(pollId) => {
              updateSessionState({ activePollId: pollId, activeMode: 'poll' });
            }}
            onToggleStarAnswer={handleToggleStarAnswer}
            onApproveAnswer={handleApproveAnswer}
            onToggleStarQna={handleToggleStarQna}
            approvedAnswers={approvedAnswers}
            allAnswers={answers}
            approvedQna={approvedQna}
            activeMode={sessionState.activeMode}
            flipchartRemote={flipchartRemote}
            boardDeviceId={boardDeviceId}
            dismissedFlipchartTs={dismissedFlipchartTs}
            onDismissFlipchartRemote={handleDismissFlipchartRemote}
            onPublishFlipchart={handlePublishFlipchart}
          />
        )}

        {viewRole === 'participant' && (
          <div>
            {!window.location.search.includes('view=participant') && window.innerWidth >= 768 && (
              <div className="bg-[#FFF7EC] border-b border-[#1F3A5F]/10 px-4 py-2 text-center text-xs text-[#1F3A5F]/75 flex flex-wrap items-center justify-center gap-3">
                <span>
                  Mode Simulasi: <strong>HP Peserta</strong> ({customContent.seminarTitle}).
                </span>
                <button
                  onClick={() => setViewRole('projector')}
                  className="font-bold text-[#F28C28] hover:underline cursor-pointer"
                >
                  Kembali ke presenter →
                </button>
              </div>
            )}
            {(!hasRemoteState || !hasRemoteContent) && !syncWaitTimedOut ? (
              <div className="max-w-xl mx-auto px-4 py-14 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#1F3A5F] text-white flex items-center justify-center mx-auto shadow-md">
                  <div className="w-5 h-5 border-2 border-[#F28C28] border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-display text-lg font-extrabold text-[#1F3A5F]">
                    Menyambungkan ke Materi Aktif...
                  </h2>
                  <p className="text-xs sm:text-sm text-[#1F3A5F]/70">
                    Sedang menyinkronkan pertanyaan dan polling langsung dari layar presenter.
                  </p>
                </div>
              </div>
            ) : (
              <ParticipantView
                questions={customContent.questions}
                polls={customContent.polls}
                slides={customContent.slides}
                seminarTitle={customContent.seminarTitle}
                organizerName={customContent.organizerName}
                brandTheme={customContent.brandTheme}
                qnaTopics={customContent.qnaTopics}
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
            )}
          </div>
        )}

        {viewRole === 'moderation' && (
          <ModerationView
            questions={customContent.questions}
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
            onOpenContentEditor={() => setViewRole('editor')}
            onToggleLockAnswers={async (locked, notice) =>
              updateSessionState({
                answersLocked: locked,
                ...(notice ? { lockedNotice: notice } : {}),
              })
            }
          />
        )}

        {viewRole === 'editor' && (
          <ContentEditorView
            customContent={customContent}
            onSaveCustomContent={handleSaveCustomContent}
            onResetToPartnerUpDefault={handleResetToPartnerUpDefault}
            onOpenGuide={() => setIsGuideModalOpen(true)}
            materials={materials}
            activeMaterialId={activeMaterialId}
            onSelectActiveMaterial={handleSelectActiveMaterial}
            onSaveNewMaterial={handleSaveNewMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onOpenBankModal={() => setIsBankModalOpen(true)}
          />
        )}

        {viewRole === 'remote' && (
          <RemoteClickerView
            slides={customContent.slides}
            questions={customContent.questions}
            polls={customContent.polls}
            pollVotes={pollVotes}
            seminarTitle={customContent.seminarTitle}
            activeSlideIndex={sessionState.activeSlide}
            activeSlideStep={sessionState.activeSlideStep ?? 0}
            stepByStepEnabled={sessionState.stepByStepEnabled ?? true}
            transitionStyle={sessionState.transitionStyle || 'slide'}
            activeSlideDrawer={sessionState.activeSlideDrawer || 'none'}
            allowParticipantSlideAccess={Boolean(sessionState.allowParticipantSlideAccess)}
            answersLocked={Boolean(sessionState.answersLocked)}
            lockedNotice={sessionState.lockedNotice}
            onToggleLockAnswers={(locked, notice) =>
              updateSessionState({
                answersLocked: locked,
                ...(notice ? { lockedNotice: notice } : {}),
              })
            }
            activeQuestionIndex={sessionState.activeQuestion}
            activePollId={sessionState.activePollId}
            activeMode={sessionState.activeMode}
            approvedAnswers={approvedAnswers}
            allAnswers={answers}
            approvedQna={approvedQna}
            onUpdateSlideState={(partial) => updateSessionState(partial)}
            onSyncQuestionOnly={(qIdx) => {
              updateSessionState({ activeQuestion: qIdx, activeMode: 'worksheet' });
            }}
            onSyncPollOnly={(pollId) => {
              updateSessionState({ activePollId: pollId, activeMode: 'poll' });
            }}
            onToggleStarAnswer={handleToggleStarAnswer}
            onApproveAnswer={handleApproveAnswer}
            onToggleStarQna={handleToggleStarQna}
            onOpenGuide={() => setIsGuideModalOpen(true)}
            flipchartRemote={flipchartRemote}
            boardDeviceId={boardDeviceId}
            onPublishFlipchart={handlePublishFlipchart}
          />
        )}

        {viewRole === 'bursa' && (
          <ClassUnlockPortalView
            isHostMode={!isPublicBursaHeader}
            materials={materials}
            campaign={unlockCampaign}
            votes={unlockVotes}
            contacts={unlockContacts}
            participantId={participantId}
            isVerifiedMentorAdmin={isVerifiedMentorAdmin}
            mentorEmail={mentorUser?.email || null}
            initialHighlightedMaterialId={initialQrTargetRef.current.materialId}
            onLoginMentorGoogle={async () => {
              await loginWithGoogle();
            }}
            onLogoutMentorGoogle={async () => {
              await logoutUser();
            }}
            onSaveCampaign={handleSaveUnlockCampaign}
            onSubmitVoteAndContact={handleSubmitUnlockVoteAndContact}
            onConfirmParticipantPayment={handleConfirmParticipantPayment}
            onUpdateLeadCrm={handleUpdateLeadCrm}
            onUpdateVoteStatus={handleUpdateUnlockVoteStatus}
            onDeleteVote={handleDeleteUnlockVote}
            onSeedDemoVotes={handleSeedBursaDemoVotes}
            onClearDemoVotes={handleClearBursaDemoVotes}
            onActivateWinningMaterial={async (mat) => {
              await handleSelectActiveMaterial(mat);
              setViewRole('slides');
            }}
            onCreateMaterial={async (newMat) => {
              const nextList = await persistMaterial(db, newMat, false);
              setMaterials(nextList);
            }}
            onBackToPresenter={() => setViewRole('projector')}
          />
        )}
      </main>

      {/* Floating Developer Quick Switcher for Presenter when simulating participant */}
      {isPresenterUnlocked && viewRole === 'participant' && (
        <div className="fixed bottom-4 right-4 z-40 animate-fade-in">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 bg-[#1F3A5F] text-white hover:bg-[#162a45] shadow-xl border border-white/20 px-3.5 py-2 rounded-full text-xs font-bold cursor-pointer transition-all hover:scale-105 active:scale-95"
            title="Buka Menu Navigasi Pemateri & Developer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Panel Presenter</span>
          </button>
        </div>
      )}

      {/* Footer: Differentiated for Participant vs Developer/Presenter */}
      <footer className="border-t border-[#1F3A5F]/10 py-4 px-6 text-center text-xs text-[#1F3A5F]/60 bg-[#FFF7EC] flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <span>{customContent.seminarTitle} · {customContent.organizerName}</span>
        {!isPublicHeaderOnly ? (
          <button
            type="button"
            onClick={() => setIsGuideModalOpen(true)}
            className="text-xs text-[#F28C28] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Buku Panduan & Manual Duplikasi (PDF)</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#1F3A5F]/50">
              {isPublicBursaHeader ? 'Portal Bursa Materi Pelatihan' : 'Portal Interaktif Peserta'}
            </span>
            {/* Subtle discreet lock for developer login */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-[#1F3A5F]/20 hover:text-[#1F3A5F]/70 p-1 rounded transition-colors cursor-pointer"
              title="Akses Pemateri & Developer"
            >
              <Lock className="w-3 h-3" />
            </button>
          </div>
        )}
      </footer>
      <OfflineBanner />

      {/* Materials Bank Library Modal */}
      <MaterialsBankModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        materials={materials}
        activeMaterialId={activeMaterialId}
        onSelectActiveMaterial={handleSelectActiveMaterial}
        onEditMaterialInEditor={(mat) => {
          handleSelectActiveMaterial(mat);
          setViewRole('editor');
        }}
        onSaveNewMaterial={handleSaveNewMaterial}
        onDeleteMaterial={handleDeleteMaterial}
      />

      {/* Presenter & Developer Authentication & Role Navigation Modal */}
      <PresenterAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentRole={viewRole}
        onSelectRole={(r) => {
          if (r === 'bursa') {
            setForcePublicBursa(false);
          }
          setViewRole(r);
        }}
        isUnlocked={isPresenterUnlocked}
        onUnlockSuccess={() => {
          setIsPresenterUnlocked(true);
        }}
        onLock={handleLockPresenter}
        onOpenGuide={() => {
          setIsGuideModalOpen(true);
        }}
      />

      {/* Comprehensive System Guide & Duplication Manual Modal - Strict Developer Access */}
      <SystemGuideModal
        isOpen={(isGuideModalOpen || viewRole === 'guide') && !isPublicHeaderOnly}
        onClose={() => {
          setIsGuideModalOpen(false);
          if (viewRole === 'guide') {
            setViewRole('projector');
          }
        }}
        seminarTitle={customContent.seminarTitle}
        organizerName={customContent.organizerName}
        brandTheme={customContent.brandTheme}
      />
    </div>
  );
}

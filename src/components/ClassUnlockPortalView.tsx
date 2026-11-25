import React, { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Database,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  Image as ImageIcon,
  Instagram,
  Lock,
  MessageCircle,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';
import {
  SavedMaterial,
  UnlockCampaignDoc,
  UnlockCampaignStatus,
  UnlockContactDoc,
  UnlockLeadStage,
  UnlockTimeSlot,
  UnlockVoteDoc,
  UnlockVoteStatus,
} from '../types';
import {
  buildBursaBroadcastText,
  downloadMaterialPosterPng,
  extractMaterialCoreHighlights,
  getMaterialCoverImageUrl,
  renderMaterialPosterDataUrl,
} from '../utils/posterExport';

interface ClassUnlockPortalViewProps {
  isHostMode: boolean;
  materials: SavedMaterial[];
  campaign: UnlockCampaignDoc;
  votes: UnlockVoteDoc[];
  contacts: UnlockContactDoc[];
  participantId: string;
  isVerifiedMentorAdmin: boolean;
  mentorEmail: string | null;
  initialHighlightedMaterialId?: string | null;
  onLoginMentorGoogle: () => Promise<void>;
  onLogoutMentorGoogle: () => Promise<void>;
  onSaveCampaign: (next: UnlockCampaignDoc) => Promise<void>;
  onSubmitVoteAndContact: (
    vote: Omit<UnlockVoteDoc, 'id'>,
    contactDetails: {
      whatsapp: string;
      instagram: string;
      businessCategory: string;
      interestedTopicTitle: string;
    }
  ) => Promise<void>;
  onUpdateLeadCrm: (
    contactId: string,
    updates: { leadStage?: UnlockLeadStage; mentorNotes?: string }
  ) => Promise<void>;
  onUpdateVoteStatus: (voteId: string, status: UnlockVoteStatus) => Promise<void>;
  onDeleteVote: (voteId: string) => Promise<void>;
  onSeedDemoVotes: () => Promise<void>;
  onClearDemoVotes: () => Promise<void>;
  onActivateWinningMaterial: (material: SavedMaterial) => Promise<void>;
  onBackToPresenter?: () => void;
}

const LOCAL_WA_CACHE_KEY = 'partnerup_bursa_my_wa_v1';
const LOCAL_IG_CACHE_KEY = 'partnerup_bursa_my_ig_v1';
const LOCAL_CAT_CACHE_KEY = 'partnerup_bursa_my_cat_v1';
const LOCAL_NAME_CACHE_KEY = 'partnerup_bursa_my_name_v1';
const LOCAL_BIZ_CACHE_KEY = 'partnerup_bursa_my_biz_v1';

const BUSINESS_CATEGORIES = [
  'F&B / Kuliner',
  'Kriya / Handmade',
  'Fashion / Busana',
  'Kecantikan / Herbal',
  'Jasa / Event',
  'Lainnya',
];

const LEAD_STAGE_META: Record<
  UnlockLeadStage,
  { label: string; badgeClass: string }
> = {
  lead_baru: {
    label: 'Lead Baru',
    badgeClass: 'bg-slate-100 border-slate-200 text-slate-700',
  },
  sudah_dihubungi: {
    label: 'Sudah Dihubungi',
    badgeClass: 'bg-sky-50 border-sky-200 text-sky-800',
  },
  hadir_kelas: {
    label: 'Hadir Kelas',
    badgeClass: 'bg-amber-50 border-amber-200 text-amber-800',
  },
  prospek_klien: {
    label: 'Prospek Klien',
    badgeClass: 'bg-orange-50 border-orange-200 text-orange-800',
  },
  klien_deal: {
    label: 'Klien Deal',
    badgeClass: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  },
};

function normalizeWhatsappForWaMe(raw: string): string {
  const digits = (raw || '').replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `62${digits}`;
  return digits;
}

function normalizeInstagramHandle(raw: string): string {
  let clean = (raw || '').trim();
  clean = clean.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');
  clean = clean.split(/[/?#]/)[0] || '';
  clean = clean.replace(/^@+/, '').replace(/\s+/g, '');
  if (!clean) return '';
  return `@${clean}`;
}

function getInstagramProfileUrl(handle?: string): string {
  const clean = (handle || '').replace(/^@+/, '').trim();
  if (!clean) return '';
  return `https://instagram.com/${encodeURIComponent(clean)}`;
}

export const ClassUnlockPortalView: React.FC<ClassUnlockPortalViewProps> = ({
  isHostMode,
  materials,
  campaign,
  votes,
  contacts,
  participantId,
  isVerifiedMentorAdmin,
  mentorEmail,
  initialHighlightedMaterialId,
  onLoginMentorGoogle,
  onLogoutMentorGoogle,
  onSaveCampaign,
  onSubmitVoteAndContact,
  onUpdateLeadCrm,
  onUpdateVoteStatus,
  onDeleteVote,
  onSeedDemoVotes,
  onClearDemoVotes,
  onActivateWinningMaterial,
  onBackToPresenter,
}) => {
  const [hostTab, setHostTab] = useState<'posters' | 'monitor' | 'crm' | 'setup'>('posters');

  const baseBursaUrl = useMemo(() => {
    if (typeof window === 'undefined') return '/?view=bursa';
    return `${window.location.origin}${window.location.pathname}?view=bursa`;
  }, []);

  const visiblePosterIdSet = useMemo(
    () => new Set(campaign.candidateMaterialIds),
    [campaign.candidateMaterialIds]
  );

  const candidateMaterials = useMemo(() => {
    const matched = materials.filter((m) => visiblePosterIdSet.has(m.id));
    return matched.length > 0 ? matched : materials;
  }, [visiblePosterIdSet, materials]);

  const analytics = useMemo(() => {
    const activeVotes = votes.filter((v) => v.status !== 'cancelled');
    const candidateStats = candidateMaterials.map((mat) => {
      const primaryCount = activeVotes.filter((v) => v.primaryMaterialId === mat.id).length;
      const secondaryCount = activeVotes.filter((v) =>
        (v.secondaryMaterialIds || []).includes(mat.id)
      ).length;
      const sharePct =
        activeVotes.length > 0 ? Math.round((primaryCount / activeVotes.length) * 100) : 0;
      return {
        material: mat,
        primaryCount,
        secondaryCount,
        sharePct,
      };
    });

    const sortedCandidates = [...candidateStats].sort(
      (a, b) => b.primaryCount - a.primaryCount || b.secondaryCount - a.secondaryCount
    );
    const leadingCandidate = sortedCandidates[0] || null;
    const leadingMaterialId =
      campaign.winningMaterialId &&
      candidateMaterials.some((m) => m.id === campaign.winningMaterialId)
        ? campaign.winningMaterialId
        : leadingCandidate?.material.id || candidateMaterials[0]?.id || '';

    const slotStats = campaign.timeSlots.map((slot) => {
      const slotVoters = activeVotes.filter((v) =>
        (v.availableSlotIds || []).includes(slot.id)
      );
      const exactCount = slotVoters.filter(
        (v) => v.primaryMaterialId === leadingMaterialId
      ).length;
      const rescueCount = slotVoters.filter(
        (v) => v.primaryMaterialId !== leadingMaterialId && v.flexibleTopic === true
      ).length;
      const effectiveQuorum = exactCount + rescueCount;
      return {
        slot,
        totalAvailable: slotVoters.length,
        exactCount,
        rescueCount,
        effectiveQuorum,
      };
    });

    const sortedSlots = [...slotStats].sort(
      (a, b) =>
        b.effectiveQuorum - a.effectiveQuorum ||
        b.exactCount - a.exactCount ||
        b.totalAvailable - a.totalAvailable
    );
    const bestSlotStat = sortedSlots[0] || null;
    const minQ = Math.max(5, campaign.minQuota || 15);
    const bestEffective = bestSlotStat?.effectiveQuorum || 0;
    const quorumProgressPct = Math.min(100, Math.round((bestEffective / minQ) * 100));
    const isQuorumReached = bestEffective >= minQ;
    const confirmedCount = activeVotes.filter((v) => v.status === 'confirmed_h1').length;

    return {
      activeVotes,
      candidateStats,
      sortedCandidates,
      leadingCandidate,
      leadingMaterialId,
      slotStats,
      bestSlotStat,
      bestEffective,
      quorumProgressPct,
      isQuorumReached,
      confirmedCount,
      demoCount: votes.filter((v) => v.participantId.startsWith('seed_bursa_')).length,
    };
  }, [votes, candidateMaterials, campaign.timeSlots, campaign.minQuota, campaign.winningMaterialId]);

  const myExistingVote = useMemo(
    () =>
      votes.find(
        (v) => v.campaignId === (campaign.id || 'active') && v.participantId === participantId
      ) || null,
    [votes, campaign.id, participantId]
  );

  // Participant Registration + Vote Modal State
  const [isVoteModalOpen, setIsVoteModalOpen] = useState<boolean>(false);
  const [voteStep, setVoteStep] = useState<1 | 2>(1);
  const [primaryMaterialId, setPrimaryMaterialId] = useState<string>(() => {
    if (
      initialHighlightedMaterialId &&
      candidateMaterials.some((m) => m.id === initialHighlightedMaterialId)
    ) {
      return initialHighlightedMaterialId;
    }
    return candidateMaterials[0]?.id || '';
  });
  const [secondaryMaterialIds, setSecondaryMaterialIds] = useState<string[]>([]);
  const [availableSlotIds, setAvailableSlotIds] = useState<string[]>(() =>
    campaign.timeSlots[0]?.id ? [campaign.timeSlots[0].id] : []
  );
  const [flexibleTopic, setFlexibleTopic] = useState<boolean>(true);
  const [displayName, setDisplayName] = useState<string>(() => {
    try {
      return window.localStorage.getItem(LOCAL_NAME_CACHE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [businessName, setBusinessName] = useState<string>(() => {
    try {
      return window.localStorage.getItem(LOCAL_BIZ_CACHE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [businessCategory, setBusinessCategory] = useState<string>(() => {
    try {
      return window.localStorage.getItem(LOCAL_CAT_CACHE_KEY) || BUSINESS_CATEGORIES[0];
    } catch {
      return BUSINESS_CATEGORIES[0];
    }
  });
  const [whatsapp, setWhatsapp] = useState<string>(() => {
    try {
      return window.localStorage.getItem(LOCAL_WA_CACHE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [instagram, setInstagram] = useState<string>(() => {
    try {
      return window.localStorage.getItem(LOCAL_IG_CACHE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [mainChallenge, setMainChallenge] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');
  const [isSubmittingVote, setIsSubmittingVote] = useState<boolean>(false);
  const [hasInitializedFromMyVote, setHasInitializedFromMyVote] = useState<boolean>(false);

  useEffect(() => {
    if (myExistingVote && !hasInitializedFromMyVote) {
      setHasInitializedFromMyVote(true);
      setPrimaryMaterialId(myExistingVote.primaryMaterialId);
      setSecondaryMaterialIds(myExistingVote.secondaryMaterialIds || []);
      setAvailableSlotIds(myExistingVote.availableSlotIds || []);
      setFlexibleTopic(myExistingVote.flexibleTopic);
      setDisplayName(myExistingVote.displayName);
      setBusinessName(myExistingVote.businessName);
      setMainChallenge(myExistingVote.mainChallenge || '');
    }
  }, [myExistingVote, hasInitializedFromMyVote]);

  useEffect(() => {
    if (!candidateMaterials.some((m) => m.id === primaryMaterialId) && candidateMaterials[0]) {
      setPrimaryMaterialId(candidateMaterials[0].id);
    }
  }, [candidateMaterials, primaryMaterialId]);

  // Poster Preview Modal State
  const [posterModalMaterial, setPosterModalMaterial] = useState<SavedMaterial | null>(null);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string>('');
  const [isRenderingPoster, setIsRenderingPoster] = useState<boolean>(false);
  const modalQrWrapRef = useRef<HTMLDivElement | null>(null);

  // Studio Poster State (Host)
  const [studioMaterialId, setStudioMaterialId] = useState<string>(
    () => candidateMaterials[0]?.id || materials[0]?.id || ''
  );
  const [studioCustomNote, setStudioCustomNote] = useState<string>('');
  const [studioCtaLabel, setStudioCtaLabel] = useState<string>(
    'Scan QR / Klik Link untuk Voting & Kunci Kursi'
  );
  const [studioPreviewUrl, setStudioPreviewUrl] = useState<string>('');
  const [isRenderingStudio, setIsRenderingStudio] = useState<boolean>(false);
  const studioQrWrapRef = useRef<HTMLDivElement | null>(null);

  // Poster Catalog Filter & Visibility Toggle State (Host)
  const [posterFilterMode, setPosterFilterMode] = useState<'all' | 'visible' | 'hidden'>('all');
  const [posterSearchQuery, setPosterSearchQuery] = useState<string>('');
  const [togglingPosterId, setTogglingPosterId] = useState<string | null>(null);

  // CRM State (Host)
  const [crmSearch, setCrmSearch] = useState<string>('');
  const [crmStageFilter, setCrmStageFilter] = useState<string>('all');
  const [crmCategoryFilter, setCrmCategoryFilter] = useState<string>('all');
  const [crmTopicFilter, setCrmTopicFilter] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>('');

  // Copy & Action Feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [hostMessage, setHostMessage] = useState<string>('');
  const [isBusyHost, setIsBusyHost] = useState<boolean>(false);

  // Host Decision Controls
  const [decisionMaterialId, setDecisionMaterialId] = useState<string>(
    () => campaign.winningMaterialId || analytics.leadingMaterialId
  );
  const [decisionSlotId, setDecisionSlotId] = useState<string>(
    () => campaign.winningSlotId || analytics.bestSlotStat?.slot.id || ''
  );
  const [decisionNote, setDecisionNote] = useState<string>(
    () => campaign.confirmedScheduleNote || ''
  );

  useEffect(() => {
    if (!decisionMaterialId && analytics.leadingMaterialId) {
      setDecisionMaterialId(analytics.leadingMaterialId);
    }
    if (!decisionSlotId && analytics.bestSlotStat?.slot.id) {
      setDecisionSlotId(analytics.bestSlotStat.slot.id);
    }
  }, [analytics.leadingMaterialId, analytics.bestSlotStat, decisionMaterialId, decisionSlotId]);

  const [draftCampaign, setDraftCampaign] = useState<UnlockCampaignDoc>(campaign);
  useEffect(() => {
    setDraftCampaign(campaign);
  }, [campaign]);

  const slotsSummaryText = useMemo(
    () =>
      campaign.timeSlots
        .slice(0, 3)
        .map((s) => `${s.label} (${s.timeText})`)
        .join(' · '),
    [campaign.timeSlots]
  );

  // Render poster preview inside PNG modal
  useEffect(() => {
    if (!posterModalMaterial) {
      setPosterPreviewUrl('');
      return;
    }
    let cancelled = false;
    setIsRenderingPoster(true);
    const timer = window.setTimeout(async () => {
      try {
        const qrCanvas = modalQrWrapRef.current?.querySelector('canvas') || null;
        const url = await renderMaterialPosterDataUrl(posterModalMaterial, {
          minQuota: campaign.minQuota,
          deadlineLabel: campaign.deadlineLabel,
          slotsSummary: slotsSummaryText,
          qrCanvas,
        });
        if (!cancelled) setPosterPreviewUrl(url);
      } catch (err) {
        console.warn('Poster preview render warning:', err);
      } finally {
        if (!cancelled) setIsRenderingPoster(false);
      }
    }, 80);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [posterModalMaterial, campaign.minQuota, campaign.deadlineLabel, slotsSummaryText]);

  // Render Studio Poster Preview
  const studioMaterial = useMemo(
    () => materials.find((m) => m.id === studioMaterialId) || materials[0] || null,
    [materials, studioMaterialId]
  );

  useEffect(() => {
    if (!isHostMode || hostTab !== 'posters' || !studioMaterial) return;
    let cancelled = false;
    setIsRenderingStudio(true);
    const timer = window.setTimeout(async () => {
      try {
        const qrCanvas = studioQrWrapRef.current?.querySelector('canvas') || null;
        const url = await renderMaterialPosterDataUrl(studioMaterial, {
          minQuota: campaign.minQuota,
          deadlineLabel: campaign.deadlineLabel,
          slotsSummary: slotsSummaryText,
          ctaLabel: studioCtaLabel,
          customNote: studioCustomNote,
          qrCanvas,
        });
        if (!cancelled) setStudioPreviewUrl(url);
      } catch (err) {
        console.warn('Studio poster preview warning:', err);
      } finally {
        if (!cancelled) setIsRenderingStudio(false);
      }
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    isHostMode,
    hostTab,
    studioMaterial,
    campaign.minQuota,
    campaign.deadlineLabel,
    slotsSummaryText,
    studioCtaLabel,
    studioCustomNote,
  ]);

  const handleCopyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 2200);
    } catch {
      setHostMessage('Tidak dapat menyalin otomatis. Silakan salin manual teksnya.');
    }
  };

  const openVoteModalForMaterial = (matId: string) => {
    setPrimaryMaterialId(matId);
    setSecondaryMaterialIds((prev) => prev.filter((id) => id !== matId));
    setFormError('');
    setFormSuccess('');
    setVoteStep(1);
    setIsVoteModalOpen(true);
  };

  const toggleSecondaryTopic = (matId: string) => {
    if (matId === primaryMaterialId) return;
    setSecondaryMaterialIds((prev) => {
      if (prev.includes(matId)) return prev.filter((id) => id !== matId);
      if (prev.length >= 2) return [prev[1], matId];
      return [...prev, matId];
    });
  };

  const toggleAvailableSlot = (slotId: string) => {
    setAvailableSlotIds((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    );
  };

  const handleValidateStep1 = () => {
    setFormError('');
    const cleanName = displayName.trim();
    const cleanBiz = businessName.trim();
    const cleanWa = whatsapp.trim().replace(/\s+/g, '');
    const waDigits = cleanWa.replace(/[^\d]/g, '');
    const cleanIg = normalizeInstagramHandle(instagram);

    if (cleanName.length < 2) {
      setFormError('Nama lengkap peserta wajib diisi (minimal 2 karakter).');
      return;
    }
    if (cleanBiz.length < 2) {
      setFormError('Nama usaha UMKM wajib diisi.');
      return;
    }
    if (waDigits.length < 8 || cleanWa.length < 6) {
      setFormError('Nomor WhatsApp aktif wajib diisi dengan benar (contoh: 081234567890).');
      return;
    }
    if (!cleanIg || cleanIg.length < 3) {
      setFormError('Username Instagram wajib diisi (contoh: @kopinusantara).');
      return;
    }
    setInstagram(cleanIg);
    setVoteStep(2);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (campaign.status === 'closed') {
      setFormError('Voting periode ini sudah ditutup oleh moderator.');
      return;
    }
    const cleanName = displayName.trim().slice(0, 60);
    const cleanBiz = businessName.trim().slice(0, 60);
    const cleanWa = whatsapp.trim().replace(/\s+/g, '').slice(0, 24);
    const cleanIg = normalizeInstagramHandle(instagram).slice(0, 64);
    const cleanCat = (businessCategory || BUSINESS_CATEGORIES[0]).slice(0, 40);
    const cleanChallenge = mainChallenge.trim().slice(0, 220);

    if (!primaryMaterialId) {
      setFormError('Pilih minimal 1 poster materi utama.');
      return;
    }
    if (availableSlotIds.length === 0) {
      setFormError('Centang minimal 1 jadwal waktu yang kamu bisa hadiri.');
      return;
    }
    if (cleanName.length < 2 || cleanBiz.length < 2 || cleanWa.length < 6 || !cleanIg) {
      setVoteStep(1);
      setFormError('Lengkapi dulu nama peserta, usaha, WhatsApp, dan akun Instagram.');
      return;
    }

    const topicTitle =
      materials.find((m) => m.id === primaryMaterialId)?.seminarTitle || primaryMaterialId;

    setIsSubmittingVote(true);
    try {
      await onSubmitVoteAndContact(
        {
          campaignId: (campaign.id || 'active').slice(0, 64),
          participantId: participantId.slice(0, 64),
          displayName: cleanName,
          businessName: cleanBiz,
          primaryMaterialId: primaryMaterialId.slice(0, 100),
          secondaryMaterialIds: secondaryMaterialIds
            .filter((id) => id !== primaryMaterialId)
            .slice(0, 3),
          availableSlotIds: availableSlotIds.slice(0, 8),
          flexibleTopic,
          mainChallenge: cleanChallenge,
          status: myExistingVote?.status === 'confirmed_h1' ? 'confirmed_h1' : 'committed',
          ts: Date.now(),
        },
        {
          whatsapp: cleanWa,
          instagram: cleanIg,
          businessCategory: cleanCat,
          interestedTopicTitle: topicTitle.slice(0, 120),
        }
      );
      try {
        window.localStorage.setItem(LOCAL_WA_CACHE_KEY, cleanWa);
        window.localStorage.setItem(LOCAL_IG_CACHE_KEY, cleanIg);
        window.localStorage.setItem(LOCAL_CAT_CACHE_KEY, cleanCat);
        window.localStorage.setItem(LOCAL_NAME_CACHE_KEY, cleanName);
        window.localStorage.setItem(LOCAL_BIZ_CACHE_KEY, cleanBiz);
      } catch {
        // ignore storage errors
      }
      setFormSuccess(
        myExistingVote
          ? 'Pilihan topik, jadwal & data UMKM kamu berhasil diperbarui!'
          : 'Suaramu resmi terkunci! Terima kasih sudah berkomitmen hadir.'
      );
    } catch {
      setFormError('Gagal menyimpan data ke server. Periksa koneksi internet dan coba lagi.');
    } finally {
      setIsSubmittingVote(false);
    }
  };

  // Host Decision Handlers
  const handleConfirmClassSchedule = async () => {
    if (!decisionMaterialId || !decisionSlotId) return;
    setIsBusyHost(true);
    try {
      await onSaveCampaign({
        ...campaign,
        status: 'scheduled',
        winningMaterialId: decisionMaterialId,
        winningSlotId: decisionSlotId,
        confirmedScheduleNote:
          decisionNote.trim() ||
          'Kelas resmi dilaksanakan! Link Zoom / alamat lokasi akan dikirim via WhatsApp H-1.',
        updatedAt: Date.now(),
      });
      setHostMessage('Jadwal resmi berhasil dikunci (Status: SCHEDULED / GO!).');
    } finally {
      setIsBusyHost(false);
    }
  };

  const handleReopenCampaign = async () => {
    setIsBusyHost(true);
    try {
      await onSaveCampaign({
        ...campaign,
        status: 'open',
        winningMaterialId: '',
        winningSlotId: '',
        confirmedScheduleNote: '',
        updatedAt: Date.now(),
      });
      setHostMessage('Voting Bursa Kelas dibuka kembali.');
    } finally {
      setIsBusyHost(false);
    }
  };

  const handleExportUmkmDatabaseCsv = () => {
    const contactMap = new Map<string, UnlockContactDoc>();
    contacts.forEach((c) => contactMap.set(c.voteId, c));
    const header = [
      'Nama Peserta',
      'Nama Usaha UMKM',
      'Kategori Usaha',
      'WhatsApp',
      'Instagram',
      'Topik yang Dipilih',
      'Jadwal Bisa Hadir',
      'Status Kehadiran',
      'Status Prospek Klien',
      'Catatan Audit Mentor',
      'Masalah Utama Peserta',
      'Waktu Daftar',
    ];
    const esc = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;

    const rows = votes.map((v) => {
      const contact = contactMap.get(v.id);
      const matTitle =
        contact?.interestedTopicTitle ||
        materials.find((m) => m.id === v.primaryMaterialId)?.seminarTitle ||
        v.primaryMaterialId;
      const slotLabels = (v.availableSlotIds || [])
        .map((sid) => campaign.timeSlots.find((s) => s.id === sid)?.label || sid)
        .join(' | ');
      const stageLabel =
        LEAD_STAGE_META[contact?.leadStage || 'lead_baru']?.label || 'Lead Baru';
      return [
        esc(v.displayName),
        esc(v.businessName),
        esc(contact?.businessCategory || '-'),
        esc(isVerifiedMentorAdmin ? contact?.whatsapp || '-' : '(Verifikasi Admin)'),
        esc(isVerifiedMentorAdmin ? contact?.instagram || '-' : '(Verifikasi Admin)'),
        esc(matTitle),
        esc(slotLabels),
        esc(v.status),
        esc(isVerifiedMentorAdmin ? stageLabel : '-'),
        esc(isVerifiedMentorAdmin ? contact?.mentorNotes || '' : ''),
        esc(v.mainChallenge || ''),
        esc(new Date(v.ts).toLocaleString('id-ID')),
      ].join(',');
    });
    const csv = '\uFEFF' + [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bank_Database_UMKM_obeeAcademy_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveCampaignSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (draftCampaign.candidateMaterialIds.length === 0) {
      setHostMessage('Pilih minimal 1 poster materi untuk ditampilkan di halaman publik.');
      return;
    }
    if (draftCampaign.timeSlots.length === 0) {
      setHostMessage('Tambahkan minimal 1 opsi jadwal pelatihan.');
      return;
    }
    setIsBusyHost(true);
    try {
      await onSaveCampaign({
        ...draftCampaign,
        title: draftCampaign.title.trim().slice(0, 120) || 'Bursa Kelas UMKM obeeAcademy',
        subtitle: draftCampaign.subtitle.trim().slice(0, 300),
        organizerName:
          draftCampaign.organizerName.trim().slice(0, 100) || 'obeeAcademy | PartnerUp',
        minQuota: Math.min(200, Math.max(5, Number(draftCampaign.minQuota) || 15)),
        deadlineLabel: draftCampaign.deadlineLabel.trim().slice(0, 80),
        winningMaterialId: draftCampaign.winningMaterialId || '',
        winningSlotId: draftCampaign.winningSlotId || '',
        confirmedScheduleNote: draftCampaign.confirmedScheduleNote || '',
        updatedAt: Date.now(),
      });
      setHostMessage('Pengaturan poster publik & jadwal Bursa Kelas berhasil disimpan.');
    } finally {
      setIsBusyHost(false);
    }
  };

  const handleTogglePosterVisibility = async (materialId: string) => {
    const exists = visiblePosterIdSet.has(materialId);
    if (exists && campaign.candidateMaterialIds.length <= 1) {
      setHostMessage('Minimal 1 poster materi harus tetap tampil di halaman publik.');
      return;
    }
    if (!exists && campaign.candidateMaterialIds.length >= 20) {
      setHostMessage('Maksimal 20 poster dapat ditampilkan sekaligus di halaman publik.');
      return;
    }
    const nextIds = exists
      ? campaign.candidateMaterialIds.filter((id) => id !== materialId)
      : [...campaign.candidateMaterialIds, materialId];

    setTogglingPosterId(materialId);
    try {
      await onSaveCampaign({
        ...campaign,
        candidateMaterialIds: nextIds,
        updatedAt: Date.now(),
      });
      const matTitle = materials.find((m) => m.id === materialId)?.seminarTitle || materialId;
      setHostMessage(
        exists
          ? `Poster "${matTitle}" disembunyikan dari halaman publik.`
          : `Poster "${matTitle}" kini ditampilkan di halaman publik.`
      );
    } finally {
      setTogglingPosterId(null);
    }
  };

  const handleShowAllPosters = async () => {
    const allIds = materials.map((m) => m.id).slice(0, 20);
    if (allIds.length === 0) return;
    setIsBusyHost(true);
    try {
      await onSaveCampaign({
        ...campaign,
        candidateMaterialIds: allIds,
        updatedAt: Date.now(),
      });
      setHostMessage(`Seluruh ${allIds.length} poster materi kini ditampilkan di halaman publik.`);
    } finally {
      setIsBusyHost(false);
    }
  };

  const filteredHostPosterMaterials = useMemo(() => {
    const q = posterSearchQuery.trim().toLowerCase();
    return materials.filter((mat) => {
      const isVisible = visiblePosterIdSet.has(mat.id);
      if (posterFilterMode === 'visible' && !isVisible) return false;
      if (posterFilterMode === 'hidden' && isVisible) return false;
      if (!q) return true;
      return (
        mat.seminarTitle.toLowerCase().includes(q) ||
        (mat.category || '').toLowerCase().includes(q) ||
        (mat.description || '').toLowerCase().includes(q)
      );
    });
  }, [materials, visiblePosterIdSet, posterFilterMode, posterSearchQuery]);

  const hiddenPosterCount = useMemo(
    () => materials.filter((m) => !visiblePosterIdSet.has(m.id)).length,
    [materials, visiblePosterIdSet]
  );

  const winningMaterialObj = materials.find(
    (m) => m.id === (campaign.winningMaterialId || analytics.leadingMaterialId)
  );
  const winningSlotObj = campaign.timeSlots.find(
    (s) => s.id === (campaign.winningSlotId || analytics.bestSlotStat?.slot.id)
  );

  const contactByVoteId = useMemo(() => {
    const map = new Map<string, UnlockContactDoc>();
    contacts.forEach((c) => map.set(c.voteId, c));
    return map;
  }, [contacts]);

  // CRM Funnel counts & filtered records (must be unconditional before early return)
  const crmRecords = useMemo(() => {
    return votes.map((v) => {
      const contact = contactByVoteId.get(v.id);
      const topicTitle =
        contact?.interestedTopicTitle ||
        materials.find((m) => m.id === v.primaryMaterialId)?.seminarTitle ||
        v.primaryMaterialId;
      return {
        vote: v,
        contact,
        topicTitle,
        stage: (contact?.leadStage || 'lead_baru') as UnlockLeadStage,
        category: contact?.businessCategory || 'Belum diisi',
        instagram: contact?.instagram || '',
        whatsapp: contact?.whatsapp || '',
        mentorNotes: contact?.mentorNotes || '',
      };
    });
  }, [votes, contactByVoteId, materials]);

  const crmFunnelStats = useMemo(() => {
    return {
      total: crmRecords.length,
      leadBaru: crmRecords.filter((r) => r.stage === 'lead_baru').length,
      sudahDihubungi: crmRecords.filter((r) => r.stage === 'sudah_dihubungi').length,
      prospekKlien: crmRecords.filter((r) => r.stage === 'prospek_klien').length,
      klienDeal: crmRecords.filter((r) => r.stage === 'klien_deal').length,
    };
  }, [crmRecords]);

  const filteredCrmRecords = useMemo(() => {
    const q = crmSearch.trim().toLowerCase();
    return crmRecords.filter((r) => {
      if (crmStageFilter !== 'all' && r.stage !== crmStageFilter) return false;
      if (crmCategoryFilter !== 'all' && r.category !== crmCategoryFilter) return false;
      if (crmTopicFilter !== 'all' && r.vote.primaryMaterialId !== crmTopicFilter) return false;
      if (!q) return true;
      return (
        r.vote.displayName.toLowerCase().includes(q) ||
        r.vote.businessName.toLowerCase().includes(q) ||
        r.instagram.toLowerCase().includes(q) ||
        r.whatsapp.toLowerCase().includes(q) ||
        r.topicTitle.toLowerCase().includes(q) ||
        (r.vote.mainChallenge || '').toLowerCase().includes(q) ||
        r.mentorNotes.toLowerCase().includes(q)
      );
    });
  }, [crmRecords, crmSearch, crmStageFilter, crmCategoryFilter, crmTopicFilter]);

  const posterDownloadModalJsx = posterModalMaterial ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        <div className="px-5 py-3.5 bg-[#1F3A5F] text-white flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#F28C28]">Poster Ajakan Kelas (4:5 PNG)</div>
            <div className="text-sm font-extrabold truncate max-w-[260px]">
              {posterModalMaterial.seminarTitle}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPosterModalMaterial(null)}
            className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={modalQrWrapRef} className="hidden">
          <QRCodeCanvas
            value={`${baseBursaUrl}&mid=${encodeURIComponent(posterModalMaterial.id)}`}
            size={220}
            level="M"
            includeMargin
          />
        </div>

        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center gap-4 bg-slate-100">
          {isRenderingPoster || !posterPreviewUrl ? (
            <div className="w-full aspect-[4/5] rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
              <RefreshCw className="w-5 h-5 animate-spin text-[#F28C28]" />
              <span>Menyusun poster PNG resolusi tinggi...</span>
            </div>
          ) : (
            <img
              src={posterPreviewUrl}
              alt={`Poster ${posterModalMaterial.seminarTitle}`}
              className="w-full max-w-[340px] rounded-xl shadow-md border border-slate-200"
            />
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              const qrCanvas = modalQrWrapRef.current?.querySelector('canvas') || null;
              await downloadMaterialPosterPng(posterModalMaterial, {
                minQuota: campaign.minQuota,
                deadlineLabel: campaign.deadlineLabel,
                slotsSummary: slotsSummaryText,
                qrCanvas,
              });
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#F28C28] hover:bg-[#d97719] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Poster PNG</span>
          </button>
          <button
            type="button"
            onClick={() =>
              handleCopyText(
                'modal_link',
                `${baseBursaUrl}&mid=${encodeURIComponent(posterModalMaterial.id)}`
              )
            }
            className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1F3A5F] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            {copiedKey === 'modal_link' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // =========================================================================
  // RENDER: PUBLIC POSTER-FIRST GALLERY & GATED POLLING PORTAL
  // =========================================================================
  if (!isHostMode) {
    const isScheduled = campaign.status === 'scheduled' || campaign.status === 'unlocked';
    const remainingToMin = Math.max(0, (campaign.minQuota || 15) - analytics.bestEffective);
    const chosenModalMaterial =
      materials.find((m) => m.id === primaryMaterialId) || candidateMaterials[0] || null;

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-9 space-y-8">
        {/* Hero & Quorum Status */}
        <section className="bg-[#1F3A5F] text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/75">
              <span className="font-semibold tracking-wide text-[#F28C28]">
                {campaign.organizerName || 'obeeAcademy | PartnerUp'} · Bursa Kelas Gratis UMKM
              </span>
              <span className="tabular-nums">{campaign.deadlineLabel}</span>
            </div>

            <div className="space-y-2 max-w-3xl">
              <h1
                className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight"
                style={{ textWrap: 'balance' }}
              >
                {campaign.title}
              </h1>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                {campaign.subtitle}
              </p>
            </div>

            {isScheduled && winningMaterialObj && winningSlotObj ? (
              <div className="bg-emerald-500/15 border border-emerald-400/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kuota Tercapai — Kelas Resmi Dijadwalkan</span>
                  </div>
                  <h2 className="font-display text-lg font-extrabold text-white">
                    {winningMaterialObj.seminarTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/85">
                    Jadwal Sah: <strong>{winningSlotObj.label}</strong> ({winningSlotObj.dateText} ·{' '}
                    {winningSlotObj.timeText})
                  </p>
                  {campaign.confirmedScheduleNote && (
                    <p className="text-xs text-emerald-100/90 pt-1">
                      {campaign.confirmedScheduleNote}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => openVoteModalForMaterial(winningMaterialObj.id)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  Daftar Ikut Kelas Ini
                </button>
              </div>
            ) : (
              <div className="bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-amber-300">
                      Kandidat Terkuat Saat Ini
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white mt-0.5 truncate">
                      {analytics.leadingCandidate
                        ? analytics.leadingCandidate.material.seminarTitle
                        : 'Pilih poster materi di bawah untuk mulai voting'}
                    </div>
                    {analytics.bestSlotStat && (
                      <div className="text-xs text-white/75 mt-0.5">
                        Jadwal terpadat: {analytics.bestSlotStat.slot.label} (
                        {analytics.bestSlotStat.slot.dateText} ·{' '}
                        {analytics.bestSlotStat.slot.timeText})
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#F28C28] tabular-nums">
                      {analytics.bestEffective} / {campaign.minQuota}
                    </div>
                    <div className="text-[11px] text-white/80">
                      {analytics.isQuorumReached
                        ? 'Kuota Minimal Tercapai · Siap Jalan'
                        : `Kurang ${remainingToMin} peserta lagi untuk GO`}
                    </div>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      analytics.isQuorumReached ? 'bg-emerald-400' : 'bg-[#F28C28]'
                    }`}
                    style={{ width: `${analytics.quorumProgressPct}%` }}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/75">
                  <span className="tabular-nums">
                    {analytics.activeVotes.length} UMKM sudah berpartisipasi · Alur: Pilih Poster → Isi Nama, WA & IG → Kunci Jadwal
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText('share_bursa', baseBursaUrl)}
                    className="text-amber-300 hover:text-amber-200 font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    {copiedKey === 'share_bursa' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Link Disalin</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Bagikan Halaman Ini</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Registered Identity Status Strip (when participant already filled data) */}
            {myExistingVote && (
              <div className="bg-emerald-500/15 border border-emerald-400/35 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>
                    Terdaftar sebagai <strong>{myExistingVote.displayName}</strong> ({myExistingVote.businessName}
                    {instagram ? ` · ${instagram}` : ''})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openVoteModalForMaterial(myExistingVote.primaryMaterialId)}
                  className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold cursor-pointer whitespace-nowrap"
                >
                  Ubah Data / Pilihan Jadwal
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Step 1: Galeri Poster Materi Publik */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#1F3A5F]">
                Galeri Poster Kelas Pilihan Moderator
              </h2>
              <p className="text-xs sm:text-sm text-[#1F3A5F]/75 mt-1">
                Baca inti materi pada masing-masing poster di bawah, lalu klik <strong>Vote Poster Ini</strong> untuk mengisi data diri (Nama, WhatsApp & Instagram) dan jadwal pilihanmu.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#1F3A5F]/70 tabular-nums">
              {candidateMaterials.length} Poster Tersedia
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analytics.candidateStats.map(({ material, primaryCount, sharePct }) => {
              const coverUrl = getMaterialCoverImageUrl(material);
              const highlights = extractMaterialCoreHighlights(material).slice(0, 3);
              const themePrimary = material.content.brandTheme?.primaryColor || '#1F3A5F';
              const isMyVote = myExistingVote?.primaryMaterialId === material.id;
              const isLeading = analytics.leadingMaterialId === material.id && primaryCount > 0;

              return (
                <article
                  key={material.id}
                  className={`rounded-3xl overflow-hidden flex flex-col border transition-all shadow-sm ${
                    isMyVote
                      ? 'border-[#F28C28] ring-2 ring-[#F28C28]/30'
                      : 'border-[#1F3A5F]/15 hover:border-[#1F3A5F]/35'
                  }`}
                  style={{ backgroundColor: themePrimary }}
                >
                  {/* Top Poster Masthead */}
                  <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-2 text-white">
                    <span className="text-[11px] font-bold truncate text-white/90">
                      {material.organizerName || 'obeeAcademy'}
                    </span>
                    <span className="text-[11px] text-white/70 whitespace-nowrap shrink-0 tabular-nums">
                      {material.category || 'Materi'} · {material.content.slides.length} Slide
                    </span>
                  </div>

                  {/* Poster Visual Showcase */}
                  <div className="px-4">
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={material.seminarTitle}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col justify-center px-5 bg-gradient-to-br from-[#0F243E] to-[#1E466E] text-white">
                          <span className="text-[11px] font-semibold text-[#F28C28]">
                            Modul Pelatihan UMKM
                          </span>
                          <p className="font-display text-base font-extrabold mt-1 line-clamp-2">
                            {material.seminarTitle}
                          </p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-white">
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-[#F28C28] text-white whitespace-nowrap">
                          MIN. {campaign.minQuota} PESERTA
                        </span>
                        {isLeading && (
                          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 whitespace-nowrap">
                            <Flame className="w-3.5 h-3.5" />
                            Unggul Sementara
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cream Poster Editorial Body */}
                  <div className="m-4 mb-0 rounded-2xl bg-[#FFF9F0] p-4 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-2.5">
                      <h3 className="font-display text-base font-extrabold text-[#1F3A5F] leading-snug">
                        {material.seminarTitle}
                      </h3>
                      {material.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {material.description}
                        </p>
                      )}

                      <div className="border-t border-[#1F3A5F]/10 pt-2.5 space-y-1.5">
                        <div className="text-[11px] font-bold text-[#2A9D8F]">
                          Inti Materi yang Dibahas:
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {highlights.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 leading-snug">
                              <span className="w-4 h-4 rounded-full bg-[#1F3A5F] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                                {idx + 1}
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Vote Meter */}
                    <div className="pt-2 border-t border-[#1F3A5F]/10 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#1F3A5F] tabular-nums">
                        <span>Perolehan Polling</span>
                        <span>
                          {primaryCount} suara ({sharePct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#2A9D8F] transition-all duration-300"
                          style={{ width: `${Math.max(primaryCount > 0 ? 6 : 0, sharePct)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Poster Footer Actions */}
                  <div className="p-4 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={campaign.status === 'closed'}
                      onClick={() => openVoteModalForMaterial(material.id)}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 ${
                        isMyVote
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          : 'bg-[#F28C28] hover:bg-[#d97719] text-white'
                      }`}
                    >
                      {isMyVote ? '✓ Pilihanmu (Edit)' : 'Vote Poster Ini'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterModalMaterial(material)}
                      className="py-2.5 px-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      title="Unduh Poster PNG Resolusi Tinggi"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PNG</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Public Commitment Roster (Zero PII - no WA or IG shown publicly) */}
        <section className="bg-white rounded-2xl border border-[#1F3A5F]/12 p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base sm:text-lg font-extrabold text-[#1F3A5F]">
                Daftar Rekan UMKM yang Sudah Ikut Polling
              </h3>
              <p className="text-xs text-slate-500">
                Hanya menampilkan nama & usaha untuk transparansi kuota. Nomor WhatsApp & Instagram tersimpan privat.
              </p>
            </div>
            <span className="text-xs font-bold text-[#1F3A5F] tabular-nums">
              {analytics.activeVotes.length} UMKM Terdaftar
            </span>
          </div>

          {analytics.activeVotes.length === 0 ? (
            <div className="text-center py-8 text-xs sm:text-sm text-slate-500">
              Belum ada suara masuk. Klik <strong>Vote Poster Ini</strong> pada materi pilihanmu untuk menjadi pendaftar pertama.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {analytics.activeVotes.slice(0, 36).map((v) => {
                const chosenMat = materials.find((m) => m.id === v.primaryMaterialId);
                return (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1F3A5F] truncate">
                        {v.displayName} · {v.businessName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {chosenMat?.seminarTitle || v.primaryMaterialId}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                        v.status === 'confirmed_h1'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {v.status === 'confirmed_h1' ? 'Fix H-1' : 'Siap'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* GATED 2-STEP IDENTITY + POLLING MODAL */}
        {isVoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="px-6 py-4 bg-[#1F3A5F] text-white flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#F28C28]">
                    Langkah {voteStep} dari 2 · {voteStep === 1 ? 'Identitas Peserta & UMKM' : 'Pilih Jadwal & Kunci Suara'}
                  </div>
                  <div className="font-display text-base font-extrabold truncate">
                    {chosenModalMaterial?.seminarTitle || 'Polling Bursa Kelas'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVoteModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step Indicator Bar */}
              <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setVoteStep(1)}
                  className={`py-2.5 text-center transition-colors cursor-pointer ${
                    voteStep === 1
                      ? 'bg-white text-[#1F3A5F] border-b-2 border-[#F28C28]'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  1. Nama, WA & Instagram
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (voteStep === 1) {
                      handleValidateStep1();
                    } else {
                      setVoteStep(2);
                    }
                  }}
                  className={`py-2.5 text-center transition-colors cursor-pointer ${
                    voteStep === 2
                      ? 'bg-white text-[#1F3A5F] border-b-2 border-[#F28C28]'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  2. Topik & Jadwal Hadir
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5">
                {voteStep === 1 ? (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-600 leading-relaxed">
                      Lengkapi data diri & usahamu terlebih dahulu sebelum memilih jadwal polling. Data kontakmu aman dan digunakan mentor untuk pengingat H-1 serta kurasi pembahasan studi kasus UMKM.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nama Lengkap Peserta *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={60}
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Contoh: Ibu Rina Kusuma"
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nama Usaha UMKM *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={60}
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Contoh: Keripik Apel Makmur"
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nomor WhatsApp Aktif *
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={24}
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="Contoh: 081234567890"
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Akun Instagram (Usaha/Pribadi) *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={64}
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          placeholder="Contoh: @keripikapel.makmur"
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Kategori Bidang Usaha *
                        </label>
                        <select
                          value={businessCategory}
                          onChange={(e) => setBusinessCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                        >
                          {BUSINESS_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#2A9D8F] shrink-0 mt-0.5" />
                      <span>
                        Privasi terjaga: Nomor WhatsApp & Instagram tidak tampil di daftar publik dan hanya dapat diakses oleh mentor penyelenggara.
                      </span>
                    </div>

                    {formError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                        {formError}
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleValidateStep1}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F28C28] hover:bg-[#d97719] text-white text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Lanjut Pilih Jadwal</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitForm} className="space-y-5">
                    {/* Selected Poster Confirmation */}
                    <div className="p-3.5 rounded-xl bg-[#FFF7EC] border border-[#F28C28]/40 space-y-2">
                      <div className="text-[11px] font-bold text-[#F28C28]">
                        Materi Utama yang Dipilih:
                      </div>
                      <select
                        value={primaryMaterialId}
                        onChange={(e) => {
                          setPrimaryMaterialId(e.target.value);
                          setSecondaryMaterialIds((prev) =>
                            prev.filter((id) => id !== e.target.value)
                          );
                        }}
                        className="w-full px-3 py-2 text-xs sm:text-sm font-bold text-[#1F3A5F] bg-white border border-slate-300 rounded-lg"
                      >
                        {candidateMaterials.map((mat) => (
                          <option key={mat.id} value={mat.id}>
                            {mat.seminarTitle}
                          </option>
                        ))}
                      </select>

                      {candidateMaterials.length > 1 && (
                        <div className="pt-1">
                          <div className="text-[11px] font-semibold text-slate-600 mb-1.5">
                            Topik cadangan jika berminat (maks. 2):
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {candidateMaterials
                              .filter((m) => m.id !== primaryMaterialId)
                              .map((mat) => {
                                const checked = secondaryMaterialIds.includes(mat.id);
                                return (
                                  <button
                                    key={mat.id}
                                    type="button"
                                    onClick={() => toggleSecondaryTopic(mat.id)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                                      checked
                                        ? 'bg-[#2A9D8F]/15 border-[#2A9D8F] text-[#1F3A5F]'
                                        : 'bg-white border-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {checked ? '✓ ' : '+ '}
                                    {mat.seminarTitle.length > 36
                                      ? `${mat.seminarTitle.slice(0, 33)}...`
                                      : mat.seminarTitle}
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Time Slots Multi-Select */}
                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-[#1F3A5F]">
                        Centang SEMUA Jadwal yang Kamu Bisa Hadir *
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {analytics.slotStats.map(({ slot, totalAvailable, effectiveQuorum }) => {
                          const checked = availableSlotIds.includes(slot.id);
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => toggleAvailableSlot(slot.id)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                checked
                                  ? 'bg-[#1F3A5F]/5 border-[#1F3A5F] ring-1 ring-[#1F3A5F]'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div>
                                <div className="text-xs sm:text-sm font-bold text-[#1F3A5F]">
                                  {slot.label} · {slot.dateText}
                                </div>
                                <div className="text-xs text-slate-600 mt-0.5 tabular-nums">
                                  {slot.timeText} · {totalAvailable} bisa hadir ({effectiveQuorum}/{campaign.minQuota} kuota)
                                </div>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                                  checked
                                    ? 'bg-[#1F3A5F] border-[#1F3A5F] text-white'
                                    : 'bg-white border-slate-300'
                                }`}
                              >
                                {checked && <Check className="w-3.5 h-3.5" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={flexibleTopic}
                          onChange={(e) => setFlexibleTopic(e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-[#F28C28]"
                        />
                        <span className="text-xs text-[#1F3A5F] leading-snug">
                          <strong>Tetap bersedia hadir</strong> meski topik lain yang memperoleh suara terbanyak di jadwal pilihan saya (mempercepat kuota {campaign.minQuota} peserta).
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        1 Masalah / Pertanyaan Utama yang Ingin Dibahas (Opsional)
                      </label>
                      <input
                        type="text"
                        maxLength={220}
                        value={mainChallenge}
                        onChange={(e) => setMainChallenge(e.target.value)}
                        placeholder="Contoh: Foto produk botol kaca saya masih sering memantulkan lampu..."
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                      />
                    </div>

                    {formError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                        {formError}
                      </div>
                    )}

                    {formSuccess ? (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                        <div className="text-xs sm:text-sm font-bold text-emerald-900">
                          ✓ {formSuccess}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyText('modal_share_after', baseBursaUrl)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                          >
                            {copiedKey === 'modal_share_after'
                              ? 'Link Tersalin!'
                              : 'Salin Link & Ajak Teman'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsVoteModalOpen(false)}
                            className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-bold cursor-pointer"
                          >
                            Tutup & Lihat Hasil
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setVoteStep(1)}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Ubah Data Diri</span>
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingVote}
                          className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-[#F28C28] hover:bg-[#d97719] disabled:opacity-50 text-white text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {isSubmittingVote
                              ? 'Menyimpan...'
                              : myExistingVote
                              ? 'Perbarui Pilihan Saya'
                              : 'Kirim Voting & Kunci Kursi'}
                          </span>
                        </button>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Poster PNG Download Modal */}
        {posterDownloadModalJsx}
      </div>
    );
  }

  // =========================================================================
  // RENDER: HOST / MENTOR COMMAND CENTER + BANK DATABASE UMKM CRM
  // =========================================================================
  const decisionMat = materials.find((m) => m.id === decisionMaterialId);
  const decisionSlot = campaign.timeSlots.find((s) => s.id === decisionSlotId);
  const broadcastText = buildBursaBroadcastText(campaign, materials, baseBursaUrl);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Command Header */}
      <div className="bg-white rounded-2xl border border-[#1F3A5F]/12 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="text-xs font-bold text-[#F28C28]">
            Bursa Kelas & Bank Database UMKM · Minimal {campaign.minQuota} Peserta
          </div>
          <h1 className="font-display text-lg sm:text-xl font-extrabold text-[#1F3A5F] mt-0.5">
            {campaign.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopyText('public_bursa_link', baseBursaUrl)}
            className="px-3 py-2 rounded-xl bg-[#1F3A5F] hover:bg-[#162a45] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {copiedKey === 'public_bursa_link' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link Publik Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#F28C28]" />
                <span>Salin Link Halaman Publik</span>
              </>
            )}
          </button>
          <a
            href={baseBursaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1F3A5F] text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Halaman Publik</span>
          </a>
          {onBackToPresenter && (
            <button
              type="button"
              onClick={onBackToPresenter}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              Ke Proyektor
            </button>
          )}
        </div>
      </div>

      {/* Host Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setHostTab('posters')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            hostTab === 'posters'
              ? 'bg-[#1F3A5F] text-white shadow-xs'
              : 'bg-white text-[#1F3A5F]/75 border border-[#1F3A5F]/15 hover:bg-slate-50'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-[#F28C28]" />
          <span className="tabular-nums">
            Semua Poster & Pilihan Publik ({candidateMaterials.length}/{materials.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setHostTab('monitor')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            hostTab === 'monitor'
              ? 'bg-[#1F3A5F] text-white shadow-xs'
              : 'bg-white text-[#1F3A5F]/75 border border-[#1F3A5F]/15 hover:bg-slate-50'
          }`}
        >
          <Trophy className="w-4 h-4 text-[#F28C28]" />
          <span>Pantau Kuota & Keputusan</span>
        </button>

        <button
          type="button"
          onClick={() => setHostTab('crm')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            hostTab === 'crm'
              ? 'bg-[#1F3A5F] text-white shadow-xs'
              : 'bg-white text-[#1F3A5F]/75 border border-[#1F3A5F]/15 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4 text-[#F28C28]" />
          <span className="tabular-nums">Bank Database UMKM ({votes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setHostTab('setup')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            hostTab === 'setup'
              ? 'bg-[#1F3A5F] text-white shadow-xs'
              : 'bg-white text-[#1F3A5F]/75 border border-[#1F3A5F]/15 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4 text-[#F28C28]" />
          <span>Atur Jadwal & Aturan Main</span>
        </button>
      </div>

      {hostMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-semibold text-emerald-900 flex items-center justify-between gap-2">
          <span>✓ {hostMessage}</span>
          <button
            type="button"
            onClick={() => setHostMessage('')}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: MONITOR & GO/NO-GO */}
      {hostTab === 'monitor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl border border-[#1F3A5F]/12 p-4">
              <div className="text-xs font-semibold text-slate-500">Pemilih Aktif</div>
              <div className="font-display text-2xl font-extrabold text-[#1F3A5F] mt-1 tabular-nums">
                {analytics.activeVotes.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                {analytics.confirmedCount} terkonfirmasi H-1
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#1F3A5F]/12 p-4">
              <div className="text-xs font-semibold text-slate-500">Topik Peringkat #1</div>
              <div className="font-display text-sm font-extrabold text-[#1F3A5F] mt-1 line-clamp-2">
                {analytics.leadingCandidate?.material.seminarTitle || '-'}
              </div>
              <div className="text-[11px] text-[#2A9D8F] font-bold mt-1 tabular-nums">
                {analytics.leadingCandidate?.primaryCount || 0} suara utama
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#1F3A5F]/12 p-4">
              <div className="text-xs font-semibold text-slate-500">Jadwal Terkuat</div>
              <div className="font-display text-sm font-extrabold text-[#1F3A5F] mt-1">
                {analytics.bestSlotStat?.slot.label || '-'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                {analytics.bestSlotStat
                  ? `${analytics.bestSlotStat.exactCount} utama + ${analytics.bestSlotStat.rescueCount} fleksibel`
                  : '-'}
              </div>
            </div>

            <div
              className={`rounded-2xl border p-4 ${
                analytics.isQuorumReached || campaign.status === 'scheduled'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="text-xs font-semibold text-slate-600">Keputusan Kuota</div>
              <div
                className={`font-display text-2xl font-extrabold mt-1 tabular-nums ${
                  analytics.isQuorumReached || campaign.status === 'scheduled'
                    ? 'text-emerald-700'
                    : 'text-[#d97719]'
                }`}
              >
                {analytics.bestEffective} / {campaign.minQuota}
              </div>
              <div className="text-[11px] font-bold mt-0.5 text-slate-700">
                {campaign.status === 'scheduled'
                  ? 'STATUS: RESMI DIJADWALKAN'
                  : analytics.isQuorumReached
                  ? 'SIAP GO! Kuota Tercapai'
                  : `Kurang ${Math.max(0, campaign.minQuota - analytics.bestEffective)} peserta lagi`}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#1F3A5F]/12 p-5 space-y-5">
              <div>
                <h3 className="font-display text-base font-extrabold text-[#1F3A5F]">
                  Perolehan Suara Topik Materi
                </h3>
                <div className="space-y-3 mt-3">
                  {analytics.sortedCandidates.map(({ material, primaryCount, secondaryCount, sharePct }, i) => (
                    <div key={material.id} className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-[#1F3A5F] truncate">
                          #{i + 1} · {material.seminarTitle}
                        </span>
                        <span className="font-bold text-[#1F3A5F] whitespace-nowrap shrink-0 tabular-nums">
                          {primaryCount} utama ({secondaryCount} cadangan) · {sharePct}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            i === 0 ? 'bg-[#F28C28]' : 'bg-[#2A9D8F]'
                          }`}
                          style={{ width: `${Math.max(primaryCount > 0 ? 5 : 0, sharePct)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="font-display text-base font-extrabold text-[#1F3A5F]">
                  Matriks Irisan Jadwal vs Kuota Minimal ({campaign.minQuota} Orang)
                </h3>
                <div className="space-y-2.5 mt-3">
                  {analytics.slotStats.map((st) => {
                    const hit = st.effectiveQuorum >= campaign.minQuota;
                    return (
                      <div
                        key={st.slot.id}
                        className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                          hit ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-[#1F3A5F]">
                            {st.slot.label} · {st.slot.dateText} ({st.slot.timeText})
                          </div>
                          <div className="text-[11px] text-slate-600 tabular-nums">
                            {st.totalAvailable} total bisa hadir ({st.exactCount} pilih topik #1 +{' '}
                            {st.rescueCount} fleksibel penyelamat kuota)
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-sm font-extrabold tabular-nums ${
                              hit ? 'text-emerald-700' : 'text-[#1F3A5F]'
                            }`}
                          >
                            {st.effectiveQuorum} / {campaign.minQuota}
                          </span>
                          <span className="block text-[10px] font-bold text-slate-500">
                            {hit ? 'LULUS KUOTA' : 'BELUM PENUH'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#1F3A5F]/12 p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-base font-extrabold text-[#1F3A5F]">
                    Keputusan Mentor: Tetapkan Kelas & Jadwal Sah
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Begitu kuota memenuhi target, kunci materi & jadwal pemenang agar tampil di halaman publik.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Materi Pemenang
                    </label>
                    <select
                      value={decisionMaterialId}
                      onChange={(e) => setDecisionMaterialId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl"
                    >
                      {candidateMaterials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.seminarTitle}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jadwal Terpilih
                    </label>
                    <select
                      value={decisionSlotId}
                      onChange={(e) => setDecisionSlotId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl"
                    >
                      {campaign.timeSlots.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label} — {s.dateText} ({s.timeText})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Catatan Lokasi / Zoom untuk Peserta
                    </label>
                    <textarea
                      rows={2}
                      maxLength={250}
                      value={decisionNote}
                      onChange={(e) => setDecisionNote(e.target.value)}
                      placeholder="Contoh: Dilaksanakan via Zoom Live. Link dikirim ke WA peserta H-1."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  disabled={isBusyHost}
                  onClick={handleConfirmClassSchedule}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tetapkan Jadwal Resmi (GO!)</span>
                </button>

                {decisionMat && (
                  <button
                    type="button"
                    disabled={isBusyHost}
                    onClick={async () => {
                      setIsBusyHost(true);
                      try {
                        await onActivateWinningMaterial(decisionMat);
                        setHostMessage(
                          `Materi "${decisionMat.seminarTitle}" dimuat ke Kelas Aktif (Slide & Proyektor).`
                        );
                      } finally {
                        setIsBusyHost(false);
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#F28C28] hover:bg-[#d97719] disabled:opacity-50 text-white text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>Muat Materi Pemenang ke Kelas Aktif</span>
                  </button>
                )}

                {campaign.status !== 'open' && (
                  <button
                    type="button"
                    disabled={isBusyHost}
                    onClick={handleReopenCampaign}
                    className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Buka Kembali Voting
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BANK DATABASE UMKM (MINI-CRM PROSPEK KLIEN) */}
      {hostTab === 'crm' && (
        <div className="space-y-5">
          {/* Mentor Google Auth Gate */}
          {!isVerifiedMentorAdmin ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 text-xs text-amber-950">
                <Lock className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm">
                    Database Kontak WhatsApp & Instagram Terproteksi
                  </span>
                  <span>
                    Login dengan akun Google mentor terverifikasi (feedkreatif@gmail.com) untuk membuka Bank Database UMKM, audit profil Instagram peserta, kirim pengingat H-1, serta mengelola pipeline prospek klien.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onLoginMentorGoogle}
                className="px-4 py-2.5 rounded-xl bg-[#1F3A5F] hover:bg-[#162a45] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verifikasi Akun Mentor (Google)</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Bank Database UMKM Aktif · Login sebagai {mentorEmail}</span>
              </div>
              <button
                type="button"
                onClick={onLogoutMentorGoogle}
                className="text-emerald-800 underline hover:text-emerald-950 cursor-pointer font-semibold"
              >
                Keluar Google Mentor
              </button>
            </div>
          )}

          {/* Lead Funnel KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-[11px] font-semibold text-slate-500">Total Database UMKM</div>
              <div className="font-display text-xl font-extrabold text-[#1F3A5F] mt-0.5 tabular-nums">
                {crmFunnelStats.total}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-[11px] font-semibold text-slate-500">Lead Baru</div>
              <div className="font-display text-xl font-extrabold text-slate-700 mt-0.5 tabular-nums">
                {crmFunnelStats.leadBaru}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-[11px] font-semibold text-slate-500">Sudah Dihubungi</div>
              <div className="font-display text-xl font-extrabold text-sky-700 mt-0.5 tabular-nums">
                {crmFunnelStats.sudahDihubungi}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-orange-200 p-3.5">
              <div className="text-[11px] font-semibold text-orange-700">Prospek Klien</div>
              <div className="font-display text-xl font-extrabold text-orange-700 mt-0.5 tabular-nums">
                {crmFunnelStats.prospekKlien}
              </div>
            </div>
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3.5">
              <div className="text-[11px] font-semibold text-emerald-700">Klien Deal</div>
              <div className="font-display text-xl font-extrabold text-emerald-700 mt-0.5 tabular-nums">
                {crmFunnelStats.klienDeal}
              </div>
            </div>
          </div>

          {/* Search, Filters & Actions */}
          <div className="bg-white rounded-2xl border border-[#1F3A5F]/12 p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={crmSearch}
                    onChange={(e) => setCrmSearch(e.target.value)}
                    placeholder="Cari nama, usaha, @instagram, atau masalah..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                  />
                </div>

                <select
                  value={crmCategoryFilter}
                  onChange={(e) => setCrmCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="all">Semua Kategori</option>
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={crmStageFilter}
                  onChange={(e) => setCrmStageFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="all">Semua Pipeline</option>
                  {(Object.keys(LEAD_STAGE_META) as UnlockLeadStage[]).map((st) => (
                    <option key={st} value={st}>
                      {LEAD_STAGE_META[st].label}
                    </option>
                  ))}
                </select>

                <select
                  value={crmTopicFilter}
                  onChange={(e) => setCrmTopicFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl max-w-[210px]"
                >
                  <option value="all">Semua Minat Topik</option>
                  {candidateMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.seminarTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleExportUmkmDatabaseCsv}
                  className="px-3 py-2 rounded-xl bg-[#1F3A5F] text-white text-xs font-bold hover:bg-[#162a45] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 text-[#F28C28]" />
                  <span>Ekspor Database CSV</span>
                </button>
                <button
                  type="button"
                  disabled={isBusyHost}
                  onClick={async () => {
                    setIsBusyHost(true);
                    try {
                      await onSeedDemoVotes();
                      setHostMessage(
                        isVerifiedMentorAdmin
                          ? '16 UMKM simulasi beserta WA, Instagram & contoh pipeline berhasil ditambahkan.'
                          : '16 pemilih simulasi ditambahkan. Login Google mentor untuk melihat/mengisi simulasi kontak WA & IG.'
                      );
                    } finally {
                      setIsBusyHost(false);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 cursor-pointer whitespace-nowrap"
                >
                  +16 Simulasi UMKM
                </button>
                {analytics.demoCount > 0 && (
                  <button
                    type="button"
                    disabled={isBusyHost}
                    onClick={async () => {
                      setIsBusyHost(true);
                      try {
                        await onClearDemoVotes();
                        setHostMessage('Data simulasi berhasil dibersihkan.');
                      } finally {
                        setIsBusyHost(false);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 cursor-pointer whitespace-nowrap"
                  >
                    Hapus Simulasi ({analytics.demoCount})
                  </button>
                )}
              </div>
            </div>

            {filteredCrmRecords.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                Belum ada data UMKM yang cocok dengan filter atau pencarian.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 pr-3 font-bold">UMKM & Kategori</th>
                      <th className="py-2.5 px-3 font-bold">Instagram (Audit)</th>
                      <th className="py-2.5 px-3 font-bold">WhatsApp & Aksi</th>
                      <th className="py-2.5 px-3 font-bold">Minat Topik & Hadir</th>
                      <th className="py-2.5 px-3 font-bold">Pipeline Klien</th>
                      <th className="py-2.5 px-3 font-bold">Catatan Audit Mentor</th>
                      <th className="py-2.5 pl-3 font-bold text-right">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCrmRecords.map(
                      ({
                        vote,
                        contact,
                        topicTitle,
                        stage,
                        category,
                        instagram: igHandle,
                        whatsapp: waNumber,
                        mentorNotes,
                      }) => {
                        const waClean = normalizeWhatsappForWaMe(waNumber);
                        const igUrl = getInstagramProfileUrl(igHandle);
                        const targetSlotLabel = decisionSlot
                          ? `${decisionSlot.label} (${decisionSlot.dateText} ${decisionSlot.timeText})`
                          : 'jadwal pilihan';
                        const reminderMsg = encodeURIComponent(
                          `Halo Kak ${vote.displayName} (${vote.businessName}), mengingatkan kelas obeeAcademy "${decisionMat?.seminarTitle || topicTitle}" insyaAllah berjalan pada ${targetSlotLabel}. Mohon konfirmasi kehadirannya ya kak!`
                        );
                        const followupMsg = encodeURIComponent(
                          `Halo Kak ${vote.displayName} dari ${vote.businessName}, terima kasih sudah ikut kelas obeeAcademy (${topicTitle}). Saya sudah sempat lihat Instagram ${igHandle || 'usahamu'} — boleh diskusi santai kalau kakak butuh bantuan optimasi visual/branding usaha?`
                        );
                        const isEditingThisNote = editingNoteId === vote.id;

                        return (
                          <tr key={vote.id} className="hover:bg-slate-50/70 align-top">
                            <td className="py-3 pr-3">
                              <div className="font-bold text-[#1F3A5F]">{vote.displayName}</div>
                              <div className="text-slate-700 font-medium">{vote.businessName}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{category}</div>
                              {vote.mainChallenge && (
                                <div className="text-[11px] text-slate-500 italic mt-1 max-w-[220px] line-clamp-2">
                                  "{vote.mainChallenge}"
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-3">
                              {isVerifiedMentorAdmin ? (
                                igHandle && igUrl ? (
                                  <a
                                    href={igUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#1F3A5F] font-semibold whitespace-nowrap"
                                  >
                                    <Instagram className="w-3.5 h-3.5 text-[#F28C28]" />
                                    <span>{igHandle}</span>
                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                  </a>
                                ) : (
                                  <span className="text-slate-400">Belum diisi</span>
                                )
                              ) : (
                                <span className="text-slate-400">Terkunci</span>
                              )}
                            </td>

                            <td className="py-3 px-3 tabular-nums">
                              {isVerifiedMentorAdmin ? (
                                waNumber ? (
                                  <div className="space-y-1.5">
                                    <div className="font-semibold text-slate-700">{waNumber}</div>
                                    {waClean && (
                                      <div className="flex flex-wrap gap-1">
                                        <a
                                          href={`https://wa.me/${waClean}?text=${reminderMsg}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold whitespace-nowrap"
                                        >
                                          <MessageCircle className="w-3 h-3" />
                                          <span>H-1</span>
                                        </a>
                                        <a
                                          href={`https://wa.me/${waClean}?text=${followupMsg}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#F28C28] hover:bg-[#d97719] text-white text-[10px] font-bold whitespace-nowrap"
                                        >
                                          <Sparkles className="w-3 h-3" />
                                          <span>Follow-Up</span>
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">Belum ada</span>
                                )
                              ) : (
                                <span className="text-slate-400">Terkunci</span>
                              )}
                            </td>

                            <td className="py-3 px-3 max-w-[200px]">
                              <div className="font-semibold text-slate-800 line-clamp-2">
                                {topicTitle}
                              </div>
                              <select
                                value={vote.status}
                                onChange={(e) =>
                                  onUpdateVoteStatus(vote.id, e.target.value as UnlockVoteStatus)
                                }
                                className={`mt-1.5 px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                                  vote.status === 'confirmed_h1'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    : vote.status === 'cancelled'
                                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                                    : 'bg-amber-50 border-amber-200 text-amber-800'
                                }`}
                              >
                                <option value="committed">Siap Hadir</option>
                                <option value="confirmed_h1">Fix H-1</option>
                                <option value="cancelled">Batal</option>
                              </select>
                            </td>

                            <td className="py-3 px-3">
                              {isVerifiedMentorAdmin && contact ? (
                                <select
                                  value={stage}
                                  onChange={(e) =>
                                    onUpdateLeadCrm(contact.id, {
                                      leadStage: e.target.value as UnlockLeadStage,
                                    })
                                  }
                                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${
                                    LEAD_STAGE_META[stage].badgeClass
                                  }`}
                                >
                                  {(Object.keys(LEAD_STAGE_META) as UnlockLeadStage[]).map((st) => (
                                    <option key={st} value={st}>
                                      {LEAD_STAGE_META[st].label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>

                            <td className="py-3 px-3 min-w-[190px] max-w-[240px]">
                              {isVerifiedMentorAdmin && contact ? (
                                isEditingThisNote ? (
                                  <div className="space-y-1.5">
                                    <textarea
                                      rows={2}
                                      maxLength={300}
                                      value={editingNoteText}
                                      onChange={(e) => setEditingNoteText(e.target.value)}
                                      placeholder="Catat hasil audit IG atau peluang jasa..."
                                      className="w-full p-2 text-[11px] bg-white border border-slate-300 rounded-lg"
                                    />
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          await onUpdateLeadCrm(contact.id, {
                                            mentorNotes: editingNoteText.trim(),
                                          });
                                          setEditingNoteId(null);
                                        }}
                                        className="px-2.5 py-1 rounded bg-[#1F3A5F] text-white text-[10px] font-bold cursor-pointer"
                                      >
                                        Simpan
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingNoteId(null)}
                                        className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold cursor-pointer"
                                      >
                                        Batal
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingNoteId(vote.id);
                                      setEditingNoteText(mentorNotes);
                                    }}
                                    className="text-left group flex items-start gap-1.5 text-[11px] text-slate-600 hover:text-[#1F3A5F] cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3 shrink-0 mt-0.5 text-slate-400 group-hover:text-[#F28C28]" />
                                    <span className="line-clamp-2">
                                      {mentorNotes || 'Tambah catatan audit IG...'}
                                    </span>
                                  </button>
                                )
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>

                            <td className="py-3 pl-3 text-right">
                              <button
                                type="button"
                                onClick={() => onDeleteVote(vote.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Hapus data peserta"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3 / DEFAULT: SEMUA POSTER MATERI + CHECKBOX TAMPIL PUBLIK + STUDIO PNG */}
      {hostTab === 'posters' && (
        <div className="space-y-6">
          {/* Toolbar: Show All / Filter / Search */}
          <div className="bg-white rounded-2xl border border-[#1F3A5F]/12 p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-base sm:text-lg font-extrabold text-[#1F3A5F]">
                  Semua Materi di Web Apps ({materials.length} Poster)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Centang checkbox <strong>Tampilkan di Halaman Publik</strong> pada poster yang ingin Anda munculkan untuk polling peserta. Perubahan langsung tersimpan otomatis.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {hiddenPosterCount > 0 && (
                  <button
                    type="button"
                    disabled={isBusyHost}
                    onClick={handleShowAllPosters}
                    className="px-3.5 py-2 rounded-xl bg-[#F28C28] hover:bg-[#d97719] disabled:opacity-50 text-white text-xs font-extrabold cursor-pointer whitespace-nowrap"
                  >
                    Tampilkan Semua ({Math.min(materials.length, 20)})
                  </button>
                )}
                <a
                  href={baseBursaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1F3A5F] text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Lihat Halaman Publik ({candidateMaterials.length})</span>
                </a>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPosterFilterMode('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer tabular-nums ${
                    posterFilterMode === 'all'
                      ? 'bg-[#1F3A5F] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Semua Materi ({materials.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPosterFilterMode('visible')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer tabular-nums ${
                    posterFilterMode === 'visible'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Tampil di Publik ({candidateMaterials.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPosterFilterMode('hidden')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer tabular-nums ${
                    posterFilterMode === 'hidden'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Disembunyikan ({hiddenPosterCount})
                </button>
              </div>

              <div className="relative min-w-[230px] flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={posterSearchQuery}
                  onChange={(e) => setPosterSearchQuery(e.target.value)}
                  placeholder="Cari judul atau kategori materi..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                />
              </div>
            </div>
          </div>

          {/* All Materials Visual Poster Grid with Show/Hide Checkbox */}
          {filteredHostPosterMaterials.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
              Tidak ada materi yang sesuai filter atau kata kunci pencarian.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHostPosterMaterials.map((material) => {
                const isVisiblePublic = visiblePosterIdSet.has(material.id);
                const isToggling = togglingPosterId === material.id;
                const coverUrl = getMaterialCoverImageUrl(material);
                const highlights = extractMaterialCoreHighlights(material).slice(0, 3);
                const themePrimary = material.content.brandTheme?.primaryColor || '#1F3A5F';
                const voteCount = analytics.activeVotes.filter(
                  (v) => v.primaryMaterialId === material.id
                ).length;

                return (
                  <article
                    key={material.id}
                    className={`rounded-3xl overflow-hidden flex flex-col border transition-all shadow-sm ${
                      isVisiblePublic
                        ? 'border-emerald-400 ring-2 ring-emerald-500/20'
                        : 'border-slate-300 opacity-80'
                    }`}
                    style={{ backgroundColor: themePrimary }}
                  >
                    {/* Checkbox Visibility Header Bar */}
                    <label
                      className={`px-4 py-3 flex items-center justify-between gap-2 cursor-pointer border-b transition-colors ${
                        isVisiblePublic
                          ? 'bg-emerald-950/65 border-emerald-400/30 text-white'
                          : 'bg-slate-900/80 border-white/10 text-white/75'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isVisiblePublic}
                          disabled={isToggling || isBusyHost}
                          onChange={() => handleTogglePosterVisibility(material.id)}
                          className="w-4 h-4 accent-[#F28C28] rounded cursor-pointer shrink-0"
                        />
                        <span className="text-xs font-extrabold truncate">
                          {isToggling
                            ? 'Menyimpan...'
                            : isVisiblePublic
                            ? 'Tampilkan di Halaman Publik'
                            : 'Tidak Ditampilkan di Publik'}
                        </span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 flex items-center gap-1 ${
                          isVisiblePublic
                            ? 'bg-emerald-500/25 text-emerald-200'
                            : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {isVisiblePublic ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Publik</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Tersembunyi</span>
                          </>
                        )}
                      </span>
                    </label>

                    {/* Poster Visual Preview */}
                    <div className="px-4 pt-3">
                      <div className="relative h-36 rounded-2xl overflow-hidden bg-slate-900">
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={material.seminarTitle}
                            referrerPolicy="no-referrer"
                            className={`w-full h-full object-cover ${
                              isVisiblePublic ? '' : 'grayscale-[35%]'
                            }`}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col justify-center px-4 bg-gradient-to-br from-[#0F243E] to-[#1E466E] text-white">
                            <span className="text-[10px] font-semibold text-[#F28C28]">
                              {material.category || 'Modul Pelatihan UMKM'}
                            </span>
                            <p className="font-display text-sm font-extrabold mt-1 line-clamp-2">
                              {material.seminarTitle}
                            </p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 text-white">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#F28C28] text-white whitespace-nowrap tabular-nums">
                            MIN. {campaign.minQuota} PESERTA
                          </span>
                          <span className="text-[11px] font-bold text-white/90 whitespace-nowrap tabular-nums">
                            {voteCount} suara · {material.content.slides.length} slide
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Poster Editorial Highlights */}
                    <div className="m-4 mb-0 rounded-2xl bg-[#FFF9F0] p-4 flex-1 flex flex-col justify-between gap-2.5">
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-[#2A9D8F] truncate">
                          {material.category || 'Modul Pelatihan'} · {material.organizerName}
                        </div>
                        <h3 className="font-display text-sm sm:text-base font-extrabold text-[#1F3A5F] leading-snug">
                          {material.seminarTitle}
                        </h3>
                        <ul className="space-y-1 text-[11px] text-slate-700 pt-1 border-t border-[#1F3A5F]/10">
                          {highlights.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 leading-snug">
                              <span className="w-4 h-4 rounded-full bg-[#1F3A5F] text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                                {idx + 1}
                              </span>
                              <span className="line-clamp-2">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Poster Card Actions */}
                    <div className="p-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStudioMaterialId(material.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                          studioMaterialId === material.id
                            ? 'bg-white text-[#1F3A5F]'
                            : 'bg-white/15 hover:bg-white/25 text-white'
                        }`}
                      >
                        Edit Studio PNG
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosterModalMaterial(material)}
                        className="py-2 px-3 rounded-xl text-xs font-extrabold bg-[#F28C28] hover:bg-[#d97719] text-white transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        title="Pratinjau & Unduh Poster PNG"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PNG</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Studio Poster PNG & Broadcast WA Section */}
          {studioMaterial && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              <div className="lg:col-span-6 space-y-5">
                <div className="bg-white rounded-2xl border border-[#1F3A5F]/12 p-5 space-y-4">
                  <div>
                    <h3 className="font-display text-base font-extrabold text-[#1F3A5F]">
                      Studio Poster PNG Resolusi Tinggi & QR
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sesuaikan hook atau teks ajakan poster sebelum diunduh sebagai 4:5 (1080×1350 px) untuk Story/Grup WA.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Modul yang Diedit di Studio ({materials.length} modul)
                    </label>
                    <select
                      value={studioMaterial.id}
                      onChange={(e) => setStudioMaterialId(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl"
                    >
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {visiblePosterIdSet.has(m.id) ? '[Publik] ' : '[Tersembunyi] '}
                          {m.seminarTitle}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ringkasan / Hook Poster (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      maxLength={180}
                      value={studioCustomNote}
                      onChange={(e) => setStudioCustomNote(e.target.value)}
                      placeholder={studioMaterial.description || 'Tulis kalimat pengantar singkat untuk poster...'}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teks Ajakan Bawah (CTA Poster)
                    </label>
                    <input
                      type="text"
                      maxLength={90}
                      value={studioCtaLabel}
                      onChange={(e) => setStudioCtaLabel(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        const qrCanvas = studioQrWrapRef.current?.querySelector('canvas') || null;
                        await downloadMaterialPosterPng(studioMaterial, {
                          minQuota: campaign.minQuota,
                          deadlineLabel: campaign.deadlineLabel,
                          slotsSummary: slotsSummaryText,
                          ctaLabel: studioCtaLabel,
                          customNote: studioCustomNote,
                          qrCanvas,
                        });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d97719] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh Poster PNG (1080×1350)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          'studio_mat_link',
                          `${baseBursaUrl}&mid=${encodeURIComponent(studioMaterial.id)}`
                        )
                      }
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1F3A5F] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'studio_mat_link' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Link Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Link Voting Modul Ini</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#1F3A5F]/12 p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base font-extrabold text-[#1F3A5F]">
                        Teks Broadcast Grup WhatsApp
                      </h3>
                      <p className="text-xs text-slate-500">
                        Otomatis merangkum poster yang dicentang tampil publik, inti materi, opsi jadwal & link voting.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText('wa_broadcast', broadcastText)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {copiedKey === 'wa_broadcast' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Broadcast WA</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    rows={10}
                    value={broadcastText}
                    className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 bg-white rounded-2xl border border-[#1F3A5F]/12 p-5 flex flex-col items-center gap-4">
                <div className="w-full flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1F3A5F]">Pratinjau Langsung Poster 4:5</span>
                  <span className="text-slate-500 tabular-nums">1080 × 1350 px</span>
                </div>

                <div ref={studioQrWrapRef} className="hidden">
                  <QRCodeCanvas
                    value={`${baseBursaUrl}&mid=${encodeURIComponent(studioMaterial.id)}`}
                    size={220}
                    level="M"
                    includeMargin
                  />
                </div>

                {isRenderingStudio || !studioPreviewUrl ? (
                  <div className="w-full max-w-[400px] aspect-[4/5] rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#F28C28]" />
                    <span>Merender poster...</span>
                  </div>
                ) : (
                  <img
                    src={studioPreviewUrl}
                    alt={`Preview Poster ${studioMaterial.seminarTitle}`}
                    className="w-full max-w-[400px] rounded-2xl shadow-lg border border-slate-200"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SETUP POSTER PUBLIK & JADWAL */}
      {hostTab === 'setup' && (
        <form
          onSubmit={handleSaveCampaignSetup}
          className="bg-white rounded-2xl border border-[#1F3A5F]/12 p-5 sm:p-6 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Judul Halaman Publik Bursa Kelas
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={draftCampaign.title}
                onChange={(e) => setDraftCampaign({ ...draftCampaign, title: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Penyelenggara
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={draftCampaign.organizerName}
                onChange={(e) =>
                  setDraftCampaign({ ...draftCampaign, organizerName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subjudul / Penjelasan Aturan Main
              </label>
              <input
                type="text"
                maxLength={300}
                value={draftCampaign.subtitle}
                onChange={(e) => setDraftCampaign({ ...draftCampaign, subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kuota Minimal Peserta (Default 15)
              </label>
              <input
                type="number"
                min={5}
                max={200}
                value={draftCampaign.minQuota}
                onChange={(e) =>
                  setDraftCampaign({
                    ...draftCampaign,
                    minQuota: Math.max(5, Math.min(200, Number(e.target.value) || 15)),
                  })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Label Batas Waktu Voting
              </label>
              <input
                type="text"
                maxLength={80}
                value={draftCampaign.deadlineLabel}
                onChange={(e) =>
                  setDraftCampaign({ ...draftCampaign, deadlineLabel: e.target.value })
                }
                placeholder="Contoh: Voting ditutup Kamis pukul 20.00 WIB"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Kampanye
              </label>
              <select
                value={draftCampaign.status}
                onChange={(e) =>
                  setDraftCampaign({
                    ...draftCampaign,
                    status: e.target.value as UnlockCampaignStatus,
                  })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="open">Open (Voting Berjalan)</option>
                <option value="unlocked">Unlocked (Kuota Tercapai)</option>
                <option value="scheduled">Scheduled (Jadwal Resmi Diumumkan)</option>
                <option value="closed">Closed (Ditutup)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-extrabold text-[#1F3A5F] tabular-nums">
                Poster Materi yang Ditampilkan Moderator di Halaman Publik ({draftCampaign.candidateMaterialIds.length}/{materials.length} dipilih)
              </label>
              <button
                type="button"
                onClick={() =>
                  setDraftCampaign({
                    ...draftCampaign,
                    candidateMaterialIds: materials.map((m) => m.id).slice(0, 20),
                  })
                }
                className="text-xs font-bold text-[#F28C28] hover:underline cursor-pointer"
              >
                Centang Semua ({Math.min(materials.length, 20)})
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {materials.map((mat) => {
                const selected = draftCampaign.candidateMaterialIds.includes(mat.id);
                return (
                  <label
                    key={mat.id}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                      selected
                        ? 'bg-amber-50/70 border-[#F28C28]'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        const exists = draftCampaign.candidateMaterialIds.includes(mat.id);
                        const nextIds = exists
                          ? draftCampaign.candidateMaterialIds.filter((id) => id !== mat.id)
                          : [...draftCampaign.candidateMaterialIds, mat.id].slice(0, 20);
                        setDraftCampaign({ ...draftCampaign, candidateMaterialIds: nextIds });
                      }}
                      className="mt-1 w-4 h-4 accent-[#F28C28]"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1F3A5F]">{mat.seminarTitle}</div>
                      <div className="text-[11px] text-slate-500">
                        {mat.category || 'Umum'} · {mat.content.slides.length} slide
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-extrabold text-[#1F3A5F] tabular-nums">
                Opsi Hari & Jam Pelatihan ({draftCampaign.timeSlots.length}/8)
              </label>
              {draftCampaign.timeSlots.length < 8 && (
                <button
                  type="button"
                  onClick={() => {
                    const nextIdx = draftCampaign.timeSlots.length + 1;
                    const newSlot: UnlockTimeSlot = {
                      id: `slot_${Date.now().toString(36)}`,
                      label: `Opsi ${nextIdx}`,
                      dateText: 'Sabtu Pekan Depan',
                      timeText: '19.30 - 21.00 WIB',
                    };
                    setDraftCampaign({
                      ...draftCampaign,
                      timeSlots: [...draftCampaign.timeSlots, newSlot],
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#1F3A5F] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Opsi Jadwal</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {draftCampaign.timeSlots.map((slot, idx) => (
                <div
                  key={slot.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 items-center"
                >
                  <input
                    type="text"
                    value={slot.label}
                    onChange={(e) => {
                      const next = [...draftCampaign.timeSlots];
                      next[idx] = { ...slot, label: e.target.value };
                      setDraftCampaign({ ...draftCampaign, timeSlots: next });
                    }}
                    placeholder="Label (mis. Sabtu Pagi)"
                    className="sm:col-span-3 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={slot.dateText}
                    onChange={(e) => {
                      const next = [...draftCampaign.timeSlots];
                      next[idx] = { ...slot, dateText: e.target.value };
                      setDraftCampaign({ ...draftCampaign, timeSlots: next });
                    }}
                    placeholder="Tanggal (mis. Sabtu, 6 Des 2026)"
                    className="sm:col-span-4 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={slot.timeText}
                    onChange={(e) => {
                      const next = [...draftCampaign.timeSlots];
                      next[idx] = { ...slot, timeText: e.target.value };
                      setDraftCampaign({ ...draftCampaign, timeSlots: next });
                    }}
                    placeholder="Jam (mis. 09.30 - 11.30 WIB)"
                    className="sm:col-span-4 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      disabled={draftCampaign.timeSlots.length <= 1}
                      onClick={() => {
                        const next = draftCampaign.timeSlots.filter((_, i) => i !== idx);
                        setDraftCampaign({ ...draftCampaign, timeSlots: next });
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isBusyHost}
              className="px-6 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d97719] disabled:opacity-50 text-white text-sm font-extrabold cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isBusyHost ? 'Menyimpan...' : 'Simpan Pengaturan Poster & Jadwal'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Poster PNG Download Modal */}
      {posterDownloadModalJsx}
    </div>
  );
};

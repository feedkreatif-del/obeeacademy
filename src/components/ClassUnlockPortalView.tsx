import React, { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
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
  Layers,
  Lock,
  MapPin,
  MessageCircle,
  Plus,
  QrCode,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  Video,
  Wallet,
  X,
} from 'lucide-react';
import {
  CoachingScopeType,
  DeliveryModeType,
  MaterialPricingConfig,
  MaterialProgramConfig,
  MaterialTierEntry,
  ProgramFormatType,
  SavedMaterial,
  ScheduleModeType,
  UnlockCampaignDoc,
  UnlockCampaignStatus,
  UnlockContactDoc,
  UnlockLeadStage,
  UnlockPaymentMode,
  UnlockPaymentStatus,
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
import {
  DELIVERY_MODE_META,
  PROGRAM_FORMAT_META,
  PROGRAM_TIERS_ORDER,
  ResolvedTopicTier,
  SCHEDULE_MODE_META,
  buildDefaultProgramForTier,
  encodeTierOfferingKey,
  getDeliveryDisplayLabel,
  getEnabledTopicTiers,
  getProgramQuotaBadgeText,
  getProgramTierLabelOnly,
  isFixedScheduleProgram,
  normalizePricingConfig,
  parseTierOfferingKey,
  resolveMaterialProgram,
  resolveOfferingByKey,
  resolveTopicTiers,
  sanitizeSingleProgramConfig,
} from '../utils/programTier';
import { buildTierVariantMaterialDraft } from '../utils/tierDraftGenerator';
import {
  DEFAULT_GOPAY_MERCHANT_NAME,
  DEFAULT_GOPAY_MERCHANT_NMID,
  DEFAULT_GOPAY_QRIS_IMAGE,
  DEFAULT_GOPAY_QRIS_PAYLOAD,
  buildDynamicQrisPayload,
  decodeQrisFromImageFile,
  deriveUniquePaymentCode,
  extractQrisMetadata,
  formatRupiah,
  isValidQrisPayload,
} from '../utils/qris';

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
  onConfirmParticipantPayment: (
    voteId: string,
    paymentUniqueCode: number,
    paymentAmount: number
  ) => Promise<void>;
  onUpdateLeadCrm: (
    contactId: string,
    updates: {
      leadStage?: UnlockLeadStage;
      mentorNotes?: string;
      paymentStatus?: UnlockPaymentStatus;
      paidAt?: number;
    }
  ) => Promise<void>;
  onUpdateVoteStatus: (voteId: string, status: UnlockVoteStatus) => Promise<void>;
  onDeleteVote: (voteId: string) => Promise<void>;
  onSeedDemoVotes: () => Promise<void>;
  onClearDemoVotes: () => Promise<void>;
  onActivateWinningMaterial: (material: SavedMaterial) => Promise<void>;
  onCreateMaterial?: (material: SavedMaterial) => Promise<void>;
  onBackToPresenter?: () => void;
}

const LOCAL_WA_CACHE_KEY = 'partnerup_bursa_my_wa_v1';
const LOCAL_IG_CACHE_KEY = 'partnerup_bursa_my_ig_v1';
const LOCAL_CAT_CACHE_KEY = 'partnerup_bursa_my_cat_v1';
const LOCAL_NAME_CACHE_KEY = 'partnerup_bursa_my_name_v1';
const LOCAL_BIZ_CACHE_KEY = 'partnerup_bursa_my_biz_v1';

const BUSINESS_CATEGORIES = [
  'Korporasi / Perusahaan / Industri',
  'Instansi / Pendidikan / Komunitas',
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

const PAYMENT_STATUS_META: Record<
  UnlockPaymentStatus,
  { label: string; badgeClass: string }
> = {
  free: {
    label: 'Gratis',
    badgeClass: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  },
  unpaid: {
    label: 'Belum Bayar',
    badgeClass: 'bg-amber-50 border-amber-200 text-amber-800',
  },
  confirming: {
    label: 'Menunggu Cek Mutasi',
    badgeClass: 'bg-sky-50 border-sky-200 text-sky-800',
  },
  paid: {
    label: '✓ Lunas',
    badgeClass: 'bg-emerald-100 border-emerald-300 text-emerald-900',
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
  onConfirmParticipantPayment,
  onUpdateLeadCrm,
  onUpdateVoteStatus,
  onDeleteVote,
  onSeedDemoVotes,
  onClearDemoVotes,
  onActivateWinningMaterial,
  onCreateMaterial,
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

  const getEffectiveFormatForRawId = (rawId: string): ProgramFormatType => {
    const parsed = parseTierOfferingKey(rawId);
    if (parsed.format) return parsed.format;
    const anchorMat = materials.find((m) => m.id === parsed.anchorMaterialId);
    return anchorMat ? resolveMaterialProgram(anchorMat, campaign).format : 'seminar';
  };

  const doesVoteMatchOffering = (
    vote: Pick<UnlockVoteDoc, 'primaryMaterialId'>,
    offeringKey: string
  ): boolean => {
    const vParsed = parseTierOfferingKey(vote.primaryMaterialId);
    const oParsed = parseTierOfferingKey(offeringKey);
    if (vParsed.anchorMaterialId !== oParsed.anchorMaterialId) return false;
    const vFormat = getEffectiveFormatForRawId(vote.primaryMaterialId);
    const oFormat = getEffectiveFormatForRawId(offeringKey);
    return vFormat === oFormat;
  };

  const resolveTierSafe = (rawId: string): ResolvedTopicTier | null =>
    resolveOfferingByKey(rawId, materials, campaign);

  // Per-topic card active tier tab selector (Seminar | Workshop | Coaching)
  const [selectedTierByTopic, setSelectedTierByTopic] = useState<Record<string, ProgramFormatType>>(
    () => {
      if (!initialHighlightedMaterialId) return {};
      const parsed = parseTierOfferingKey(initialHighlightedMaterialId);
      return parsed.format ? { [parsed.anchorMaterialId]: parsed.format } : {};
    }
  );

  const getActiveTierForTopic = (
    anchorMat: SavedMaterial,
    preferredFilter: 'all' | ProgramFormatType = 'all',
    preferredDelivery: 'all' | DeliveryModeType = 'all'
  ): ResolvedTopicTier => {
    const enabled = getEnabledTopicTiers(anchorMat, materials, campaign);
    if (preferredFilter !== 'all') {
      const exactBoth = enabled.find(
        (t) =>
          t.format === preferredFilter &&
          (preferredDelivery === 'all' || (t.program.deliveryMode || 'online') === preferredDelivery)
      );
      if (exactBoth) return exactBoth;
      const exactFmt = enabled.find((t) => t.format === preferredFilter);
      if (exactFmt) return exactFmt;
    }
    const chosenFmt = selectedTierByTopic[anchorMat.id];
    if (chosenFmt) {
      const chosenTier = enabled.find((t) => t.format === chosenFmt);
      if (chosenTier) return chosenTier;
    }
    if (preferredDelivery !== 'all') {
      const matchDelivery = enabled.find(
        (t) => (t.program.deliveryMode || 'online') === preferredDelivery
      );
      if (matchDelivery) return matchDelivery;
    }
    return enabled[0];
  };

  const analytics = useMemo(() => {
    const activeVotes = votes.filter((v) => v.status !== 'cancelled');
    const allEnabledOfferings: ResolvedTopicTier[] = [];
    candidateMaterials.forEach((anchorMat) => {
      const enabled = getEnabledTopicTiers(anchorMat, materials, campaign);
      allEnabledOfferings.push(...enabled);
    });

    const offeringStats = allEnabledOfferings.map((tier) => {
      const primaryCount = activeVotes.filter((v) =>
        doesVoteMatchOffering(v, tier.offeringKey)
      ).length;
      const secondaryCount = activeVotes.filter((v) => {
        if (doesVoteMatchOffering(v, tier.offeringKey)) return false;
        return (v.secondaryMaterialIds || []).some(
          (sid) =>
            sid === tier.offeringKey ||
            (parseTierOfferingKey(sid).anchorMaterialId === tier.anchorMaterialId &&
              getEffectiveFormatForRawId(sid) === tier.format)
        );
      }).length;
      const sharePct =
        activeVotes.length > 0 ? Math.round((primaryCount / activeVotes.length) * 100) : 0;
      return {
        tier,
        material: tier.linkedMaterial,
        primaryCount,
        secondaryCount,
        sharePct,
      };
    });

    const offeringStatsMap = new Map(offeringStats.map((s) => [s.tier.offeringKey, s]));
    const sortedCandidates = [...offeringStats].sort(
      (a, b) => b.primaryCount - a.primaryCount || b.secondaryCount - a.secondaryCount
    );
    const leadingCandidate = sortedCandidates[0] || null;
    const resolvedWinningFromCamp = campaign.winningMaterialId
      ? resolveOfferingByKey(campaign.winningMaterialId, materials, campaign)
      : null;
    const leadingMaterialId =
      resolvedWinningFromCamp &&
      allEnabledOfferings.some((t) => t.offeringKey === resolvedWinningFromCamp.offeringKey)
        ? resolvedWinningFromCamp.offeringKey
        : leadingCandidate?.tier.offeringKey || allEnabledOfferings[0]?.offeringKey || '';

    const slotStats = campaign.timeSlots.map((slot) => {
      const slotVoters = activeVotes.filter((v) =>
        (v.availableSlotIds || []).includes(slot.id)
      );
      const exactCount = slotVoters.filter((v) =>
        doesVoteMatchOffering(v, leadingMaterialId)
      ).length;
      const rescueCount = slotVoters.filter(
        (v) => !doesVoteMatchOffering(v, leadingMaterialId) && v.flexibleTopic === true
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
      allEnabledOfferings,
      candidateStats: offeringStats,
      offeringStatsMap,
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
  }, [votes, candidateMaterials, materials, campaign]);

  const myVotes = useMemo(
    () =>
      votes.filter(
        (v) => v.campaignId === (campaign.id || 'active') && v.participantId === participantId
      ),
    [votes, campaign.id, participantId]
  );

  // Participant Registration + Vote Modal State (stores offeringKey: `${anchorId}::${format}`)
  const [isVoteModalOpen, setIsVoteModalOpen] = useState<boolean>(false);
  const [voteStep, setVoteStep] = useState<1 | 2>(1);
  const [primaryMaterialId, setPrimaryMaterialId] = useState<string>(() => {
    if (initialHighlightedMaterialId) {
      const resolved = resolveOfferingByKey(initialHighlightedMaterialId, materials, campaign);
      if (resolved) return resolved.offeringKey;
    }
    const firstAnchor = candidateMaterials[0];
    if (firstAnchor) {
      return getEnabledTopicTiers(firstAnchor, materials, campaign)[0]?.offeringKey || '';
    }
    return '';
  });
  const [selectedMyVoteId, setSelectedMyVoteId] = useState<string | null>(null);
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

  const myVoteForCurrentOffering = useMemo(
    () => myVotes.find((v) => doesVoteMatchOffering(v, primaryMaterialId)) || null,
    [myVotes, primaryMaterialId, materials, campaign]
  );

  const myActiveStatusVote = useMemo(
    () =>
      (selectedMyVoteId ? myVotes.find((v) => v.id === selectedMyVoteId) : null) ||
      myVoteForCurrentOffering ||
      myVotes[0] ||
      null,
    [myVotes, selectedMyVoteId, myVoteForCurrentOffering]
  );

  const myExistingVote = isVoteModalOpen ? myVoteForCurrentOffering : myActiveStatusVote;

  useEffect(() => {
    if (myVotes.length > 0 && !hasInitializedFromMyVote) {
      setHasInitializedFromMyVote(true);
      const firstVote = myVotes[0];
      const resolved = resolveTierSafe(firstVote.primaryMaterialId);
      setPrimaryMaterialId(resolved?.offeringKey || firstVote.primaryMaterialId);
      setSelectedMyVoteId(firstVote.id);
      setSecondaryMaterialIds(firstVote.secondaryMaterialIds || []);
      setAvailableSlotIds(firstVote.availableSlotIds || []);
      setFlexibleTopic(firstVote.flexibleTopic);
      setDisplayName(firstVote.displayName);
      setBusinessName(firstVote.businessName);
      setMainChallenge(firstVote.mainChallenge || '');
    }
  }, [myVotes, hasInitializedFromMyVote]);

  useEffect(() => {
    if (
      analytics.allEnabledOfferings.length > 0 &&
      !analytics.allEnabledOfferings.some((o) => o.offeringKey === primaryMaterialId)
    ) {
      setPrimaryMaterialId(analytics.allEnabledOfferings[0].offeringKey);
    }
  }, [analytics.allEnabledOfferings, primaryMaterialId]);

  // Poster Preview Modal State
  const [posterModalOffering, setPosterModalOffering] = useState<ResolvedTopicTier | null>(null);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string>('');
  const [isRenderingPoster, setIsRenderingPoster] = useState<boolean>(false);
  const modalQrWrapRef = useRef<HTMLDivElement | null>(null);

  // Studio Poster State (Host)
  const [studioMaterialId, setStudioMaterialId] = useState<string>(
    () => candidateMaterials[0]?.id || materials[0]?.id || ''
  );
  const [studioTierFormat, setStudioTierFormat] = useState<ProgramFormatType>('seminar');
  const [studioCustomNote, setStudioCustomNote] = useState<string>('');
  const [studioCtaLabel, setStudioCtaLabel] = useState<string>(
    'Scan QR / Klik Link untuk Voting & Kunci Kursi'
  );
  const [studioPreviewUrl, setStudioPreviewUrl] = useState<string>('');
  const [isRenderingStudio, setIsRenderingStudio] = useState<boolean>(false);
  const studioQrWrapRef = useRef<HTMLDivElement | null>(null);

  // Poster Catalog Filter, Visibility, & Multi-Jenjang Editor State
  const [publicProgramFilter, setPublicProgramFilter] = useState<'all' | ProgramFormatType>('all');
  const [publicDeliveryFilter, setPublicDeliveryFilter] = useState<'all' | DeliveryModeType>('all');
  const [posterFilterMode, setPosterFilterMode] = useState<'all' | 'visible' | 'hidden'>('all');
  const [posterProgramFilter, setPosterProgramFilter] = useState<'all' | ProgramFormatType>('all');
  const [posterDeliveryFilter, setPosterDeliveryFilter] = useState<'all' | DeliveryModeType>('all');
  const [posterSearchQuery, setPosterSearchQuery] = useState<string>('');
  const [togglingPosterId, setTogglingPosterId] = useState<string | null>(null);

  // Multi-Jenjang Modal Editor (Host)
  const [editingMultiTierAnchorId, setEditingMultiTierAnchorId] = useState<string | null>(null);
  const [editingTierTab, setEditingTierTab] = useState<ProgramFormatType>('seminar');
  const [tierDraftMap, setTierDraftMap] = useState<Record<ProgramFormatType, MaterialTierEntry>>({
    seminar: {
      enabled: true,
      linkedMaterialId: '',
      program: buildDefaultProgramForTier('seminar', 15),
      pricing: { isPaid: false, price: 0, paymentMode: 'pay_when_go' },
    },
    workshop: {
      enabled: false,
      linkedMaterialId: '',
      program: buildDefaultProgramForTier('workshop', 15),
      pricing: { isPaid: true, price: 150000, paymentMode: 'pay_when_go' },
    },
    coaching: {
      enabled: false,
      linkedMaterialId: '',
      program: buildDefaultProgramForTier('coaching', 15),
      pricing: { isPaid: true, price: 450000, paymentMode: 'direct_pay' },
    },
  });
  const [isCreatingTierDraft, setIsCreatingTierDraft] = useState<boolean>(false);

  // Dynamic QRIS Payment Modal State (Public)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [showOriginalQrisCard, setShowOriginalQrisCard] = useState<boolean>(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState<boolean>(false);
  const [paymentConfirmSuccess, setPaymentConfirmSuccess] = useState<string>('');

  // QRIS Setup Upload Feedback (Host)
  const [isDecodingQrisFile, setIsDecodingQrisFile] = useState<boolean>(false);
  const [qrisUploadFeedback, setQrisUploadFeedback] = useState<string>('');

  // CRM State (Host)
  const [crmSearch, setCrmSearch] = useState<string>('');
  const [crmStageFilter, setCrmStageFilter] = useState<string>('all');
  const [crmCategoryFilter, setCrmCategoryFilter] = useState<string>('all');
  const [crmTopicFilter, setCrmTopicFilter] = useState<string>('all');
  const [crmProgramFilter, setCrmProgramFilter] = useState<'all' | ProgramFormatType>('all');
  const [crmPaymentFilter, setCrmPaymentFilter] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>('');

  // Copy & Action Feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [hostMessage, setHostMessage] = useState<string>('');
  const [isBusyHost, setIsBusyHost] = useState<boolean>(false);

  // Host Decision Controls (holds offeringKey)
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
    if (!posterModalOffering) {
      setPosterPreviewUrl('');
      return;
    }
    let cancelled = false;
    setIsRenderingPoster(true);
    const timer = window.setTimeout(async () => {
      try {
        const qrCanvas = modalQrWrapRef.current?.querySelector('canvas') || null;
        const url = await renderMaterialPosterDataUrl(posterModalOffering.linkedMaterial, {
          minQuota: campaign.minQuota,
          deadlineLabel: campaign.deadlineLabel,
          slotsSummary: slotsSummaryText,
          pricing: posterModalOffering.pricing,
          program: posterModalOffering.program,
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
  }, [posterModalOffering, campaign.minQuota, campaign.deadlineLabel, slotsSummaryText]);

  // Render Studio Poster Preview
  const studioAnchorMaterial = useMemo(
    () => materials.find((m) => m.id === studioMaterialId) || materials[0] || null,
    [materials, studioMaterialId]
  );

  const studioResolvedTier = useMemo(() => {
    if (!studioAnchorMaterial) return null;
    const tiers = resolveTopicTiers(studioAnchorMaterial, materials, campaign);
    const chosen = tiers[studioTierFormat];
    if (chosen.enabled) return chosen;
    return PROGRAM_TIERS_ORDER.map((f) => tiers[f]).find((t) => t.enabled) || chosen;
  }, [studioAnchorMaterial, studioTierFormat, materials, campaign]);

  useEffect(() => {
    if (!isHostMode || hostTab !== 'posters' || !studioResolvedTier) return;
    let cancelled = false;
    setIsRenderingStudio(true);
    const timer = window.setTimeout(async () => {
      try {
        const qrCanvas = studioQrWrapRef.current?.querySelector('canvas') || null;
        const url = await renderMaterialPosterDataUrl(studioResolvedTier.linkedMaterial, {
          minQuota: campaign.minQuota,
          deadlineLabel: campaign.deadlineLabel,
          slotsSummary: slotsSummaryText,
          ctaLabel: studioCtaLabel,
          customNote: studioCustomNote,
          pricing: studioResolvedTier.pricing,
          program: studioResolvedTier.program,
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
    studioResolvedTier,
    campaign.minQuota,
    campaign.deadlineLabel,
    slotsSummaryText,
    studioCtaLabel,
    studioCustomNote,
  ]);

  const payableContext = useMemo(() => {
    const targetVote = myActiveStatusVote;
    const activeOfferingKey =
      (isVoteModalOpen ? primaryMaterialId : targetVote?.primaryMaterialId) || primaryMaterialId;
    const resolvedTier = resolveTierSafe(activeOfferingKey);
    const materialObj = resolvedTier?.linkedMaterial || null;
    const pricing = resolvedTier?.pricing || {
      isPaid: false,
      price: 0,
      paymentMode: 'pay_when_go' as UnlockPaymentMode,
    };
    const matchingVote =
      myVotes.find((v) => doesVoteMatchOffering(v, activeOfferingKey)) || targetVote || null;
    const uniqueCode =
      matchingVote?.paymentUniqueCode && matchingVote.paymentUniqueCode > 0
        ? matchingVote.paymentUniqueCode
        : deriveUniquePaymentCode(participantId, campaign.id || 'active');
    const payableAmount =
      pricing.isPaid && pricing.price > 0
        ? matchingVote?.paymentAmount &&
          matchingVote.paymentAmount >= pricing.price &&
          doesVoteMatchOffering(matchingVote, activeOfferingKey)
          ? matchingVote.paymentAmount
          : pricing.price + uniqueCode
        : 0;
    const isCampaignGo = campaign.status === 'scheduled' || campaign.status === 'unlocked';
    const isPaymentUnlocked =
      pricing.isPaid &&
      pricing.price > 0 &&
      (pricing.paymentMode === 'direct_pay' || isCampaignGo);
    const staticQris = campaign.qrisPayload || DEFAULT_GOPAY_QRIS_PAYLOAD;
    const dynamicQrisPayload =
      payableAmount > 0 ? buildDynamicQrisPayload(staticQris, payableAmount) : '';
    const merchantMeta = extractQrisMetadata(staticQris);
    return {
      resolvedTier,
      matchingVote,
      materialObj,
      pricing,
      uniqueCode,
      payableAmount,
      isCampaignGo,
      isPaymentUnlocked,
      dynamicQrisPayload,
      merchantName:
        campaign.qrisMerchantName || merchantMeta.merchantName || DEFAULT_GOPAY_MERCHANT_NAME,
      merchantNmid:
        campaign.qrisMerchantNmid || merchantMeta.nmid || DEFAULT_GOPAY_MERCHANT_NMID,
      fallbackImageUrl: campaign.qrisFallbackImageUrl || DEFAULT_GOPAY_QRIS_IMAGE,
    };
  }, [
    myActiveStatusVote,
    myVotes,
    isVoteModalOpen,
    primaryMaterialId,
    materials,
    campaign,
    participantId,
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

  const openVoteModalForMaterial = (offeringOrMatId: string) => {
    const resolved = resolveTierSafe(offeringOrMatId);
    const nextKey = resolved?.offeringKey || offeringOrMatId;
    setPrimaryMaterialId(nextKey);
    const existingForOffering = myVotes.find((v) => doesVoteMatchOffering(v, nextKey));
    if (existingForOffering) {
      setAvailableSlotIds(existingForOffering.availableSlotIds || []);
      setFlexibleTopic(existingForOffering.flexibleTopic);
      setMainChallenge(existingForOffering.mainChallenge || '');
    }
    setSecondaryMaterialIds((prev) => prev.filter((id) => id !== nextKey));
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
      setFormError('Nama perusahaan / usaha / instansi wajib diisi.');
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

    const resolvedTier = resolveTierSafe(primaryMaterialId);
    if (!resolvedTier) {
      setFormError('Pilih minimal 1 poster materi utama.');
      return;
    }

    const canonicalOfferingKey = resolvedTier.offeringKey;
    const primaryMatObj = resolvedTier.linkedMaterial;
    const chosenProgram = resolvedTier.program;
    const tierLabel = PROGRAM_FORMAT_META[resolvedTier.format].label;
    const topicTitle = `${primaryMatObj.seminarTitle} (${tierLabel})`;
    const isFixedSchedule = isFixedScheduleProgram(chosenProgram);

    if (!isFixedSchedule && availableSlotIds.length === 0) {
      setFormError('Centang minimal 1 jadwal waktu yang kamu bisa hadiri.');
      return;
    }
    if (cleanName.length < 2 || cleanBiz.length < 2 || cleanWa.length < 6 || !cleanIg) {
      setVoteStep(1);
      setFormError('Lengkapi dulu nama peserta, usaha, WhatsApp, dan akun Instagram.');
      return;
    }

    const effectiveSlotIds =
      isFixedSchedule && availableSlotIds.length === 0
        ? [campaign.timeSlots[0]?.id || 'fixed_admin_slot']
        : availableSlotIds.slice(0, 8);
    const isOneOnOneCoaching =
      chosenProgram.format === 'coaching' && chosenProgram.coachingScope === 'one_on_one';
    const chosenPricing = resolvedTier.pricing;
    const existingMatchingVote = myVotes.find((v) =>
      doesVoteMatchOffering(v, canonicalOfferingKey)
    );
    const uniqueCode =
      existingMatchingVote?.paymentUniqueCode && existingMatchingVote.paymentUniqueCode > 0
        ? existingMatchingVote.paymentUniqueCode
        : deriveUniquePaymentCode(participantId, `${campaign.id || 'active'}_${resolvedTier.format}`);
    const isPaidTopic = chosenPricing.isPaid && chosenPricing.price > 0;
    const totalPayableAmount = isPaidTopic ? chosenPricing.price + uniqueCode : 0;
    const nextPaymentStatus: UnlockPaymentStatus =
      existingMatchingVote?.paymentStatus === 'paid'
        ? 'paid'
        : isPaidTopic
        ? existingMatchingVote?.paymentStatus === 'confirming'
          ? 'confirming'
          : 'unpaid'
        : 'free';

    setIsSubmittingVote(true);
    try {
      await onSubmitVoteAndContact(
        {
          campaignId: (campaign.id || 'active').slice(0, 64),
          participantId: participantId.slice(0, 64),
          displayName: cleanName,
          businessName: cleanBiz,
          primaryMaterialId: canonicalOfferingKey.slice(0, 100),
          secondaryMaterialIds: isOneOnOneCoaching
            ? []
            : secondaryMaterialIds
                .filter((id) => !doesVoteMatchOffering({ primaryMaterialId: id }, canonicalOfferingKey))
                .slice(0, 3),
          availableSlotIds: effectiveSlotIds,
          flexibleTopic: isOneOnOneCoaching || isFixedSchedule ? false : flexibleTopic,
          mainChallenge: cleanChallenge,
          status:
            existingMatchingVote?.status === 'confirmed_h1' ? 'confirmed_h1' : 'committed',
          paymentStatus: nextPaymentStatus,
          paymentUniqueCode: isPaidTopic ? uniqueCode : 0,
          paymentAmount: totalPayableAmount,
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
      const isCampaignGoNow =
        campaign.status === 'scheduled' || campaign.status === 'unlocked';
      const shouldOpenQrisNow =
        isPaidTopic &&
        nextPaymentStatus !== 'paid' &&
        (chosenPricing.paymentMode === 'direct_pay' || isCampaignGoNow);

      if (shouldOpenQrisNow) {
        setIsVoteModalOpen(false);
        setPaymentConfirmSuccess('');
        setIsPaymentModalOpen(true);
      } else {
        setFormSuccess(
          isOneOnOneCoaching
            ? isPaidTopic
              ? `Pengajuan Coaching Privat (${formatRupiah(chosenPricing.price)}) tercatat! Mentor akan mengonfirmasi jadwal sesi 1-on-1 via WhatsApp.`
              : 'Pengajuan sesi Coaching Privat 1-on-1 berhasil dikirim! Mentor akan segera menghubungimu.'
            : isFixedSchedule
            ? isPaidTopic
              ? `Pendaftaran kelas terjadwal (${chosenProgram?.fixedScheduleLabel}) tercatat! Lanjutkan konfirmasi QRIS atau tunggu pengingat H-1 via WhatsApp.`
              : `Pendaftaranmu untuk jadwal tetap (${chosenProgram?.fixedScheduleLabel}) resmi tercatat! Pengingat H-1 akan dikirim via WhatsApp.`
            : isPaidTopic
            ? `Pilihan kelas berbayar (${formatRupiah(chosenPricing.price)}) tercatat! QRIS pembayaran otomatis terbuka saat kelas mencapai kuota GO.`
            : myExistingVote
            ? 'Pilihan topik, jadwal & data peserta berhasil diperbarui!'
            : 'Suaramu resmi terkunci! Terima kasih sudah berkomitmen hadir.'
        );
      }
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
      'Jenjang Program',
      'Metode & Lokasi',
      'Topik yang Dipilih',
      'Jadwal Bisa Hadir',
      'Status Kehadiran',
      'Status Pembayaran',
      'Nominal QRIS (Rp)',
      'Status Prospek Klien',
      'Catatan Audit Mentor',
      'Masalah Utama Peserta',
      'Waktu Daftar',
    ];
    const esc = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;

    const rows = votes.map((v) => {
      const contact = contactMap.get(v.id);
      const resolvedTier = resolveTierSafe(v.primaryMaterialId);
      const matObj = resolvedTier?.linkedMaterial;
      const matProgram = resolvedTier?.program || null;
      const programLabel = matProgram
        ? `${PROGRAM_FORMAT_META[matProgram.format].label}${
            matProgram.format === 'coaching'
              ? matProgram.coachingScope === 'category_group'
                ? ` (${matProgram.targetCategory || 'Kategori'})`
                : ' (1-on-1 Privat)'
              : ''
          }`
        : 'Seminar';
      const deliveryLabel = matProgram
        ? getDeliveryDisplayLabel(matProgram)
        : 'ONLINE · Via Zoom / Google Meet';
      const matTitle =
        contact?.interestedTopicTitle || matObj?.seminarTitle || v.primaryMaterialId;
      const slotLabels =
        matProgram && isFixedScheduleProgram(matProgram)
          ? `Jadwal Pasti Admin: ${matProgram.fixedScheduleLabel}`
          : (v.availableSlotIds || [])
              .map((sid) => campaign.timeSlots.find((s) => s.id === sid)?.label || sid)
              .join(' | ');
      const stageLabel =
        LEAD_STAGE_META[contact?.leadStage || 'lead_baru']?.label || 'Lead Baru';
      const matPricing = resolvedTier?.pricing || normalizePricingConfig(undefined);
      const effectivePayStatus: UnlockPaymentStatus =
        contact?.paymentStatus ||
        v.paymentStatus ||
        (matPricing.isPaid ? 'unpaid' : 'free');
      const effectivePayAmount =
        contact?.paymentAmount ??
        v.paymentAmount ??
        (matPricing.isPaid
          ? matPricing.price + deriveUniquePaymentCode(v.participantId, campaign.id || 'active')
          : 0);
      return [
        esc(v.displayName),
        esc(v.businessName),
        esc(contact?.businessCategory || '-'),
        esc(isVerifiedMentorAdmin ? contact?.whatsapp || '-' : '(Verifikasi Admin)'),
        esc(isVerifiedMentorAdmin ? contact?.instagram || '-' : '(Verifikasi Admin)'),
        esc(programLabel),
        esc(deliveryLabel),
        esc(matTitle),
        esc(slotLabels),
        esc(v.status),
        esc(PAYMENT_STATUS_META[effectivePayStatus]?.label || effectivePayStatus),
        esc(effectivePayAmount > 0 ? String(effectivePayAmount) : '0'),
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
    a.download = `Bank_Database_Peserta_obeeAcademy_${new Date().toISOString().slice(0, 10)}.csv`;
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
        title:
          draftCampaign.title.trim().slice(0, 120) ||
          'Bursa Kelas Pelatihan obeeAcademy - Vote Topik & Jadwal',
        subtitle: draftCampaign.subtitle.trim().slice(0, 300),
        organizerName:
          draftCampaign.organizerName.trim().slice(0, 100) || 'obeeAcademy',
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
      const enabledTiers = getEnabledTopicTiers(mat, materials, campaign);
      const hasMatchingTier = enabledTiers.some((t) => {
        if (posterProgramFilter !== 'all' && t.format !== posterProgramFilter) return false;
        const tDel: DeliveryModeType = t.program.deliveryMode === 'offline' ? 'offline' : 'online';
        if (posterDeliveryFilter !== 'all' && tDel !== posterDeliveryFilter) return false;
        return true;
      });
      if (!hasMatchingTier) return false;
      if (!q) return true;
      return (
        mat.seminarTitle.toLowerCase().includes(q) ||
        (mat.category || '').toLowerCase().includes(q) ||
        (mat.description || '').toLowerCase().includes(q) ||
        enabledTiers.some(
          (t) =>
            PROGRAM_FORMAT_META[t.format].label.toLowerCase().includes(q) ||
            (t.program.locationLabel || '').toLowerCase().includes(q) ||
            t.linkedMaterial.seminarTitle.toLowerCase().includes(q)
        )
      );
    });
  }, [
    materials,
    visiblePosterIdSet,
    posterFilterMode,
    posterProgramFilter,
    posterDeliveryFilter,
    posterSearchQuery,
    campaign,
  ]);

  const hiddenPosterCount = useMemo(
    () => materials.filter((m) => !visiblePosterIdSet.has(m.id)).length,
    [materials, visiblePosterIdSet]
  );

  const winningOffering = useMemo(() => {
    const key = campaign.winningMaterialId || analytics.leadingMaterialId;
    return key ? resolveTierSafe(key) : null;
  }, [campaign.winningMaterialId, analytics.leadingMaterialId, materials, campaign]);
  const winningSlotObj = campaign.timeSlots.find(
    (s) => s.id === (campaign.winningSlotId || analytics.bestSlotStat?.slot.id)
  );

  const contactByVoteId = useMemo(() => {
    const map = new Map<string, UnlockContactDoc>();
    contacts.forEach((c) => map.set(c.voteId, c));
    return map;
  }, [contacts]);

  const openMultiTierModal = (anchorMat: SavedMaterial, initialFmt?: ProgramFormatType) => {
    const resolvedMap = resolveTopicTiers(anchorMat, materials, campaign);
    const nextDraft: Record<ProgramFormatType, MaterialTierEntry> = {
      seminar: {
        enabled: resolvedMap.seminar.enabled,
        linkedMaterialId: resolvedMap.seminar.linkedMaterialId,
        program: { ...resolvedMap.seminar.program },
        pricing: { ...resolvedMap.seminar.pricing },
      },
      workshop: {
        enabled: resolvedMap.workshop.enabled,
        linkedMaterialId: resolvedMap.workshop.linkedMaterialId,
        program: { ...resolvedMap.workshop.program },
        pricing: { ...resolvedMap.workshop.pricing },
      },
      coaching: {
        enabled: resolvedMap.coaching.enabled,
        linkedMaterialId: resolvedMap.coaching.linkedMaterialId,
        program: { ...resolvedMap.coaching.program },
        pricing: { ...resolvedMap.coaching.pricing },
      },
    };
    setTierDraftMap(nextDraft);
    const activeDefault =
      initialFmt ||
      PROGRAM_TIERS_ORDER.find((f) => nextDraft[f].enabled) ||
      'seminar';
    setEditingTierTab(activeDefault);
    setEditingMultiTierAnchorId(anchorMat.id);
  };

  const handleSaveMultiTierConfig = async (anchorId: string) => {
    const enabledCount = PROGRAM_TIERS_ORDER.filter((f) => tierDraftMap[f].enabled).length;
    if (enabledCount === 0) {
      setHostMessage('Aktifkan minimal 1 jenjang (Seminar / Workshop / Coaching) pada materi ini.');
      return;
    }

    const sanitizedTiers: Partial<Record<ProgramFormatType, MaterialTierEntry>> = {};
    for (const fmt of PROGRAM_TIERS_ORDER) {
      const raw = tierDraftMap[fmt];
      const cleanPricing = normalizePricingConfig(raw.pricing);
      if (raw.enabled && cleanPricing.isPaid && cleanPricing.price < 1000) {
        setEditingTierTab(fmt);
        setHostMessage(
          `Masukkan nominal harga minimal Rp1.000 pada jenjang ${PROGRAM_FORMAT_META[fmt].label}.`
        );
        return;
      }
      const cleanProg = sanitizeSingleProgramConfig(
        raw.program,
        buildDefaultProgramForTier(fmt, campaign.minQuota || 15),
        fmt,
        campaign.minQuota || 15
      );
      if (raw.enabled && cleanProg.scheduleMode === 'fixed' && !cleanProg.fixedScheduleLabel) {
        setEditingTierTab(fmt);
        setHostMessage(
          `Masukkan tanggal & jam pasti pada jenjang ${PROGRAM_FORMAT_META[fmt].label}.`
        );
        return;
      }
      sanitizedTiers[fmt] = {
        enabled: Boolean(raw.enabled),
        linkedMaterialId: (raw.linkedMaterialId || anchorId).slice(0, 100),
        program: cleanProg,
        pricing: cleanPricing,
      };
    }

    const primaryTierFmt =
      PROGRAM_TIERS_ORDER.find((f) => sanitizedTiers[f]?.enabled) || 'seminar';
    const primaryTier = sanitizedTiers[primaryTierFmt]!;
    const existingProg = campaign.materialProgram?.[anchorId];

    const nextProgramEntry: MaterialProgramConfig = {
      ...primaryTier.program,
      tiers: sanitizedTiers,
      ...(existingProg?.format ? {} : {}),
    };

    const nextProgramMap: Record<string, MaterialProgramConfig> = {
      ...(campaign.materialProgram || {}),
      [anchorId]: nextProgramEntry,
    };
    const nextPricingMap: Record<string, MaterialPricingConfig> = {
      ...(campaign.materialPricing || {}),
      [anchorId]: primaryTier.pricing,
    };

    setIsBusyHost(true);
    try {
      await onSaveCampaign({
        ...campaign,
        materialProgram: nextProgramMap,
        materialPricing: nextPricingMap,
        updatedAt: Date.now(),
      });
      const matTitle = materials.find((m) => m.id === anchorId)?.seminarTitle || anchorId;
      const activeNames = PROGRAM_TIERS_ORDER.filter((f) => sanitizedTiers[f]?.enabled)
        .map((f) => PROGRAM_FORMAT_META[f].label)
        .join(' + ');
      setHostMessage(`Multi-jenjang "${matTitle}" disimpan (${activeNames}).`);
      setEditingMultiTierAnchorId(null);
    } finally {
      setIsBusyHost(false);
    }
  };

  const handleCreateTierDraftMaterial = async (
    anchorMat: SavedMaterial,
    targetFormat: ProgramFormatType
  ) => {
    if (!onCreateMaterial) {
      setHostMessage('Fungsi tambah Bank Materi belum tersedia di mode ini.');
      return;
    }
    setIsCreatingTierDraft(true);
    try {
      const draftMat = buildTierVariantMaterialDraft(anchorMat, targetFormat);
      await onCreateMaterial(draftMat);
      setTierDraftMap((prev) => ({
        ...prev,
        [targetFormat]: {
          ...prev[targetFormat],
          enabled: true,
          linkedMaterialId: draftMat.id,
        },
      }));
      setHostMessage(
        `Draf modul "${draftMat.seminarTitle}" dibuat di Bank Materi dan ditautkan ke jenjang ${PROGRAM_FORMAT_META[targetFormat].label}.`
      );
    } catch {
      setHostMessage('Gagal membuat draf varian materi. Coba lagi.');
    } finally {
      setIsCreatingTierDraft(false);
    }
  };

  // CRM Funnel counts & filtered records (must be unconditional before early return)
  const crmRecords = useMemo(() => {
    return votes.map((v) => {
      const contact = contactByVoteId.get(v.id);
      const resolvedTier = resolveTierSafe(v.primaryMaterialId);
      const matObj = resolvedTier?.linkedMaterial || null;
      const matProgram = resolvedTier?.program || null;
      const tierLabel = resolvedTier ? PROGRAM_FORMAT_META[resolvedTier.format].label : '';
      const topicTitle =
        contact?.interestedTopicTitle ||
        (matObj
          ? `${matObj.seminarTitle}${tierLabel ? ` (${tierLabel})` : ''}`
          : v.primaryMaterialId);
      const matPricing = resolvedTier?.pricing || normalizePricingConfig(undefined);
      const paymentStatus: UnlockPaymentStatus =
        contact?.paymentStatus ||
        v.paymentStatus ||
        (matPricing.isPaid ? 'unpaid' : 'free');
      const paymentUniqueCode =
        contact?.paymentUniqueCode ??
        v.paymentUniqueCode ??
        (matPricing.isPaid ? deriveUniquePaymentCode(v.participantId, campaign.id || 'active') : 0);
      const paymentAmount =
        contact?.paymentAmount ??
        v.paymentAmount ??
        (matPricing.isPaid ? matPricing.price + paymentUniqueCode : 0);

      return {
        vote: v,
        contact,
        resolvedTier,
        topicTitle,
        matProgram,
        matPricing,
        paymentStatus,
        paymentUniqueCode,
        paymentAmount,
        stage: (contact?.leadStage || 'lead_baru') as UnlockLeadStage,
        category: contact?.businessCategory || 'Belum diisi',
        instagram: contact?.instagram || '',
        whatsapp: contact?.whatsapp || '',
        mentorNotes: contact?.mentorNotes || '',
      };
    });
  }, [votes, contactByVoteId, materials, campaign]);

  const crmFunnelStats = useMemo(() => {
    return {
      total: crmRecords.length,
      leadBaru: crmRecords.filter((r) => r.stage === 'lead_baru').length,
      sudahDihubungi: crmRecords.filter((r) => r.stage === 'sudah_dihubungi').length,
      prospekKlien: crmRecords.filter((r) => r.stage === 'prospek_klien').length,
      klienDeal: crmRecords.filter((r) => r.stage === 'klien_deal').length,
      paidCount: crmRecords.filter((r) => r.paymentStatus === 'paid').length,
    };
  }, [crmRecords]);

  const filteredCrmRecords = useMemo(() => {
    const q = crmSearch.trim().toLowerCase();
    return crmRecords.filter((r) => {
      if (crmStageFilter !== 'all' && r.stage !== crmStageFilter) return false;
      if (crmCategoryFilter !== 'all' && r.category !== crmCategoryFilter) return false;
      if (
        crmTopicFilter !== 'all' &&
        parseTierOfferingKey(r.vote.primaryMaterialId).anchorMaterialId !== crmTopicFilter
      ) {
        return false;
      }
      if (
        crmProgramFilter !== 'all' &&
        (r.matProgram?.format || 'seminar') !== crmProgramFilter
      ) {
        return false;
      }
      if (crmPaymentFilter !== 'all' && r.paymentStatus !== crmPaymentFilter) return false;
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
  }, [
    crmRecords,
    crmSearch,
    crmStageFilter,
    crmCategoryFilter,
    crmTopicFilter,
    crmProgramFilter,
    crmPaymentFilter,
  ]);

  const posterDownloadModalJsx = posterModalOffering ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        <div className="px-5 py-4 bg-[#1F3A5F] text-white flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-bold text-[#F28C28]">
              Poster {PROGRAM_FORMAT_META[posterModalOffering.format].label} (4:5 PNG)
            </div>
            <div className="text-base sm:text-lg font-extrabold truncate">
              {posterModalOffering.linkedMaterial.seminarTitle}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPosterModalOffering(null)}
            className="p-2 rounded-lg hover:bg-white/10 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={modalQrWrapRef} className="hidden">
          <QRCodeCanvas
            value={`${baseBursaUrl}&mid=${encodeURIComponent(posterModalOffering.offeringKey)}`}
            size={220}
            level="M"
            includeMargin
          />
        </div>

        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center gap-4 bg-slate-100">
          {isRenderingPoster || !posterPreviewUrl ? (
            <div className="w-full aspect-[4/5] rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-2 text-sm text-slate-600">
              <RefreshCw className="w-5 h-5 animate-spin text-[#F28C28]" />
              <span>Menyusun poster PNG resolusi tinggi...</span>
            </div>
          ) : (
            <img
              src={posterPreviewUrl}
              alt={`Poster ${posterModalOffering.linkedMaterial.seminarTitle}`}
              className="w-full max-w-[340px] rounded-xl shadow-md border border-slate-200"
            />
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2.5">
          <button
            type="button"
            onClick={async () => {
              const qrCanvas = modalQrWrapRef.current?.querySelector('canvas') || null;
              await downloadMaterialPosterPng(posterModalOffering.linkedMaterial, {
                minQuota: campaign.minQuota,
                deadlineLabel: campaign.deadlineLabel,
                slotsSummary: slotsSummaryText,
                pricing: posterModalOffering.pricing,
                program: posterModalOffering.program,
                qrCanvas,
              });
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-[#F28C28] hover:bg-[#d97719] text-white text-sm sm:text-[15px] font-extrabold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Poster PNG</span>
          </button>
          <button
            type="button"
            onClick={() =>
              handleCopyText(
                'modal_link',
                `${baseBursaUrl}&mid=${encodeURIComponent(posterModalOffering.offeringKey)}`
              )
            }
            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1F3A5F] text-sm font-bold flex items-center gap-1.5 cursor-pointer"
          >
            {copiedKey === 'modal_link' ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
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
    const chosenModalTier =
      resolveTierSafe(primaryMaterialId) || analytics.allEnabledOfferings[0] || null;
    const chosenModalMaterial = chosenModalTier?.linkedMaterial || candidateMaterials[0] || null;
    const chosenModalProgram = chosenModalTier?.program || null;
    const chosenModalPricing =
      chosenModalTier?.pricing || normalizePricingConfig(undefined);
    const isModalOneOnOneCoaching =
      chosenModalProgram?.format === 'coaching' &&
      chosenModalProgram.coachingScope === 'one_on_one';
    const isModalFixedSchedule = chosenModalProgram
      ? isFixedScheduleProgram(chosenModalProgram)
      : false;

    const programCounts = {
      seminar: candidateMaterials.filter((anchorMat) =>
        getEnabledTopicTiers(anchorMat, materials, campaign).some((t) => t.format === 'seminar')
      ).length,
      workshop: candidateMaterials.filter((anchorMat) =>
        getEnabledTopicTiers(anchorMat, materials, campaign).some((t) => t.format === 'workshop')
      ).length,
      coaching: candidateMaterials.filter((anchorMat) =>
        getEnabledTopicTiers(anchorMat, materials, campaign).some((t) => t.format === 'coaching')
      ).length,
    };

    const visiblePublicTopics = candidateMaterials
      .map((anchorMat) => {
        const enabledTiers = getEnabledTopicTiers(anchorMat, materials, campaign);
        const matchesFilters = enabledTiers.some((t) => {
          if (publicProgramFilter !== 'all' && t.format !== publicProgramFilter) return false;
          const mode: DeliveryModeType = t.program.deliveryMode === 'offline' ? 'offline' : 'online';
          if (publicDeliveryFilter !== 'all' && mode !== publicDeliveryFilter) return false;
          return true;
        });
        if (!matchesFilters) return null;
        const activeTier = getActiveTierForTopic(
          anchorMat,
          publicProgramFilter,
          publicDeliveryFilter
        );
        const stat = analytics.offeringStatsMap.get(activeTier.offeringKey);
        const totalTopicVotes = enabledTiers.reduce(
          (acc, t) => acc + (analytics.offeringStatsMap.get(t.offeringKey)?.primaryCount || 0),
          0
        );
        return {
          anchorMat,
          enabledTiers,
          activeTier,
          primaryCount: stat?.primaryCount || 0,
          sharePct: stat?.sharePct || 0,
          totalTopicVotes,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return (
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9 space-y-8">
        {/* Hero & Quorum Status */}
        <section className="bg-[#1F3A5F] text-white rounded-3xl p-5 sm:p-8 border border-white/10 shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm sm:text-[15px] text-white/80">
              <span className="font-semibold tracking-wide text-[#F28C28]">
                {campaign.organizerName || 'obeeAcademy'} | Bursa Materi Pelatihan
              </span>
              <span className="tabular-nums">{campaign.deadlineLabel}</span>
            </div>

            <div className="space-y-2.5 max-w-3xl">
              <h1
                className="font-display text-[26px] sm:text-4xl font-extrabold tracking-tight leading-tight"
                style={{ textWrap: 'balance' }}
              >
                {campaign.title}
              </h1>
              <p className="text-base sm:text-lg text-white/85 leading-relaxed">
                {campaign.subtitle}
              </p>
            </div>

            {isScheduled && winningOffering && winningSlotObj ? (
              <div className="bg-emerald-500/15 border border-emerald-400/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-emerald-300 text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Kuota Tercapai — Kelas Resmi Dijadwalkan</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-100 text-xs font-extrabold">
                      {PROGRAM_FORMAT_META[winningOffering.format].label}
                    </span>
                  </div>
                  <h2 className="font-display text-xl font-extrabold text-white">
                    {winningOffering.linkedMaterial.seminarTitle}
                  </h2>
                  <p className="text-sm sm:text-base text-white/90">
                    Jadwal Sah: <strong>{winningSlotObj.label}</strong> ({winningSlotObj.dateText} ·{' '}
                    {winningSlotObj.timeText})
                  </p>
                  {campaign.confirmedScheduleNote && (
                    <p className="text-sm text-emerald-100/95 pt-1 leading-relaxed">
                      {campaign.confirmedScheduleNote}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {myExistingVote &&
                    payableContext.pricing.isPaid &&
                    myExistingVote.paymentStatus !== 'paid' && (
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentConfirmSuccess('');
                          setIsPaymentModalOpen(true);
                        }}
                        className="px-4 py-3 rounded-xl bg-[#F28C28] hover:bg-[#d97719] text-white text-sm sm:text-[15px] font-extrabold whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Bayar QRIS ({formatRupiah(payableContext.payableAmount)})</span>
                      </button>
                    )}
                  <button
                    type="button"
                    onClick={() => openVoteModalForMaterial(winningOffering.offeringKey)}
                    className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm sm:text-[15px] font-bold whitespace-nowrap cursor-pointer transition-colors"
                  >
                    Daftar Ikut Kelas Ini
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-amber-300">
                      Kandidat Terkuat Saat Ini
                    </div>
                    <div className="text-base sm:text-lg font-bold text-white mt-0.5 leading-snug">
                      {analytics.leadingCandidate ? (
                        <>
                          <span className="inline-block mr-2 px-2 py-0.5 rounded bg-white/15 text-amber-200 text-xs font-extrabold align-middle">
                            {PROGRAM_FORMAT_META[analytics.leadingCandidate.tier.format].label}
                          </span>
                          {analytics.leadingCandidate.material.seminarTitle}
                        </>
                      ) : (
                        'Pilih poster materi di bawah untuk mulai voting'
                      )}
                    </div>
                    {analytics.bestSlotStat && (
                      <div className="text-sm text-white/85 mt-1 leading-snug">
                        Jadwal terpadat: {analytics.bestSlotStat.slot.label} (
                        {analytics.bestSlotStat.slot.dateText} ·{' '}
                        {analytics.bestSlotStat.slot.timeText})
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display text-2xl sm:text-4xl font-extrabold text-[#F28C28] tabular-nums">
                      {analytics.bestEffective} / {campaign.minQuota}
                    </div>
                    <div className="text-xs sm:text-sm text-white/85 mt-0.5">
                      {analytics.isQuorumReached
                        ? 'Kuota Minimal Tercapai · Siap Jalan'
                        : `Kurang ${remainingToMin} peserta lagi untuk GO`}
                    </div>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      analytics.isQuorumReached ? 'bg-emerald-400' : 'bg-[#F28C28]'
                    }`}
                    style={{ width: `${analytics.quorumProgressPct}%` }}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2.5 text-sm text-white/85 leading-relaxed">
                  <span className="tabular-nums">
                    {analytics.activeVotes.length} pendaftaran masuk · Alur: Pilih Tema & Jenjang → Isi Nama, WA & IG → Kunci Jadwal
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText('share_bursa', baseBursaUrl)}
                    className="text-amber-300 hover:text-amber-200 font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap py-1"
                  >
                    {copiedKey === 'share_bursa' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Link Disalin</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>Bagikan Halaman Ini</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Registered Identity & QRIS Payment Status Strip (Multi-Jenjang Aware) */}
            {myActiveStatusVote && (
              <div className="bg-emerald-500/15 border border-emerald-400/35 rounded-xl px-4 py-3.5 space-y-3 text-sm sm:text-[15px]">
                {myVotes.length > 1 && (
                  <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-emerald-400/25">
                    <span className="text-xs font-bold text-emerald-200 mr-1">
                      Pendaftaranmu ({myVotes.length}):
                    </span>
                    {myVotes.map((mv) => {
                      const mvTier = resolveTierSafe(mv.primaryMaterialId);
                      const isSel = mv.id === myActiveStatusVote.id;
                      const mvAnchor = mvTier
                        ? materials.find((m) => m.id === mvTier.anchorMaterialId)
                        : null;
                      const mvTitle =
                        mvAnchor?.seminarTitle ||
                        mvTier?.linkedMaterial.seminarTitle ||
                        mv.primaryMaterialId;
                      return (
                        <button
                          key={mv.id}
                          type="button"
                          onClick={() => setSelectedMyVoteId(mv.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                            isSel
                              ? 'bg-emerald-400 text-[#1F3A5F]'
                              : 'bg-white/10 text-emerald-100 hover:bg-white/20'
                          }`}
                        >
                          {mvTier ? `[${PROGRAM_FORMAT_META[mvTier.format].label}] ` : ''}
                          {mvTitle.length > 26 ? `${mvTitle.slice(0, 23)}...` : mvTitle}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-100">
                      <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                      <span>
                        Terdaftar sebagai <strong>{myActiveStatusVote.displayName}</strong> (
                        {myActiveStatusVote.businessName}
                        {instagram ? ` · ${instagram}` : ''})
                      </span>
                    </div>
                    {payableContext.pricing.isPaid && (
                      <div className="flex flex-wrap items-center gap-2 pl-7 text-sm">
                        {myActiveStatusVote.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-300">
                            <BadgeCheck className="w-4 h-4" />
                            <span>
                              Pembayaran Lunas Terverifikasi ({formatRupiah(payableContext.payableAmount)})
                            </span>
                          </span>
                        ) : payableContext.isPaymentUnlocked ? (
                          <span className="text-amber-200 font-semibold">
                            {myActiveStatusVote.paymentStatus === 'confirming'
                              ? `Konfirmasi QRIS (${formatRupiah(payableContext.payableAmount)}) terkirim — menunggu verifikasi mentor.`
                              : `Tagihan aktif: ${formatRupiah(payableContext.payableAmount)} (sudah termasuk kode unik +Rp${payableContext.uniqueCode})`}
                          </span>
                        ) : (
                          <span className="text-white/85">
                            Kelas Berbayar {formatRupiah(payableContext.pricing.price)} · QRIS otomatis aktif saat kuota kelas mencapai GO!
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {payableContext.pricing.isPaid &&
                      payableContext.isPaymentUnlocked &&
                      myActiveStatusVote.paymentStatus !== 'paid' && (
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentConfirmSuccess('');
                            setIsPaymentModalOpen(true);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d97719] text-white text-sm font-extrabold cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>
                            {myActiveStatusVote.paymentStatus === 'confirming'
                              ? 'Lihat QRIS Pembayaran'
                              : `Bayar QRIS (${formatRupiah(payableContext.payableAmount)})`}
                          </span>
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={() =>
                        openVoteModalForMaterial(myActiveStatusVote.primaryMaterialId)
                      }
                      className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-bold cursor-pointer whitespace-nowrap"
                    >
                      Ubah Data / Pilihan Jadwal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Step 1: Galeri Poster Materi Publik */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F3A5F]">
                Galeri Poster Kelas Pilihan Moderator
              </h2>
              <p className="text-[15px] sm:text-base text-[#1F3A5F]/80 mt-1.5 leading-relaxed">
                Satu tema dapat dibuka dalam beberapa jenjang: <strong>Seminar</strong> untuk dasar konsep, <strong>Workshop</strong> untuk praktik intensif, dan <strong>Coaching</strong> untuk pendalaman 1-on-1 / per kategori. Klik tab jenjang pada kartu untuk melihat materi & biaya.
              </p>
            </div>
            <span className="text-sm font-bold text-[#1F3A5F]/75 tabular-nums">
              {visiblePublicTopics.length} dari {candidateMaterials.length} Tema
            </span>
          </div>

          {/* 3-Tier Program + Online/Offline Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPublicProgramFilter('all')}
                className={`px-4 py-2.5 rounded-xl text-sm font-extrabold border transition-colors cursor-pointer tabular-nums ${
                  publicProgramFilter === 'all'
                    ? 'bg-[#1F3A5F] border-[#1F3A5F] text-white shadow-xs'
                    : 'bg-white border-slate-200 text-[#1F3A5F] hover:bg-slate-50'
                }`}
              >
                Semua Program ({candidateMaterials.length})
              </button>
              <button
                type="button"
                onClick={() => setPublicProgramFilter('seminar')}
                className={`px-4 py-2.5 rounded-xl text-sm font-extrabold border transition-colors cursor-pointer tabular-nums ${
                  publicProgramFilter === 'seminar'
                    ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                    : 'bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-100'
                }`}
              >
                Seminar Dasar ({programCounts.seminar})
              </button>
              <button
                type="button"
                onClick={() => setPublicProgramFilter('workshop')}
                className={`px-4 py-2.5 rounded-xl text-sm font-extrabold border transition-colors cursor-pointer tabular-nums ${
                  publicProgramFilter === 'workshop'
                    ? 'bg-[#F28C28] border-[#F28C28] text-white shadow-xs'
                    : 'bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100'
                }`}
              >
                Workshop Praktik ({programCounts.workshop})
              </button>
              <button
                type="button"
                onClick={() => setPublicProgramFilter('coaching')}
                className={`px-4 py-2.5 rounded-xl text-sm font-extrabold border transition-colors cursor-pointer tabular-nums ${
                  publicProgramFilter === 'coaching'
                    ? 'bg-amber-400 border-amber-500 text-[#1F3A5F] shadow-xs'
                    : 'bg-amber-50 border-amber-200 text-amber-950 hover:bg-amber-100'
                }`}
              >
                Coaching ({programCounts.coaching})
              </button>
            </div>

            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200">
              {(['all', 'online', 'offline'] as const).map((dm) => (
                <button
                  key={dm}
                  type="button"
                  onClick={() => setPublicDeliveryFilter(dm)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-extrabold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    publicDeliveryFilter === dm
                      ? dm === 'online'
                        ? 'bg-emerald-600 text-white'
                        : dm === 'offline'
                        ? 'bg-violet-600 text-white'
                        : 'bg-[#1F3A5F] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {dm === 'online' && <Video className="w-4 h-4" />}
                  {dm === 'offline' && <MapPin className="w-4 h-4" />}
                  <span>
                    {dm === 'all' ? 'Semua Metode' : DELIVERY_MODE_META[dm].label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {visiblePublicTopics.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm sm:text-base text-slate-600">
              Belum ada poster pada jenjang ini yang ditampilkan moderator. Pilih tab <strong>Semua Program</strong> untuk melihat kelas lainnya.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-7">
              {visiblePublicTopics.map(({ anchorMat, enabledTiers, activeTier, primaryCount, sharePct }) => {
                const material = activeTier.linkedMaterial;
                const coverUrl = getMaterialCoverImageUrl(material) || getMaterialCoverImageUrl(anchorMat);
                const highlights = extractMaterialCoreHighlights(material).slice(0, 3);
                const themePrimary =
                  material.content.brandTheme?.primaryColor ||
                  anchorMat.content.brandTheme?.primaryColor ||
                  '#1F3A5F';
                const isMyVoteForActiveTier = myVotes.some((v) =>
                  doesVoteMatchOffering(v, activeTier.offeringKey)
                );
                const isLeading =
                  analytics.leadingMaterialId === activeTier.offeringKey && primaryCount > 0;
                const pricing = activeTier.pricing;
                const program = activeTier.program;
                const programMeta = PROGRAM_FORMAT_META[program.format];
                const effectiveQuota = Math.max(
                  1,
                  program.quotaOverride || campaign.minQuota || 15
                );
                const isOneOnOne =
                  program.format === 'coaching' && program.coachingScope === 'one_on_one';
                const isCategoryCoaching =
                  program.format === 'coaching' && program.coachingScope === 'category_group';
                const isFixedSchedule = isFixedScheduleProgram(program);
                const quotaFillPct = Math.min(
                  100,
                  Math.round((primaryCount / effectiveQuota) * 100)
                );

                return (
                  <article
                    key={anchorMat.id}
                    className={`rounded-3xl overflow-hidden flex flex-col border transition-all shadow-sm ${
                      isMyVoteForActiveTier
                        ? 'border-[#F28C28] ring-2 ring-[#F28C28]/30'
                        : 'border-[#1F3A5F]/15 hover:border-[#1F3A5F]/35'
                    }`}
                    style={{ backgroundColor: themePrimary }}
                  >
                    {/* Top Poster Masthead */}
                    <div className="px-5 pt-4 pb-2.5 flex items-center justify-between gap-2 text-white">
                      <span className="text-[13px] font-bold truncate text-white/95">
                        {material.organizerName || anchorMat.organizerName || 'obeeAcademy'}
                      </span>
                      <span className="text-[13px] text-white/80 whitespace-nowrap shrink-0 tabular-nums">
                        {material.category || 'Materi'} · {material.content.slides.length} Slide
                      </span>
                    </div>

                    {/* Interactive Multi-Jenjang Tier Tabs (only when topic has >1 active tier) */}
                    {enabledTiers.length > 1 && (
                      <div className="px-4 pb-2.5">
                        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/25 border border-white/10">
                          {PROGRAM_TIERS_ORDER.map((fmt) => {
                            const tierItem = enabledTiers.find((t) => t.format === fmt);
                            if (!tierItem) {
                              return (
                                <div
                                  key={fmt}
                                  className="py-1.5 px-1 rounded-lg text-[11px] font-semibold text-white/30 text-center select-none"
                                >
                                  {PROGRAM_FORMAT_META[fmt].label}
                                </div>
                              );
                            }
                            const isSelected = activeTier.format === fmt;
                            const hasMyVoteOnThisTier = myVotes.some((v) =>
                              doesVoteMatchOffering(v, tierItem.offeringKey)
                            );
                            return (
                              <button
                                key={fmt}
                                type="button"
                                onClick={() =>
                                  setSelectedTierByTopic((prev) => ({
                                    ...prev,
                                    [anchorMat.id]: fmt,
                                  }))
                                }
                                className={`py-1.5 px-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex flex-col items-center leading-tight ${
                                  isSelected
                                    ? 'bg-white text-[#1F3A5F] shadow-xs'
                                    : 'text-white/85 hover:bg-white/10'
                                }`}
                              >
                                <span className="flex items-center gap-1">
                                  {hasMyVoteOnThisTier && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                  )}
                                  <span>{PROGRAM_FORMAT_META[fmt].label}</span>
                                </span>
                                <span
                                  className={`text-[10px] font-bold tabular-nums mt-0.5 ${
                                    isSelected ? 'text-[#F28C28]' : 'text-white/70'
                                  }`}
                                >
                                  {tierItem.pricing.isPaid
                                    ? formatRupiah(tierItem.pricing.price)
                                    : 'Gratis'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Poster Visual Showcase */}
                    <div className="px-4">
                      <div className="relative h-52 rounded-2xl overflow-hidden bg-slate-900">
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
                            <span className="text-xs font-semibold text-[#F28C28]">
                              {programMeta.tierHeadline}
                            </span>
                            <p className="font-display text-lg font-extrabold mt-1 line-clamp-2">
                              {material.seminarTitle}
                            </p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                        {/* Non-overlapping Top Overlay Row: Tier Label (left) + Price / Gratis (right) */}
                        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span
                              className={`inline-block text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-sm truncate max-w-full ${programMeta.publicChipClass}`}
                            >
                              {getProgramTierLabelOnly(program)}
                            </span>
                          </div>

                          <div className="shrink-0 flex flex-col items-end gap-1">
                            {pricing.isPaid ? (
                              <div className="px-2.5 py-1 rounded-lg bg-amber-400 text-[#1F3A5F] shadow-sm text-right">
                                <div className="text-[13px] font-extrabold leading-tight tabular-nums whitespace-nowrap">
                                  {pricing.originalPrice ? (
                                    <span className="line-through text-[#1F3A5F]/65 mr-1 font-semibold">
                                      {formatRupiah(pricing.originalPrice)}
                                    </span>
                                  ) : null}
                                  {formatRupiah(pricing.price)}
                                </div>
                                <div className="text-[11px] font-bold text-[#1F3A5F]/90 leading-tight whitespace-nowrap">
                                  {pricing.paymentMode === 'direct_pay'
                                    ? 'QRIS langsung'
                                    : 'QRIS saat GO!'}
                                </div>
                              </div>
                            ) : (
                              <span className="inline-block text-[13px] font-extrabold px-3 py-1 rounded-lg bg-emerald-500 text-white shadow-sm whitespace-nowrap">
                                GRATIS
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-white">
                          <span className="text-xs sm:text-[13px] font-extrabold px-2.5 py-1 rounded-lg bg-[#F28C28] text-white whitespace-nowrap truncate">
                            {getProgramQuotaBadgeText(program, campaign.minQuota)}
                          </span>
                          {isLeading && (
                            <span className="text-[13px] font-bold text-amber-300 flex items-center gap-1 whitespace-nowrap shrink-0">
                              <Flame className="w-4 h-4" />
                              Unggul
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cream Poster Editorial Body */}
                    <div className="m-4 mb-0 rounded-2xl bg-[#FFF9F0] p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-3">
                        {/* Clean Online / Offline Delivery, Location & Duration Strip above Headline */}
                        {(() => {
                          const dMode: DeliveryModeType =
                            program.deliveryMode === 'offline' ? 'offline' : 'online';
                          const dMeta = DELIVERY_MODE_META[dMode];
                          return (
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-[13px]">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-extrabold border shrink-0 ${dMeta.badgeClass}`}
                                >
                                  {dMode === 'offline' ? (
                                    <MapPin className="w-3.5 h-3.5" />
                                  ) : (
                                    <Video className="w-3.5 h-3.5" />
                                  )}
                                  <span>{dMeta.shortLabel}</span>
                                </span>
                                <span className="font-semibold text-slate-700 truncate">
                                  {program.locationLabel || dMeta.defaultLocation}
                                </span>
                              </div>
                              {program.durationLabel && (
                                <span className="text-xs sm:text-[13px] font-bold text-[#1F3A5F]/80 whitespace-nowrap shrink-0 tabular-nums">
                                  · {program.durationLabel}
                                </span>
                              )}
                            </div>
                          );
                        })()}

                        <h3 className="font-display text-lg sm:text-[19px] font-extrabold text-[#1F3A5F] leading-snug">
                          {material.seminarTitle}
                        </h3>
                        {material.description && (
                          <p className="text-[15px] text-slate-700 line-clamp-3 leading-relaxed">
                            {material.description}
                          </p>
                        )}
                        {program.prerequisiteNote && (
                          <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200/80 text-sm font-semibold text-amber-950 leading-snug">
                            Prasyarat: {program.prerequisiteNote}
                          </div>
                        )}
                        {isFixedSchedule && (
                          <div className="px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-2.5 text-indigo-950">
                            <Calendar className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                            <div className="min-w-0 leading-snug">
                              <div className="text-xs font-extrabold uppercase tracking-wide text-indigo-700">
                                Jadwal Tetap Mentor
                              </div>
                              <div className="text-sm sm:text-[15px] font-bold text-[#1F3A5F] mt-0.5">
                                {program.fixedScheduleLabel}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="border-t border-[#1F3A5F]/12 pt-3 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <div className="text-[13px] font-extrabold text-[#2A9D8F]">
                              {program.format === 'coaching'
                                ? 'Pendalaman Studi Kasus Peserta:'
                                : program.format === 'workshop'
                                ? 'Fokus Praktik (Workshop):'
                                : 'Inti Materi (Seminar):'}
                            </div>
                            {program.format === 'coaching' && (
                              <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-[11px] font-extrabold text-amber-950">
                                Tanpa Slide Teori Baru
                              </span>
                            )}
                          </div>
                          {program.format === 'coaching' && (
                            <p className="text-xs font-semibold text-amber-950 bg-amber-50/90 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
                              100% bedah studi kasus nyata, audit langsung aset/bisnis peserta, tanya-jawab spesifik &amp; penyusunan action plan.
                            </p>
                          )}
                          <ul className="space-y-2 text-[15px] text-slate-800">
                            {highlights.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                                <span className="w-5 h-5 rounded-full bg-[#1F3A5F] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                                  {idx + 1}
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Tier-Aware Quota / Booking Meter */}
                      <div className="pt-3 border-t border-[#1F3A5F]/12 space-y-2">
                        {isOneOnOne ? (
                          <div className="flex items-center justify-between text-sm font-bold text-[#1F3A5F] tabular-nums">
                            <span>Sesi Privat 1-on-1</span>
                            <span>{primaryCount} peserta mengajukan jadwal</span>
                          </div>
                        ) : isCategoryCoaching ? (
                          <>
                            <div className="flex items-center justify-between text-sm font-bold text-[#1F3A5F] tabular-nums">
                              <span className="truncate">
                                Khusus {program.targetCategory || 'Kategori'}
                              </span>
                              <span className="shrink-0">
                                {primaryCount} / {effectiveQuota} Peserta
                              </span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-amber-500 transition-all duration-300"
                                style={{ width: `${Math.max(primaryCount > 0 ? 8 : 0, quotaFillPct)}%` }}
                              />
                            </div>
                          </>
                        ) : program.format === 'workshop' ? (
                          <>
                            <div className="flex items-center justify-between text-sm font-bold text-[#1F3A5F] tabular-nums">
                              <span>Kuota Workshop Praktik</span>
                              <span>
                                {primaryCount} / {effectiveQuota} Kursi
                              </span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#F28C28] transition-all duration-300"
                                style={{ width: `${Math.max(primaryCount > 0 ? 8 : 0, quotaFillPct)}%` }}
                              />
                            </div>
                          </>
                        ) : isFixedSchedule ? (
                          <>
                            <div className="flex items-center justify-between text-sm font-bold text-[#1F3A5F] tabular-nums">
                              <span>Kursi Kelas Terjadwal</span>
                              <span>
                                {primaryCount} / {effectiveQuota} Peserta
                              </span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                                style={{ width: `${Math.max(primaryCount > 0 ? 8 : 0, quotaFillPct)}%` }}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between text-sm font-bold text-[#1F3A5F] tabular-nums">
                              <span>Perolehan Polling ({programMeta.label})</span>
                              <span>
                                {primaryCount} suara ({sharePct}%)
                              </span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#2A9D8F] transition-all duration-300"
                                style={{ width: `${Math.max(primaryCount > 0 ? 6 : 0, sharePct)}%` }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Poster Footer Actions */}
                    <div className="p-4 flex items-center gap-2.5">
                      <button
                        type="button"
                        disabled={campaign.status === 'closed'}
                        onClick={() => openVoteModalForMaterial(activeTier.offeringKey)}
                        className={`flex-1 py-3.5 px-4 rounded-xl text-sm sm:text-[15px] font-extrabold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 ${
                          isMyVoteForActiveTier
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-[#F28C28] hover:bg-[#d97719] text-white'
                        }`}
                      >
                        {isMyVoteForActiveTier
                          ? `✓ Pilihanmu (${programMeta.label}) · Edit`
                          : isOneOnOne
                          ? pricing.isPaid
                            ? `Booking 1-on-1 (${formatRupiah(pricing.price)})`
                            : 'Ajukan Coaching Privat'
                          : isCategoryCoaching
                          ? pricing.isPaid
                            ? `Daftar Klaster (${formatRupiah(pricing.price)})`
                            : 'Daftar Coaching Kategori'
                          : program.format === 'workshop'
                          ? pricing.isPaid
                            ? `Daftar Workshop (${formatRupiah(pricing.price)})`
                            : 'Daftar Workshop'
                          : isFixedSchedule
                          ? pricing.isPaid
                            ? `Daftar (${formatRupiah(pricing.price)})`
                            : 'Daftar Kelas Ini'
                          : pricing.isPaid
                          ? `Vote & Daftar (${formatRupiah(pricing.price)})`
                          : `Vote ${programMeta.label}`}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosterModalOffering(activeTier)}
                        className="py-3.5 px-3.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        title="Unduh Poster PNG Resolusi Tinggi"
                      >
                        <Download className="w-4 h-4" />
                        <span>PNG</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Public Commitment Roster (Zero PII - no WA or IG shown publicly) */}
        <section className="bg-white rounded-2xl border border-[#1F3A5F]/12 p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#1F3A5F]">
                Daftar Peserta yang Sudah Terdaftar
              </h3>
              <p className="text-sm sm:text-[15px] text-slate-600 mt-0.5 leading-relaxed">
                Hanya menampilkan nama & perusahaan/usaha untuk transparansi kuota. Nomor WhatsApp & Instagram tersimpan privat.
              </p>
            </div>
            <span className="text-sm font-bold text-[#1F3A5F] tabular-nums">
              {analytics.activeVotes.length} Peserta Terdaftar
            </span>
          </div>

          {analytics.activeVotes.length === 0 ? (
            <div className="text-center py-8 text-sm sm:text-base text-slate-600">
              Belum ada suara masuk. Klik <strong>Vote Poster Ini</strong> pada materi pilihanmu untuk menjadi pendaftar pertama.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {analytics.activeVotes.slice(0, 36).map((v) => {
                const resolved = resolveTierSafe(v.primaryMaterialId);
                const matTitle =
                  resolved?.linkedMaterial.seminarTitle ||
                  materials.find((m) => m.id === v.primaryMaterialId)?.seminarTitle ||
                  v.primaryMaterialId;
                const tierBadge = resolved
                  ? PROGRAM_FORMAT_META[resolved.format].label
                  : null;
                return (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2.5"
                  >
                    <div className="min-w-0">
                      <div className="text-[15px] font-bold text-[#1F3A5F] truncate">
                        {v.displayName} · {v.businessName}
                      </div>
                      <div className="text-[13px] text-slate-600 truncate mt-0.5">
                        {tierBadge ? `[${tierBadge}] ` : ''}
                        {matTitle}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded shrink-0 ${
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
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#F28C28]">
                    <span>
                      Langkah {voteStep} dari 2 · {voteStep === 1 ? 'Identitas Peserta & Instansi/Usaha' : isModalOneOnOneCoaching ? 'Ajukan Jadwal Coaching Privat' : 'Pilih Jadwal & Kunci Suara'}
                    </span>
                    {chosenModalMaterial && chosenModalProgram && (
                      <>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-extrabold ${
                            PROGRAM_FORMAT_META[chosenModalProgram.format].publicChipClass
                          }`}
                        >
                          {PROGRAM_FORMAT_META[chosenModalProgram.format].label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-extrabold ${
                            chosenModalProgram.deliveryMode === 'offline'
                              ? 'bg-violet-500 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {chosenModalProgram.deliveryMode === 'offline' ? 'OFFLINE' : 'ONLINE'}
                        </span>
                      </>
                    )}
                    {chosenModalMaterial && (
                      chosenModalPricing.isPaid ? (
                        <span className="px-2 py-0.5 rounded bg-amber-400 text-[#1F3A5F] text-xs font-extrabold">
                          Berbayar · {formatRupiah(chosenModalPricing.price)}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-xs font-extrabold">
                          Gratis
                        </span>
                      )
                    )}
                  </div>
                  <div className="font-display text-lg font-extrabold truncate mt-1">
                    {chosenModalMaterial?.seminarTitle || 'Bursa Kelas Pelatihan'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVoteModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step Indicator Bar */}
              <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-200 text-sm font-bold">
                <button
                  type="button"
                  onClick={() => setVoteStep(1)}
                  className={`py-3 text-center transition-colors cursor-pointer ${
                    voteStep === 1
                      ? 'bg-white text-[#1F3A5F] border-b-2 border-[#F28C28]'
                      : 'text-slate-600 hover:text-slate-800'
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
                  className={`py-3 text-center transition-colors cursor-pointer ${
                    voteStep === 2
                      ? 'bg-white text-[#1F3A5F] border-b-2 border-[#F28C28]'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  2. Topik & Jadwal Hadir
                </button>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
                {voteStep === 1 ? (
                  <div className="space-y-4">
                    <div className="text-[15px] text-slate-700 leading-relaxed">
                      Lengkapi data diri & perusahaan/usahamu terlebih dahulu sebelum memilih jadwal pelatihan. Data kontakmu aman dan digunakan mentor untuk pengingat H-1 serta kurasi pembahasan studi kasus kelas.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1.5">
                          Nama Lengkap Peserta *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={60}
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Contoh: Ibu Rina Kusuma"
                          className="w-full px-3.5 py-3 text-base bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1.5">
                          Nama Perusahaan / Usaha / Instansi *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={60}
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Contoh: PT Karya Nusantara / Kopi Makmur"
                          className="w-full px-3.5 py-3 text-base bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1.5">
                          Nomor WhatsApp Aktif *
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={24}
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="Contoh: 081234567890"
                          className="w-full px-3.5 py-3 text-base bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1.5">
                          Akun Instagram (Perusahaan/Pribadi) *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={64}
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          placeholder="Contoh: @kopi.makmur / @karyanusantara"
                          className="w-full px-3.5 py-3 text-base bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-bold text-slate-800 mb-1.5">
                          Kategori Bidang Industri / Usaha *
                        </label>
                        <select
                          value={businessCategory}
                          onChange={(e) => setBusinessCategory(e.target.value)}
                          className="w-full px-3.5 py-3 text-base bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                        >
                          {BUSINESS_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 flex items-start gap-2.5 leading-relaxed">
                      <Lock className="w-4 h-4 text-[#2A9D8F] shrink-0 mt-1" />
                      <span>
                        Privasi terjaga: Nomor WhatsApp & Instagram tidak tampil di daftar publik dan hanya dapat diakses oleh mentor penyelenggara.
                      </span>
                    </div>

                    {formError && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-700">
                        {formError}
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleValidateStep1}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#F28C28] hover:bg-[#d97719] text-white text-base font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Lanjut Pilih Jadwal</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitForm} className="space-y-5">
                    {/* Selected Tema & Jenjang Confirmation */}
                    {(() => {
                      const selectedAnchorId =
                        chosenModalTier?.anchorMaterialId ||
                        parseTierOfferingKey(primaryMaterialId).anchorMaterialId ||
                        candidateMaterials[0]?.id ||
                        '';
                      const selectedAnchorMat =
                        candidateMaterials.find((m) => m.id === selectedAnchorId) ||
                        candidateMaterials[0] ||
                        null;
                      const anchorEnabledTiers = selectedAnchorMat
                        ? getEnabledTopicTiers(selectedAnchorMat, materials, campaign)
                        : [];

                      return (
                        <div className="p-4 rounded-xl bg-[#FFF7EC] border border-[#F28C28]/40 space-y-3">
                          <div className="space-y-1.5">
                            <div className="text-sm font-bold text-[#F28C28]">
                              1. Tema Materi yang Dipilih:
                            </div>
                            <select
                              value={selectedAnchorId}
                              onChange={(e) => {
                                const nextAnchor = candidateMaterials.find(
                                  (m) => m.id === e.target.value
                                );
                                if (!nextAnchor) return;
                                const nextTiers = getEnabledTopicTiers(
                                  nextAnchor,
                                  materials,
                                  campaign
                                );
                                const keepFormat = chosenModalTier?.format;
                                const targetTier =
                                  (keepFormat
                                    ? nextTiers.find((t) => t.format === keepFormat)
                                    : null) || nextTiers[0];
                                if (targetTier) {
                                  setPrimaryMaterialId(targetTier.offeringKey);
                                  setSecondaryMaterialIds((prev) =>
                                    prev.filter((id) => id !== targetTier.offeringKey)
                                  );
                                }
                              }}
                              className="w-full px-3.5 py-3 text-[15px] sm:text-base font-bold text-[#1F3A5F] bg-white border border-slate-300 rounded-xl"
                            >
                              {candidateMaterials.map((anchorMat) => {
                                const tiers = getEnabledTopicTiers(
                                  anchorMat,
                                  materials,
                                  campaign
                                );
                                return (
                                  <option key={anchorMat.id} value={anchorMat.id}>
                                    {anchorMat.seminarTitle} ({tiers.length} jenjang)
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {anchorEnabledTiers.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="text-sm font-bold text-[#1F3A5F]">
                                2. Pilih Jenjang Kelas:
                              </div>
                              <div
                                className={`grid gap-2 ${
                                  anchorEnabledTiers.length === 1
                                    ? 'grid-cols-1'
                                    : anchorEnabledTiers.length === 2
                                    ? 'grid-cols-2'
                                    : 'grid-cols-1 sm:grid-cols-3'
                                }`}
                              >
                                {anchorEnabledTiers.map((tierOpt) => {
                                  const isSel = chosenModalTier?.offeringKey === tierOpt.offeringKey;
                                  const alreadyRegistered = myVotes.some((v) =>
                                    doesVoteMatchOffering(v, tierOpt.offeringKey)
                                  );
                                  return (
                                    <button
                                      key={tierOpt.offeringKey}
                                      type="button"
                                      onClick={() => {
                                        setPrimaryMaterialId(tierOpt.offeringKey);
                                        setSecondaryMaterialIds((prev) =>
                                          prev.filter((id) => id !== tierOpt.offeringKey)
                                        );
                                      }}
                                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                        isSel
                                          ? 'bg-[#1F3A5F] border-[#1F3A5F] text-white shadow-xs'
                                          : 'bg-white border-slate-200 text-[#1F3A5F] hover:border-[#F28C28]'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-xs sm:text-sm font-extrabold">
                                          {PROGRAM_FORMAT_META[tierOpt.format].label}
                                        </span>
                                        {alreadyRegistered && (
                                          <span
                                            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                              isSel
                                                ? 'bg-emerald-400 text-[#1F3A5F]'
                                                : 'bg-emerald-100 text-emerald-800'
                                            }`}
                                          >
                                            ✓ Terdaftar
                                          </span>
                                        )}
                                      </div>
                                      <div
                                        className={`text-xs font-extrabold mt-1 tabular-nums ${
                                          isSel ? 'text-[#F28C28]' : 'text-emerald-700'
                                        }`}
                                      >
                                        {tierOpt.pricing.isPaid
                                          ? formatRupiah(tierOpt.pricing.price)
                                          : 'GRATIS'}
                                      </div>
                                      <div
                                        className={`text-[11px] mt-0.5 truncate ${
                                          isSel ? 'text-white/80' : 'text-slate-500'
                                        }`}
                                      >
                                        {tierOpt.program.deliveryMode === 'offline'
                                          ? 'Offline'
                                          : 'Online'}{' '}
                                        · {tierOpt.program.durationLabel}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {chosenModalProgram && (
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#1F3A5F] pt-0.5">
                              {chosenModalProgram.deliveryMode === 'offline' ? (
                                <MapPin className="w-4 h-4 text-violet-600 shrink-0" />
                              ) : (
                                <Video className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                              <span>
                                Metode:{' '}
                                <strong>
                                  {chosenModalProgram.deliveryMode === 'offline'
                                    ? 'OFFLINE'
                                    : 'ONLINE'}
                                </strong>{' '}
                                —{' '}
                                {chosenModalProgram.locationLabel ||
                                  DELIVERY_MODE_META[
                                    chosenModalProgram.deliveryMode === 'offline'
                                      ? 'offline'
                                      : 'online'
                                  ].defaultLocation}
                              </span>
                            </div>
                          )}

                          {chosenModalProgram?.format === 'coaching' &&
                            chosenModalProgram.coachingScope === 'category_group' &&
                            chosenModalProgram.targetCategory &&
                            businessCategory !== chosenModalProgram.targetCategory && (
                              <div className="p-3 rounded-lg bg-amber-100/75 border border-amber-300 text-sm font-semibold text-amber-950 leading-relaxed">
                                Info: Sesi Coaching ini difokuskan untuk kategori{' '}
                                <strong>{chosenModalProgram.targetCategory}</strong> (kategori usahamu tercatat:{' '}
                                <strong>{businessCategory}</strong>). Mentor tetap meninjau kecocokan kelompok usahamu.
                              </div>
                            )}

                          {chosenModalProgram?.format === 'coaching' && (
                            <div className="p-3 rounded-lg bg-white border border-amber-300 text-sm text-[#1F3A5F] leading-relaxed">
                              <strong>
                                {isModalOneOnOneCoaching
                                  ? 'Mode Pendalaman Studi Kasus (1-on-1 Privat):'
                                  : `Mode Pendalaman Studi Kasus (${chosenModalProgram.targetCategory || 'Kelompok Sejenis'}):`}
                              </strong>{' '}
                              Sesi ini tidak mengulang slide teori, melainkan 100% membedah kasus, kendala, dan aset usaha milik peserta secara langsung ({chosenModalProgram?.durationLabel || '90 Menit'}).
                            </div>
                          )}
                          {!isModalOneOnOneCoaching && (
                            analytics.allEnabledOfferings.filter(
                              (o) => o.offeringKey !== chosenModalTier?.offeringKey
                            ).length > 0 && (
                              <div className="pt-1">
                                <div className="text-sm font-semibold text-slate-700 mb-2">
                                  Topik cadangan jika berminat (maks. 2):
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {analytics.allEnabledOfferings
                                    .filter((o) => o.offeringKey !== chosenModalTier?.offeringKey)
                                    .slice(0, 8)
                                    .map((tierOpt) => {
                                      const checked = secondaryMaterialIds.includes(
                                        tierOpt.offeringKey
                                      );
                                      const labelText = `[${PROGRAM_FORMAT_META[tierOpt.format].label}] ${tierOpt.linkedMaterial.seminarTitle}`;
                                      return (
                                        <button
                                          key={tierOpt.offeringKey}
                                          type="button"
                                          onClick={() => toggleSecondaryTopic(tierOpt.offeringKey)}
                                          className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
                                            checked
                                              ? 'bg-[#2A9D8F]/15 border-[#2A9D8F] text-[#1F3A5F]'
                                              : 'bg-white border-slate-200 text-slate-700'
                                          }`}
                                        >
                                          {checked ? '✓ ' : '+ '}
                                          {labelText.length > 38
                                            ? `${labelText.slice(0, 35)}...`
                                            : labelText}
                                        </button>
                                      );
                                    })}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      );
                    })()}

                    {/* Time Slots Multi-Select or Fixed Schedule Confirmation */}
                    {isModalFixedSchedule ? (
                      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                        <div className="flex items-center gap-2 text-indigo-800 font-extrabold text-sm sm:text-[15px]">
                          <Calendar className="w-5 h-5 text-indigo-600 shrink-0" />
                          <span>Jadwal Tetap Ditetapkan Mentor</span>
                        </div>
                        <div className="text-base sm:text-lg font-extrabold text-[#1F3A5F]">
                          {chosenModalProgram?.fixedScheduleLabel}
                        </div>
                        <div className="text-sm text-slate-700 leading-relaxed">
                          Metode:{' '}
                          <strong>
                            {chosenModalProgram
                              ? getDeliveryDisplayLabel(chosenModalProgram)
                              : 'Online'}
                          </strong>
                          . Kamu tidak perlu memilih jadwal poling — langsung klik tombol kirim di bawah untuk mengunci kursi.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <label className="block text-[15px] font-extrabold text-[#1F3A5F]">
                          {isModalOneOnOneCoaching
                            ? 'Pilih Opsi Jadwal Luangmu untuk Sesi Privat *'
                            : 'Centang SEMUA Jadwal yang Kamu Bisa Hadir *'}
                        </label>
                        <div className="grid grid-cols-1 gap-2.5">
                          {analytics.slotStats.map(({ slot, totalAvailable, effectiveQuorum }) => {
                            const checked = availableSlotIds.includes(slot.id);
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => toggleAvailableSlot(slot.id)}
                                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                  checked
                                    ? 'bg-[#1F3A5F]/5 border-[#1F3A5F] ring-1 ring-[#1F3A5F]'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div>
                                  <div className="text-[15px] sm:text-base font-bold text-[#1F3A5F]">
                                    {slot.label} · {slot.dateText}
                                  </div>
                                  <div className="text-sm text-slate-600 mt-0.5 tabular-nums">
                                    {slot.timeText}
                                    {!isModalOneOnOneCoaching &&
                                      ` · ${totalAvailable} bisa hadir (${effectiveQuorum}/${campaign.minQuota} kuota)`}
                                  </div>
                                </div>
                                <div
                                  className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${
                                    checked
                                      ? 'bg-[#1F3A5F] border-[#1F3A5F] text-white'
                                      : 'bg-white border-slate-300'
                                  }`}
                                >
                                  {checked && <Check className="w-4 h-4" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {!isModalOneOnOneCoaching && (
                          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={flexibleTopic}
                              onChange={(e) => setFlexibleTopic(e.target.checked)}
                              className="mt-0.5 w-5 h-5 accent-[#F28C28] shrink-0"
                            />
                            <span className="text-sm sm:text-[15px] text-[#1F3A5F] leading-relaxed">
                              <strong>Tetap bersedia hadir</strong> meski topik lain yang memperoleh suara terbanyak di jadwal pilihan saya (mempercepat kuota {campaign.minQuota} peserta).
                            </span>
                          </label>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        1 Masalah / Pertanyaan Utama yang Ingin Dibahas (Opsional)
                      </label>
                      <input
                        type="text"
                        maxLength={220}
                        value={mainChallenge}
                        onChange={(e) => setMainChallenge(e.target.value)}
                        placeholder="Contoh: Foto produk botol kaca saya masih sering memantulkan lampu..."
                        className="w-full px-3.5 py-3 text-base bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
                      />
                    </div>

                    {formError && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-700">
                        {formError}
                      </div>
                    )}

                    {formSuccess ? (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                        <div className="text-[15px] font-bold text-emerald-900 leading-relaxed">
                          ✓ {formSuccess}
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          {payableContext.pricing.isPaid &&
                            payableContext.isPaymentUnlocked &&
                            myExistingVote?.paymentStatus !== 'paid' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsVoteModalOpen(false);
                                  setPaymentConfirmSuccess('');
                                  setIsPaymentModalOpen(true);
                                }}
                                className="px-4 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d97719] text-white text-sm font-extrabold cursor-pointer flex items-center gap-1.5"
                              >
                                <QrCode className="w-4 h-4" />
                                <span>Bayar QRIS ({formatRupiah(payableContext.payableAmount)})</span>
                              </button>
                            )}
                          <button
                            type="button"
                            onClick={() => handleCopyText('modal_share_after', baseBursaUrl)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold cursor-pointer"
                          >
                            {copiedKey === 'modal_share_after'
                              ? 'Link Tersalin!'
                              : 'Salin Link & Ajak Teman'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsVoteModalOpen(false)}
                            className="px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-sm font-bold cursor-pointer"
                          >
                            Tutup & Lihat Hasil
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setVoteStep(1)}
                          className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Ubah Data Diri</span>
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingVote}
                          className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl bg-[#F28C28] hover:bg-[#d97719] disabled:opacity-50 text-white text-base font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          <span>
                            {isSubmittingVote
                              ? 'Menyimpan...'
                              : isModalOneOnOneCoaching
                              ? 'Ajukan Sesi Coaching Privat'
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

        {/* DYNAMIC GOPAY MERCHANT QRIS PAYMENT MODAL */}
        {isPaymentModalOpen && payableContext.pricing.isPaid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
              <div className="px-5 py-4 bg-[#1F3A5F] text-white flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#F28C28] flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" />
                    <span>Pembayaran QRIS GoPay Merchant</span>
                  </div>
                  <div className="font-display text-base sm:text-lg font-extrabold truncate mt-0.5">
                    {payableContext.materialObj?.seminarTitle || 'Kelas Pelatihan Pilihan'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4">
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-center space-y-1">
                  <div className="text-sm font-extrabold text-[#1F3A5F]">
                    {payableContext.merchantName}
                  </div>
                  <div className="text-[13px] font-semibold text-sky-800 tabular-nums">
                    NMID: {payableContext.merchantNmid} · Terima semua e-wallet & m-banking
                  </div>
                </div>

                {/* Amount + Unique Code Breakdown */}
                <div className="p-4 rounded-2xl bg-[#FFF7EC] border border-[#F28C28]/35 space-y-2.5 text-sm sm:text-[15px]">
                  <div className="flex items-center justify-between text-slate-700 tabular-nums">
                    <span>Biaya Kelas</span>
                    <span>
                      {payableContext.pricing.originalPrice && (
                        <span className="line-through text-slate-400 mr-1.5">
                          {formatRupiah(payableContext.pricing.originalPrice)}
                        </span>
                      )}
                      {formatRupiah(payableContext.pricing.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 tabular-nums">
                    <span>Kode Unik Identifikasi Peserta</span>
                    <span className="font-bold text-[#1F3A5F]">+{formatRupiah(payableContext.uniqueCode)}</span>
                  </div>
                  <div className="pt-2.5 border-t border-[#F28C28]/25 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-[#1F3A5F]">Total Scan QRIS</div>
                      <div className="font-display text-2xl font-extrabold text-[#F28C28] tabular-nums">
                        {formatRupiah(payableContext.payableAmount)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText('qris_amount', String(payableContext.payableAmount))
                      }
                      className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#1F3A5F] text-sm font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'qris_amount' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Salin Nominal</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Dynamic QR Code Canvas or Official GoPay Merchant Image Toggle */}
                <div className="flex flex-col items-center gap-3">
                  {showOriginalQrisCard ? (
                    <div className="w-full max-w-[280px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                      <img
                        src={payableContext.fallbackImageUrl}
                        alt="Kartu QRIS GoPay Merchant OBEECREATIVES"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-white border-2 border-[#1F3A5F]/15 shadow-sm flex flex-col items-center gap-2">
                      <QRCodeCanvas
                        value={payableContext.dynamicQrisPayload}
                        size={220}
                        level="M"
                        includeMargin
                      />
                      <span className="text-sm font-bold text-emerald-700 text-center">
                        Nominal {formatRupiah(payableContext.payableAmount)} otomatis terisi saat scan
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowOriginalQrisCard((prev) => !prev)}
                    className="text-sm font-bold text-[#1F3A5F]/80 hover:text-[#1F3A5F] underline cursor-pointer py-1"
                  >
                    {showOriginalQrisCard
                      ? 'Kembali ke QRIS Nominal Otomatis'
                      : 'Tampilkan Kartu QRIS Asli GoPay Merchant'}
                  </button>
                </div>

                {myExistingVote?.paymentStatus === 'paid' ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm sm:text-[15px] font-bold text-emerald-800 flex items-center gap-2.5 leading-relaxed">
                    <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Pembayaran sudah diverifikasi Lunas oleh mentor. Sampai jumpa di kelas!</span>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    {(paymentConfirmSuccess || myExistingVote?.paymentStatus === 'confirming') && (
                      <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sm font-semibold text-sky-900 leading-relaxed">
                        ✓ {paymentConfirmSuccess || 'Konfirmasi pembayaranmu sudah tercatat! Mentor sedang mencocokkan mutasi kode unik pada GoPay Merchant.'}
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isConfirmingPayment || !myExistingVote}
                      onClick={async () => {
                        if (!myExistingVote) return;
                        setIsConfirmingPayment(true);
                        try {
                          await onConfirmParticipantPayment(
                            myExistingVote.id,
                            payableContext.uniqueCode,
                            payableContext.payableAmount
                          );
                          setPaymentConfirmSuccess(
                            'Konfirmasi terkirim! Statusmu kini "Menunggu Cek Mutasi" dan segera diverifikasi mentor.'
                          );
                        } finally {
                          setIsConfirmingPayment(false);
                        }
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>
                        {isConfirmingPayment
                          ? 'Mengirim Konfirmasi...'
                          : myExistingVote?.paymentStatus === 'confirming'
                          ? 'Kirim Ulang Konfirmasi Sudah Bayar'
                          : 'Saya Sudah Bayar QRIS'}
                      </span>
                    </button>

                    {campaign.mentorWhatsapp &&
                      normalizeWhatsappForWaMe(campaign.mentorWhatsapp) && (
                        <a
                          href={`https://wa.me/${normalizeWhatsappForWaMe(
                            campaign.mentorWhatsapp
                          )}?text=${encodeURIComponent(
                            `Halo Mentor, saya ${displayName || myExistingVote?.displayName || 'Peserta'} (${businessName || myExistingVote?.businessName || 'Peserta'}) sudah melakukan pembayaran QRIS sebesar ${formatRupiah(
                              payableContext.payableAmount
                            )} untuk kelas "${payableContext.materialObj?.seminarTitle || ''}".`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1F3A5F] text-sm font-bold flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          <span>Kirim Bukti Transfer ke WA Mentor</span>
                        </a>
                      )}
                  </div>
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
  const decisionOffering = useMemo(() => {
    return decisionMaterialId ? resolveTierSafe(decisionMaterialId) : null;
  }, [decisionMaterialId, materials, campaign]);
  const decisionMat = decisionOffering?.linkedMaterial || null;
  const decisionSlot = campaign.timeSlots.find((s) => s.id === decisionSlotId);
  const broadcastText = buildBursaBroadcastText(campaign, materials, baseBursaUrl);

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
          <span>Atur Jadwal & QRIS</span>
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
                {analytics.leadingCandidate
                  ? `[${PROGRAM_FORMAT_META[analytics.leadingCandidate.tier.format].label}] ${analytics.leadingCandidate.material.seminarTitle}`
                  : '-'}
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
                  {analytics.sortedCandidates.map(({ tier, material, primaryCount, secondaryCount, sharePct }, i) => (
                    <div key={tier.offeringKey} className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-[#1F3A5F] truncate">
                          #{i + 1} · [{PROGRAM_FORMAT_META[tier.format].label}] {material.seminarTitle}
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
                      Materi & Jenjang Pemenang
                    </label>
                    <select
                      value={decisionOffering?.offeringKey || decisionMaterialId}
                      onChange={(e) => setDecisionMaterialId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl"
                    >
                      {analytics.allEnabledOfferings.map((tier) => (
                        <option key={tier.offeringKey} value={tier.offeringKey}>
                          [{PROGRAM_FORMAT_META[tier.format].label}] {tier.linkedMaterial.seminarTitle}
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
                      Catatan Lokasi / Link Kelas untuk Peserta
                    </label>
                    <textarea
                      rows={2}
                      maxLength={250}
                      value={decisionNote}
                      onChange={(e) => setDecisionNote(e.target.value)}
                      placeholder={
                        decisionOffering?.program.deliveryMode === 'offline'
                          ? `Contoh: Dilaksanakan OFFLINE (${
                              decisionOffering.program.locationLabel || 'Lokasi Studio'
                            }). Shareloc dikirim ke WA peserta H-1.`
                          : 'Contoh: Dilaksanakan ONLINE via Zoom Live. Link dikirim ke WA peserta H-1.'
                      }
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
                  value={crmProgramFilter}
                  onChange={(e) => setCrmProgramFilter(e.target.value as 'all' | ProgramFormatType)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="all">Semua Jenjang</option>
                  <option value="seminar">Seminar</option>
                  <option value="workshop">Workshop</option>
                  <option value="coaching">Coaching</option>
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

                <select
                  value={crmPaymentFilter}
                  onChange={(e) => setCrmPaymentFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="all">Semua Pembayaran</option>
                  <option value="free">Kelas Gratis</option>
                  <option value="unpaid">Belum Bayar</option>
                  <option value="confirming">Menunggu Cek Mutasi</option>
                  <option value="paid">Lunas</option>
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
                      <th className="py-2.5 px-3 font-bold">Status Bayar & QRIS</th>
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
                        matProgram,
                        matPricing,
                        paymentStatus,
                        paymentUniqueCode,
                        paymentAmount,
                        stage,
                        category,
                        instagram: igHandle,
                        whatsapp: waNumber,
                        mentorNotes,
                      }) => {
                        const waClean = normalizeWhatsappForWaMe(waNumber);
                        const igUrl = getInstagramProfileUrl(igHandle);
                        const isMatFixed = matProgram ? isFixedScheduleProgram(matProgram) : false;
                        const targetSlotLabel = isMatFixed
                          ? matProgram!.fixedScheduleLabel!
                          : decisionSlot
                          ? `${decisionSlot.label} (${decisionSlot.dateText} ${decisionSlot.timeText})`
                          : 'jadwal pilihan';
                        const matDeliveryMode: DeliveryModeType =
                          matProgram?.deliveryMode === 'offline' ? 'offline' : 'online';
                        const matDeliveryLoc =
                          matProgram?.locationLabel ||
                          DELIVERY_MODE_META[matDeliveryMode].defaultLocation;
                        const reminderMsg = encodeURIComponent(
                          `Halo Kak ${vote.displayName} (${vote.businessName}), mengingatkan kelas obeeAcademy "${decisionMat?.seminarTitle || topicTitle}" insyaAllah berjalan secara ${matDeliveryMode.toUpperCase()} (${matDeliveryLoc}) pada ${targetSlotLabel}. Mohon konfirmasi kehadirannya ya kak!`
                        );
                        const followupMsg = encodeURIComponent(
                          `Halo Kak ${vote.displayName} dari ${vote.businessName}, terima kasih sudah ikut kelas obeeAcademy (${topicTitle}). Saya sudah sempat lihat Instagram ${igHandle || 'usahamu'} — boleh diskusi santai kalau kakak butuh bantuan optimasi visual/branding usaha?`
                        );
                        const qrisBillMsg = encodeURIComponent(
                          `Halo Kak ${vote.displayName} (${vote.businessName}), kelas "${topicTitle}" sudah siap dilaksanakan! Untuk konfirmasi kursi berbayar, silakan buka halaman ${baseBursaUrl} lalu scan QRIS GoPay Merchant sebesar ${formatRupiah(
                            paymentAmount
                          )} (sudah termasuk kode unik +Rp${paymentUniqueCode}). Terima kasih kak!`
                        );
                        const isEditingThisNote = editingNoteId === vote.id;
                        const crmFormatMeta =
                          PROGRAM_FORMAT_META[matProgram?.format || 'seminar'];
                        const crmDeliveryMeta = DELIVERY_MODE_META[matDeliveryMode];

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

                            <td className="py-3 px-3 max-w-[220px]">
                              <div className="mb-1 flex flex-wrap items-center gap-1">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold border ${crmFormatMeta.badgeClass}`}
                                >
                                  {crmFormatMeta.label}
                                  {matProgram?.format === 'coaching'
                                    ? matProgram.coachingScope === 'category_group'
                                      ? ` · ${matProgram.targetCategory || 'Kategori'}`
                                      : ' · 1-on-1'
                                    : ''}
                                </span>
                                <span
                                  className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-extrabold border ${crmDeliveryMeta.badgeClass}`}
                                >
                                  {crmDeliveryMeta.label}
                                </span>
                              </div>
                              <div className="font-semibold text-slate-800 line-clamp-2">
                                {topicTitle}
                              </div>
                              {isMatFixed && (
                                <div className="text-[10px] font-bold text-indigo-700 mt-0.5 truncate">
                                  Jadwal Pasti: {matProgram!.fixedScheduleLabel}
                                </div>
                              )}
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

                            <td className="py-3 px-3 min-w-[165px] tabular-nums">
                              {!matPricing.isPaid && paymentStatus === 'free' ? (
                                <span
                                  className={`inline-flex px-2 py-1 rounded-lg text-[11px] font-bold border ${PAYMENT_STATUS_META.free.badgeClass}`}
                                >
                                  Gratis
                                </span>
                              ) : (
                                <div className="space-y-1.5">
                                  <div className="font-extrabold text-[#1F3A5F]">
                                    {formatRupiah(paymentAmount)}
                                    {paymentUniqueCode > 0 && (
                                      <span className="ml-1 text-[10px] font-semibold text-slate-500">
                                        (Kode +{paymentUniqueCode})
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1">
                                    <span
                                      className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                        PAYMENT_STATUS_META[paymentStatus]?.badgeClass ||
                                        PAYMENT_STATUS_META.unpaid.badgeClass
                                      }`}
                                    >
                                      {PAYMENT_STATUS_META[paymentStatus]?.label || 'Belum Bayar'}
                                    </span>
                                  </div>
                                  {isVerifiedMentorAdmin && contact && (
                                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                      {paymentStatus !== 'paid' ? (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              onUpdateLeadCrm(contact.id, {
                                                paymentStatus: 'paid',
                                                paidAt: Date.now(),
                                              })
                                            }
                                            className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold cursor-pointer whitespace-nowrap"
                                          >
                                            Tandai Lunas ✓
                                          </button>
                                          {waClean && (
                                            <a
                                              href={`https://wa.me/${waClean}?text=${qrisBillMsg}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="px-2 py-1 rounded-md bg-[#1F3A5F] hover:bg-[#162a45] text-white text-[10px] font-bold whitespace-nowrap"
                                            >
                                              Tagih QRIS WA
                                            </a>
                                          )}
                                        </>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onUpdateLeadCrm(contact.id, {
                                              paymentStatus: 'unpaid',
                                            })
                                          }
                                          className="text-[10px] text-slate-400 hover:text-slate-700 underline cursor-pointer"
                                        >
                                          Reset status
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
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
                <span className="h-4 w-px bg-slate-200 mx-1 hidden sm:inline-block" />
                {(['all', 'seminar', 'workshop', 'coaching'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setPosterProgramFilter(tier)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      posterProgramFilter === tier
                        ? tier === 'seminar'
                          ? 'bg-sky-600 text-white'
                          : tier === 'workshop'
                          ? 'bg-[#F28C28] text-white'
                          : tier === 'coaching'
                          ? 'bg-amber-400 text-[#1F3A5F]'
                          : 'bg-[#1F3A5F] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {tier === 'all'
                      ? 'Semua Jenjang'
                      : PROGRAM_FORMAT_META[tier].label}
                  </button>
                ))}
                <select
                  value={posterDeliveryFilter}
                  onChange={(e) =>
                    setPosterDeliveryFilter(e.target.value as 'all' | DeliveryModeType)
                  }
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer"
                >
                  <option value="all">Online & Offline</option>
                  <option value="online">Online Saja</option>
                  <option value="offline">Offline Saja</option>
                </select>
              </div>

              <div className="relative min-w-[230px] flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={posterSearchQuery}
                  onChange={(e) => setPosterSearchQuery(e.target.value)}
                  placeholder="Cari judul, kategori, atau lokasi..."
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
              {filteredHostPosterMaterials.map((anchorMaterial) => {
                const isVisiblePublic = visiblePosterIdSet.has(anchorMaterial.id);
                const isToggling = togglingPosterId === anchorMaterial.id;
                const allTopicTiers = resolveTopicTiers(anchorMaterial, materials, campaign);
                const activeTier = getActiveTierForTopic(
                  anchorMaterial,
                  posterProgramFilter,
                  posterDeliveryFilter
                );
                const material = activeTier.linkedMaterial;
                const coverUrl =
                  getMaterialCoverImageUrl(material) || getMaterialCoverImageUrl(anchorMaterial);
                const highlights = extractMaterialCoreHighlights(material).slice(0, 3);
                const themePrimary =
                  material.content.brandTheme?.primaryColor ||
                  anchorMaterial.content.brandTheme?.primaryColor ||
                  '#1F3A5F';
                const voteCount = analytics.activeVotes.filter((v) =>
                  doesVoteMatchOffering(v, activeTier.offeringKey)
                ).length;
                const matPricing = activeTier.pricing;
                const matProgram = activeTier.program;
                const matProgramMeta = PROGRAM_FORMAT_META[matProgram.format];

                return (
                  <article
                    key={anchorMaterial.id}
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
                          onChange={() => handleTogglePosterVisibility(anchorMaterial.id)}
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

                    {/* Host Multi-Jenjang Preview Switcher */}
                    <div className="px-4 pt-3">
                      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/25 border border-white/10">
                        {PROGRAM_TIERS_ORDER.map((fmt) => {
                          const tInfo = allTopicTiers[fmt];
                          const isPreviewing = activeTier.format === fmt;
                          return (
                            <button
                              key={fmt}
                              type="button"
                              onClick={() => {
                                if (tInfo.enabled) {
                                  setSelectedTierByTopic((prev) => ({
                                    ...prev,
                                    [anchorMaterial.id]: fmt,
                                  }));
                                } else {
                                  openMultiTierModal(anchorMaterial, fmt);
                                }
                              }}
                              className={`py-1 px-1 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer flex flex-col items-center leading-tight ${
                                isPreviewing
                                  ? 'bg-white text-[#1F3A5F] shadow-xs'
                                  : tInfo.enabled
                                  ? 'text-white/90 hover:bg-white/15'
                                  : 'text-white/40 hover:bg-white/10'
                              }`}
                            >
                              <span>{PROGRAM_FORMAT_META[fmt].label}</span>
                              <span
                                className={`text-[9px] font-bold tabular-nums ${
                                  isPreviewing
                                    ? 'text-[#F28C28]'
                                    : tInfo.enabled
                                    ? 'text-emerald-300'
                                    : 'text-white/35'
                                }`}
                              >
                                {tInfo.enabled
                                  ? tInfo.pricing.isPaid
                                    ? formatRupiah(tInfo.pricing.price)
                                    : 'Gratis'
                                  : 'OFF'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Poster Visual Preview */}
                    <div className="px-4 pt-3">
                      <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-900">
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
                              {material.category || 'Modul Kelas Pelatihan'}
                            </span>
                            <p className="font-display text-sm font-extrabold mt-1 line-clamp-2">
                              {material.seminarTitle}
                            </p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span
                              className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded truncate max-w-full ${matProgramMeta.publicChipClass}`}
                            >
                              {getProgramTierLabelOnly(matProgram)}
                            </span>
                          </div>

                          <div className="shrink-0">
                            {matPricing.isPaid ? (
                              <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-400 text-[#1F3A5F] tabular-nums whitespace-nowrap">
                                {formatRupiah(matPricing.price)}
                              </span>
                            ) : (
                              <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500 text-white whitespace-nowrap">
                                GRATIS
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 text-white">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#F28C28] text-white whitespace-nowrap truncate tabular-nums">
                            {getProgramQuotaBadgeText(matProgram, campaign.minQuota)}
                          </span>
                          <span className="text-[11px] font-bold text-white/90 whitespace-nowrap shrink-0 tabular-nums">
                            {voteCount} suara · {material.content.slides.length} slide
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Poster Editorial Highlights & Pricing Bar */}
                    <div className="m-4 mb-0 rounded-2xl bg-[#FFF9F0] p-4 flex-1 flex flex-col justify-between gap-3">
                      <div className="space-y-2">
                        {(() => {
                          const dMode: DeliveryModeType =
                            matProgram.deliveryMode === 'offline' ? 'offline' : 'online';
                          const dMeta = DELIVERY_MODE_META[dMode];
                          return (
                            <div className="flex items-center justify-between gap-2 text-[10px]">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-extrabold border shrink-0 ${dMeta.badgeClass}`}
                                >
                                  {dMode === 'offline' ? (
                                    <MapPin className="w-3 h-3" />
                                  ) : (
                                    <Video className="w-3 h-3" />
                                  )}
                                  <span>{dMeta.shortLabel}</span>
                                </span>
                                <span className="font-bold text-[#2A9D8F] truncate">
                                  {matProgram.locationLabel || dMeta.defaultLocation}
                                </span>
                              </div>
                              {matProgram.durationLabel && (
                                <span className="font-bold text-slate-500 whitespace-nowrap shrink-0 tabular-nums">
                                  · {matProgram.durationLabel}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                        <h3 className="font-display text-sm sm:text-base font-extrabold text-[#1F3A5F] leading-snug">
                          {material.seminarTitle}
                        </h3>
                        {isFixedScheduleProgram(matProgram) && (
                          <div className="px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-900 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-indigo-600 shrink-0" />
                            <span className="truncate">
                              Jadwal Tetap: {matProgram.fixedScheduleLabel}
                            </span>
                          </div>
                        )}
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

                      {/* Multi-Jenjang Summary & Editor Trigger */}
                      <div className="pt-2.5 border-t border-[#1F3A5F]/10 space-y-2">
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Layers className="w-3.5 h-3.5 text-[#2A9D8F] shrink-0" />
                            <span className="font-bold text-[#1F3A5F] truncate tabular-nums">
                              {matProgramMeta.label} · {matProgram.deliveryMode === 'offline' ? 'Offline' : 'Online'} · {matProgram.durationLabel}
                              {matProgram.format === 'coaching'
                                ? matProgram.coachingScope === 'category_group'
                                  ? ` · ${matProgram.targetCategory || 'Kategori'}`
                                  : ' · Privat 1-on-1'
                                : ` · Kuota ${matProgram.quotaOverride || campaign.minQuota}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Wallet className="w-3.5 h-3.5 text-[#F28C28] shrink-0" />
                            <span className="font-bold text-[#1F3A5F] truncate tabular-nums">
                              {matPricing.isPaid
                                ? `${formatRupiah(matPricing.price)} · ${
                                    matPricing.paymentMode === 'direct_pay'
                                      ? 'QRIS Langsung'
                                      : 'QRIS saat GO!'
                                  }`
                                : 'Status: Kelas Gratis'}
                              {activeTier.linkedMaterialId !== anchorMaterial.id
                                ? ' · Modul Kustom Terkait'
                                : matProgram.format === 'coaching'
                                ? ' · Mode Studi Kasus'
                                : ''}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openMultiTierModal(anchorMaterial, activeTier.format)}
                          className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 hover:border-[#F28C28] hover:bg-amber-50/50 text-[#1F3A5F] text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Layers className="w-3.5 h-3.5 text-[#F28C28]" />
                          <span>Atur Multi-Jenjang, Materi & Harga</span>
                        </button>
                      </div>
                    </div>

                    {/* Poster Card Actions */}
                    <div className="p-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStudioMaterialId(anchorMaterial.id);
                          setStudioTierFormat(activeTier.format);
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                          studioMaterialId === anchorMaterial.id &&
                          studioTierFormat === activeTier.format
                            ? 'bg-white text-[#1F3A5F]'
                            : 'bg-white/15 hover:bg-white/25 text-white'
                        }`}
                      >
                        Edit Studio PNG
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosterModalOffering(activeTier)}
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
          {studioAnchorMaterial && studioResolvedTier && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              <div className="lg:col-span-6 space-y-5">
                <div className="bg-white rounded-2xl border border-[#1F3A5F]/12 p-5 space-y-4">
                  <div>
                    <h3 className="font-display text-base font-extrabold text-[#1F3A5F]">
                      Studio Poster PNG Resolusi Tinggi & QR
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sesuaikan hook atau teks ajakan poster per jenjang sebelum diunduh sebagai 4:5 (1080×1350 px).
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tema yang Diedit di Studio ({materials.length} modul)
                      </label>
                      <select
                        value={studioAnchorMaterial.id}
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

                    {(() => {
                      const studioEnabledTiers = getEnabledTopicTiers(
                        studioAnchorMaterial,
                        materials,
                        campaign
                      );
                      return studioEnabledTiers.length > 1 ? (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Pilih Jenjang Poster
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {studioEnabledTiers.map((t) => (
                              <button
                                key={t.format}
                                type="button"
                                onClick={() => setStudioTierFormat(t.format)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border cursor-pointer ${
                                  studioResolvedTier.format === t.format
                                    ? 'bg-[#1F3A5F] border-[#1F3A5F] text-white'
                                    : 'bg-slate-50 border-slate-200 text-[#1F3A5F] hover:bg-slate-100'
                                }`}
                              >
                                {PROGRAM_FORMAT_META[t.format].label} ·{' '}
                                {t.pricing.isPaid ? formatRupiah(t.pricing.price) : 'Gratis'}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
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
                      placeholder={
                        studioResolvedTier.linkedMaterial.description ||
                        'Tulis kalimat pengantar singkat untuk poster...'
                      }
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
                        await downloadMaterialPosterPng(studioResolvedTier.linkedMaterial, {
                          minQuota: campaign.minQuota,
                          deadlineLabel: campaign.deadlineLabel,
                          slotsSummary: slotsSummaryText,
                          ctaLabel: studioCtaLabel,
                          customNote: studioCustomNote,
                          pricing: studioResolvedTier.pricing,
                          program: studioResolvedTier.program,
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
                          `${baseBursaUrl}&mid=${encodeURIComponent(studioResolvedTier.offeringKey)}`
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
                          <span>Salin Link Voting Jenjang Ini</span>
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
                        Otomatis merangkum poster yang dicentang tampil publik, seluruh jenjang aktif & link voting.
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
                  <span className="font-bold text-[#1F3A5F]">
                    Pratinjau Poster 4:5 ({PROGRAM_FORMAT_META[studioResolvedTier.format].label})
                  </span>
                  <span className="text-slate-500 tabular-nums">1080 × 1350 px</span>
                </div>

                <div ref={studioQrWrapRef} className="hidden">
                  <QRCodeCanvas
                    value={`${baseBursaUrl}&mid=${encodeURIComponent(studioResolvedTier.offeringKey)}`}
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
                    alt={`Preview Poster ${studioResolvedTier.linkedMaterial.seminarTitle}`}
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

          {/* Pengaturan QRIS GoPay Merchant & Konfirmasi WA */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF9F0] border border-[#F28C28]/30 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#1F3A5F]">
                  <QrCode className="w-4 h-4 text-[#F28C28]" />
                  <span>Pengaturan QRIS GoPay Merchant (Auto-Nominal Dinamis)</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  QRIS aktif menggunakan Merchant{' '}
                  <strong>
                    {draftCampaign.qrisMerchantName || DEFAULT_GOPAY_MERCHANT_NAME}
                  </strong>{' '}
                  (NMID: {draftCampaign.qrisMerchantNmid || DEFAULT_GOPAY_MERCHANT_NMID}). Saat kelas berbayar dibuka, sistem otomatis menyuntikkan harga + kode unik peserta ke QRIS.
                </p>
              </div>
              <label className="px-3.5 py-2 rounded-xl bg-[#1F3A5F] hover:bg-[#162a45] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                <Upload className="w-3.5 h-3.5 text-[#F28C28]" />
                <span>{isDecodingQrisFile ? 'Membaca QRIS...' : 'Ganti Gambar QRIS'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (!file) return;
                    setIsDecodingQrisFile(true);
                    setQrisUploadFeedback('');
                    try {
                      const decoded = await decodeQrisFromImageFile(file);
                      if (!decoded) {
                        setQrisUploadFeedback(
                          'QRIS tidak terbaca dari gambar. Pastikan QR code jelas & tajam.'
                        );
                        return;
                      }
                      const meta = extractQrisMetadata(decoded);
                      setDraftCampaign({
                        ...draftCampaign,
                        qrisPayload: decoded,
                        qrisMerchantName: meta.merchantName,
                        qrisMerchantNmid: meta.nmid,
                      });
                      setQrisUploadFeedback(
                        `Berhasil membaca QRIS: ${meta.merchantName} (NMID: ${meta.nmid}). Klik Simpan di bawah.`
                      );
                    } finally {
                      setIsDecodingQrisFile(false);
                    }
                  }}
                />
              </label>
            </div>

            {qrisUploadFeedback && (
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#1F3A5F]">
                {qrisUploadFeedback}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-4 flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200">
                <img
                  src={draftCampaign.qrisFallbackImageUrl || DEFAULT_GOPAY_QRIS_IMAGE}
                  alt="Preview QRIS GoPay Merchant"
                  className="w-20 h-28 object-cover rounded-lg border border-slate-200 shrink-0"
                />
                <div className="text-[11px] space-y-1 min-w-0">
                  <div className="font-bold text-[#1F3A5F] truncate">
                    {draftCampaign.qrisMerchantName || DEFAULT_GOPAY_MERCHANT_NAME}
                  </div>
                  <div className="text-slate-500 tabular-nums">
                    NMID: {draftCampaign.qrisMerchantNmid || DEFAULT_GOPAY_MERCHANT_NMID}
                  </div>
                  <div
                    className={`font-bold ${
                      isValidQrisPayload(draftCampaign.qrisPayload || DEFAULT_GOPAY_QRIS_PAYLOAD)
                        ? 'text-emerald-700'
                        : 'text-rose-600'
                    }`}
                  >
                    {isValidQrisPayload(draftCampaign.qrisPayload || DEFAULT_GOPAY_QRIS_PAYLOAD)
                      ? '✓ String EMVCo Valid'
                      : '⚠ Format EMVCo Tidak Valid'}
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp Konfirmasi Bukti Transfer Mentor (Opsional)
                  </label>
                  <input
                    type="tel"
                    maxLength={24}
                    value={draftCampaign.mentorWhatsapp || ''}
                    onChange={(e) =>
                      setDraftCampaign({
                        ...draftCampaign,
                        mentorWhatsapp: e.target.value,
                      })
                    }
                    placeholder="Contoh: 081234567890 (tampil sebagai tombol kirim bukti di modal QRIS)"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payload EMVCo QRIS Statis GoPay Merchant
                  </label>
                  <textarea
                    rows={2}
                    value={draftCampaign.qrisPayload || DEFAULT_GOPAY_QRIS_PAYLOAD}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      const meta = extractQrisMetadata(val);
                      setDraftCampaign({
                        ...draftCampaign,
                        qrisPayload: val,
                        ...(isValidQrisPayload(val)
                          ? {
                              qrisMerchantName: meta.merchantName,
                              qrisMerchantNmid: meta.nmid,
                            }
                          : {}),
                      });
                    }}
                    className="w-full px-3 py-2 text-[11px] font-mono bg-white border border-slate-300 rounded-xl text-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isBusyHost}
              className="px-6 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d97719] disabled:opacity-50 text-white text-sm font-extrabold cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isBusyHost ? 'Menyimpan...' : 'Simpan Pengaturan Poster, QRIS & Jadwal'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Multi-Jenjang, Kurikulum & Harga Modal */}
      {editingMultiTierAnchorId && (() => {
        const editingAnchorMat = materials.find((m) => m.id === editingMultiTierAnchorId);
        if (!editingAnchorMat) return null;
        const activeTierMeta = PROGRAM_FORMAT_META[editingTierTab];
        const currentEntry = tierDraftMap[editingTierTab];
        const linkedMatObj =
          materials.find((m) => m.id === currentEntry.linkedMaterialId) || editingAnchorMat;
        const enabledTierCount = PROGRAM_TIERS_ORDER.filter((f) => tierDraftMap[f].enabled).length;

        const updateActiveEntry = (patch: Partial<MaterialTierEntry>) => {
          setTierDraftMap((prev) => ({
            ...prev,
            [editingTierTab]: {
              ...prev[editingTierTab],
              ...patch,
            },
          }));
        };

        const updateActiveProgram = (patch: Partial<MaterialTierEntry['program']>) => {
          setTierDraftMap((prev) => ({
            ...prev,
            [editingTierTab]: {
              ...prev[editingTierTab],
              program: {
                ...prev[editingTierTab].program,
                ...patch,
              },
            },
          }));
        };

        const updateActivePricing = (patch: Partial<MaterialTierEntry['pricing']>) => {
          setTierDraftMap((prev) => ({
            ...prev,
            [editingTierTab]: {
              ...prev[editingTierTab],
              pricing: {
                ...prev[editingTierTab].pricing,
                ...patch,
              },
            },
          }));
        };

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1F3A5F]">
                    <Layers className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>Atur Multi-Jenjang, Materi &amp; Harga ({enabledTierCount}/3 Aktif)</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 truncate mt-0.5">
                    {editingAnchorMat.seminarTitle}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingMultiTierAnchorId(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 cursor-pointer shrink-0"
                  aria-label="Tutup modal multi-jenjang"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3 Tier Switcher Tabs */}
              <div className="px-5 pt-3 pb-2 border-b border-slate-200 bg-white grid grid-cols-3 gap-2">
                {PROGRAM_TIERS_ORDER.map((fmt) => {
                  const meta = PROGRAM_FORMAT_META[fmt];
                  const entry = tierDraftMap[fmt];
                  const isTabActive = editingTierTab === fmt;
                  const priceLabel = entry.pricing.isPaid
                    ? formatRupiah(entry.pricing.price || 0)
                    : 'Gratis';

                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setEditingTierTab(fmt)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        isTabActive
                          ? 'border-[#1F3A5F] bg-[#1F3A5F]/5 ring-1 ring-[#1F3A5F]'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900">{meta.label}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                            entry.enabled
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {entry.enabled ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600 mt-1 truncate tabular-nums">
                        {entry.enabled ? priceLabel : 'Nonaktif'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Tier Form Body */}
              <div className="p-5 overflow-y-auto space-y-5 flex-1">
                {/* 1. Toggle Aktifkan Jenjang */}
                <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">
                      Aktifkan Jenjang {activeTierMeta.label} pada Tema Ini
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{activeTierMeta.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentEntry.enabled}
                    onChange={(e) => updateActiveEntry({ enabled: e.target.checked })}
                    className="w-5 h-5 mt-0.5 accent-[#1F3A5F] cursor-pointer shrink-0"
                  />
                </label>

                <div className={currentEntry.enabled ? 'space-y-5' : 'space-y-5 opacity-55'}>
                  {/* 2. Kurikulum / Modul Bank Materi */}
                  {editingTierTab === 'coaching' ? (
                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-200/80 text-amber-950 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                          Rekomendasi Best Practice
                        </div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-950">
                          Mode Pendalaman Studi Kasus Peserta (Tanpa Modul Slide Baru)
                        </h4>
                        <p className="text-[11px] text-amber-900/90 mt-0.5 leading-relaxed">
                          Coaching difokuskan 100% pada bedah kasus, audit usaha peserta, dan tanya-jawab mendalam menggunakan Worksheet &amp; Flipchart — tidak perlu membuat draf slide terpisah di Bank Materi.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-950 mb-1">
                          Referensi Kerangka Topik (Opsional jika perlu dibuka saat sesi)
                        </label>
                        <select
                          value={currentEntry.linkedMaterialId || editingAnchorMat.id}
                          onChange={(e) => updateActiveEntry({ linkedMaterialId: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-semibold bg-white border border-amber-300 rounded-xl text-slate-800"
                        >
                          {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.seminarTitle}
                              {m.id === editingAnchorMat.id ? ' (Referensi Tema Induk)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1F3A5F]">
                            {editingTierTab === 'workshop'
                              ? 'Varian Modul Praktik Workshop (80% Eksekusi)'
                              : 'Modul Konsep Utama Seminar (Materi Induk)'}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {editingTierTab === 'workshop'
                              ? 'Disarankan memisahkan slide Workshop agar fokus pada checklist teknis, praktik & review karya.'
                              : 'Umumnya menggunakan Tema Induk untuk pemaparan konsep inti & pemetaan strategi.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={isCreatingTierDraft}
                          onClick={() => handleCreateTierDraftMaterial(editingAnchorMat, editingTierTab)}
                          className="px-3 py-1.5 rounded-lg bg-[#1F3A5F] hover:bg-[#162b47] disabled:opacity-50 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                        >
                          {isCreatingTierDraft ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          )}
                          <span>1-Klik Buat Draf Varian {activeTierMeta.label}</span>
                        </button>
                      </div>

                      <select
                        value={currentEntry.linkedMaterialId || editingAnchorMat.id}
                        onChange={(e) => updateActiveEntry({ linkedMaterialId: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                      >
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.seminarTitle}
                            {m.id === editingAnchorMat.id ? ' (Tema Induk)' : ''} —{' '}
                            {m.content.slides.length} slide
                          </option>
                        ))}
                      </select>
                      <div className="text-[11px] text-slate-500">
                        Modul tertaut saat ini:{' '}
                        <span className="font-bold text-slate-700">{linkedMatObj.seminarTitle}</span> (
                        {linkedMatObj.content.slides.length} slide ·{' '}
                        {linkedMatObj.content.questions.length} worksheet)
                      </div>
                    </div>
                  )}

                  {/* 3. Harga & Pembayaran QRIS */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#1F3A5F]">
                      <Wallet className="w-3.5 h-3.5 text-[#F28C28]" />
                      <span>Harga &amp; Skema QRIS ({activeTierMeta.label})</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateActivePricing({ isPaid: false, price: 0 })}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer ${
                          !currentEntry.pricing.isPaid
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        Gratis (Rp0)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateActivePricing({
                            isPaid: true,
                            price:
                              currentEntry.pricing.price >= 1000
                                ? currentEntry.pricing.price
                                : editingTierTab === 'coaching'
                                ? 450000
                                : editingTierTab === 'workshop'
                                ? 150000
                                : 50000,
                          })
                        }
                        className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer ${
                          currentEntry.pricing.isPaid
                            ? 'bg-amber-50 border-[#F28C28] text-amber-950'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        Berbayar via QRIS
                      </button>
                    </div>

                    {currentEntry.pricing.isPaid && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Harga Jenjang (Rp)
                          </label>
                          <input
                            type="number"
                            min={1000}
                            step={5000}
                            value={currentEntry.pricing.price || ''}
                            onChange={(e) =>
                              updateActivePricing({ price: Number(e.target.value) || 0 })
                            }
                            className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Harga Coret (Opsional)
                          </label>
                          <input
                            type="number"
                            min={0}
                            step={5000}
                            value={currentEntry.pricing.originalPrice || ''}
                            placeholder="Misal: 300000"
                            onChange={(e) =>
                              updateActivePricing({
                                originalPrice: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Waktu Muncul QRIS
                          </label>
                          <select
                            value={currentEntry.pricing.paymentMode || 'pay_when_go'}
                            onChange={(e) =>
                              updateActivePricing({
                                paymentMode: e.target.value as UnlockPaymentMode,
                              })
                            }
                            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl"
                          >
                            <option value="pay_when_go">Saat Kelas GO (Lock Kuota)</option>
                            <option value="direct_pay">Langsung Saat Daftar</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Metode, Lokasi, Jadwal & Kuota */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1F3A5F]">
                      Metode, Lokasi, Jadwal &amp; Kuota ({activeTierMeta.label})
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Metode Pelaksanaan
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['online', 'offline'] as DeliveryModeType[]).map((mode) => {
                            const selected =
                              (currentEntry.program.deliveryMode || 'online') === mode;
                            return (
                              <button
                                key={mode}
                                type="button"
                                onClick={() =>
                                  updateActiveProgram({
                                    deliveryMode: mode,
                                    locationLabel: DELIVERY_MODE_META[mode].defaultLocation,
                                  })
                                }
                                className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                                  selected
                                    ? 'bg-[#1F3A5F] border-[#1F3A5F] text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                {mode === 'online' ? (
                                  <Video className="w-3.5 h-3.5" />
                                ) : (
                                  <MapPin className="w-3.5 h-3.5" />
                                )}
                                <span>{DELIVERY_MODE_META[mode].label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Platform / Lokasi Tatap Muka
                        </label>
                        <input
                          type="text"
                          maxLength={80}
                          value={currentEntry.program.locationLabel || ''}
                          onChange={(e) => updateActiveProgram({ locationLabel: e.target.value })}
                          placeholder={
                            (currentEntry.program.deliveryMode || 'online') === 'online'
                              ? 'Via Zoom / Google Meet'
                              : 'Contoh: Ruang Pelatihan / Gedung Koperasi'
                          }
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Pengaturan Jadwal
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['polling', 'fixed'] as ScheduleModeType[]).map((sm) => {
                            const selected = (currentEntry.program.scheduleMode || 'polling') === sm;
                            return (
                              <button
                                key={sm}
                                type="button"
                                onClick={() => updateActiveProgram({ scheduleMode: sm })}
                                className={`py-2 px-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                                  selected
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                {SCHEDULE_MODE_META[sm].label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {(currentEntry.program.scheduleMode || 'polling') === 'fixed' && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Tanggal &amp; Jam Pasti
                          </label>
                          <input
                            type="text"
                            maxLength={80}
                            value={currentEntry.program.fixedScheduleLabel || ''}
                            onChange={(e) =>
                              updateActiveProgram({ fixedScheduleLabel: e.target.value })
                            }
                            placeholder="Misal: Sabtu, 14 Des · 10.00 WIB"
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                          />
                          {campaign.timeSlots.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {campaign.timeSlots.map((slot) => (
                                <button
                                  key={slot.id}
                                  type="button"
                                  onClick={() =>
                                    updateActiveProgram({
                                      fixedScheduleLabel: `${slot.dateText} · ${slot.timeText}`,
                                    })
                                  }
                                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-[10px] font-semibold text-slate-700 cursor-pointer"
                                >
                                  {slot.dateText} ({slot.timeText})
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {editingTierTab === 'coaching' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                        <div>
                          <label className="block text-[11px] font-bold text-amber-950 mb-1">
                            Model Coaching
                          </label>
                          <select
                            value={currentEntry.program.coachingScope || 'one_on_one'}
                            onChange={(e) =>
                              updateActiveProgram({
                                coachingScope: e.target.value as CoachingScopeType,
                              })
                            }
                            className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl font-semibold"
                          >
                            <option value="one_on_one">1-on-1 Private Review</option>
                            <option value="category_group">Mini Group Sejenis (Max Kuota)</option>
                          </select>
                        </div>
                        {(currentEntry.program.coachingScope || 'one_on_one') ===
                          'category_group' && (
                          <div>
                            <label className="block text-[11px] font-bold text-amber-950 mb-1">
                              Fokus Bidang Usaha
                            </label>
                            <select
                              value={currentEntry.program.targetCategory || BUSINESS_CATEGORIES[0]}
                              onChange={(e) =>
                                updateActiveProgram({ targetCategory: e.target.value })
                              }
                              className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl font-semibold"
                            >
                              {BUSINESS_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Durasi Sesi
                        </label>
                        <input
                          type="text"
                          maxLength={40}
                          value={currentEntry.program.durationLabel || ''}
                          onChange={(e) => updateActiveProgram({ durationLabel: e.target.value })}
                          placeholder={activeTierMeta.defaultDuration}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Target Kuota GO
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={currentEntry.program.quotaOverride ?? activeTierMeta.defaultQuota}
                          onChange={(e) =>
                            updateActiveProgram({
                              quotaOverride: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                          className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Catatan / Prasyarat (Opsional)
                        </label>
                        <input
                          type="text"
                          maxLength={100}
                          value={currentEntry.program.prerequisiteNote || ''}
                          onChange={(e) =>
                            updateActiveProgram({ prerequisiteNote: e.target.value })
                          }
                          placeholder="Misal: Bawa produk / laptop"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Peserta memilih langsung jenjang di kartu bursa.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMultiTierAnchorId(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isBusyHost}
                    onClick={() => handleSaveMultiTierConfig(editingAnchorMat.id)}
                    className="px-5 py-2 rounded-xl bg-[#F28C28] hover:bg-[#d97719] disabled:opacity-50 text-white text-xs font-extrabold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isBusyHost ? 'Menyimpan...' : 'Simpan Semua Jenjang'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Poster PNG Download Modal */}
      {posterDownloadModalJsx}
    </div>
  );
};

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
} from '../types';

export const OFFERING_TIER_DELIM = '::';
export const PROGRAM_TIERS_ORDER: ProgramFormatType[] = ['seminar', 'workshop', 'coaching'];

export interface ProgramFormatMeta {
  format: ProgramFormatType;
  label: string;
  shortBadge: string;
  tierHeadline: string;
  description: string;
  defaultDuration: string;
  defaultQuota: number;
  badgeClass: string;
  publicChipClass: string;
  posterBgColor: string;
  posterTextColor: string;
}

export interface DeliveryModeMeta {
  mode: DeliveryModeType;
  label: string;
  shortLabel: string;
  defaultLocation: string;
  badgeClass: string;
  posterBgColor: string;
  posterTextColor: string;
}

export const DELIVERY_MODE_META: Record<DeliveryModeType, DeliveryModeMeta> = {
  online: {
    mode: 'online',
    label: 'Online',
    shortLabel: 'ONLINE',
    defaultLocation: 'Via Zoom / Google Meet',
    badgeClass: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    posterBgColor: '#059669',
    posterTextColor: '#FFFFFF',
  },
  offline: {
    mode: 'offline',
    label: 'Offline',
    shortLabel: 'OFFLINE',
    defaultLocation: 'Tatap Muka (Lokasi Diinfokan)',
    badgeClass: 'bg-violet-50 border-violet-200 text-violet-900',
    posterBgColor: '#7C3AED',
    posterTextColor: '#FFFFFF',
  },
};

export interface ScheduleModeMeta {
  mode: ScheduleModeType;
  label: string;
  shortLabel: string;
  badgeClass: string;
}

export const SCHEDULE_MODE_META: Record<ScheduleModeType, ScheduleModeMeta> = {
  polling: {
    mode: 'polling',
    label: 'Poling Jadwal',
    shortLabel: 'POLING',
    badgeClass: 'bg-slate-100 border-slate-300 text-slate-700',
  },
  fixed: {
    mode: 'fixed',
    label: 'Jadwal Tetap Admin',
    shortLabel: 'JADWAL PASTI',
    badgeClass: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  },
};

export const PROGRAM_FORMAT_META: Record<ProgramFormatType, ProgramFormatMeta> = {
  seminar: {
    format: 'seminar',
    label: 'Seminar',
    shortBadge: 'SEMINAR DASAR',
    tierHeadline: 'Materi Dasar · Durasi Terbatas',
    description: 'Pengenalan konsep inti & pemetaan masalah dengan kuota peserta besar.',
    defaultDuration: '60–90 Menit',
    defaultQuota: 15,
    badgeClass: 'bg-sky-50 border-sky-200 text-sky-900',
    publicChipClass: 'bg-sky-600 text-white',
    posterBgColor: '#0284C7',
    posterTextColor: '#FFFFFF',
  },
  workshop: {
    format: 'workshop',
    label: 'Workshop',
    shortBadge: 'WORKSHOP PRAKTIK',
    tierHeadline: 'Materi Lanjutan · Durasi Lebih Panjang',
    description: 'Praktik langsung & bedah karya peserta dengan kuota kursi terbatas agar optimal.',
    defaultDuration: '3 Jam Praktik',
    defaultQuota: 8,
    badgeClass: 'bg-orange-50 border-orange-200 text-orange-900',
    publicChipClass: 'bg-[#F28C28] text-white',
    posterBgColor: '#EA580C',
    posterTextColor: '#FFFFFF',
  },
  coaching: {
    format: 'coaching',
    label: 'Coaching',
    shortBadge: 'COACHING EKSKLUSIF',
    tierHeadline: 'Pendalaman Spesifik · 1-on-1 / Per Kategori',
    description: 'Pendampingan intensif 1-on-1 privat atau klaster khusus per kategori bidang usaha.',
    defaultDuration: '90 Menit Intensif',
    defaultQuota: 1,
    badgeClass: 'bg-amber-50 border-amber-300 text-amber-950',
    publicChipClass: 'bg-amber-400 text-[#1F3A5F]',
    posterBgColor: '#F59E0B',
    posterTextColor: '#1F3A5F',
  },
};

export function encodeTierOfferingKey(
  anchorMaterialId: string,
  format: ProgramFormatType
): string {
  const cleanAnchor = (anchorMaterialId || '').split(OFFERING_TIER_DELIM)[0].slice(0, 88);
  return `${cleanAnchor}${OFFERING_TIER_DELIM}${format}`;
}

export function parseTierOfferingKey(rawId: string): {
  anchorMaterialId: string;
  format: ProgramFormatType | null;
} {
  const value = (rawId || '').trim();
  const delimIdx = value.lastIndexOf(OFFERING_TIER_DELIM);
  if (delimIdx > 0) {
    const anchor = value.slice(0, delimIdx);
    const maybeFormat = value.slice(delimIdx + OFFERING_TIER_DELIM.length);
    if (maybeFormat === 'seminar' || maybeFormat === 'workshop' || maybeFormat === 'coaching') {
      return { anchorMaterialId: anchor, format: maybeFormat };
    }
  }
  return { anchorMaterialId: value, format: null };
}

export function buildOfferingVoteSlug(offeringKey: string): string {
  const parsed = parseTierOfferingKey(offeringKey);
  let hash = 2166136261;
  for (let i = 0; i < offeringKey.length; i++) {
    hash ^= offeringKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hex = (hash >>> 0).toString(36);
  const fmt = parsed.format || 'def';
  return `${hex}_${fmt}`;
}

export function normalizePricingConfig(cfg?: MaterialPricingConfig | null): MaterialPricingConfig {
  if (!cfg || !cfg.isPaid || !(cfg.price > 0)) {
    return {
      isPaid: false,
      price: 0,
      paymentMode: cfg?.paymentMode === 'direct_pay' ? 'direct_pay' : 'pay_when_go',
    };
  }
  const cleanPrice = Math.max(0, Math.round(cfg.price));
  const cleanOriginal =
    typeof cfg.originalPrice === 'number' && cfg.originalPrice > cleanPrice
      ? Math.round(cfg.originalPrice)
      : undefined;
  return {
    isPaid: true,
    price: cleanPrice,
    ...(cleanOriginal ? { originalPrice: cleanOriginal } : {}),
    paymentMode: cfg.paymentMode === 'direct_pay' ? 'direct_pay' : 'pay_when_go',
  };
}

export function getDefaultProgramForMaterial(
  material: SavedMaterial,
  campaignMinQuota: number = 15
): MaterialProgramConfig {
  const haystack = `${material.id} ${material.category || ''} ${material.seminarTitle}`.toLowerCase();
  const isHandsOnPhysical =
    haystack.includes('strobist') ||
    haystack.includes('lighting') ||
    haystack.includes('offline') ||
    haystack.includes('studio');

  if (
    haystack.includes('coaching') ||
    haystack.includes('privat') ||
    haystack.includes('1-on-1') ||
    haystack.includes('one on one')
  ) {
    const isGroup = haystack.includes('kategori') || haystack.includes('klaster');
    const deliveryMode: DeliveryModeType = isHandsOnPhysical ? 'offline' : 'online';
    return {
      format: 'coaching',
      deliveryMode,
      locationLabel:
        deliveryMode === 'offline'
          ? 'Tatap Muka / Studio Pendampingan'
          : DELIVERY_MODE_META.online.defaultLocation,
      scheduleMode: 'polling',
      durationLabel: isGroup ? '2 Jam Fokus Kategori' : '90 Menit Privat',
      quotaOverride: isGroup ? 5 : 1,
      coachingScope: isGroup ? 'category_group' : 'one_on_one',
      targetCategory: isGroup ? 'F&B / Kuliner' : undefined,
      prerequisiteNote: 'Pendalaman langsung pada kasus & aset bisnismu.',
    };
  }

  if (
    haystack.includes('workshop') ||
    haystack.includes('kemasan') ||
    haystack.includes('strobist') ||
    haystack.includes('lighting') ||
    haystack.includes('copywriting') ||
    haystack.includes('sesi 4') ||
    haystack.includes('sesi 5') ||
    haystack.includes('sesi 6') ||
    haystack.includes('sesi_4') ||
    haystack.includes('sesi_5') ||
    haystack.includes('sesi_6')
  ) {
    const deliveryMode: DeliveryModeType = isHandsOnPhysical ? 'offline' : 'online';
    return {
      format: 'workshop',
      deliveryMode,
      locationLabel:
        deliveryMode === 'offline'
          ? 'Tatap Muka · Studio Praktik'
          : DELIVERY_MODE_META.online.defaultLocation,
      scheduleMode: 'polling',
      durationLabel: '2,5 – 3 Jam Praktik',
      quotaOverride: 8,
      prerequisiteNote: 'Materi lanjutan praktik — disarankan sudah ikut Seminar Dasar.',
    };
  }

  return {
    format: 'seminar',
    deliveryMode: haystack.includes('offline') ? 'offline' : 'online',
    locationLabel: haystack.includes('offline')
      ? DELIVERY_MODE_META.offline.defaultLocation
      : DELIVERY_MODE_META.online.defaultLocation,
    scheduleMode: 'polling',
    durationLabel: '60–90 Menit',
    quotaOverride: Math.max(5, campaignMinQuota || 15),
  };
}

export function buildDefaultProgramForTier(
  format: ProgramFormatType,
  campaignMinQuota: number = 15,
  preferOffline: boolean = false
): Omit<MaterialProgramConfig, 'tiers'> {
  const deliveryMode: DeliveryModeType = preferOffline ? 'offline' : 'online';
  if (format === 'workshop') {
    return {
      format: 'workshop',
      deliveryMode,
      locationLabel:
        deliveryMode === 'offline'
          ? 'Tatap Muka · Studio Praktik'
          : DELIVERY_MODE_META.online.defaultLocation,
      scheduleMode: 'polling',
      durationLabel: '2,5 – 3 Jam Praktik',
      quotaOverride: 8,
      prerequisiteNote: 'Sesi praktik langsung — peserta menyiapkan bahan/studi kasus masing-masing.',
    };
  }
  if (format === 'coaching') {
    return {
      format: 'coaching',
      deliveryMode,
      locationLabel:
        deliveryMode === 'offline'
          ? 'Tatap Muka / Studio Pendampingan'
          : DELIVERY_MODE_META.online.defaultLocation,
      scheduleMode: 'polling',
      durationLabel: '90 Menit Privat',
      quotaOverride: 1,
      coachingScope: 'one_on_one',
      prerequisiteNote: 'Pendampingan intensif membedah kasus & target bisnismu secara langsung.',
    };
  }
  return {
    format: 'seminar',
    deliveryMode,
    locationLabel:
      deliveryMode === 'offline'
        ? DELIVERY_MODE_META.offline.defaultLocation
        : DELIVERY_MODE_META.online.defaultLocation,
    scheduleMode: 'polling',
    durationLabel: '60–90 Menit',
    quotaOverride: Math.max(5, campaignMinQuota || 15),
  };
}

export function sanitizeSingleProgramConfig(
  raw: Partial<MaterialProgramConfig> | undefined,
  fallback: Omit<MaterialProgramConfig, 'tiers'>,
  forcedFormat?: ProgramFormatType,
  campaignMinQuota: number = 15
): Omit<MaterialProgramConfig, 'tiers'> {
  const format: ProgramFormatType =
    forcedFormat ||
    (raw?.format === 'workshop' || raw?.format === 'coaching' || raw?.format === 'seminar'
      ? raw.format
      : fallback.format);
  const meta = PROGRAM_FORMAT_META[format];
  const deliveryMode: DeliveryModeType =
    raw?.deliveryMode === 'offline'
      ? 'offline'
      : raw?.deliveryMode === 'online'
      ? 'online'
      : fallback.deliveryMode || 'online';
  const locationLabel =
    (raw?.locationLabel || '').trim() ||
    (deliveryMode === fallback.deliveryMode && fallback.locationLabel
      ? fallback.locationLabel
      : DELIVERY_MODE_META[deliveryMode].defaultLocation);

  const coachingScope: CoachingScopeType | undefined =
    format === 'coaching'
      ? raw?.coachingScope === 'category_group'
        ? 'category_group'
        : 'one_on_one'
      : undefined;

  const defaultQuotaForChoice =
    format === 'coaching'
      ? coachingScope === 'category_group'
        ? 5
        : 1
      : format === 'workshop'
      ? 8
      : Math.max(5, campaignMinQuota || 15);

  const rawQuota = Number(raw?.quotaOverride);
  const quotaOverride =
    !Number.isNaN(rawQuota) && rawQuota >= 1
      ? Math.min(200, Math.round(rawQuota))
      : defaultQuotaForChoice;

  const scheduleMode: ScheduleModeType =
    raw?.scheduleMode === 'fixed' ? 'fixed' : 'polling';
  const fixedScheduleLabel =
    scheduleMode === 'fixed' ? (raw?.fixedScheduleLabel || '').trim() : '';

  return {
    format,
    deliveryMode,
    locationLabel,
    scheduleMode,
    ...(fixedScheduleLabel ? { fixedScheduleLabel } : {}),
    durationLabel: (raw?.durationLabel || '').trim() || meta.defaultDuration,
    quotaOverride,
    ...(coachingScope ? { coachingScope } : {}),
    ...(coachingScope === 'category_group' && raw?.targetCategory
      ? { targetCategory: raw.targetCategory }
      : {}),
    ...(raw?.prerequisiteNote?.trim()
      ? { prerequisiteNote: raw.prerequisiteNote.trim() }
      : {}),
  };
}

export function resolveMaterialProgram(
  material: SavedMaterial,
  campaign: Pick<UnlockCampaignDoc, 'minQuota' | 'materialProgram'>
): MaterialProgramConfig {
  const fallback = getDefaultProgramForMaterial(material, campaign.minQuota || 15);
  const override = campaign.materialProgram?.[material.id];
  if (!override) return fallback;
  return sanitizeSingleProgramConfig(override, fallback, undefined, campaign.minQuota || 15);
}

export interface ResolvedTopicTier {
  anchorMaterialId: string;
  format: ProgramFormatType;
  offeringKey: string;
  enabled: boolean;
  linkedMaterialId: string;
  linkedMaterial: SavedMaterial;
  hasDedicatedMaterial: boolean;
  program: Omit<MaterialProgramConfig, 'tiers'>;
  pricing: MaterialPricingConfig;
}

export function resolveTopicTiers(
  anchorMaterial: SavedMaterial,
  allMaterials: SavedMaterial[],
  campaign: Pick<UnlockCampaignDoc, 'minQuota' | 'materialProgram' | 'materialPricing'>
): Record<ProgramFormatType, ResolvedTopicTier> {
  const minQuota = campaign.minQuota || 15;
  const legacyProgram = resolveMaterialProgram(anchorMaterial, campaign);
  const legacyPricing = normalizePricingConfig(campaign.materialPricing?.[anchorMaterial.id]);
  const storedTiers = campaign.materialProgram?.[anchorMaterial.id]?.tiers;
  const preferOffline = legacyProgram.deliveryMode === 'offline';

  const result = {} as Record<ProgramFormatType, ResolvedTopicTier>;
  const hasAnyStoredTier = Boolean(
    storedTiers &&
      PROGRAM_TIERS_ORDER.some((fmt) => Boolean(storedTiers[fmt]))
  );

  for (const fmt of PROGRAM_TIERS_ORDER) {
    const rawTier: MaterialTierEntry | undefined = storedTiers?.[fmt];
    const isPrimaryLegacyTier = fmt === legacyProgram.format;
    const defaultTierProg = isPrimaryLegacyTier
      ? legacyProgram
      : buildDefaultProgramForTier(fmt, minQuota, preferOffline);

    const enabled = rawTier
      ? Boolean(rawTier.enabled)
      : hasAnyStoredTier
      ? false
      : isPrimaryLegacyTier;

    const linkedIdCandidate = rawTier?.linkedMaterialId || anchorMaterial.id;
    const matchedMat =
      allMaterials.find((m) => m.id === linkedIdCandidate) || anchorMaterial;

    const program = rawTier?.program
      ? sanitizeSingleProgramConfig(rawTier.program, defaultTierProg, fmt, minQuota)
      : defaultTierProg;

    const pricing = rawTier?.pricing
      ? normalizePricingConfig(rawTier.pricing)
      : isPrimaryLegacyTier
      ? legacyPricing
      : { isPaid: false, price: 0, paymentMode: 'pay_when_go' as const };

    result[fmt] = {
      anchorMaterialId: anchorMaterial.id,
      format: fmt,
      offeringKey: encodeTierOfferingKey(anchorMaterial.id, fmt),
      enabled,
      linkedMaterialId: matchedMat.id,
      linkedMaterial: matchedMat,
      hasDedicatedMaterial: matchedMat.id !== anchorMaterial.id,
      program,
      pricing,
    };
  }

  // Safety guarantee: at least 1 tier must always be enabled
  if (!PROGRAM_TIERS_ORDER.some((fmt) => result[fmt].enabled)) {
    const fallbackFmt = legacyProgram.format;
    result[fallbackFmt].enabled = true;
  }

  return result;
}

export function getEnabledTopicTiers(
  anchorMaterial: SavedMaterial,
  allMaterials: SavedMaterial[],
  campaign: Pick<UnlockCampaignDoc, 'minQuota' | 'materialProgram' | 'materialPricing'>
): ResolvedTopicTier[] {
  const tiersMap = resolveTopicTiers(anchorMaterial, allMaterials, campaign);
  return PROGRAM_TIERS_ORDER.map((fmt) => tiersMap[fmt]).filter((t) => t.enabled);
}

export function resolveOfferingByKey(
  rawOfferingOrMatId: string,
  allMaterials: SavedMaterial[],
  campaign: Pick<UnlockCampaignDoc, 'minQuota' | 'materialProgram' | 'materialPricing'>
): ResolvedTopicTier | null {
  const parsed = parseTierOfferingKey(rawOfferingOrMatId);
  const anchorMat = allMaterials.find((m) => m.id === parsed.anchorMaterialId);
  if (!anchorMat) return null;
  const tiers = resolveTopicTiers(anchorMat, allMaterials, campaign);
  if (parsed.format) {
    return tiers[parsed.format];
  }
  const enabled = PROGRAM_TIERS_ORDER.map((fmt) => tiers[fmt]).filter((t) => t.enabled);
  const defaultFmt = resolveMaterialProgram(anchorMat, campaign).format;
  return tiers[defaultFmt].enabled ? tiers[defaultFmt] : enabled[0] || tiers.seminar;
}

export function getProgramQuotaBadgeText(
  program: MaterialProgramConfig,
  campaignMinQuota: number = 15
): string {
  if (program.format === 'coaching') {
    if (program.coachingScope === 'category_group') {
      const cat = program.targetCategory || 'Kategori Usaha';
      return `COACHING ${cat.toUpperCase()} · MAKS. ${program.quotaOverride || 5} PESERTA`;
    }
    return `PRIVAT 1-ON-1 · ${program.durationLabel || '90 Menit'}`;
  }
  if (program.format === 'workshop') {
    return `WORKSHOP · MAKS. ${program.quotaOverride || 8} KURSI`;
  }
  return `SEMINAR · MIN. ${program.quotaOverride || campaignMinQuota || 15} PESERTA`;
}

export function getProgramTierLabelOnly(program: MaterialProgramConfig): string {
  if (program.format === 'coaching') {
    if (program.coachingScope === 'category_group') {
      return `COACHING (${program.targetCategory || 'Per Kategori'})`;
    }
    return 'COACHING 1-ON-1';
  }
  if (program.format === 'workshop') {
    return 'WORKSHOP PRAKTIK';
  }
  return 'SEMINAR DASAR';
}

export function getProgramShortPillText(program: MaterialProgramConfig): string {
  const duration = program.durationLabel ? ` · ${program.durationLabel}` : '';
  return `${getProgramTierLabelOnly(program)}${duration}`;
}

export function getDeliveryDisplayLabel(program: MaterialProgramConfig): string {
  const mode: DeliveryModeType = program.deliveryMode === 'offline' ? 'offline' : 'online';
  const meta = DELIVERY_MODE_META[mode];
  const loc = (program.locationLabel || '').trim() || meta.defaultLocation;
  return `${meta.shortLabel} · ${loc}`;
}

export function isFixedScheduleProgram(program?: MaterialProgramConfig | null): boolean {
  return Boolean(
    program && program.scheduleMode === 'fixed' && (program.fixedScheduleLabel || '').trim()
  );
}

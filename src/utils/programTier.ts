import {
  CoachingScopeType,
  DeliveryModeType,
  MaterialProgramConfig,
  ProgramFormatType,
  SavedMaterial,
  UnlockCampaignDoc,
} from '../types';

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

export const PROGRAM_FORMAT_META: Record<ProgramFormatType, ProgramFormatMeta> = {
  seminar: {
    format: 'seminar',
    label: 'Seminar',
    shortBadge: 'SEMINAR DASAR',
    tierHeadline: 'Materi Dasar · Durasi Terbatas',
    description: 'Pengenalan konsep inti & pemetaan masalah UMKM dengan kuota peserta besar.',
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
      durationLabel: isGroup ? '2 Jam Fokus Kategori' : '90 Menit Privat',
      quotaOverride: isGroup ? 5 : 1,
      coachingScope: isGroup ? 'category_group' : 'one_on_one',
      targetCategory: isGroup ? 'F&B / Kuliner' : undefined,
      prerequisiteNote: 'Pendalaman langsung pada kasus & aset visual bisnismu.',
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
    durationLabel: '60–90 Menit',
    quotaOverride: Math.max(5, campaignMinQuota || 15),
  };
}

export function resolveMaterialProgram(
  material: SavedMaterial,
  campaign: Pick<UnlockCampaignDoc, 'minQuota' | 'materialProgram'>
): MaterialProgramConfig {
  const fallback = getDefaultProgramForMaterial(material, campaign.minQuota || 15);
  const override = campaign.materialProgram?.[material.id];
  if (!override) return fallback;

  const format: ProgramFormatType =
    override.format === 'workshop' || override.format === 'coaching'
      ? override.format
      : 'seminar';
  const meta = PROGRAM_FORMAT_META[format];
  const deliveryMode: DeliveryModeType =
    override.deliveryMode === 'offline'
      ? 'offline'
      : override.deliveryMode === 'online'
      ? 'online'
      : fallback.deliveryMode || 'online';
  const locationLabel =
    (override.locationLabel || '').trim() ||
    (deliveryMode === fallback.deliveryMode && fallback.locationLabel
      ? fallback.locationLabel
      : DELIVERY_MODE_META[deliveryMode].defaultLocation);

  const coachingScope: CoachingScopeType | undefined =
    format === 'coaching'
      ? override.coachingScope === 'category_group'
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
      : Math.max(5, campaign.minQuota || 15);

  const rawQuota = Number(override.quotaOverride);
  const quotaOverride =
    !Number.isNaN(rawQuota) && rawQuota >= 1
      ? Math.min(200, Math.round(rawQuota))
      : defaultQuotaForChoice;

  return {
    format,
    deliveryMode,
    locationLabel,
    durationLabel: (override.durationLabel || '').trim() || meta.defaultDuration,
    quotaOverride,
    ...(coachingScope ? { coachingScope } : {}),
    ...(coachingScope === 'category_group' && override.targetCategory
      ? { targetCategory: override.targetCategory }
      : {}),
    ...(override.prerequisiteNote?.trim()
      ? { prerequisiteNote: override.prerequisiteNote.trim() }
      : {}),
  };
}

export function getProgramQuotaBadgeText(
  program: MaterialProgramConfig,
  campaignMinQuota: number = 15
): string {
  if (program.format === 'coaching') {
    if (program.coachingScope === 'category_group') {
      const cat = program.targetCategory || 'Kategori Usaha';
      return `COACHING ${cat.toUpperCase()} · MAKS. ${program.quotaOverride || 5} UMKM`;
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

import { WorksheetQuestion, LivePollConfig, SlideDefinition, SlideImagePosition } from './data/seminarData';
export type { SlideImagePosition };

export type InteractiveMode = 'worksheet' | 'poll' | 'qna' | 'external';
export type ViewRole = 'projector' | 'participant' | 'moderation' | 'slides' | 'editor' | 'extend' | 'remote' | 'guide' | 'preview' | 'bursa';
export type SlideTransitionStyle = 'slide' | 'zoom' | 'fade';
export type SlideDrawerMode = 'none' | 'answers' | 'poll' | 'qna' | 'qr';

export interface SessionStateDoc {
  activeQuestion: number;
  activeSlide: number;
  activeSlideStep?: number;
  stepByStepEnabled?: boolean;
  transitionStyle?: SlideTransitionStyle;
  activeSlideDrawer?: SlideDrawerMode;
  allowParticipantSlideAccess?: boolean;
  answersLocked?: boolean;
  lockedNotice?: string;
  activeMode: InteractiveMode;
  activePollId: string;
  moderationEnabled: boolean;
  externalEmbedUrl: string;
  externalPlatform: 'slido' | 'mentimeter' | 'custom';
  sessionName: string;
  updatedAt: number;
}

export interface BrandThemeConfig {
  presetId: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
  bgColor: string;
}

export interface CustomContentDoc {
  seminarTitle: string;
  organizerName: string;
  questions: WorksheetQuestion[];
  polls: LivePollConfig[];
  slides: SlideDefinition[];
  qnaTopics: string[];
  brandTheme?: BrandThemeConfig;
  updatedAt: number;
  materialId?: string;
  description?: string;
  category?: string;
  isDefault?: boolean;
  createdAt?: number;
}

export interface SavedMaterial {
  id: string;
  seminarTitle: string;
  organizerName: string;
  description?: string;
  category?: string;
  isDefault?: boolean;
  createdAt: number;
  updatedAt: number;
  content: CustomContentDoc;
}

export interface AnswerDoc {
  id: string;
  q: number;
  text: string;
  subText: string;
  businessName: string;
  participantId: string;
  status: 'pending' | 'approved' | 'hidden';
  star: boolean;
  spotlightSize?: 'besar' | 'kecil';
  likes: number;
  mentorNote: string;
  ts: number;
}

export interface QnaDoc {
  id: string;
  text: string;
  authorName: string;
  isAnonymous: boolean;
  topicTag: string;
  upvotes: number;
  status: 'pending' | 'approved' | 'hidden' | 'answered';
  star: boolean;
  participantId: string;
  ts: number;
}

export interface PollVoteDoc {
  id: string;
  pollId: string;
  optionId: string;
  customWord: string;
  businessName: string;
  participantId: string;
  ts: number;
}

export interface FlipchartBoardDoc {
  isOpen: boolean;
  syncToProjector: boolean;
  activePageIndex: number;
  pagesJson: string;
  sourceDeviceId: string;
  updatedAt: number;
}

export interface UnlockTimeSlot {
  id: string;
  label: string;
  dateText: string;
  timeText: string;
}

export type UnlockCampaignStatus = 'open' | 'unlocked' | 'scheduled' | 'closed';

export type UnlockPaymentMode = 'pay_when_go' | 'direct_pay';

export type ProgramFormatType = 'seminar' | 'workshop' | 'coaching';

export type CoachingScopeType = 'one_on_one' | 'category_group';

export type DeliveryModeType = 'online' | 'offline';

export type ScheduleModeType = 'polling' | 'fixed';

export interface MaterialPricingConfig {
  isPaid: boolean;
  price: number;
  originalPrice?: number;
  paymentMode?: UnlockPaymentMode;
}

export interface MaterialTierEntry {
  enabled: boolean;
  linkedMaterialId?: string;
  program: Omit<MaterialProgramConfig, 'tiers'>;
  pricing: MaterialPricingConfig;
}

export interface MaterialProgramConfig {
  format: ProgramFormatType;
  deliveryMode?: DeliveryModeType;
  locationLabel?: string;
  scheduleMode?: ScheduleModeType;
  fixedScheduleLabel?: string;
  durationLabel?: string;
  quotaOverride?: number;
  coachingScope?: CoachingScopeType;
  targetCategory?: string;
  prerequisiteNote?: string;
  tiers?: Partial<Record<ProgramFormatType, MaterialTierEntry>>;
}

export type UnlockPaymentStatus = 'free' | 'unpaid' | 'confirming' | 'paid';

export interface UnlockCampaignDoc {
  id?: string;
  title: string;
  subtitle: string;
  organizerName: string;
  minQuota: number;
  status: UnlockCampaignStatus;
  deadlineLabel: string;
  candidateMaterialIds: string[];
  timeSlots: UnlockTimeSlot[];
  winningMaterialId: string;
  winningSlotId: string;
  confirmedScheduleNote: string;
  materialPricing?: Record<string, MaterialPricingConfig>;
  materialProgram?: Record<string, MaterialProgramConfig>;
  qrisPayload?: string;
  qrisMerchantName?: string;
  qrisMerchantNmid?: string;
  qrisFallbackImageUrl?: string;
  mentorWhatsapp?: string;
  updatedAt: number;
}

export type UnlockVoteStatus = 'committed' | 'confirmed_h1' | 'cancelled';

export interface UnlockVoteDoc {
  id: string;
  campaignId: string;
  participantId: string;
  displayName: string;
  businessName: string;
  primaryMaterialId: string;
  secondaryMaterialIds: string[];
  availableSlotIds: string[];
  flexibleTopic: boolean;
  mainChallenge: string;
  status: UnlockVoteStatus;
  paymentStatus?: UnlockPaymentStatus;
  paymentUniqueCode?: number;
  paymentAmount?: number;
  ts: number;
}

export type UnlockLeadStage =
  | 'lead_baru'
  | 'sudah_dihubungi'
  | 'hadir_kelas'
  | 'prospek_klien'
  | 'klien_deal';

export interface UnlockContactDoc {
  id: string;
  campaignId: string;
  voteId: string;
  participantId: string;
  displayName: string;
  businessName: string;
  whatsapp: string;
  instagram?: string;
  businessCategory?: string;
  interestedTopicId?: string;
  interestedTopicTitle?: string;
  leadStage?: UnlockLeadStage;
  mentorNotes?: string;
  paymentStatus?: UnlockPaymentStatus;
  paymentUniqueCode?: number;
  paymentAmount?: number;
  paidAt?: number;
  ts: number;
}

export type WorksheetRubricId =
  | 'value_to_closing'
  | 'value_proposition'
  | 'visual_packaging'
  | 'laporan_keuangan_umkm'
  | 'custom';

export interface WorksheetRecommendationItem {
  area: string;
  currentDraft: string;
  suggestedUpgrade: string;
  reason: string;
}

export interface WorksheetAnalysisOutput {
  participantName: string;
  brandName: string;
  subsector: string;
  documentSummary: string;
  completenessScore: number;
  rubricVerdict: string;
  missingSections: string[];
  strengths: string[];
  gapsAndCorrections: string[];
  actionableRecommendations: WorksheetRecommendationItem[];
  coachingQuestions: string[];
  whatsappFeedbackDraft: string;
}

export interface WorksheetUploadedFileMeta {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface WorksheetAnalysisRecord {
  id: string;
  rubricId: WorksheetRubricId;
  rubricTitle: string;
  customInstruction?: string;
  linkedContactId?: string;
  linkedContactLabel?: string;
  files: WorksheetUploadedFileMeta[];
  analysis: WorksheetAnalysisOutput;
  createdAt: number;
}


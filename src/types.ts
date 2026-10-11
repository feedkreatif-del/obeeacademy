export type InteractiveMode = 'worksheet' | 'poll' | 'qna' | 'external';
export type ViewRole = 'projector' | 'participant' | 'moderation' | 'slides';

export interface SessionStateDoc {
  activeQuestion: number;
  activeSlide: number;
  activeMode: InteractiveMode;
  activePollId: string;
  moderationEnabled: boolean;
  externalEmbedUrl: string;
  externalPlatform: 'slido' | 'mentimeter' | 'custom';
  sessionName: string;
  updatedAt: number;
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

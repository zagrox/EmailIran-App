
export interface CampaignState {
  audience: {
    segmentId: string | null;
    categoryId: string | null;
    filters: string[];
    healthScore: number;
  };
  message: {
    subject: string;
    body: string;
    abTest: {
      enabled: boolean;
      subjectB: string;
      testSize: number;
    };
  };
  schedule: {
    sendDate: string;
    sendTime: string;
    timezoneAware: boolean;
  };
}

export interface Segment {
    id: string;
    name: string;
    subscribers: number;
    health: 'Excellent' | 'Good' | 'Poor';
}

export interface AudienceCategory {
  id: string;
  name_fa: string;
  name_en: string;
  count: number;
  imageUrl: string;
  health: 'Excellent' | 'Good' | 'Poor';
}

export interface Template {
    id: string;
    name: string;
    description: string;
    subject: string;
    body: string;
    icon: 'gift' | 'newspaper' | 'tag';
    iconBgColor: string;
}

export interface AICampaignDraft {
  audienceCategoryId: string;
  subject: string;
  subjectB: string; // The alternative subject for A/B testing
  body: string;
  sendTime: string; // "HH:MM"
}

export interface Report {
  id: string;
  name: string;
  sentDate: string;
  stats: {
    openRate: number;
    clickRate: number;
    conversions: number;
  };
  chartData: { name: string; opens: number; clicks: number }[];
}
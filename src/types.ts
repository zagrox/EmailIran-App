

// FIX: Added a centralized 'Page' type to be used across the application, resolving type conflicts.
export type Page = 'dashboard' | 'audiences' | 'campaigns' | 'reports' | 'calendar' | 'profile';

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

export interface ApiAudienceItem {
    id: number;
    status: string;
    audience_title: string;
    audience_contacts: number;
    audience_thumbnail: string;
    audience_slug: string;
    audience_engage: 'great' | 'good' | 'poor' | string;
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

export interface DirectusUser {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    company?: string;
    role?: string;
}

export interface EmailMarketingCampaign {
    id: number;
    status: string;
    campaign_subject: string;
    campaign_date: string; // ISO date string
    campaign_color: string | null;
    campaign_link: string | null;
    campaign_sender: string | null;
}
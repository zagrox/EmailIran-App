

// FIX: Added a centralized 'Page' type to be used across the application, resolving type conflicts.
export type Page = 'dashboard' | 'audiences' | 'campaigns' | 'reports' | 'calendar' | 'profile' | 'login';

export type CampaignStatus = 'editing' | 'scheduled' | 'payment' | 'processing' | 'sending' | 'completed';

export interface CampaignState {
  audience: {
    segmentId: string | null;
    categoryIds: string[];
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

export interface Profile {
    id: number;
    mobile?: string | null;
    website?: string | null;
    type?: 'personal' | 'business' | null;
    company?: string | null;
    display?: 'light' | 'dark' | 'auto' | null;
    user_created: string;
}

export interface RelatedAudience {
    // FIX: The type for `audiences_id` now correctly allows either a simple number (for creating a link to an existing audience) or a full object (for reading nested audience data). This resolves the root cause of the permission error.
    audiences_id: number | {
        id: number;
        audience_title: string;
        audience_contacts: number;
    }
}

export interface EmailMarketingCampaign {
    id: number;
    status: string;
    campaign_subject: string;
    campaign_date: string; // ISO date string
    campaign_color: string | null;
    campaign_link: string | null;
    campaign_sender: string | null;
    campaign_status: CampaignStatus;
    campaign_ab: boolean;
    campaign_subject_b: string | null;
    campaign_content: string;
    campaign_audiences?: RelatedAudience[];
}
export enum CampaignStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export enum AdFormat {
  FEED = 'feed',
  STORY = 'story',
  FEATURED = 'featured',
  BANNER = 'banner',
}

export enum AdStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  PAUSED = 'paused',
  REJECTED = 'rejected',
}

export enum BillingType {
  CPC = 'cpc', // Cost per click
  CPM = 'cpm', // Cost per thousand impressions
  DAILY_BUDGET = 'daily_budget',
}

export enum AudienceGender {
  ALL = 'all',
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

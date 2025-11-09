/**
 * Tipos de transacción de puntos
 */
export enum PointsTransactionType {
  EARNED = 'earned',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  ADJUSTED = 'adjusted',
}

/**
 * Razones para ganar puntos
 */
export enum PointsEarnReason {
  BOOKING_COMPLETED = 'booking_completed',
  REVIEW_WITH_PHOTO = 'review_with_photo',
  REVIEW_WITH_VIDEO = 'review_with_video',
  STORY_PUBLISHED = 'story_published',
  POST_PUBLISHED = 'post_published',
  REFERRAL = 'referral',
  FIRST_BOOKING = 'first_booking',
  CHALLENGE_COMPLETED = 'challenge_completed',
  PROFILE_COMPLETED = 'profile_completed',
  NEW_AGENCY_BOOKING = 'new_agency_booking',
  PRODUCT_PURCHASE = 'product_purchase',
}

/**
 * Razones para canjear puntos
 */
export enum PointsRedeemReason {
  DISCOUNT_VOUCHER = 'discount_voucher',
  UPGRADE = 'upgrade',
  EXPERIENCE = 'experience',
  MERCHANDISE = 'merchandise',
  DIGITAL_CONTENT = 'digital_content',
}

/**
 * Códigos de badges/insignias
 */
export enum BadgeCode {
  FIRST_TRIP = 'first_trip',
  FIRST_INTERNATIONAL = 'first_international',
  ADVENTURER = 'adventurer',
  NATURE_LOVER = 'nature_lover',
  CITY_EXPLORER = 'city_explorer',
  FOODIE = 'foodie',
  EARLY_ADOPTER = 'early_adopter',
  INFLUENCER = 'influencer',
  SUPER_REVIEWER = 'super_reviewer',
  PHOTOGRAPHER = 'photographer',
  WORLD_TRAVELER = 'world_traveler',
}

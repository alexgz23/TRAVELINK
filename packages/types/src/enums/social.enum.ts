/**
 * Tipos de publicación en feed social
 */
export enum PostType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  EXPERIENCE_SHARE = 'experience_share',
  TRIP_REVIEW = 'trip_review',
}

/**
 * Visibilidad de contenido
 */
export enum Visibility {
  PUBLIC = 'public',
  FOLLOWERS = 'followers',
  PRIVATE = 'private',
}

/**
 * Estados de contenido
 */
export enum ContentStatus {
  ACTIVE = 'active',
  FLAGGED = 'flagged',
  REMOVED = 'removed',
  UNDER_REVIEW = 'under_review',
}

/**
 * Tipos de reacción
 */
export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  WANT_TO_GO = 'want_to_go',
  USEFUL = 'useful',
  WOW = 'wow',
}

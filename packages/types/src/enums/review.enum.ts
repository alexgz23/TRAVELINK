// Review Enums

export enum ReviewableType {
  EXPERIENCE = 'experience',
  AGENCY = 'agency',
  HOTEL = 'hotel',
  GUIDE = 'guide',
  DRIVER = 'driver',
}

export enum ReviewStatus {
  PENDING = 'pending',         // Pendiente de moderación
  APPROVED = 'approved',       // Aprobada y visible
  REJECTED = 'rejected',       // Rechazada por moderación
  FLAGGED = 'flagged',         // Reportada por usuarios
  HIDDEN = 'hidden',           // Oculta por el autor
}

export enum ReviewSortBy {
  RECENT = 'recent',           // Más recientes primero
  RATING_HIGH = 'rating_high', // Mejor calificación primero
  RATING_LOW = 'rating_low',   // Peor calificación primero
  HELPFUL = 'helpful',         // Más útiles primero
}

export enum ReportReason {
  SPAM = 'spam',
  OFFENSIVE = 'offensive',
  FAKE = 'fake',
  IRRELEVANT = 'irrelevant',
  OTHER = 'other',
}

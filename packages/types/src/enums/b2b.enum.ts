// B2B Alliance Enums

export enum AllianceType {
  HOTEL = 'hotel',
  GUIDE = 'guide',
  TRANSPORT = 'transport',
}

export enum AllianceStatus {
  PENDING = 'pending', // Solicitud enviada
  ACCEPTED = 'accepted', // Alianza activa
  REJECTED = 'rejected', // Solicitud rechazada
  SUSPENDED = 'suspended', // Temporalmente suspendida
  TERMINATED = 'terminated', // Alianza terminada
}

export enum CommissionType {
  PERCENTAGE = 'percentage', // Porcentaje de la venta
  FIXED = 'fixed', // Monto fijo por transacción
  HYBRID = 'hybrid', // Combinación de ambos
}

export enum ServiceStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  MAINTENANCE = 'maintenance',
}

export enum ContractDuration {
  THREE_MONTHS = '3_months',
  SIX_MONTHS = '6_months',
  ONE_YEAR = '1_year',
  TWO_YEARS = '2_years',
  INDEFINITE = 'indefinite',
}

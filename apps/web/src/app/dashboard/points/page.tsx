'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { usePointsBalance, usePointsHistory, useLevels, usePointsRules } from '@/hooks';
import { formatDate } from '@/lib/utils';

export default function PointsPage() {
  const { data: balance, isLoading: balanceLoading } = usePointsBalance();
  const { data: history, isLoading: historyLoading } = usePointsHistory();
  const { data: levels } = useLevels();
  const { data: rules } = usePointsRules();

  if (balanceLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando tus puntos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mis Puntos</h2>
        <p className="text-gray-600 mt-1">
          Gana puntos viajando y canjéalos por recompensas
        </p>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="bordered">
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-blue-600">
              {balance?.currentPoints?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-600 mt-2">Puntos disponibles</p>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-green-600">
              {balance?.totalEarned?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-600 mt-2">Total ganados</p>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-orange-600">
              {balance?.totalSpent?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-600 mt-2">Total canjeados</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Level */}
      {balance?.currentLevel && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Tu nivel actual: {balance.currentLevel.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progreso al siguiente nivel</span>
                  <span className="font-medium">
                    {balance.currentPoints.toLocaleString()} /{' '}
                    {balance.nextLevel?.minPoints?.toLocaleString() || '∞'} pts
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-700 h-4 rounded-full transition-all"
                    style={{
                      width: `${Math.min(balance.currentLevel.progress, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Next Level Info */}
              {balance.nextLevel && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Te faltan{' '}
                    <span className="font-bold text-blue-600">
                      {balance.pointsToNextLevel.toLocaleString()}
                    </span>{' '}
                    puntos para alcanzar el nivel{' '}
                    <span className="font-bold">{balance.nextLevel.name}</span>
                  </p>
                </div>
              )}

              {/* Current Benefits */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Beneficios de tu nivel actual:
                </p>
                <div className="flex flex-wrap gap-2">
                  {balance.currentLevel.benefits.map((benefit, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      ✓ {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Levels */}
      {levels && levels.length > 0 && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Todos los niveles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {levels.map((level, idx) => {
                const isCurrentLevel = level.level === balance?.currentLevel?.level;
                const isAchieved =
                  balance?.currentPoints >= level.minPoints;

                return (
                  <div
                    key={level.level}
                    className={`p-4 rounded-lg border-2 ${
                      isCurrentLevel
                        ? 'border-blue-600 bg-blue-50'
                        : isAchieved
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {level.name}
                          </h4>
                          {isCurrentLevel && (
                            <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                              Tu nivel actual
                            </span>
                          )}
                          {isAchieved && !isCurrentLevel && (
                            <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
                              ✓ Alcanzado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {level.minPoints.toLocaleString()} -{' '}
                          {level.maxPoints
                            ? level.maxPoints.toLocaleString()
                            : '∞'}{' '}
                          puntos
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {level.benefits.map((benefit, bidx) => (
                            <span
                              key={bidx}
                              className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How to Earn Points */}
      {rules && Object.keys(rules).length > 0 && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Cómo ganar puntos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(rules).map(([key, rule]: [string, any]) => (
                <div
                  key={key}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                >
                  <span className="text-2xl">
                    {rule.type === 'EARNED_BOOKING' && '✅'}
                    {rule.type === 'EARNED_REVIEW' && '⭐'}
                    {rule.type === 'EARNED_POST' && '📱'}
                    {rule.type === 'EARNED_REFERRAL' && '👥'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {rule.description}
                      </h4>
                      <span className="font-bold text-blue-600">
                        +{rule.points}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Points History */}
      {!historyLoading && history && history.length > 0 && (
        <Card variant="bordered" padding="lg">
          <CardHeader>
            <CardTitle>Historial de puntos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(0, 10).map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {transaction.reason}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`font-bold text-lg ${
                      transaction.amount > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : ''}
                    {transaction.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expiring Soon Warning */}
      {balance?.expiringSoon > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <h4 className="font-semibold text-orange-900 mb-1">
                  Puntos próximos a expirar
                </h4>
                <p className="text-sm text-orange-700">
                  Tienes {balance.expiringSoon.toLocaleString()} puntos que
                  expirarán en los próximos 30 días. ¡Úsalos pronto!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

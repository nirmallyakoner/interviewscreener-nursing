'use client'

import { Lock, Zap, RotateCcw, TrendingDown, Clock } from 'lucide-react'

interface InterviewCreditBreakdownProps {
  sessionId: string
  durationMinutes: number
  actualDurationSeconds: number
  creditsBlocked?: number
  creditsDeducted?: number
  creditsRefunded?: number
}

export function InterviewCreditBreakdown({
  sessionId,
  durationMinutes,
  actualDurationSeconds,
  creditsBlocked,
  creditsDeducted,
  creditsRefunded
}: InterviewCreditBreakdownProps) {
  const actualMinutes = Math.round(actualDurationSeconds / 60)
  const netCost = (creditsDeducted || 0)

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown className="w-5 h-5 text-teal-400" />
        <h3 className="text-white font-bold">Credit Usage Breakdown</h3>
      </div>

      <div className="space-y-3">
        {/* Blocked Credits */}
        {creditsBlocked !== undefined && creditsBlocked > 0 && (
          <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 text-sm">Blocked (Reserved)</span>
            </div>
            <span className="text-amber-400 font-bold">{creditsBlocked} credits</span>
          </div>
        )}

        {/* Deducted Credits */}
        {creditsDeducted !== undefined && creditsDeducted > 0 && (
          <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-400" />
              <span className="text-slate-300 text-sm">Actual Used</span>
            </div>
            <span className="text-red-400 font-bold">{creditsDeducted} credits</span>
          </div>
        )}

        {/* Refunded Credits */}
        {creditsRefunded !== undefined && creditsRefunded > 0 && (
          <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300 text-sm">Refunded (Unused)</span>
            </div>
            <span className="text-blue-400 font-bold">+{creditsRefunded} credits</span>
          </div>
        )}

        {/* Net Cost */}
        <div className="flex items-center justify-between py-3 bg-slate-800/50 rounded-lg px-3 mt-2">
          <span className="text-white font-bold">Net Cost</span>
          <span className="text-teal-400 font-bold text-lg">{netCost} credits</span>
        </div>

        {/* Duration Info */}
        <div className="pt-3 border-t border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">Actual Duration</span>
            </div>
            <span className="text-white font-medium">{actualMinutes} min</span>
          </div>
          
          {durationMinutes && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Planned Duration</span>
              <span className="text-slate-500">{durationMinutes} min</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Rate</span>
            <span className="text-slate-500">10 credits/min</span>
          </div>
        </div>
      </div>

      {/* Efficiency Badge */}
      {creditsRefunded && creditsRefunded > 0 && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 text-xs text-center">
            You saved {creditsRefunded} credits by completing early!
          </p>
        </div>
      )}
    </div>
  )
}

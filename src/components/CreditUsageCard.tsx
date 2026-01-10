'use client'

import { formatDistanceToNow } from 'date-fns'
import { DollarSign, Lock, Zap, RotateCcw, TrendingUp, Clock, Receipt } from 'lucide-react'

interface CreditTransaction {
  id: string
  transaction_type: 'purchase' | 'block' | 'deduct' | 'refund' | 'adjustment'
  amount: number
  balance_after: number
  created_at: string
  interview?: {
    id: string
    duration_minutes: number
    actual_duration_seconds: number
    status: string
    started_at: string
  }
  payment?: {
    id: string
    amount: number
    receipt_number: string
    created_at: string
  }
  metadata?: any
}

interface CreditUsageCardProps {
  transaction: CreditTransaction
  compact?: boolean
  showDetails?: boolean
}

export function CreditUsageCard({ transaction, compact = false, showDetails = true }: CreditUsageCardProps) {
  const getTypeConfig = () => {
    switch (transaction.transaction_type) {
      case 'purchase':
        return {
          icon: DollarSign,
          color: 'emerald',
          bgColor: 'from-emerald-500/10 to-teal-500/10',
          borderColor: 'border-emerald-500/20',
          textColor: 'text-emerald-400',
          label: 'Purchase'
        }
      case 'block':
        return {
          icon: Lock,
          color: 'amber',
          bgColor: 'from-amber-500/10 to-orange-500/10',
          borderColor: 'border-amber-500/20',
          textColor: 'text-amber-400',
          label: 'Blocked'
        }
      case 'deduct':
        return {
          icon: Zap,
          color: 'red',
          bgColor: 'from-red-500/10 to-rose-500/10',
          borderColor: 'border-red-500/20',
          textColor: 'text-red-400',
          label: 'Deducted'
        }
      case 'refund':
        return {
          icon: RotateCcw,
          color: 'blue',
          bgColor: 'from-blue-500/10 to-cyan-500/10',
          borderColor: 'border-blue-500/20',
          textColor: 'text-blue-400',
          label: 'Refunded'
        }
      default:
        return {
          icon: TrendingUp,
          color: 'slate',
          bgColor: 'from-slate-500/10 to-gray-500/10',
          borderColor: 'border-slate-500/20',
          textColor: 'text-slate-400',
          label: 'Adjustment'
        }
    }
  }

  const config = getTypeConfig()
  const Icon = config.icon
  const isPositive = transaction.amount > 0

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg bg-gradient-to-br ${config.bgColor} border ${config.borderColor}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${config.color}-500/20`}>
            <Icon className={`w-4 h-4 ${config.textColor}`} />
          </div>
          <div>
            <p className="text-white font-medium text-sm">{config.label}</p>
            <p className="text-slate-400 text-xs">
              {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{transaction.amount}
          </p>
          <p className="text-slate-500 text-xs">{transaction.balance_after} bal</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl bg-gradient-to-br ${config.bgColor} border ${config.borderColor} p-5 hover:border-${config.color}-500/40 transition-all`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-${config.color}-500/20`}>
            <Icon className={`w-5 h-5 ${config.textColor}`} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{config.label}</h3>
            <p className="text-slate-400 text-sm">
              {new Date(transaction.created_at).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold text-2xl ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{transaction.amount}
          </p>
          <p className="text-slate-400 text-sm">credits</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
        <span className="text-slate-400 text-sm">Balance After</span>
        <span className="text-white font-bold">{transaction.balance_after} credits</span>
      </div>

      {showDetails && transaction.interview && (
        <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Interview:</span>
            <span className="text-white font-medium">
              {Math.round(transaction.interview.actual_duration_seconds / 60)} min
              {transaction.interview.duration_minutes && 
                ` (${transaction.interview.duration_minutes} min planned)`
              }
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className={`px-2 py-1 rounded text-xs font-bold ${
              transaction.interview.status === 'completed' 
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {transaction.interview.status}
            </div>
          </div>
        </div>
      )}

      {showDetails && transaction.payment && (
        <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Receipt className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Payment:</span>
            <span className="text-white font-medium">₹{transaction.payment.amount / 100}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Receipt:</span>
            <span className="text-teal-400 font-mono text-xs">{transaction.payment.receipt_number}</span>
          </div>
        </div>
      )}
    </div>
  )
}

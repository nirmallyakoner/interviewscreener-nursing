'use client'

import { useState, useEffect } from 'react'
import { Filter, Calendar, Loader2, ChevronDown, DollarSign, Lock, Zap, RotateCcw, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

interface CreditHistoryTableProps {
  compact?: boolean
  limit?: number
}

export function CreditHistoryTable({ compact = false, limit }: CreditHistoryTableProps) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    loadTransactions()
  }, [filter])

  const loadTransactions = async (loadMore = false) => {
    try {
      setLoading(true)
      const currentOffset = loadMore ? offset : 0
      
      const params = new URLSearchParams({
        limit: (limit || 50).toString(),
        offset: currentOffset.toString(),
      })

      if (filter !== 'all') {
        params.append('type', filter)
      }

      const response = await fetch(`/api/credits/history?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch credit history')
      }

      const data = await response.json()
      
      if (loadMore) {
        setTransactions(prev => [...prev, ...data.transactions])
      } else {
        setTransactions(data.transactions)
      }
      
      setHasMore(data.hasMore)
      setOffset(currentOffset + data.transactions.length)
    } catch (error: any) {
      console.error('Error loading credit history:', error)
      toast.error('Failed to load credit history')
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <DollarSign className="w-4 h-4" />
      case 'block': return <Lock className="w-4 h-4" />
      case 'deduct': return <Zap className="w-4 h-4" />
      case 'refund': return <RotateCcw className="w-4 h-4" />
      default: return <TrendingUp className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-emerald-400 bg-emerald-500/10'
      case 'block': return 'text-amber-400 bg-amber-500/10'
      case 'deduct': return 'text-red-400 bg-red-500/10'
      case 'refund': return 'text-blue-400 bg-blue-500/10'
      default: return 'text-slate-400 bg-slate-500/10'
    }
  }

  const getDescription = (tx: any) => {
    if (tx.interview) {
      const minutes = Math.round(tx.interview.actual_duration_seconds / 60)
      return `Interview session (${minutes} min)`
    }
    if (tx.payment) {
      return `Credit purchase - ₹${tx.payment.amount / 100}`
    }
    return tx.transaction_type.charAt(0).toUpperCase() + tx.transaction_type.slice(1)
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Dropdown */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2 pr-10 rounded-lg font-medium text-sm hover:border-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer transition-colors"
          >
            <option value="all">All Transactions</option>
            <option value="purchase">Purchases</option>
            <option value="block">Blocked</option>
            <option value="deduct">Deducted</option>
            <option value="refund">Refunded</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        
        {transactions.length > 0 && (
          <span className="text-sm text-slate-400">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Table */}
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Transactions Yet</h3>
          <p className="text-slate-400">
            {filter === 'all' 
              ? 'Your credit transaction history will appear here'
              : `No ${filter} transactions found`
            }
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Desktop Table View */}
          <div className="hidden md:block border border-slate-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
              <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #1e293b;
                  border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #334155;
                  border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #475569;
                }
                @keyframes shimmer {
                  0% { background-position: -1000px 0; }
                  100% { background-position: 1000px 0; }
                }
                .skeleton {
                  animation: shimmer 2s infinite;
                  background: linear-gradient(to right, #1e293b 4%, #334155 25%, #1e293b 36%);
                  background-size: 1000px 100%;
                }
              `}</style>
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-900 z-10">
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Skeleton rows
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-800/50">
                        <td className="py-4 px-4">
                          <div className="skeleton h-4 w-24 rounded mb-2"></div>
                          <div className="skeleton h-3 w-16 rounded"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="skeleton h-6 w-20 rounded-full"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="skeleton h-4 w-40 rounded"></div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="skeleton h-4 w-12 rounded ml-auto"></div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="skeleton h-4 w-12 rounded ml-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    // Actual data rows
                    transactions.map((tx, index) => (
                      <tr 
                        key={tx.id}
                        className={`border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors ${
                          index % 2 === 0 ? 'bg-slate-950/30' : ''
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div className="text-sm text-slate-300">
                            {new Date(tx.created_at).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getTypeColor(tx.transaction_type)}`}>
                            {getTypeIcon(tx.transaction_type)}
                            <span className="text-xs font-bold capitalize">{tx.transaction_type}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-slate-300">{getDescription(tx)}</div>
                          {tx.payment && (
                            <div className="text-xs text-slate-500 font-mono mt-1">
                              {tx.payment.receipt_number}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`text-sm font-bold ${
                            tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm font-medium text-white">{tx.balance_after}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #1e293b;
                border-radius: 3px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #334155;
                border-radius: 3px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #475569;
              }
              @keyframes shimmer {
                0% { background-position: -1000px 0; }
                100% { background-position: 1000px 0; }
              }
              .skeleton {
                animation: shimmer 2s infinite;
                background: linear-gradient(to right, #1e293b 4%, #334155 25%, #1e293b 36%);
                background-size: 1000px 100%;
              }
            `}</style>
            {loading ? (
              // Skeleton cards
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="skeleton h-4 w-24 rounded"></div>
                      <div className="skeleton h-3 w-16 rounded"></div>
                    </div>
                    <div className="skeleton h-6 w-20 rounded-full"></div>
                  </div>
                  <div className="skeleton h-4 w-40 rounded"></div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="skeleton h-8 w-16 rounded"></div>
                    <div className="skeleton h-8 w-16 rounded"></div>
                  </div>
                </div>
              ))
            ) : (
              // Actual cards
              transactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-slate-300 font-medium">
                        {new Date(tx.created_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${getTypeColor(tx.transaction_type)}`}>
                      {getTypeIcon(tx.transaction_type)}
                      <span className="text-xs font-bold capitalize">{tx.transaction_type}</span>
                    </div>
                  </div>

                  <div className="text-sm text-slate-300">{getDescription(tx)}</div>
                  {tx.payment && (
                    <div className="text-xs text-slate-500 font-mono">
                      {tx.payment.receipt_number}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div>
                      <div className="text-xs text-slate-500">Amount</div>
                      <div className={`text-base font-bold ${
                        tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Balance</div>
                      <div className="text-base font-bold text-white">{tx.balance_after}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && transactions.length > 0 && (
        <button
          onClick={() => loadTransactions(true)}
          disabled={loading}
          className="w-full py-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:border-slate-700 transition-all font-medium cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </span>
          ) : (
            'Load More'
          )}
        </button>
      )}
    </div>
  )
}

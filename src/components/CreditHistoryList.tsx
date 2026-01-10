'use client'

import { useState, useEffect } from 'react'
import { CreditUsageCard } from './CreditUsageCard'
import { Filter, Calendar, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface CreditHistoryListProps {
  compact?: boolean
  limit?: number
}

export function CreditHistoryList({ compact = false, limit }: CreditHistoryListProps) {
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
        limit: (limit || 20).toString(),
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

  const handleLoadMore = () => {
    loadTransactions(true)
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
      {/* Filter Tabs - Only show if not compact */}
      {!compact && (
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'purchase', 'block', 'deduct', 'refund'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                filter === type
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
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
        /* Transaction List */
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <CreditUsageCard
              key={transaction.id}
              transaction={transaction}
              compact={compact}
              showDetails={!compact}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !compact && transactions.length > 0 && (
        <button
          onClick={handleLoadMore}
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

      {/* Show "View All" link if compact */}
      {compact && hasMore && (
        <a
          href="/billing?tab=credits"
          className="block text-center py-2 text-teal-400 hover:text-teal-300 font-medium text-sm transition-colors"
        >
          View All Transactions →
        </a>
      )}
    </div>
  )
}

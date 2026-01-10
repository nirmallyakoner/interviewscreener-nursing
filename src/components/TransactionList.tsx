'use client'

import { useState, useEffect } from 'react'
import { TransactionCard } from './TransactionCard'
import { TransactionDetailsModal } from './TransactionDetailsModal'

interface PaymentMethodDetails {
  last4?: string
  network?: string
  type?: string
  issuer?: string
  name?: string
  vpa?: string
  bank?: string
  wallet?: string
}

interface Transaction {
  id: string
  razorpay_order_id: string
  razorpay_payment_id: string
  amount: number
  currency: string
  status: string
  payment_method: string
  payment_method_details: PaymentMethodDetails
  customer_email: string
  customer_contact: string
  fee: number
  tax: number
  receipt: string
  interviews_added: number
  created_at: string
  updated_at: string
}

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/payments/list')
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const data = await response.json()
      setTransactions(data.payments || [])
    } catch (err: any) {
      console.error('Error fetching transactions:', err)
      setError(err.message || 'Failed to load transaction history')
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTransaction(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <p className="text-slate-400">Loading transactions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/30 rounded-xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-rose-400 font-semibold mb-2">Failed to load transactions</p>
        <p className="text-rose-300/70 text-sm mb-4">{error}</p>
        <button
          onClick={fetchTransactions}
          className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all cursor-pointer"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Transactions Yet</h3>
        <p className="text-slate-400">Your transaction history will appear here once you make a payment.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-slate-400">
            Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={fetchTransactions}
            className="text-teal-400 hover:text-teal-300 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onClick={() => handleTransactionClick(transaction)}
          />
        ))}
      </div>

      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}

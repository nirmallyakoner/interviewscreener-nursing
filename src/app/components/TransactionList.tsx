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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-700 font-semibold mb-2">Failed to load transactions</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={fetchTransactions}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-12 text-center">
        <svg className="w-16 h-16 text-blue-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Transactions Yet</h3>
        <p className="text-gray-600">Your transaction history will appear here once you make a payment.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={fetchTransactions}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
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

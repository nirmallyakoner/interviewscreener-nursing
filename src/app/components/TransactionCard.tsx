'use client'

import { useState } from 'react'

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

interface TransactionCardProps {
  transaction: Transaction
  onClick: () => void
}

export function TransactionCard({ transaction, onClick }: TransactionCardProps) {
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return '💳'
      case 'upi':
        return '📱'
      case 'netbanking':
        return '🏦'
      case 'wallet':
        return '👛'
      default:
        return '💰'
    }
  }

  const getPaymentMethodDisplay = (method: string, details: PaymentMethodDetails | null | undefined) => {
    if (!method) return 'N/A'
    
    const safeDetails = details || {}
    
    switch (method) {
      case 'card':
        return safeDetails.last4 
          ? `${safeDetails.network || 'Card'} •••• ${safeDetails.last4}`
          : 'Card'
      case 'upi':
        return safeDetails.vpa || 'UPI'
      case 'netbanking':
        return safeDetails.bank || 'Net Banking'
      case 'wallet':
        return safeDetails.wallet || 'Wallet'
      default:
        return method.charAt(0).toUpperCase() + method.slice(1)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Success',
      },
      created: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        label: 'Pending',
      },
      failed: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: 'Failed',
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.created

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return `${currency === 'INR' ? '₹' : currency} ${(amount / 100).toFixed(2)}`
  }

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{getPaymentMethodIcon(transaction.payment_method)}</span>
            <div>
              <p className="font-semibold text-gray-900">
                {getPaymentMethodDisplay(transaction.payment_method, transaction.payment_method_details)}
              </p>
              <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {formatAmount(transaction.amount, transaction.currency)}
          </p>
          {getStatusBadge(transaction.status)}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Interviews Added:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            +{transaction.interviews_added}
          </span>
        </div>
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
          View Details →
        </button>
      </div>
    </div>
  )
}

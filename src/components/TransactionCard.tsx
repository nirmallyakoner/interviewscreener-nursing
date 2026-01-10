'use client'

import { useState } from 'react'
import { CreditCard, Smartphone, Building2, Wallet, Clock, CheckCircle2, XCircle, ArrowRight, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { analytics } from '@/lib/analytics'

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
  const [downloading, setDownloading] = useState(false)

  const handleDownloadReceipt = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    setDownloading(true)
    
    try {
      const response = await fetch(`/api/payments/receipt?paymentId=${transaction.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to generate receipt')
      }

      const data = await response.json()
      
      // Generate and download receipt
      const receiptHtml = generateReceiptHtml(data.receipt)
      const blob = new Blob([receiptHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${transaction.razorpay_payment_id || transaction.razorpay_order_id}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // Track receipt download
      analytics.trackDownloadReceipt(transaction.razorpay_payment_id || transaction.razorpay_order_id)
      
      toast.success('Receipt downloaded successfully!')
    } catch (error) {
      console.error('Receipt download error:', error)
      toast.error('Failed to download receipt')
    } finally {
      setDownloading(false)
    }
  }

  const generateReceiptHtml = (receiptData: any) => {
    // Same receipt HTML generation as in TransactionDetailsModal
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt - ${receiptData.receiptNumber}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #e2e8f0; }
    .container { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border: 2px solid #475569; border-radius: 16px; padding: 40px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); }
    .header { text-align: center; border-bottom: 3px solid #14b8a6; padding-bottom: 20px; margin-bottom: 30px; }
    .company-name { font-size: 36px; font-weight: bold; background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
    .company-info { color: #94a3b8; font-size: 14px; margin: 5px 0; }
    .receipt-title { font-size: 24px; color: #cbd5e1; margin-top: 15px; font-weight: 600; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; font-weight: bold; color: #14b8a6; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #334155; }
    .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #334155; }
    .info-label { font-weight: 600; color: #94a3b8; }
    .info-value { color: #e2e8f0; font-weight: 500; }
    .total-row { background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%); padding: 20px; margin-top: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3); }
    .total-amount { font-size: 28px; font-weight: bold; color: #ffffff; }
    .status-badge { display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: 600; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4); }
    .footer { margin-top: 50px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #334155; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-name">${receiptData.companyName}</div>
      <div class="company-info">${receiptData.companyAddress}</div>
      <div class="company-info">${receiptData.companyEmail}</div>
      <div class="receipt-title">Payment Receipt</div>
    </div>
    <div class="section">
      <div class="section-title">Receipt Information</div>
      <div class="info-row"><span class="info-label">Receipt Number:</span><span class="info-value">${receiptData.receiptNumber}</span></div>
      <div class="info-row"><span class="info-label">Receipt Date:</span><span class="info-value">${receiptData.receiptDate}</span></div>
      <div class="info-row"><span class="info-label">Status:</span><span class="status-badge">${receiptData.status === 'created' ? 'PENDING' : receiptData.status.toUpperCase()}</span></div>
    </div>
    <div class="section">
      <div class="section-title">Payment Information</div>
      <div class="info-row"><span class="info-label">Payment ID:</span><span class="info-value">${receiptData.paymentId}</span></div>
      <div class="info-row"><span class="info-label">Order ID:</span><span class="info-value">${receiptData.orderId}</span></div>
      <div class="info-row"><span class="info-label">Payment Method:</span><span class="info-value">${receiptData.paymentMethod.toUpperCase()}</span></div>
    </div>
    <div class="section">
      <div class="section-title">Transaction Details</div>
      <div class="info-row"><span class="info-label">Product:</span><span class="info-value">${receiptData.productDescription}</span></div>
      <div class="info-row"><span class="info-label">Interviews Added:</span><span class="info-value">${receiptData.interviewsAdded}</span></div>
      <div class="info-row"><span class="info-label">Amount:</span><span class="info-value">${receiptData.currency} ${(receiptData.amount / 100).toFixed(2)}</span></div>
      <div class="total-row">
        <div class="info-row" style="border: none; padding: 0;">
          <span class="info-label" style="font-size: 18px; color: #ffffff;">Total Amount Paid:</span>
          <span class="total-amount">${receiptData.currency} ${(receiptData.totalAmount / 100).toFixed(2)}</span>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>Thank you for your payment!</p>
      <p>For any queries, please contact ${receiptData.companyEmail}</p>
    </div>
  </div>
</body>
</html>`
  }

  const getPaymentMethodIcon = (method: string, status: string) => {
    if (status === 'created' && !method) {
      return <Clock className="w-5 h-5 text-amber-400" />
    }
    
    switch (method) {
      case 'card':
        return <CreditCard className="w-5 h-5 text-blue-400" />
      case 'upi':
        return <Smartphone className="w-5 h-5 text-purple-400" />
      case 'netbanking':
        return <Building2 className="w-5 h-5 text-teal-400" />
      case 'wallet':
        return <Wallet className="w-5 h-5 text-pink-400" />
      default:
        return <CreditCard className="w-5 h-5 text-slate-400" />
    }
  }

  const getPaymentMethodDisplay = (method: string, details: PaymentMethodDetails | null | undefined, status: string) => {
    if (status === 'created' && !method) {
      return 'Payment Pending'
    }
    
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
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        label: 'Success',
      },
      created: {
        icon: <Clock className="w-3.5 h-3.5" />,
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        label: 'Pending',
      },
      failed: {
        icon: <XCircle className="w-3.5 h-3.5" />,
        bg: 'bg-rose-500/20',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        label: 'Failed',
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.created

    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${config.bg} ${config.border} ${config.text}`}>
        {config.icon}
        <span className="text-xs font-bold">{config.label}</span>
      </div>
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
      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 hover:border-teal-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-teal-500/10"
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="relative p-4 sm:p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
              {getPaymentMethodIcon(transaction.payment_method, transaction.status)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm sm:text-base truncate">
                {getPaymentMethodDisplay(transaction.payment_method, transaction.payment_method_details, transaction.status)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{formatDate(transaction.created_at)}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <p className="text-xl sm:text-2xl font-bold text-white">
              {formatAmount(transaction.amount, transaction.currency)}
            </p>
            <div className="mt-1.5">
              {getStatusBadge(transaction.status)}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-700/50 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Interviews:</span>
            <span className="px-2.5 py-1 bg-teal-500/20 border border-teal-500/30 text-teal-400 rounded-full text-xs font-bold">
              +{transaction.interviews_added}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownloadReceipt}
              disabled={downloading}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-teal-500/50 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">{downloading ? 'Downloading...' : 'Receipt'}</span>
            </button>
            <button className="flex items-center gap-1.5 text-teal-400 text-xs font-semibold hover:text-teal-300 transition-colors cursor-pointer group">
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

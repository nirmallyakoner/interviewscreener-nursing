'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
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
  credits_added: number
  created_at: string
  updated_at: string
}

interface TransactionDetailsModalProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
}

export function TransactionDetailsModal({ transaction, isOpen, onClose }: TransactionDetailsModalProps) {
  const [downloadingReceipt, setDownloadingReceipt] = useState(false)

  if (!isOpen || !transaction) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return `${currency === 'INR' ? '₹' : currency} ${(amount / 100).toFixed(2)}`
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const handleDownloadReceipt = async () => {
    setDownloadingReceipt(true)
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
      a.download = `receipt-${transaction.razorpay_payment_id}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Receipt downloaded successfully!')
    } catch (error) {
      console.error('Receipt download error:', error)
      toast.error('Failed to download receipt')
    } finally {
      setDownloadingReceipt(false)
    }
  }

  const generateReceiptHtml = (receiptData: any) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt - ${receiptData.receiptNumber}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #e2e8f0;
    }
    .container {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border: 2px solid #475569;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    .header {
      text-center;
      border-bottom: 3px solid #14b8a6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .company-name {
      font-size: 36px;
      font-weight: bold;
      background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    .company-info {
      color: #94a3b8;
      font-size: 14px;
      margin: 5px 0;
    }
    .receipt-title {
      font-size: 24px;
      color: #cbd5e1;
      margin-top: 15px;
      font-weight: 600;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #14b8a6;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #334155;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #334155;
    }
    .info-label {
      font-weight: 600;
      color: #94a3b8;
    }
    .info-value {
      color: #e2e8f0;
      font-weight: 500;
    }
    .total-row {
      background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%);
      padding: 20px;
      margin-top: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
    }
    .total-amount {
      font-size: 28px;
      font-weight: bold;
      color: #ffffff;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 600;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #64748b;
      font-size: 12px;
      border-top: 1px solid #334155;
      padding-top: 20px;
    }
    .footer p {
      margin: 8px 0;
    }
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
      <div class="info-row">
        <span class="info-label">Receipt Number:</span>
        <span class="info-value">${receiptData.receiptNumber}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Receipt Date:</span>
        <span class="info-value">${receiptData.receiptDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status:</span>
        <span class="status-badge">${receiptData.status === 'created' ? 'PENDING' : receiptData.status.toUpperCase()}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Customer Information</div>
      <div class="info-row">
        <span class="info-label">Name:</span>
        <span class="info-value">${receiptData.customerName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email:</span>
        <span class="info-value">${receiptData.customerEmail}</span>
      </div>
      ${receiptData.customerContact ? `
      <div class="info-row">
        <span class="info-label">Contact:</span>
        <span class="info-value">${receiptData.customerContact}</span>
      </div>
      ` : ''}
    </div>

    <div class="section">
      <div class="section-title">Payment Information</div>
      <div class="info-row">
        <span class="info-label">Payment ID:</span>
        <span class="info-value">${receiptData.paymentId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Order ID:</span>
        <span class="info-value">${receiptData.orderId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Method:</span>
        <span class="info-value">${receiptData.paymentMethod.toUpperCase()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Date:</span>
        <span class="info-value">${receiptData.paymentDate}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Transaction Details</div>
      <div class="info-row">
        <span class="info-label">Product:</span>
        <span class="info-value">${receiptData.productDescription}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Credits Added:</span>
        <span class="info-value">${receiptData.creditsAdded}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Amount:</span>
        <span class="info-value">${receiptData.currency} ${(receiptData.amount / 100).toFixed(2)}</span>
      </div>
      ${receiptData.fee > 0 ? `
      <div class="info-row">
        <span class="info-label">Processing Fee:</span>
        <span class="info-value">${receiptData.currency} ${(receiptData.fee / 100).toFixed(2)}</span>
      </div>
      ` : ''}
      ${receiptData.tax > 0 ? `
      <div class="info-row">
        <span class="info-label">Tax:</span>
        <span class="info-value">${receiptData.currency} ${(receiptData.tax / 100).toFixed(2)}</span>
      </div>
      ` : ''}
      
      <div class="total-row">
        <div class="info-row" style="border: none; padding: 0;">
          <span class="info-label" style="font-size: 18px; color: #ffffff;">Total Amount Paid:</span>
          <span class="total-amount">${receiptData.currency} ${(receiptData.totalAmount / 100).toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for your payment!</p>
      <p>This is a computer-generated receipt and does not require a signature.</p>
      <p>For any queries, please contact ${receiptData.companyEmail}</p>
    </div>
  </div>
</body>
</html>
    `
  }

  const getPaymentMethodDetails = () => {
    const { payment_method, payment_method_details } = transaction
    
    if (!payment_method) return <p>N/A</p>

    const safeDetails = payment_method_details || {}

    switch (payment_method) {
      case 'card':
        return (
          <div className="space-y-2">
            <p><span className="font-semibold">Type:</span> {safeDetails.type || 'N/A'}</p>
            <p><span className="font-semibold">Network:</span> {safeDetails.network || 'N/A'}</p>
            <p><span className="font-semibold">Last 4 Digits:</span> •••• {safeDetails.last4 || 'N/A'}</p>
            {safeDetails.issuer && (
              <p><span className="font-semibold">Issuer:</span> {safeDetails.issuer}</p>
            )}
          </div>
        )
      case 'upi':
        return <p><span className="font-semibold">UPI ID:</span> {safeDetails.vpa || 'N/A'}</p>
      case 'netbanking':
        return <p><span className="font-semibold">Bank:</span> {safeDetails.bank || 'N/A'}</p>
      case 'wallet':
        return <p><span className="font-semibold">Wallet:</span> {safeDetails.wallet || 'N/A'}</p>
      default:
        return <p>{payment_method}</p>
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl custom-modal-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border-b border-teal-500/30 p-6 rounded-t-2xl backdrop-blur-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Transaction Details</h2>
              <p className="text-teal-300/70 text-sm font-mono">Payment ID: {transaction.razorpay_payment_id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full p-2 transition-all cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount Section */}
          <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/30 rounded-xl p-6 text-center">
            <p className="text-slate-400 text-sm mb-2">Amount Paid</p>
            <p className="text-4xl font-bold text-white">
              {formatAmount(transaction.amount, transaction.currency)}
            </p>
            <div className="mt-3">
              {transaction.status === 'paid' && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full text-sm font-bold">
                  ✓ Payment Successful
                </span>
              )}
              {transaction.status === 'created' && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-full text-sm font-bold">
                  ⏳ Pending
                </span>
              )}
              {transaction.status === 'failed' && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-full text-sm font-bold">
                  ✗ Failed
                </span>
              )}
            </div>
          </div>

          {/* Payment Information */}
          {transaction.razorpay_payment_id ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-white text-lg">Payment Information</h3>
              
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-400">Payment ID</p>
                    <p className="font-mono text-sm text-white">{transaction.razorpay_payment_id}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(transaction.razorpay_payment_id, 'Payment ID')}
                    className="text-teal-400 hover:text-teal-300 text-sm font-semibold cursor-pointer transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-400">Order ID</p>
                    <p className="font-mono text-sm text-white">{transaction.razorpay_order_id}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(transaction.razorpay_order_id, 'Order ID')}
                    className="text-teal-400 hover:text-teal-300 text-sm font-semibold cursor-pointer transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">⏳</span>
                <div>
                  <p className="text-amber-400 font-bold text-lg mb-1">Payment Pending</p>
                  <p className="text-amber-300/70 text-sm mb-3">
                    This order was created but payment has not been completed yet.
                  </p>
                  <div className="bg-slate-800/50 border border-amber-500/30 rounded-lg p-3">
                    <p className="text-sm text-slate-400 mb-1">Order ID</p>
                    <div className="flex justify-between items-center">
                      <p className="font-mono text-sm text-white">{transaction.razorpay_order_id}</p>
                      <button
                        onClick={() => copyToClipboard(transaction.razorpay_order_id, 'Order ID')}
                        className="text-teal-400 hover:text-teal-300 text-sm font-semibold cursor-pointer transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Details - Only show if payment completed */}
          {transaction.payment_method && (
            <div className="space-y-3">
              <h3 className="font-semibold text-white text-lg">Payment Method</h3>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-2">
                  {transaction.payment_method?.toUpperCase() || 'N/A'}
                </p>
                <div className="text-sm text-white">
                  {getPaymentMethodDetails()}
                </div>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white text-lg">Transaction Details</h3>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Credits Added</span>
                <span className="font-semibold text-teal-400">+{transaction.credits_added}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction Date</span>
                <span className="font-semibold text-white">{formatDate(transaction.created_at)}</span>
              </div>
              {transaction.fee > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Processing Fee</span>
                    <span className="font-semibold text-white">
                      {formatAmount(transaction.fee, transaction.currency)}
                    </span>
                  </div>
                  {transaction.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tax</span>
                      <span className="font-semibold text-white">
                        {formatAmount(transaction.tax, transaction.currency)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Customer Details */}
          {(transaction.customer_email || transaction.customer_contact) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-white text-lg">Customer Details</h3>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
                {transaction.customer_email && (
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-sm text-white">{transaction.customer_email}</p>
                  </div>
                )}
                {transaction.customer_contact && (
                  <div>
                    <p className="text-sm text-slate-400">Contact</p>
                    <p className="text-sm text-white">{transaction.customer_contact}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDownloadReceipt}
              disabled={downloadingReceipt}
              className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {downloadingReceipt ? 'Generating...' : 'Download Receipt'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-slate-700 text-slate-300 hover:text-white rounded-lg font-semibold hover:bg-slate-800 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-modal-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-modal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-modal-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.3);
          border-radius: 3px;
        }
        .custom-modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.5);
        }
      `}</style>
    </div>
  )
}

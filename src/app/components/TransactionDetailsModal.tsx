'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

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
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #3B82F6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .company-name {
      font-size: 32px;
      font-weight: bold;
      color: #3B82F6;
      margin-bottom: 10px;
    }
    .receipt-title {
      font-size: 24px;
      color: #666;
      margin-top: 10px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #3B82F6;
      margin-bottom: 15px;
      border-bottom: 2px solid #E5E7EB;
      padding-bottom: 5px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #F3F4F6;
    }
    .info-label {
      font-weight: 600;
      color: #666;
    }
    .info-value {
      color: #333;
    }
    .total-row {
      background-color: #F3F4F6;
      padding: 15px;
      margin-top: 20px;
      border-radius: 8px;
    }
    .total-amount {
      font-size: 24px;
      font-weight: bold;
      color: #3B82F6;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: 600;
      background-color: #D1FAE5;
      color: #065F46;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #999;
      font-size: 12px;
      border-top: 1px solid #E5E7EB;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">${receiptData.companyName}</div>
    <div>${receiptData.companyAddress}</div>
    <div>${receiptData.companyEmail}</div>
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
      <span class="status-badge">${receiptData.status.toUpperCase()}</span>
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
      <span class="info-label">Interviews Added:</span>
      <span class="info-value">${receiptData.interviewsAdded}</span>
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
      <div class="info-row" style="border: none;">
        <span class="info-label" style="font-size: 18px;">Total Amount Paid:</span>
        <span class="total-amount">${receiptData.currency} ${(receiptData.totalAmount / 100).toFixed(2)}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for your payment!</p>
    <p>This is a computer-generated receipt and does not require a signature.</p>
    <p>For any queries, please contact ${receiptData.companyEmail}</p>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Transaction Details</h2>
              <p className="text-blue-100 text-sm">Payment ID: {transaction.razorpay_payment_id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
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
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center">
            <p className="text-gray-600 text-sm mb-2">Amount Paid</p>
            <p className="text-4xl font-bold text-gray-900">
              {formatAmount(transaction.amount, transaction.currency)}
            </p>
            <div className="mt-3">
              {transaction.status === 'paid' && (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  ✓ Payment Successful
                </span>
              )}
              {transaction.status === 'created' && (
                <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                  ⏳ Pending
                </span>
              )}
              {transaction.status === 'failed' && (
                <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  ✗ Failed
                </span>
              )}
            </div>
          </div>

          {/* Payment IDs */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-lg">Payment Information</h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Payment ID</p>
                  <p className="font-mono text-sm text-gray-900">{transaction.razorpay_payment_id}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(transaction.razorpay_payment_id, 'Payment ID')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-mono text-sm text-gray-900">{transaction.razorpay_order_id}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(transaction.razorpay_order_id, 'Order ID')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-lg">Payment Method</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                {transaction.payment_method?.toUpperCase() || 'N/A'}
              </p>
              <div className="text-sm text-gray-900">
                {getPaymentMethodDetails()}
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-lg">Transaction Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Interviews Added</span>
                <span className="font-semibold text-blue-600">+{transaction.interviews_added}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction Date</span>
                <span className="font-semibold text-gray-900">{formatDate(transaction.created_at)}</span>
              </div>
              {transaction.fee > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="font-semibold text-gray-900">
                      {formatAmount(transaction.fee, transaction.currency)}
                    </span>
                  </div>
                  {transaction.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-semibold text-gray-900">
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
              <h3 className="font-semibold text-gray-900 text-lg">Customer Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {transaction.customer_email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm text-gray-900">{transaction.customer_email}</p>
                  </div>
                )}
                {transaction.customer_contact && (
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="text-sm text-gray-900">{transaction.customer_contact}</p>
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
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingReceipt ? 'Generating...' : '📄 Download Receipt'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

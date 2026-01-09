-- Migration: Add comprehensive payment details to payments table
-- This migration adds fields to store detailed payment information from Razorpay

-- Add payment method and details columns
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_method_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_contact TEXT,
ADD COLUMN IF NOT EXISTS fee INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS receipt TEXT,
ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS payment_metadata JSONB DEFAULT '{}';

-- Add index for faster queries on payment method
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);

-- Add index for customer email lookups
CREATE INDEX IF NOT EXISTS idx_payments_customer_email ON payments(customer_email);

-- Add comments for documentation
COMMENT ON COLUMN payments.payment_method IS 'Payment method used: card, upi, netbanking, wallet, etc.';
COMMENT ON COLUMN payments.payment_method_details IS 'Method-specific details like last4 digits, bank name, UPI ID, wallet name';
COMMENT ON COLUMN payments.customer_email IS 'Customer email from Razorpay payment';
COMMENT ON COLUMN payments.customer_contact IS 'Customer phone number from Razorpay payment';
COMMENT ON COLUMN payments.fee IS 'Razorpay fee charged in paise';
COMMENT ON COLUMN payments.tax IS 'Tax on Razorpay fee in paise';
COMMENT ON COLUMN payments.receipt IS 'Receipt number/ID for the payment';
COMMENT ON COLUMN payments.notes IS 'Custom notes attached to the payment';
COMMENT ON COLUMN payments.payment_metadata IS 'Complete payment response from Razorpay for reference';

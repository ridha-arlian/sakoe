CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  midtrans_transaction_id TEXT,
  amount INTEGER NOT NULL,
  donor_name TEXT,
  is_anonymous INTEGER NOT NULL DEFAULT 0,
  message TEXT,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'expired', 'failed', 'cancelled', 'refunded')),
  paid_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  raw_notification TEXT,
  signature_verified INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS donations_status_idx ON donations (status);

ALTER TABLE donations ADD COLUMN tako_gift_id TEXT;

ALTER TABLE donations ADD COLUMN tako_payment_url TEXT;

ALTER TABLE donations ADD COLUMN tako_transaction_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS donations_tako_gift_id_idx
  ON donations (tako_gift_id)
  WHERE tako_gift_id IS NOT NULL;

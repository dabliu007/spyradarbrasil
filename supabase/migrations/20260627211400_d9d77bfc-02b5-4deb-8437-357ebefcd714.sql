
CREATE TABLE public.purchase_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text UNIQUE NOT NULL,
  amount numeric(10,2),
  currency text DEFAULT 'BRL',
  status text,
  fbc text,
  fbp text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  utm_id text,
  fbclid text,
  gclid text,
  landing_url text,
  referrer text,
  raw_metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.purchase_logs TO service_role;
ALTER TABLE public.purchase_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX purchase_logs_created_at_idx ON public.purchase_logs (created_at DESC);
CREATE INDEX purchase_logs_utm_campaign_idx ON public.purchase_logs (utm_campaign);

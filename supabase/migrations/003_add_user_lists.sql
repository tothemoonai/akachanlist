-- Migration: Add user authentication and personal lists
-- Date: 2026-03-23
-- Depends on: 001_initial_schema.sql, 002_insert_data.sql

-- Create user_lists table
CREATE TABLE IF NOT EXISTS user_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  share_token UUID UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_list_items table
CREATE TABLE IF NOT EXISTS user_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_list_id UUID NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  priority TEXT NOT NULL CHECK (priority IN ('required', 'recommended', 'optional')),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0 AND quantity <= 99),
  is_purchased BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_list_id, item_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_lists_user ON user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_share ON user_lists(share_token) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_list_items_list ON user_list_items(user_list_id);
CREATE INDEX IF NOT EXISTS idx_user_list_items_item ON user_list_items(item_id);
CREATE INDEX IF NOT EXISTS idx_user_list_items_purchased ON user_list_items(user_list_id, is_purchased);

-- Enable RLS
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_lists
CREATE POLICY "Users can view own lists"
  ON user_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lists"
  ON user_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists"
  ON user_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists"
  ON user_lists FOR DELETE
  USING (auth.uid() = user_id);

-- Public read access via share token
CREATE POLICY "Public can view shared lists"
  ON user_lists FOR SELECT
  USING (is_public = TRUE AND share_token IS NOT NULL);

-- RLS Policies for user_list_items
CREATE POLICY "Users can view items in own lists"
  ON user_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = user_list_items.user_list_id
      AND user_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items into own lists"
  ON user_list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = user_list_items.user_list_id
      AND user_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in own lists"
  ON user_list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = user_list_items.user_list_id
      AND user_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items in own lists"
  ON user_list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = user_list_items.user_list_id
      AND user_lists.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function (if not exists from migration 001)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_lists_updated_at ON user_lists;
CREATE TRIGGER update_user_lists_updated_at BEFORE UPDATE ON user_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_list_items_updated_at ON user_list_items;
CREATE TRIGGER update_user_list_items_updated_at BEFORE UPDATE ON user_list_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verification queries (commented out)
-- SELECT COUNT(*) FROM user_lists; -- Should return 0
-- SELECT COUNT(*) FROM user_list_items; -- Should return 0

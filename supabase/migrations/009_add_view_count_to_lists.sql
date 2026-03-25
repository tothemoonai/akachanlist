-- Add view_count column to user_lists for tracking shared list views
ALTER TABLE user_lists
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create index on view_count for analytics
CREATE INDEX IF NOT EXISTS idx_user_lists_view_count ON user_lists(view_count DESC);

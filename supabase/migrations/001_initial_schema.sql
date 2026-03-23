-- ============================================
-- Supabase Database Schema for Akachanlist
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Projects Table
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_zh TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description_zh TEXT NOT NULL,
  description_ja TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Categories Table
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, slug)
);

-- ============================================
-- Subcategories Table
-- ============================================
CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description_zh TEXT,
  description_ja TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(category_id, slug)
);

-- ============================================
-- Items Table
-- ============================================
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  name_zh TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description_zh TEXT,
  description_ja TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('required', 'recommended', 'optional')),
  quantity_zh TEXT,
  quantity_ja TEXT,
  notes_zh TEXT,
  notes_ja TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX idx_categories_project ON categories(project_id);
CREATE INDEX idx_categories_sort ON categories(project_id, sort_order);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);
CREATE INDEX idx_subcategories_sort ON subcategories(category_id, sort_order);
CREATE INDEX idx_items_subcategory ON items(subcategory_id);
CREATE INDEX idx_items_sort ON items(subcategory_id, sort_order);
CREATE INDEX idx_projects_slug ON projects(slug);

-- ============================================
-- Updated At Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Allow public read access to projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to subcategories"
  ON subcategories FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to items"
  ON items FOR SELECT
  USING (true);

-- Note: Write access should be restricted to authenticated users
-- Add additional policies as needed for your authentication setup

# Supabase Reviews Table Setup Guide

This guide provides step-by-step instructions for completing the reviews table setup in Supabase Dashboard.

## Overview

The migration file `supabase/migrations/008_create_reviews_table.sql` has been created and committed. The following steps require manual execution in the Supabase Dashboard.

---

## Step 1: Execute Migration SQL (COMPLETED)

The migration file has been created at:
`C:\ClaudeCodeProject\akachanlist\supabase\migrations\008_create_reviews_table.sql`

**Status:** ✅ Migration file created and committed (commit: f75a82b)

---

## Step 2: Execute SQL in Supabase Dashboard

### Instructions:

1. **Navigate to Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project
   - Click on "SQL Editor" in the left sidebar

2. **Execute the Migration**
   - Click "New Query"
   - Copy the entire contents of `008_create_reviews_table.sql`
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl+Enter`

3. **Expected Results:**
   - ✅ Table `reviews` created successfully
   - ✅ 7 indexes created successfully
   - ✅ RLS policies created successfully (5 policies)
   - ✅ Trigger created for `updated_at`
   - ✅ 3 sample test data rows inserted

4. **Verify Execution:**
   ```sql
   -- Check table exists
   SELECT COUNT(*) FROM reviews;

   -- Check sample data
   SELECT title, status, published_at FROM reviews;

   -- Check RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'reviews';

   -- Check indexes
   SELECT indexname FROM pg_indexes WHERE tablename = 'reviews';
   ```

**Expected Output:**
- `COUNT(*)` should return 3 (sample reviews)
- Should see 3 reviews with status='published'
- Should see 5 RLS policies
- Should see 7 indexes

---

## Step 3: Verify Table Structure

### Instructions:

1. **Navigate to Table Editor**
   - In Supabase Dashboard, click "Table Editor" in the left sidebar
   - Find and click on the `reviews` table

2. **Verify Columns:**
   The table should have the following columns:

   | Column | Type | Description |
   |--------|------|-------------|
   | id | UUID | Primary key |
   | title | TEXT | Review title |
   | slug | TEXT | URL-friendly unique identifier |
   | excerpt | TEXT | Short summary |
   | content | TEXT | Full review content (markdown) |
   | cover_image | TEXT | Cover image URL |
   | author_name | TEXT | Author display name |
   | author_avatar | TEXT | Author avatar URL |
   | category_id | UUID | Foreign key to categories |
   | subcategory_id | UUID | Foreign key to subcategories |
   | item_id | UUID | Foreign key to items |
   | meta_title | TEXT | SEO title |
   | meta_description | TEXT | SEO description |
   | keywords | TEXT[] | SEO keywords array |
   | status | TEXT | draft/published/archived |
   | view_count | INTEGER | View counter |
   | like_count | INTEGER | Like counter |
   | published_at | TIMESTAMPTZ | Publication timestamp |
   | created_at | TIMESTAMPTZ | Creation timestamp |
   | updated_at | TIMESTAMPTZ | Last update timestamp |

3. **Verify Sample Data:**
   - Click on "Rows" tab
   - Should see 3 rows of test data
   - Check that all columns have appropriate values

**Expected Result:** ✅ Table structure matches the schema above, sample data displays correctly

---

## Step 4: Create Storage Bucket for Review Images

### Instructions:

1. **Navigate to Storage**
   - In Supabase Dashboard, click "Storage" in the left sidebar

2. **Create New Bucket**
   - Click the "New bucket" button
   - Enter bucket name: `review-images`
   - **Important:** Check the "Make bucket public" checkbox
   - Click "Create bucket"

3. **Configure Bucket Settings**
   - Click on the `review-images` bucket
   - Go to "Configuration" tab
   - Verify:
     - Public bucket: ✅ Yes
     - File size limit: Can be left as default
     - Allowed MIME types: Can be left as default (all types)

4. **Set up RLS Policies for Storage**

   - Go to "Policies" tab in the bucket
   - Click "New Policy"
   - Select "Get started quickly" or "Custom"

   **Policy 1: Public Read Access**
   ```sql
   CREATE POLICY "Allow public read access to review images"
   ON storage.objects FOR SELECT
   USING ( bucket_id = 'review-images' );
   ```

   **Policy 2: Authenticated Upload**
   ```sql
   CREATE POLICY "Allow authenticated users to upload review images"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'review-images'
     AND auth.uid() IS NOT NULL
   );
   ```

   **Policy 3: Authenticated Delete**
   ```sql
   CREATE POLICY "Allow authenticated users to delete review images"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'review-images'
     AND auth.uid() IS NOT NULL
   );
   ```

   **Alternative Method:** Execute all policies in SQL Editor:
   ```sql
   -- Public read access
   CREATE POLICY "Allow public read access to review images"
   ON storage.objects FOR SELECT
   USING ( bucket_id = 'review-images' );

   -- Authenticated upload
   CREATE POLICY "Allow authenticated users to upload review images"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'review-images'
     AND auth.uid() IS NOT NULL
   );

   -- Authenticated delete
   CREATE POLICY "Allow authenticated users to delete review images"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'review-images'
     AND auth.uid() IS NOT NULL
   );
   ```

**Expected Result:**
- ✅ Bucket `review-images` created successfully
- ✅ Bucket is public
- ✅ 3 RLS policies created for the bucket

---

## Step 5: Upload Sample Images (Optional)

For testing purposes, you may want to upload sample cover images:

1. **Navigate to Storage** → **review-images** bucket
2. **Click "Upload"**
3. **Upload sample images** (you can use placeholders for now):
   - `car-seat-cover.jpg`
   - `diaper-comparison.jpg`
   - `hospital-bag.jpg`

4. **Update the reviews** to use the correct image URLs:
   ```sql
   UPDATE reviews
   SET cover_image = '/storage/v1/object/public/review-images/car-seat-cover.jpg'
   WHERE slug = 'newborn-car-seat-buying-guide';

   UPDATE reviews
   SET cover_image = '/storage/v1/object/public/review-images/diaper-comparison.jpg'
   WHERE slug = 'diaper-brand-comparison';

   UPDATE reviews
   SET cover_image = '/storage/v1/object/public/review-images/hospital-bag.jpg'
   WHERE slug = 'hospital-bag-checklist';
   ```

---

## Verification Checklist

Use this checklist to ensure everything is set up correctly:

- [ ] Migration SQL executed successfully in Supabase Dashboard
- [ ] Reviews table exists with all 19 columns
- [ ] 7 indexes created on the reviews table
- [ ] 5 RLS policies created for the reviews table
- [ ] 3 sample review rows inserted
- [ ] Storage bucket `review-images` created
- [ ] Storage bucket is set to public
- [ ] 3 RLS policies created for the storage bucket
- [ ] Can query reviews table: `SELECT * FROM reviews WHERE status = 'published';`
- [ ] Can access storage bucket URL pattern: `https://[your-project].supabase.co/storage/v1/object/public/review-images/`

---

## Troubleshooting

### Issue: Migration SQL fails with "relation does not exist"

**Solution:** Ensure you have executed migrations 001-007 first. The reviews table references:
- `categories` table
- `subcategories` table
- `items` table

### Issue: Sample data insertion fails

**Solution:** Check if the referenced category/subcategory/item exists. The sample data uses:
- Category: `clothing-diapering`
- Subcategories: `clothing`, `diapering`
- Items: `汽车座椅`, `纸尿裤`

If these don't exist, you can modify the sample data or insert the missing references.

### Issue: Storage bucket RLS policies don't work

**Solution:** Make sure you're using the correct bucket ID. Check the bucket name matches exactly: `review-images`

### Issue: Images not accessible

**Solution:** Verify:
1. Bucket is set to public
2. RLS policy allows public read access
3. URL format is correct: `/storage/v1/object/public/review-images/filename.jpg`

---

## Next Steps

After completing the setup:

1. ✅ Test queries in Supabase SQL Editor
2. ✅ Verify data appears correctly in Table Editor
3. ✅ Test storage bucket access
4. ✅ Proceed to Task 3: Create TypeScript type definitions

---

## Migration File Details

**File:** `supabase/migrations/008_create_reviews_table.sql`
**Commit:** f75a82b
**Date:** 2026-03-25
**Components:**
- Reviews table with 19 columns
- 7 indexes for performance
- 5 RLS policies (1 read, 4 write)
- 1 trigger for updated_at
- 3 sample review articles
- Storage bucket policies

---

**Setup Guide Created:** 2026-03-25
**Migration Committed:** f75a82b

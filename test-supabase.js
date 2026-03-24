// Test Supabase connection and data fetching
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wnyrinifinvgagbtlpwb.supabase.co'
const supabaseKey = 'sb_publishable_LCbzioQaM2XTyJZWDHBTLw_OUEbwM5_'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')

  try {
    // Test 1: Check if we can reach the projects table
    console.log('\n1️⃣ Testing projects table...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', 'akachanlist')

    if (projectsError) {
      console.error('❌ Projects error:', projectsError)
    } else {
      console.log('✅ Projects data:', projects)
    }

    // Test 2: Try the full query with joins
    console.log('\n2️⃣ Testing full query with joins...')
    const { data: fullData, error: fullError } = await supabase
      .from('projects')
      .select(`
        id,
        slug,
        name_zh,
        name_ja,
        description_zh,
        description_ja,
        categories (
          id,
          slug,
          name_zh,
          name_ja,
          icon,
          sort_order,
          subcategories (
            id,
            slug,
            name_zh,
            name_ja,
            description_zh,
            description_ja,
            sort_order,
            items (
              id,
              name_zh,
              name_ja,
              description_zh,
              description_ja,
              priority,
              quantity_zh,
              quantity_ja,
              notes_zh,
              notes_ja,
              sort_order
            )
          )
        )
      `)
      .eq('slug', 'akachanlist')
      .single()

    if (fullError) {
      console.error('❌ Full query error:', fullError)
      console.error('Error details:', JSON.stringify(fullError, null, 2))
    } else {
      console.log('✅ Full query successful!')
      console.log('Categories count:', fullData.categories?.length || 0)

      // Count total items
      let totalItems = 0
      fullData.categories?.forEach(cat => {
        cat.subcategories?.forEach(sub => {
          totalItems += sub.items?.length || 0
        })
      })
      console.log('Total items:', totalItems)
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testConnection()

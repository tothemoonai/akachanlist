# Akachan List

A multilingual birth preparation checklist app inspired by Japan's赤ちゃん本舗 (Akachan Honpo). Built with React, TypeScript, and Supabase.

## Features

- **Multilingual Support** - Chinese (Simplified) and Japanese
- **Main Checklist** - Comprehensive birth preparation items organized by category
- **User Authentication** - Magic link email login and password authentication
- **Personal Lists** - Create and manage multiple custom checklists
- **Shopping List** - Unified view of items across all personal lists
- **Purchase Tracking** - Mark items as purchased and reset tracking
- **List Sharing** - Share your checklist with others via a unique link
- **Reviews** - Product reviews and recommendations
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **State Management**: React Context, TanStack Query
- **Backend**: Supabase (PostgreSQL, Auth)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/tothemoonai/akachanlist.git
cd akachanlist

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run the Supabase migrations in order:

1. `001_initial_schema.sql` - Core schema
2. `002_insert_data.sql` - Checklist items data
3. `003_add_user_lists.sql` - User lists functionality
4. `004_add_notes_and_icons.sql` - Notes and icons
5. `005_fix_icons.sql` - Icon fixes
6. `006_update_category_icons_to_png.sql` - Category icons
7. `007_update_item_icons_to_png.sql` - Item icons
8. `008_create_reviews_table.sql` - Reviews feature
9. `009_add_view_count_to_lists.sql` - View tracking

Or use the migration script:

```bash
npm run migrate
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Deployment

The app is deployed on Vercel at [https://akachanlist.vercel.app](https://akachanlist.vercel.app).

### Supabase Configuration

After deploying, configure the following in your Supabase project:

1. **Authentication**: Add your deployment URL to allowed redirect URLs
2. **RLS Policies**: Ensure row level security is properly configured

## Project Structure

```
akachanlist/
├── src/
│   ├── components/       # React components
│   │   ├── reviews/      # Review-related components
│   │   └── user/         # User-related components
│   ├── contexts/         # React contexts
│   ├── data/             # Static data
│   ├── pages/            # Page components
│   └── styles/           # CSS files
├── supabase/
│   ├── migrations/       # Database migrations
│   └── scripts/          # Utility scripts
└── public/               # Static assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Inspired by [赤ちゃん本舗 (Akachan Honpo)](https://www.akachan.jp/)
- Built with [Vite](https://vitejs.dev/)
- Auth and database powered by [Supabase](https://supabase.com/)

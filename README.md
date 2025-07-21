# Impact Charter - Business Plan Builder

A collaborative business plan editor built with Next.js, featuring real-time collaboration, Airtable integration, and comprehensive admin tools.

## Features

- **Real-time Collaboration**: Multiple users can edit business plans simultaneously
- **Business Plan Templates**: Pre-structured sections for comprehensive business planning
- **User Management**: Complete admin dashboard for user administration
- **Airtable Integration**: Seamless data storage and retrieval
- **Responsive Design**: Works on desktop and mobile devices
- **Theme Support**: Light and dark mode support

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Airtable
- **Real-time**: Liveblocks for collaborative editing
- **Authentication**: Custom user management system
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Airtable account and API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd impact-charter-app
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id

# Liveblocks Configuration (for real-time collaboration)
LIVEBLOCKS_SECRET_KEY=your_liveblocks_secret_key

# Database Configuration (if using Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── plan/              # Business plan editor pages
│   └── ...
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── lib/                  # Utility functions and configurations
│   ├── airtable.ts       # Airtable client and operations
│   ├── liveblocks.ts     # Real-time collaboration setup
│   └── ...
└── public/               # Static assets
\`\`\`

## Key Components

### Business Plan Editor
- Collaborative text editing with real-time updates
- Section-based organization (Executive Summary, Market Analysis, etc.)
- Progress tracking and completion status
- Auto-save functionality

### Admin Dashboard
- User management and role assignment
- System logs and error tracking
- Airtable connection management
- Bulk operations support

### Real-time Collaboration
- Live cursors and user presence
- Conflict-free collaborative editing
- Activity notifications
- Session management

## API Routes

### Business Plans
- `GET /api/business-plans` - List all business plans
- `POST /api/business-plans` - Create new business plan
- `PUT /api/business-plans/[id]` - Update business plan
- `DELETE /api/business-plans/[id]` - Delete business plan

### User Management
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

### System Administration
- `GET /api/admin/logs` - System logs
- `GET /api/admin/airtable/connection` - Test Airtable connection
- `POST /api/admin/airtable/test` - Validate Airtable setup

## Configuration

### Airtable Setup
1. Create an Airtable base with the following tables:
   - `BusinessPlans` - Store business plan data
   - `Users` - User management
   - `SystemLogs` - Application logs

2. Configure field mappings in `lib/airtable.ts`

### Liveblocks Setup
1. Create a Liveblocks account
2. Set up authentication endpoint
3. Configure room permissions

## Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
Ensure all required environment variables are set in your deployment platform:
- Airtable credentials
- Liveblocks configuration
- Database connections (if applicable)

## Development

### Running Tests
\`\`\`bash
npm run test
\`\`\`

### Building for Production
\`\`\`bash
npm run build
\`\`\`

### Linting
\`\`\`bash
npm run lint
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

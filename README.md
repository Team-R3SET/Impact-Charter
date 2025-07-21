# Business Planning App

A collaborative business plan builder with real-time editing, Airtable integration, and live presence indicators. Built with Next.js, Liveblocks, and Airtable.

## ✨ Features

- **Real-time Collaborative Editing**: Multiple users can edit business plans simultaneously
- **Airtable Integration**: Automatic saving and syncing with your personal Airtable base
- **Live Presence Indicators**: See who's currently editing each section
- **Section-based Organization**: Structured business plan sections (Executive Summary, Market Analysis, etc.)
- **Mark as Complete**: Track completion status and submission for review
- **User Profiles**: Customizable user profiles with avatar support
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Toggle between themes for comfortable editing

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A GitHub account
- A Vercel account
- An Airtable account (free tier works)

### 1. Fork and Clone the Repository

1. **Fork this repository** to your GitHub account by clicking the "Fork" button
2. **Clone your fork** to your local machine:
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/business-planning-app.git
   cd business-planning-app
   \`\`\`

3. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

### 2. Set Up Airtable

#### Create Your Airtable Base

1. **Sign up** for Airtable at [airtable.com](https://airtable.com) (free account works)
2. **Create a new base** called "Business Planning App"
3. **Create the following tables** with these exact names:

**Table 1: Business Plans**
- \`planName\` (Single line text)
- \`createdDate\` (Date)
- \`lastModified\` (Date)
- \`ownerEmail\` (Email)
- \`status\` (Single select: Draft, In Progress, Complete, Submitted for Review)

**Table 2: Business Plan Sections**
- \`planId\` (Single line text)
- \`sectionName\` (Single line text)
- \`sectionContent\` (Long text)
- \`lastModified\` (Date)
- \`modifiedBy\` (Email)
- \`isComplete\` (Checkbox)
- \`submittedForReview\` (Checkbox)
- \`completedDate\` (Date)

**Table 3: User Profiles**
- \`name\` (Single line text)
- \`email\` (Email)
- \`avatar\` (URL)
- \`company\` (Single line text)
- \`role\` (Single line text)
- \`bio\` (Long text)
- \`createdDate\` (Date)
- \`lastModified\` (Date)

#### Get Your Airtable Credentials

1. **Get your Base ID**:
   - Go to your Airtable base
   - Click "Help" → "API documentation"
   - Your Base ID starts with \`app\` (e.g., \`appXXXXXXXXXXXXXX\`)

2. **Create a Personal Access Token**:
   - Go to [airtable.com/create/tokens](https://airtable.com/create/tokens)
   - Click "Create new token"
   - Name it "Business Planning App"
   - Add these scopes:
     - \`data.records:read\`
     - \`data.records:write\`
     - \`schema.bases:read\`
   - Select your base under "Access"
   - Click "Create token"
   - **Copy and save this token** (starts with \`pat\`)

### 3. Set Up Liveblocks (Real-time Collaboration)

1. **Sign up** at [liveblocks.io](https://liveblocks.io) (free tier available)
2. **Create a new project**
3. **Get your API keys**:
   - Go to your project dashboard
   - Copy the **Public Key** (starts with \`pk_\`)
   - Copy the **Secret Key** (starts with \`sk_\`)

### 4. Configure Environment Variables

1. **Create a \`.env.local\` file** in your project root:
   \`\`\`bash
   # Airtable Configuration
   AIRTABLE_API_KEY=your_personal_access_token_here
   AIRTABLE_BASE_ID=your_base_id_here
   
   # Liveblocks Configuration
   NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your_liveblocks_public_key_here
   LIVEBLOCKS_SECRET_KEY=your_liveblocks_secret_key_here
   \`\`\`

2. **Replace the placeholder values** with your actual credentials

### 5. Test Locally

1. **Start the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Open your browser** to [http://localhost:3000](http://localhost:3000)

3. **Test the features**:
   - Create a new business plan
   - Try real-time editing
   - Check if data saves to Airtable
   - Test the "Mark as Complete" functionality

### 6. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code** to GitHub:
   \`\`\`bash
   git add .
   git commit -m "Initial setup with environment variables"
   git push origin main
   \`\`\`

2. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

3. **Import your repository**:
   - Click "New Project"
   - Select your forked repository
   - Click "Import"

4. **Configure environment variables**:
   - In the deployment settings, add all your environment variables:
     - \`AIRTABLE_API_KEY\`
     - \`AIRTABLE_BASE_ID\`
     - \`NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY\`
     - \`LIVEBLOCKS_SECRET_KEY\`

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at \`https://your-app-name.vercel.app\`

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   \`\`\`bash
   npm i -g vercel
   \`\`\`

2. **Login to Vercel**:
   \`\`\`bash
   vercel login
   \`\`\`

3. **Deploy**:
   \`\`\`bash
   vercel --prod
   \`\`\`

4. **Add environment variables**:
   \`\`\`bash
   vercel env add AIRTABLE_API_KEY
   vercel env add AIRTABLE_BASE_ID
   vercel env add NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY
   vercel env add LIVEBLOCKS_SECRET_KEY
   \`\`\`

5. **Redeploy** to apply environment variables:
   \`\`\`bash
   vercel --prod
   \`\`\`

## 🔧 Configuration

### User Settings Page

Once deployed, users can configure their own Airtable credentials:

1. **Navigate to** \`/settings\` in your deployed app
2. **Enter your personal Airtable credentials**
3. **Test the connection** to verify everything works
4. **Save settings** to enable personal data storage

This allows each user to connect their own Airtable base while using your deployed app.

### Customization Options

#### Modify Business Plan Sections

Edit \`lib/business-plan-sections.ts\` to customize the default sections:

\`\`\`typescript
export const businessPlanSections = [
  { name: "Executive Summary", description: "Overview of your business" },
  { name: "Market Analysis", description: "Research your target market" },
  // Add your custom sections here
]
\`\`\`

#### Update Branding

- **Logo**: Replace files in \`public/\` directory
- **Colors**: Modify \`tailwind.config.ts\`
- **App Name**: Update \`app/layout.tsx\` and \`package.json\`

## 🐛 Troubleshooting

### Common Issues

#### 1. "Airtable request failed: 404"
**Problem**: Table names don't match exactly
**Solution**: 
- Ensure table names are exactly: "Business Plans", "Business Plan Sections", "User Profiles"
- Check for extra spaces or different capitalization

#### 2. "Failed to test connection"
**Problem**: Invalid Airtable credentials
**Solution**:
- Verify your Personal Access Token starts with \`pat\`
- Confirm your Base ID starts with \`app\`
- Check token permissions include read/write access

#### 3. Real-time collaboration not working
**Problem**: Liveblocks configuration issue
**Solution**:
- Verify \`NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY\` is set correctly
- Ensure \`LIVEBLOCKS_SECRET_KEY\` is configured in Vercel
- Check Liveblocks project settings

#### 4. Environment variables not working in production
**Problem**: Variables not set in Vercel
**Solution**:
- Go to Vercel dashboard → Project → Settings → Environment Variables
- Add all required variables
- Redeploy the application

#### 5. Build errors during deployment
**Problem**: TypeScript or dependency issues
**Solution**:
\`\`\`bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run build
\`\`\`

### Debug Mode

Enable debug logging by adding to your \`.env.local\`:
\`\`\`bash
DEBUG=true
NODE_ENV=development
\`\`\`

### Getting Help

1. **Check the browser console** for error messages
2. **Review Vercel deployment logs** in the dashboard
3. **Test API endpoints** directly:
   - \`/api/business-plans\` - Should return business plans
   - \`/api/user-profile\` - Should return user profile data

## 🔒 Security Best Practices

### Environment Variables
- **Never commit** \`.env.local\` to version control
- **Use different credentials** for development and production
- **Regularly rotate** your API keys

### Airtable Security
- **Limit token permissions** to only required scopes
- **Use separate bases** for different environments
- **Monitor API usage** in Airtable dashboard

### Vercel Security
- **Enable branch protection** in GitHub
- **Use preview deployments** for testing
- **Monitor deployment logs** for suspicious activity

## 🚀 Advanced Features

### Custom Authentication

To add user authentication, integrate with:
- **NextAuth.js** for OAuth providers
- **Clerk** for complete auth solution
- **Supabase Auth** for backend integration

### Database Alternatives

While Airtable is the default, you can integrate:
- **Supabase** for PostgreSQL
- **PlanetScale** for MySQL
- **MongoDB Atlas** for document storage

### Additional Integrations

Consider adding:
- **Email notifications** via SendGrid/Resend
- **File uploads** via Vercel Blob/Cloudinary
- **Analytics** via Vercel Analytics
- **Monitoring** via Sentry

## 📝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: \`git checkout -b feature/amazing-feature\`
3. **Commit your changes**: \`git commit -m 'Add amazing feature'\`
4. **Push to the branch**: \`git push origin feature/amazing-feature\`
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** for the amazing React framework
- **Liveblocks** for real-time collaboration
- **Airtable** for the flexible database
- **Vercel** for seamless deployment
- **Tailwind CSS** for beautiful styling

---

**Need help?** Open an issue or reach out to the community!

**Happy building!** 🚀

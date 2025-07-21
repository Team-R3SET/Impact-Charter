# Business Planning App

A collaborative business plan builder with real-time editing, Airtable integration, and live presence indicators. Built with Next.js, Liveblocks, and Airtable.

## ✨ Features

-   **Real-time Collaborative Editing**: Multiple users can edit business plans simultaneously.
-   **Airtable Integration**: Automatic saving and syncing with your personal Airtable base.
-   **Live Presence Indicators**: See who's currently editing each section.
-   **Section-based Organization**: Structured business plan sections (Executive Summary, Market Analysis, etc.).
-   **Mark as Complete**: Track completion status and submission for review.
-   **User Profiles**: Customizable user profiles with avatar support.
-   **Responsive Design**: Works seamlessly on desktop and mobile devices.
-   **Dark/Light Mode**: Toggle between themes for comfortable editing.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
-   Node.js 18+ installed
-   A GitHub account
-   A Vercel account
-   An Airtable account (free tier works)

➡️ **Environment Variables**
This project requires several environment variables to function. You will need to add these in your Vercel project settings (Project → Settings → Environment Variables). See the in-app `/settings` page or the sections below for the required keys.

### 1. Fork and Clone the Repository

1.  **Fork this repository** to your GitHub account.
2.  **Clone your fork** to your local machine:
  \`\`\`bash
  git clone https://github.com/YOUR_USERNAME/business-planning-app.git
  cd business-planning-app
  \`\`\`
3.  **Install dependencies**:
  \`\`\`bash
  npm install
  \`\`\`

### 2. Set Up Airtable

#### Create Your Airtable Base

1.  **Sign up** for Airtable at [airtable.com](https://airtable.com).
2.  **Create a new base** called "Business Planning App".
3.  **Create the following tables** with these exact names:
  -   `Business Plans`
  -   `Business Plan Sections`
  -   `User Profiles`

  For the required fields in each table, please refer to `lib/airtable.ts`.

#### Get Your Airtable Credentials

1.  **Get your Base ID**: Go to your Airtable base, click "Help" → "API documentation". Your Base ID starts with `app`.
2.  **Create a Personal Access Token**: Go to [airtable.com/create/tokens](https://airtable.com/create/tokens), create a new token with `data.records:read`, `data.records:write`, and `schema.bases:read` scopes, and grant it access to your base.

### 3. Set Up Liveblocks (Real-time Collaboration)

1.  **Sign up** at [liveblocks.io](https://liveblocks.io).
2.  **Create a new project**.
3.  **Get your API keys**: From your project dashboard, copy the **Public Key** (starts with `pk_`) and the **Secret Key** (starts with `sk_`).

### 4. Deploy to Vercel

1.  **Push your code** to your forked GitHub repository.
2.  Go to [vercel.com](https://vercel.com) and import your repository to create a new project.
3.  **Configure Environment Variables**: In the Vercel project settings, add the following variables:
  -   `AIRTABLE_API_KEY`: Your Airtable Personal Access Token.
  -   `AIRTABLE_BASE_ID`: Your Airtable Base ID.
  -   `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY`: Your Liveblocks Public Key.
  -   `LIVEBLOCKS_SECRET_KEY`: Your Liveblocks Secret Key.
4.  **Deploy**. Vercel will build and deploy your application.

## 🔧 Configuration

The application is configured primarily through environment variables. Once deployed, individual users can also navigate to the `/settings` page to configure their personal Airtable credentials if they wish to connect to their own base.

## 🐛 Troubleshooting

### Real-time collaboration not working

-   **Problem**: Liveblocks configuration issue.
-   **Solution**:
  -   Verify your Liveblocks Public Key is set correctly in your Vercel environment variables.
  -   Ensure your Liveblocks Secret Key is also set correctly.
  -   Check the browser console for any Liveblocks-related errors.

### Airtable connection failed

-   **Problem**: Invalid Airtable credentials or incorrect table names.
-   **Solution**:
  -   Double-check your `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` in Vercel.
  -   Ensure your Airtable table and field names match what is expected in the application code (`lib/airtable.ts`).

## 🔒 Security Best Practices

-   **Never commit** `.env.local` files or other files containing secrets to version control.
-   Use Vercel's Environment Variables UI to manage all keys for production and preview deployments.
-   Regularly rotate your API keys and tokens.

---

**Happy building!** 🚀

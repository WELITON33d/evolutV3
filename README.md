<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Product OS - Entrepreneurial Command Center

A high-performance personal dashboard for organizing SaaS and physical product ideas, featuring a block-based editor, strategic tracking, and automatic project timelines.

View your app in AI Studio: https://ai.studio/apps/drive/1-cD5yBwkaQ9hYZepyfVbh29AYMtaoUIB

## Setup & Run Locally

**Prerequisites:**  Node.js

### 1. Installation

Install the dependencies:

```bash
npm install
```

### 2. Supabase Configuration

This project uses Supabase for the database and authentication.

1.  Create a new project on [Supabase](https://supabase.com).
2.  Go to the **SQL Editor** in your Supabase dashboard.
3.  Copy the content of `supabase/schema.sql` and run it to set up the tables and security policies.
4.  Get your project URL and Anon Key from **Project Settings > API**.

### 3. Environment Variables

Rename `.env.example` to `.env.local` (or create it) and fill in your keys:

```env
GEMINI_API_KEY=your_gemini_key_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the App

Start the development server:

```bash
npm run dev
```

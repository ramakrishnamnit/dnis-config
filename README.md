# HSBC Config Opus - Configuration Management System

## Project info

**URL**: https://lovable.dev/projects/2ca0aed7-f77a-4b91-a1f8-022983eb6b8a

## Overview

A modern, metadata-driven configuration management system built for enterprise use. Features include dynamic tables, smart filtering with AND/OR logic, bulk operations, audit trails, and more.

## Key Features

### ⚡ Smart Filter (NEW!)
Advanced filtering with AND/OR logic operations. Create complex queries across multiple columns without SQL knowledge.
- 📖 [Smart Filter Feature Documentation](./SMART_FILTER_FEATURE.md)
- 📚 [Quick Start Guide](./SMART_FILTER_GUIDE.md)

### 🗃️ Configuration Management
- Metadata-driven dynamic tables
- Region-based configuration (Country + Business Unit)
- Real-time data editing with optimistic concurrency control
- Bulk upload via Excel
- Template download with metadata

### 🔍 Search & Filter
- Global search across all columns
- Smart filter with AND/OR conditions
- Column-specific filters
- Multiple filter operators (equals, contains, greater than, etc.)

### 📊 Data Management
- Add/Edit/View records
- Batch operations
- Edit reason tracking
- Version control with OCC
- Excel import/export

### 🎵 Audio Asset Management
- Upload and manage audio files
- Play audio in-browser
- Metadata management
- Batch operations

### 📜 Audit Trail
- Complete change history
- User tracking
- Edit reason logging
- Version comparison

## Documentation

- [Quick Start](./QUICK_START.md)
- [Features Summary](./FEATURES_SUMMARY.md)
- [Backend Integration](./BACKEND_INTEGRATION.md)
- [Smart Filter Guide](./SMART_FILTER_GUIDE.md)
- [Editing Guide](./EDITING_GUIDE.md)

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2ca0aed7-f77a-4b91-a1f8-022983eb6b8a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/2ca0aed7-f77a-4b91-a1f8-022983eb6b8a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

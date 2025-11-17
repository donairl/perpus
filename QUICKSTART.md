# Quick Start Guide

## Installation

Run this command to install dependencies:

```bash
npm install
```

This will install:
- React 18.2.0
- React Router DOM 6.20.0
- TypeScript 5.2.2
- Vite 5.0.8
- And other dev dependencies

## Running the Application

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Login

**Demo Mode**: Enter any username and password to login

Example:
- Username: `admin`
- Password: `password`

## Features

### 📊 Dashboard
- View library statistics
- Track borrowed books
- Monitor active members
- See recent activities

### 📚 Books
- Browse book collection (8 sample books included)
- Search by title, author, or ISBN
- Filter by category (All, Fiction, Fantasy, Romance, Non-Fiction)
- View book status (Available, Borrowed, Reserved)

### 👥 Membership
- View all members (6 sample members included)
- Search by name or email
- Filter by status (All, Active, Expired)
- See membership types (Basic, Premium, VIP)

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Styling**: Pure CSS with gradients and animations

## Project Structure

```
perpus/
├── src/
│   ├── components/
│   │   ├── Layout.tsx        # Sidebar navigation
│   │   └── Layout.css
│   ├── pages/
│   │   ├── Login.tsx         # Login page
│   │   ├── Dashboard.tsx     # Main dashboard
│   │   ├── Books.tsx         # Book collection
│   │   └── Membership.tsx    # Member management
│   ├── App.tsx               # Main app with routing
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Next Steps

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open browser to `http://localhost:5173`
4. Login with any credentials
5. Explore the features!

Enjoy your library management system! 📖
# Perpus - Library Management System

A modern, responsive library book management system built with React, TypeScript, and Vite.

## Features

- **Login Page**: Secure authentication with JWT tokens
- **Dashboard**: Overview of library statistics and recent activities
- **Book Collection**: Browse, search, and filter books by category
- **Borrow Books**: Members can borrow available books with configurable due dates
- **Return Books**: Process book returns with late fee tracking
- **Membership Management**: Manage library members and their subscriptions
- **Transaction History**: Track all borrow and return operations

## Getting Started

### Backend Setup

1. Install Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

2. Seed the database with sample data:

```bash
python seed_data.py
```

3. Start the FastAPI server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Install Node.js dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **CSS3** - Styling with gradients and animations

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL ORM
- **SQLite** - Database
- **Pydantic** - Data validation
- **JWT** - Authentication

## Demo Credentials

For the demo version, use any username and password to login.

## Project Structure

```
perpus/
├── src/
│   ├── components/
│   │   ├── Layout.tsx        # Main layout with sidebar
│   │   └── Layout.css
│   ├── pages/
│   │   ├── Login.tsx         # Login page
│   │   ├── Login.css
│   │   ├── Dashboard.tsx     # Dashboard with stats
│   │   ├── Dashboard.css
│   │   ├── Books.tsx         # Book collection
│   │   ├── Books.css
│   │   ├── Membership.tsx    # Member management
│   │   └── Membership.css
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Features Overview

### Dashboard
- Total books count
- Borrowed books statistics
- Active members count
- Overdue books tracking
- Recent activity feed

### Books
- Search by title, author, or ISBN
- Filter by category (Fiction, Fantasy, Romance, Non-Fiction)
- View book status (Available, Borrowed, Reserved)
- Track number of copies

### Membership
- Member directory with search
- Filter by status (Active, Expired)
- View membership types (Basic, Premium, VIP)
- Track borrowed books per member
- Contact information management

## License

MIT
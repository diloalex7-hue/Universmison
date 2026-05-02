# Univers Maison

A premium e-commerce platform for luxury furniture and home decor. Built with a modern tech stack focusing on performance, scalability, and user experience.

## 🚀 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS & Framer Motion for animations
- **Build Tool**: Vite
- **Backend/Database**: Supabase (PostgreSQL + Auth + Storage)
- **Mobile Support**: Capacitor (iOS & Android)
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/diloalex7-hue/Universmison.git
   cd univers-maison
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your Supabase credentials.
   ```bash
   cp .env.example .env
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 📱 Mobile Development

This project uses Capacitor to bridge the web app to mobile platforms.

- **Android**: `npx cap run android`
- **iOS**: `npx cap run ios`

## 🏗️ Building for Production

To create a production build, run:
```bash
npm run build
```
The output will be in the `dist` directory.

## 🧪 Testing & Linting

- **Test**: `npm run test`
- **Lint**: `npm run lint`

---

Built with ❤️ by the Univers Maison Team.
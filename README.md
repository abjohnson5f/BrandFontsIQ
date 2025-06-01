# BrandFontsIQ v15 - Performance Optimized Stack

## Stack Overview

- **Next.js 15** - Latest with Partial Prerendering
- **React 19** - New hooks and performance improvements
- **Turbopack** - Rust-based bundler (10x faster)
- **tRPC** - End-to-end typesafe APIs
- **Drizzle ORM** - Lightweight, TypeScript-first ORM
- **Edge Runtime** - Deploy closer to users
- **Supabase** - Backend as a Service
- **OpenAI** - Company identification

## Performance Features

1. **Turbopack** - Enabled by default in dev mode
2. **Partial Prerendering** - Best of static + dynamic
3. **React Compiler** - Auto-optimizations (experimental)
4. **Edge Runtime** - For API routes that need speed
5. **Streaming** - Built-in with React 19

## Project Structure

```
src/
├── app/              # Next.js App Router
├── components/       # React components
├── lib/             
│   ├── db/          # Drizzle schema & queries
│   ├── trpc/        # tRPC router & procedures
│   └── services/    # Business logic
└── types/           # TypeScript types
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Build for production
npm run build
```

## Key Differences from v14

1. **React 19** - Use new `use()` hook for data fetching
2. **Turbopack** - Instant HMR and faster builds
3. **Drizzle** - Much faster than Prisma
4. **tRPC** - Type-safe API calls without GraphQL complexity
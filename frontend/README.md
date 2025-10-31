# Shopsense Frontend

E-commerce frontend with smooth animations, using view transition API, React's canary `<ViewTransition>` component, and Framer Motion.

## Stack
- Next.js 16 
- Framer Motion
- TailwindCSS 4
- TanStack (React) Query
- Biome

## Running
```bash
bun install
bun dev      # start dev server (http://localhost:3000)
bun build    # production build
bun start    # run production build
bun lint     # check code
bun format   # format code
```

## Structure
- `src/app/` - Next.js pages & layouts
- `src/components/` - React components (UI + feature)
- `src/hooks/` - Custom hooks
- `src/lib/` - Utilities, context, services

## Env
`NEXT_PUBLIC_API_URL`: Backend API URL

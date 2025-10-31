# tRPC API Server

A modern, type-safe API server built with tRPC, Express, and TypeScript.

## Features

- **Type-safe API** with tRPC
- **Express** server with CORS enabled
- **Zod** validation for inputs
- **Hot reload** in development with tsx
- **TypeScript** for full type safety

## Getting Started

### Install dependencies

```bash
npm install
```

### Development

Start the server in development mode with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Production

Run the compiled server:

```bash
npm start
```

## API Endpoints

### Health Check

- **GET** `/health` - Server health check

### tRPC Endpoints

All tRPC procedures are available at `/trpc`:

#### Queries

- `greeting` - Get a greeting message
  - Input: `{ name?: string }`
  - Output: `{ message: string, timestamp: string }`

- `getUser` - Get user information
  - Input: `{ id: string }`
  - Output: User object

#### Mutations

- `createPost` - Create a new post
  - Input: `{ title: string, content: string }`
  - Output: `{ success: boolean, post: object }`

## Using the Client

The tRPC client can be imported and used in your Neutralino app:

```typescript
import { trpc } from './api/src/client';

// Query example
const greeting = await trpc.greeting.query({ name: 'John' });
console.log(greeting.message); // "Hello John!"

// Mutation example
const result = await trpc.createPost.mutate({
  title: 'My First Post',
  content: 'This is the content'
});
```

## Project Structure

```
api/
├── src/
│   ├── server.ts    # Express server with tRPC
│   ├── router.ts    # tRPC router with all procedures
│   ├── trpc.ts      # tRPC initialization
│   └── client.ts    # tRPC client for frontend
├── package.json
└── tsconfig.json
```

## Adding New Procedures

Edit [src/router.ts](src/router.ts) to add new queries or mutations:

```typescript
export const appRouter = router({
  // Add your new procedure here
  myNewQuery: publicProcedure
    .input(z.object({ /* validation schema */ }))
    .query(({ input }) => {
      // Your logic here
    }),
});
```

The client will automatically have type-safe access to your new procedures!

# deen.page

**Discover what the Ummah is building** — a directory to find Muslim builders and Islamic projects, discover work, and get discovered.

This repository is **open source**. You are welcome to use it, learn from it, and contribute improvements.

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com) & [DaisyUI](https://daisyui.com)
- [Better Auth](https://www.better-auth.com) (X/Twitter)
- [MongoDB](https://www.mongodb.com) via [Mongoose](https://mongoosejs.com)

## Getting started

**Requirements:** Node.js 20+ and a MongoDB database.

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables (create `.env.local` in the project root):

   | Variable | Purpose |
   |----------|---------|
   | `MONGO_URI` | MongoDB connection string |
   | `NEXT_PUBLIC_APP_URL` | Public site URL (e.g. `http://localhost:3000` in development) |
   | `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET` | OAuth for Better Auth |
   | `TWITTER_API_KEY` | Twitter API (admin features) |
   | `ADMIN_EMAIL` | Admin access |

3. Run the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

## Contributing

Issues and pull requests are welcome. For larger changes, opening an issue first helps align on direction.

## License

[MIT](LICENSE)

---

Built with [Next.js](https://nextjs.org). Deploy on [Vercel](https://vercel.com) with the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying).

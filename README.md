![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/UnHeardCoder/steam-item-tracker-app-v1?utm_source=oss&utm_medium=github&utm_campaign=UnHeardCoder%2Fsteam-item-tracker-app-v1&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

# Steam Item Tracker

A Next.js application that helps you track and monitor Steam items' prices and market trends in real-time.

## Features

- Track Steam items' prices
- Monitor market trends
- Real-time price updates
- Historical price data visualization

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/UnHeardCoder/steam-item-tracker-app-v1.git
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up your environment variables:
Create a `.env` file in the root directory and add your required environment variables.

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Drizzle ORM
- PostgreSQL

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:seed` - Seed the database
- `pnpm price-updates` - Run price update script

## License

MIT

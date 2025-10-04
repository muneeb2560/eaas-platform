This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# EaaS - Evaluation as a Service Platform

## 🚀 Quick Start

EaaS is a comprehensive platform for automated AI model evaluation with custom rubrics and real-time scoring.

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Supabase CLI
- Redis (for background workers)

### Installation

1. **Clone and setup the project:**
   ```bash
   git clone <repository-url>
   cd my-nextjs-app
   npm install
   ```

2. **Install Python dependencies:**
   ```bash
   cd api
   pip install -r requirements.txt
   ```

3. **Setup Supabase:**
   ```bash
   npx supabase init
   npx supabase start
   npx supabase db reset
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

5. **Start the development servers:**
   ```bash
   # Frontend (Terminal 1)
   npm run dev

   # Python API (Terminal 2)
   cd api && python main.py

   # Redis (Terminal 3)
   redis-server
   ```

### First Steps

1. Open [http://localhost:3000](http://localhost:3000)
2. Create your first experiment
3. Upload a CSV dataset
4. Design a custom rubric
5. Run your first evaluation

## 📁 Project Structure

```
my-nextjs-app/
├── src/               # Next.js frontend
│   ├── app/          # App router pages
│   ├── components/   # Reusable UI components
│   ├── lib/          # Utilities and integrations
│   └── types/        # TypeScript definitions
├── api/              # Python FastAPI backend
│   ├── routes/       # API endpoints
│   ├── services/     # Business logic
│   ├── workers/      # Background processing
│   └── models/       # Data models
├── supabase/         # Database migrations
├── data/             # Sample datasets and templates
├── tests/            # Test suites
└── docs/             # Documentation
```

## 🔧 Key Features

- **Custom Rubrics**: Create detailed evaluation criteria
- **Automated Processing**: Background evaluation with real-time progress
- **Dashboard Analytics**: Comprehensive performance insights
- **Experiment Tracking**: Version control for evaluations
- **Multi-format Support**: CSV upload with flexible schemas

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Detailed installation instructions
- [API Reference](./API.md) - Complete API documentation
- [Architecture](./architecture/) - System design documentation
- [Contributing](./CONTRIBUTING.md) - Development guidelines

## 🛠️ Development

### Tech Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Python FastAPI, Celery, Redis
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Python API
REDIS_URL=redis://localhost:6379/0
PYTHON_API_URL=http://localhost:8000
```

## 🚀 Deployment

For localhost development only. Production deployment guides will be added in future releases.

## 📖 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📞 Support

For questions and support, please open an issue in the repository.

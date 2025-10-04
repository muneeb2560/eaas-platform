# EaaS Setup Guide

## Detailed Installation Instructions

### System Requirements

- **Node.js**: Version 18.0 or higher
- **Python**: Version 3.9 or higher
- **Redis**: Version 6.0 or higher
- **Git**: Latest version
- **Operating System**: macOS, Linux, or Windows with WSL2

### Step-by-Step Setup

#### 1. Environment Preparation

**Install Node.js:**
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Or download from https://nodejs.org/
```

**Install Python:**
```bash
# macOS with Homebrew
brew install python@3.9

# Ubuntu/Debian
sudo apt update
sudo apt install python3.9 python3.9-pip

# Windows - download from python.org
```

**Install Redis:**
```bash
# macOS
brew install redis

# Ubuntu/Debian
sudo apt install redis-server

# Windows - use Redis for Windows or WSL2
```

#### 2. Project Setup

**Clone Repository:**
```bash
git clone <your-repository-url>
cd my-nextjs-app
```

**Install Frontend Dependencies:**
```bash
npm install
# or
yarn install
```

**Install Backend Dependencies:**
```bash
cd api
python -m pip install --upgrade pip
pip install -r requirements.txt
cd ..
```

#### 3. Database Configuration

**Install Supabase CLI:**
```bash
npm install -g @supabase/cli
# or
brew install supabase/tap/supabase
```

**Initialize Supabase:**
```bash
supabase init
supabase start
```

**Run Migrations:**
```bash
supabase db reset
```

#### 4. Environment Configuration

**Create Environment Files:**
```bash
# Frontend environment
cp .env.example .env.local

# Backend environment  
cp api/.env.example api/.env
```

**Configure .env.local:**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_supabase_start
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase_start

# API Configuration
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
```

**Configure api/.env:**
```env
# Database
SUPABASE_URL=http://localhost:54321
SUPABASE_KEY=your_service_role_key

# Redis
REDIS_URL=redis://localhost:6379/0

# API Settings
DEBUG=true
API_HOST=0.0.0.0
API_PORT=8000
```

#### 5. Start Development Services

**Terminal 1 - Redis Server:**
```bash
redis-server
# Should show: Ready to accept connections
```

**Terminal 2 - Supabase (if not already running):**
```bash
supabase start
# Should show all services started
```

**Terminal 3 - Python API:**
```bash
cd api
python main.py
# Should show: EaaS Python Worker API starting up...
# Server running on http://0.0.0.0:8000
```

**Terminal 4 - Next.js Frontend:**
```bash
npm run dev
# Should show: Ready in X ms
# Local: http://localhost:3000
```

### Verification

1. **Check Frontend:** Open http://localhost:3000
2. **Check API:** Open http://localhost:8000/docs
3. **Check Supabase:** Open http://localhost:54323
4. **Check Redis:** Run `redis-cli ping` (should return PONG)

### Common Issues

#### Port Conflicts
If ports are in use, update the configurations:
- Next.js: Change port with `npm run dev -- -p 3001`
- Python API: Update `API_PORT` in api/.env
- Supabase: Update ports in supabase/config.toml

#### Permission Issues
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Fix Python permissions
python -m pip install --user --upgrade pip
```

#### Database Connection Issues
```bash
# Reset Supabase
supabase stop
supabase start
supabase db reset
```

#### Redis Connection Issues
```bash
# Restart Redis
brew services restart redis
# or
sudo systemctl restart redis
```

### Development Workflow

1. **Daily Startup:**
   ```bash
   # Start all services
   supabase start
   redis-server &
   cd api && python main.py &
   npm run dev
   ```

2. **Code Changes:**
   - Frontend changes auto-reload
   - Python API restarts automatically with uvicorn reload
   - Database changes require migration

3. **Database Changes:**
   ```bash
   # Create new migration
   supabase migration new your_migration_name
   
   # Apply migrations
   supabase db reset
   ```

### Next Steps

After successful setup:
1. Read the [API Documentation](./API.md)
2. Explore sample datasets in `data/sample-datasets/`
3. Try creating your first experiment
4. Review the [Architecture Documentation](./architecture/)

### Troubleshooting

For additional help:
1. Check the [GitHub Issues]()
2. Review error logs in each terminal
3. Verify all environment variables are set
4. Ensure all services are running on correct ports"
# Database Setup Guide

## Current Status

- ✅ Backend dependencies installed
- ✅ Prisma schema defined (12 models)
- ✅ Environment variables configured
- ⚠️ Database connection needed
- ⚠️ Migrations not yet applied

## 🚀 Quick Setup Options

### Option 1: Supabase (Cloud - Recommended - 5 minutes)

**Why Supabase:**
- Free tier: 500MB database
- No local installation needed
- Includes database UI
- Production-ready

**Steps:**

1. **Create Supabase account**
   ```bash
   # Go to: https://supabase.com
   # Click "Start your project" → Sign up with GitHub
   ```

2. **Create new project**
   - Organization: Create new or select existing
   - Name: `viajero-conectado`
   - Database Password: Generate a strong one (save it!)
   - Region: Choose closest to you (e.g., South America)
   - Click "Create new project" (wait ~2 minutes)

3. **Get connection string**
   - Go to Project Settings (⚙️ icon bottom left)
   - Click "Database" in left sidebar
   - Scroll to "Connection string" section
   - Copy "URI" connection string (should look like):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```

4. **Update your .env file**
   ```bash
   cd apps/backend
   # Edit .env and replace DATABASE_URL with your Supabase connection string
   ```

5. **Run migrations**
   ```bash
   cd apps/backend
   pnpm prisma generate
   pnpm prisma migrate dev --name init
   ```

6. **Verify**
   ```bash
   # Start backend
   pnpm dev

   # In another terminal, test health endpoint
   curl http://localhost:4000/api/v1/health
   ```

---

### Option 2: Local PostgreSQL

**Requirements:**
- PostgreSQL 15+ installed
- PostgreSQL service running

**For Ubuntu/Debian:**

```bash
# 1. Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 2. Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 3. Check it's running
sudo systemctl status postgresql

# 4. Create database and user
sudo -u postgres psql

# Inside PostgreSQL prompt:
CREATE DATABASE viajero_conectado;
CREATE USER viajero_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE viajero_conectado TO viajero_user;
\q

# 5. Update .env
cd apps/backend
# Edit DATABASE_URL to:
# postgresql://viajero_user:secure_password@localhost:5432/viajero_conectado?schema=public

# 6. Run migrations
pnpm prisma generate
pnpm prisma migrate dev --name init

# 7. Start backend
pnpm dev
```

**For macOS:**

```bash
# 1. Install PostgreSQL
brew install postgresql@15

# 2. Start PostgreSQL service
brew services start postgresql@15

# 3. Create database
createdb viajero_conectado

# 4. Update .env (use default postgres user)
cd apps/backend
# DATABASE_URL="postgresql://postgres@localhost:5432/viajero_conectado?schema=public"

# 5. Run migrations
pnpm prisma generate
pnpm prisma migrate dev --name init

# 6. Start backend
pnpm dev
```

**For Windows:**

1. Download PostgreSQL installer: https://www.postgresql.org/download/windows/
2. Run installer (remember your postgres password!)
3. Use pgAdmin 4 (included) or command line:
   ```cmd
   # Open CMD as Administrator
   cd "C:\Program Files\PostgreSQL\15\bin"

   # Create database
   psql -U postgres
   CREATE DATABASE viajero_conectado;
   \q
   ```
4. Update `.env` with your password
5. Run migrations from Git Bash or PowerShell:
   ```bash
   cd apps/backend
   pnpm prisma generate
   pnpm prisma migrate dev --name init
   ```

---

### Option 3: Railway (Cloud - Alternative)

```bash
# 1. Go to: https://railway.app
# 2. Sign up with GitHub
# 3. Click "New Project" → "Provision PostgreSQL"
# 4. Click on PostgreSQL service → "Connect" tab
# 5. Copy "Postgres Connection URL"
# 6. Update .env with Railway connection string
# 7. Run migrations as in Option 1 step 5
```

---

### Option 4: Neon (Cloud - Serverless)

```bash
# 1. Go to: https://neon.tech
# 2. Sign up (GitHub recommended)
# 3. Create project: name it "viajero-conectado"
# 4. Copy connection string from dashboard
# 5. Update .env with Neon connection string
# 6. Run migrations as in Option 1 step 5
```

---

## 📊 Database Schema Overview

Once migrations are applied, you'll have **11 tables**:

1. **User** - User accounts (travelers, providers, admins)
2. **RefreshToken** - JWT refresh tokens
3. **Experience** - Travel experiences/activities
4. **Booking** - Experience reservations
5. **Review** - User reviews and ratings
6. **Post** - Social media posts
7. **Like** - Likes on posts
8. **Comment** - Comments on posts
9. **Conversation** - Chat conversations
10. **ConversationParticipant** - Chat participants
11. **Message** - Chat messages

**Total schema size:** 388 lines of Prisma schema
**Relations:** 20+ foreign keys

---

## 🧪 Testing Your Setup

### 1. Check database connection

```bash
cd apps/backend
pnpm prisma studio
# Should open Prisma Studio at http://localhost:5555
# You should see all 11 tables (empty)
```

### 2. Start backend server

```bash
cd apps/backend
pnpm dev
# Should start on http://localhost:4000
```

### 3. Test API endpoints

```bash
# Health check
curl http://localhost:4000/api/v1/health

# Should return: {"status":"ok","timestamp":"..."}

# Register a test user
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "name": "Test User",
    "phone": "+57300123456"
  }'
```

### 4. View API documentation

Open browser to: http://localhost:4000/api/docs

---

## 🐛 Troubleshooting

### Issue: "Prisma binary download failed (403)"

**Solution:** Use a cloud database (Supabase/Railway/Neon) - they work without local Prisma binaries.

### Issue: "PostgreSQL not running"

```bash
# Ubuntu/Debian
sudo systemctl start postgresql

# macOS
brew services start postgresql@15

# Check status
pg_isready -h localhost -p 5432
```

### Issue: "Connection refused" or "authentication failed"

1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in `.env` is correct
3. Check username/password are correct
4. For Supabase: verify connection string includes password

### Issue: "Migration failed"

```bash
# Reset and try again
cd apps/backend
rm -rf prisma/migrations
pnpm prisma migrate dev --name init
```

---

## ✅ Success Checklist

- [ ] Database service running (local or cloud)
- [ ] `.env` has correct DATABASE_URL
- [ ] `pnpm prisma generate` executed successfully
- [ ] `pnpm prisma migrate dev` executed successfully
- [ ] 11 tables visible in Prisma Studio
- [ ] Backend server starts without errors (`pnpm dev`)
- [ ] Health endpoint returns 200 OK
- [ ] Swagger docs accessible at `/api/docs`

---

## 📞 Next Steps After Database Setup

1. **Create seed data (optional)**
   ```bash
   # Create apps/backend/prisma/seed.ts
   pnpm prisma db seed
   ```

2. **Test authentication**
   - Register a test user via API
   - Login and get JWT token
   - Test protected endpoints

3. **Start frontend**
   ```bash
   cd apps/web
   pnpm dev
   # Frontend will connect to backend API
   ```

4. **Test full integration**
   - Register via frontend
   - Create experiences (as provider)
   - Browse experiences (as traveler)

---

**Recommended:** Start with **Option 1 (Supabase)** - fastest and most reliable for development.

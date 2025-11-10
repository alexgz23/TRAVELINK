#!/bin/bash

# Viajero Conectado - Quick Start Script
# Automates backend setup process

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Viajero Conectado - Quick Start     ║${NC}"
echo -e "${CYAN}║   Backend Setup Automation            ║${NC}"
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo ""

# Step 1: Install dependencies
echo -e "${BLUE}[1/5]${NC} Installing dependencies..."
if [ ! -d "node_modules" ]; then
    pnpm install
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${GREEN}✓${NC} Dependencies already installed"
fi
echo ""

# Step 2: Check .env
echo -e "${BLUE}[2/5]${NC} Checking environment variables..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠${NC}  .env file not found, copying from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓${NC} .env file created"
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠  IMPORTANT: Configure your database!${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "Edit ${BLUE}.env${NC} and update ${YELLOW}DATABASE_URL${NC}"
    echo ""
    echo -e "${CYAN}Option 1 - Supabase (Recommended):${NC}"
    echo "  1. Go to https://supabase.com"
    echo "  2. Create new project"
    echo "  3. Get connection string from Settings → Database"
    echo "  4. Update DATABASE_URL in .env"
    echo ""
    echo -e "${CYAN}Option 2 - Local PostgreSQL:${NC}"
    echo "  1. Install PostgreSQL"
    echo "  2. Create database: viajero_conectado"
    echo "  3. Update DATABASE_URL with local connection"
    echo ""
    echo -e "See ${BLUE}../../DATABASE_SETUP.md${NC} for detailed instructions"
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    read -p "Press Enter when DATABASE_URL is configured..."
    echo ""
else
    echo -e "${GREEN}✓${NC} .env file exists"

    # Check if DATABASE_URL is still localhost
    if grep -q "DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432" .env; then
        echo ""
        echo -e "${YELLOW}⚠${NC}  DATABASE_URL is using default localhost value"
        echo -e "${YELLOW}   ${NC} Make sure PostgreSQL is running locally, or update to use cloud database"
        echo ""
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}Setup cancelled${NC}"
            exit 1
        fi
    fi
fi
echo ""

# Step 3: Generate Prisma Client
echo -e "${BLUE}[3/5]${NC} Generating Prisma Client..."
if pnpm prisma generate 2>&1; then
    echo -e "${GREEN}✓${NC} Prisma Client generated"
else
    echo ""
    echo -e "${RED}✗${NC} Failed to generate Prisma Client"
    echo ""
    echo -e "${YELLOW}This usually happens when:${NC}"
    echo "  1. Prisma binaries can't be downloaded (network restriction)"
    echo "  2. Running in restricted environment"
    echo ""
    echo -e "${CYAN}Solution:${NC} Use a cloud database (Supabase/Railway/Neon)"
    echo "  Cloud databases work without local Prisma binaries"
    echo ""
    echo -e "See ${BLUE}../../DATABASE_SETUP.md${NC} for alternatives"
    echo ""
    exit 1
fi
echo ""

# Step 4: Run migrations
echo -e "${BLUE}[4/5]${NC} Running database migrations..."
if pnpm prisma migrate dev --name init 2>&1; then
    echo -e "${GREEN}✓${NC} Migrations applied successfully"
    echo -e "${GREEN}✓${NC} Created 11 database tables"
else
    echo ""
    echo -e "${RED}✗${NC} Failed to run migrations"
    echo ""
    echo -e "${YELLOW}Possible issues:${NC}"
    echo "  1. Can't connect to database (check DATABASE_URL)"
    echo "  2. Database credentials incorrect"
    echo "  3. Database doesn't exist"
    echo ""
    echo -e "${CYAN}Debug:${NC}"
    echo "  • Test connection: pnpm prisma db execute --stdin <<< \"SELECT 1;\""
    echo "  • View Prisma Studio: pnpm prisma studio"
    echo ""
    exit 1
fi
echo ""

# Step 5: Verify setup
echo -e "${BLUE}[5/5]${NC} Verifying setup..."
if [ -f "verify-setup.sh" ]; then
    ./verify-setup.sh
else
    echo -e "${YELLOW}⚠${NC}  verify-setup.sh not found, skipping verification"
fi
echo ""

# Success!
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ Setup Complete!                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo ""
echo -e "  1. ${YELLOW}Start development server:${NC}"
echo -e "     ${BLUE}pnpm dev${NC}"
echo ""
echo -e "  2. ${YELLOW}View API documentation:${NC}"
echo -e "     ${BLUE}http://localhost:4000/api/docs${NC}"
echo ""
echo -e "  3. ${YELLOW}Test health endpoint:${NC}"
echo -e "     ${BLUE}curl http://localhost:4000/api/v1/health${NC}"
echo ""
echo -e "  4. ${YELLOW}View database (Prisma Studio):${NC}"
echo -e "     ${BLUE}pnpm prisma studio${NC}"
echo ""
echo -e "  5. ${YELLOW}Register a test user:${NC}"
echo -e "     ${BLUE}curl -X POST http://localhost:4000/api/v1/auth/register \\${NC}"
echo -e "     ${BLUE}  -H \"Content-Type: application/json\" \\${NC}"
echo -e "     ${BLUE}  -d '{${NC}"
echo -e "     ${BLUE}    \"email\": \"test@example.com\",${NC}"
echo -e "     ${BLUE}    \"password\": \"Test1234!\",${NC}"
echo -e "     ${BLUE}    \"name\": \"Test User\"${NC}"
echo -e "     ${BLUE}  }'${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📚 Documentation:${NC}"
echo -e "   • Backend README: ${BLUE}./README.md${NC}"
echo -e "   • Database Setup: ${BLUE}../../DATABASE_SETUP.md${NC}"
echo -e "   • Current Status: ${BLUE}../../CURRENT_STATUS.md${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""

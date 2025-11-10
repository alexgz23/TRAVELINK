#!/bin/bash

# Viajero Conectado - Backend Setup Verification Script
# This script checks if your backend environment is properly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Viajero Conectado - Setup Verification${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Track issues
ISSUES=0

# 1. Check Node.js version
echo -e "${YELLOW}[1/10]${NC} Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✓${NC} Node.js $(node --version) (required: 18+)"
else
    echo -e "${RED}✗${NC} Node.js version too old: $(node --version) (required: 18+)"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 2. Check pnpm
echo -e "${YELLOW}[2/10]${NC} Checking pnpm..."
if command -v pnpm &> /dev/null; then
    echo -e "${GREEN}✓${NC} pnpm $(pnpm --version)"
else
    echo -e "${RED}✗${NC} pnpm not found. Install with: npm install -g pnpm"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 3. Check if node_modules exists
echo -e "${YELLOW}[3/10]${NC} Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${RED}✗${NC} Dependencies not installed. Run: pnpm install"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 4. Check .env file
echo -e "${YELLOW}[4/10]${NC} Checking .env file..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"

    # Check required variables
    if grep -q "DATABASE_URL=" .env; then
        DATABASE_URL=$(grep "DATABASE_URL=" .env | cut -d'=' -f2- | tr -d '"')
        echo -e "${GREEN}✓${NC} DATABASE_URL is set"

        # Check if it's still the default localhost
        if echo "$DATABASE_URL" | grep -q "localhost:5432"; then
            echo -e "${YELLOW}⚠${NC}  DATABASE_URL points to localhost (make sure PostgreSQL is running)"
        fi
    else
        echo -e "${RED}✗${NC} DATABASE_URL not set in .env"
        ISSUES=$((ISSUES + 1))
    fi

    if grep -q "JWT_SECRET=" .env; then
        JWT_SECRET=$(grep "JWT_SECRET=" .env | cut -d'=' -f2)
        if [ "$JWT_SECRET" != "your-secret-key-change-in-production" ] && [ -n "$JWT_SECRET" ]; then
            echo -e "${GREEN}✓${NC} JWT_SECRET is set"
        else
            echo -e "${YELLOW}⚠${NC}  JWT_SECRET is using default value (change for production)"
        fi
    else
        echo -e "${RED}✗${NC} JWT_SECRET not set in .env"
        ISSUES=$((ISSUES + 1))
    fi

    if grep -q "JWT_REFRESH_SECRET=" .env; then
        echo -e "${GREEN}✓${NC} JWT_REFRESH_SECRET is set"
    else
        echo -e "${RED}✗${NC} JWT_REFRESH_SECRET not set in .env"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo -e "${RED}✗${NC} .env file not found. Copy from .env.example"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 5. Check Prisma schema
echo -e "${YELLOW}[5/10]${NC} Checking Prisma schema..."
if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✓${NC} Prisma schema exists"
    MODEL_COUNT=$(grep -c "^model " prisma/schema.prisma || echo "0")
    echo -e "${GREEN}✓${NC} Found $MODEL_COUNT models in schema"
else
    echo -e "${RED}✗${NC} Prisma schema not found"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 6. Check Prisma Client
echo -e "${YELLOW}[6/10]${NC} Checking Prisma Client..."
if [ -d "node_modules/.prisma/client" ]; then
    echo -e "${GREEN}✓${NC} Prisma Client generated"
else
    echo -e "${YELLOW}⚠${NC}  Prisma Client not generated. Run: pnpm prisma generate"
    echo -e "${YELLOW}   ${NC} (This might fail if Prisma binaries can't be downloaded)"
fi
echo ""

# 7. Check database connection (if Prisma is available)
echo -e "${YELLOW}[7/10]${NC} Checking database connection..."
if command -v pnpm &> /dev/null && [ -d "node_modules" ]; then
    # Try to connect to database
    if pnpm prisma db execute --stdin <<< "SELECT 1;" &> /dev/null; then
        echo -e "${GREEN}✓${NC} Database connection successful"
    else
        echo -e "${RED}✗${NC} Cannot connect to database"
        echo -e "${YELLOW}   ${NC} Make sure:"
        echo -e "${YELLOW}   ${NC} - PostgreSQL is running (local or cloud)"
        echo -e "${YELLOW}   ${NC} - DATABASE_URL in .env is correct"
        echo -e "${YELLOW}   ${NC} - Database credentials are valid"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC}  Skipping database check (dependencies not installed)"
fi
echo ""

# 8. Check for migrations
echo -e "${YELLOW}[8/10]${NC} Checking migrations..."
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
    MIGRATION_COUNT=$(ls -1 prisma/migrations | wc -l)
    echo -e "${GREEN}✓${NC} Found $MIGRATION_COUNT migration(s)"
else
    echo -e "${YELLOW}⚠${NC}  No migrations found. Run: pnpm prisma migrate dev --name init"
fi
echo ""

# 9. Check source files
echo -e "${YELLOW}[9/10]${NC} Checking source files..."
REQUIRED_MODULES=("auth" "users" "experiences" "common")
MISSING_MODULES=()

for module in "${REQUIRED_MODULES[@]}"; do
    if [ ! -d "src/$module" ]; then
        MISSING_MODULES+=("$module")
    fi
done

if [ ${#MISSING_MODULES[@]} -eq 0 ]; then
    echo -e "${GREEN}✓${NC} All required modules present"
else
    echo -e "${RED}✗${NC} Missing modules: ${MISSING_MODULES[*]}"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 10. Check TypeScript compilation
echo -e "${YELLOW}[10/10]${NC} Checking TypeScript compilation..."
if [ -d "node_modules" ]; then
    if pnpm tsc --noEmit &> /dev/null; then
        echo -e "${GREEN}✓${NC} TypeScript compiles without errors"
    else
        echo -e "${YELLOW}⚠${NC}  TypeScript compilation has errors (might be expected if DB not set up)"
    fi
else
    echo -e "${YELLOW}⚠${NC}  Skipping TypeScript check (dependencies not installed)"
fi
echo ""

# Summary
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo -e "${GREEN}Your backend environment is properly configured.${NC}"
    echo ""
    echo -e "Next steps:"
    echo -e "  1. Make sure migrations are applied: ${BLUE}pnpm prisma migrate dev${NC}"
    echo -e "  2. Start the development server: ${BLUE}pnpm dev${NC}"
    echo -e "  3. Visit API docs: ${BLUE}http://localhost:4000/api/docs${NC}"
    echo ""
else
    echo -e "${RED}✗ Found $ISSUES issue(s)${NC}"
    echo ""
    echo -e "${YELLOW}Please fix the issues above before starting development.${NC}"
    echo ""
    echo -e "Common solutions:"
    echo -e "  • Install dependencies: ${BLUE}pnpm install${NC}"
    echo -e "  • Copy environment file: ${BLUE}cp .env.example .env${NC}"
    echo -e "  • Update DATABASE_URL in .env with your database connection string"
    echo -e "  • Generate Prisma client: ${BLUE}pnpm prisma generate${NC}"
    echo -e "  • Run migrations: ${BLUE}pnpm prisma migrate dev --name init${NC}"
    echo ""
    echo -e "See ${BLUE}DATABASE_SETUP.md${NC} for detailed setup instructions"
    echo ""
fi

echo -e "${BLUE}======================================${NC}"
echo ""

exit $ISSUES

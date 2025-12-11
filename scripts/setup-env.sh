#!/bin/bash

# AI Auto Pro - Environment Setup Script
# Helps set up environment variables for deployment

set -e

echo "🔐 AI Auto Pro - Environment Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if .env already exists
if [ -f "server/.env" ]; then
    echo -e "${YELLOW}⚠️  server/.env already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "Exiting without changes"
        exit 0
    fi
fi

echo "Please provide the following values:"
echo ""

# Database URL
echo -e "${GREEN}1. Database URL${NC}"
echo "Get this from: https://console.neon.tech"
read -p "DATABASE_URL: " DATABASE_URL

# JWT Secret
echo ""
echo -e "${GREEN}2. JWT Secret${NC}"
echo "Generate a random secret (or press Enter for auto-generated):"
read -p "JWT_SECRET: " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "Generated: $JWT_SECRET"
fi

# Gemini API Key
echo ""
echo -e "${GREEN}3. Gemini API Key${NC}"
read -p "GEMINI_API_KEY: " GEMINI_API_KEY

# DeepSeek API Key
echo ""
echo -e "${GREEN}4. DeepSeek API Key${NC}"
read -p "DEEPSEEK_API_KEY: " DEEPSEEK_API_KEY

# Preferred AI Provider
echo ""
echo -e "${GREEN}5. Preferred AI Provider${NC}"
echo "Options: gemini, deepseek"
read -p "PREFERRED_AI_PROVIDER (default: deepseek): " PREFERRED_AI_PROVIDER
PREFERRED_AI_PROVIDER=${PREFERRED_AI_PROVIDER:-deepseek}

# Create .env file
cat > server/.env << EOF
# Server
PORT=3001
NODE_ENV=development
JWT_SECRET=$JWT_SECRET

# Database (Neon PostgreSQL)
DATABASE_URL=$DATABASE_URL

# AI Providers
GEMINI_API_KEY=$GEMINI_API_KEY
DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY
PREFERRED_AI_PROVIDER=$PREFERRED_AI_PROVIDER
EOF

echo ""
echo -e "${GREEN}✅ Environment file created: server/.env${NC}"
echo ""
echo "Next steps:"
echo "1. cd server && npm install"
echo "2. npm run db:push"
echo "3. npm run dev"
echo ""

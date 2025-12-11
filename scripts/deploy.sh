#!/bin/bash

# AI Auto Pro - Deployment Script
# Automates deployment to various platforms

set -e

echo "🚀 AI Auto Pro Deployment Script"
echo "================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f "server/.env" ]; then
    echo -e "${RED}❌ Error: server/.env file not found${NC}"
    echo "Please create server/.env with your configuration"
    echo "See server/.env.example for reference"
    exit 1
fi

echo "Select deployment platform:"
echo "1) Railway"
echo "2) Render"
echo "3) Docker (local)"
echo "4) Docker (production)"
echo "5) Vercel"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo -e "${GREEN}Deploying to Railway...${NC}"
        if ! command -v railway &> /dev/null; then
            echo "Installing Railway CLI..."
            npm install -g @railway/cli
        fi
        railway login
        railway link
        railway up
        echo -e "${GREEN}✅ Deployed to Railway!${NC}"
        ;;
    2)
        echo -e "${GREEN}Deploying to Render...${NC}"
        echo "Please ensure you have:"
        echo "1. Connected your GitHub repository to Render"
        echo "2. Created a Web Service from the dashboard"
        echo "3. Render will automatically use render.yaml"
        echo ""
        echo "Render deployment URL: https://dashboard.render.com"
        ;;
    3)
        echo -e "${GREEN}Building and running Docker locally...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✅ Docker container started!${NC}"
        echo "View logs: docker-compose logs -f backend"
        echo "Stop: docker-compose down"
        ;;
    4)
        echo -e "${GREEN}Building production Docker image...${NC}"
        cd server
        docker build -t ai-auto-pro-backend:latest .
        echo -e "${GREEN}✅ Docker image built!${NC}"
        echo ""
        echo "To run the container:"
        echo "docker run -d --name ai-auto-pro -p 3001:3001 --env-file ../.env ai-auto-pro-backend:latest"
        ;;
    5)
        echo -e "${GREEN}Deploying to Vercel...${NC}"
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        vercel login
        vercel --prod
        echo -e "${GREEN}✅ Deployed to Vercel!${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Test the health endpoint: curl https://your-domain.com/health"
echo "2. Update frontend API URL"
echo "3. Set up monitoring"
echo ""

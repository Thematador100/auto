#!/bin/bash
set -e

echo "📦 Installing server dependencies..."
cd server
npm install

echo "🔨 Building server..."
npm run build

echo "🚀 Starting server..."
exec npm start

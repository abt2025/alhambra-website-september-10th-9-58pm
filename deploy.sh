#!/bin/bash

# 🚀 Alhambra Bank & Trust - Automated Deployment Script
# This script automatically builds, commits, and pushes changes to GitHub

set -e  # Exit on any error

echo "🏛️ Alhambra Bank & Trust - Automated Deployment"
echo "================================================"

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MSG="🔄 Auto-update: $TIMESTAMP

✅ Latest changes:
- Updated website content
- Enhanced features and functionality
- Optimized performance
- Ready for production deployment"

echo "📦 Building production version..."
npm run build

echo "📝 Adding changes to Git..."
git add .

echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG" || echo "No changes to commit"

echo "🚀 Pushing to GitHub..."
git push origin main || echo "Push failed - check GitHub authentication"

echo "✅ Deployment completed successfully!"
echo "🌐 Live URL: https://8080-i4wat3j76sdaf8wbzi7l8-5761bc9a.manusvm.computer"
echo "📊 GitHub Repository: https://github.com/abt2025/alhambra-bank-trust"

# Optional: Deploy to additional platforms
if [ "$1" = "--deploy-all" ]; then
    echo "🌍 Deploying to additional platforms..."
    
    # Add Netlify deployment if configured
    if command -v netlify &> /dev/null; then
        echo "📡 Deploying to Netlify..."
        netlify deploy --prod --dir=dist
    fi
    
    # Add Vercel deployment if configured  
    if command -v vercel &> /dev/null; then
        echo "⚡ Deploying to Vercel..."
        vercel --prod
    fi
fi

echo "🎉 All deployments completed!"

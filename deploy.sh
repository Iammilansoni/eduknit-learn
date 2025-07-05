#!/bin/bash

echo "🚀 EduKnit Learn Deployment Helper"
echo "=================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists git; then
    echo "❌ Git is not installed"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✅ Prerequisites met"

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "backend" ] && [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the EduKnit_Learn root directory"
    exit 1
fi

echo ""
echo "🔧 Deployment Options:"
echo "1. Prepare for GitHub (add, commit, push)"
echo "2. Deploy Backend to Vercel"
echo "3. Deploy Frontend to Vercel"
echo "4. Full deployment (all steps)"
echo ""

read -p "Choose option (1-4): " choice

case $choice in
    1)
        echo "📦 Preparing for GitHub..."
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        echo "📤 Ready to push to GitHub!"
        echo "Run: git remote add origin <your-repo-url>"
        echo "Then: git push -u origin main"
        ;;
    2)
        echo "🚀 Backend deployment instructions:"
        echo "1. Go to https://vercel.com"
        echo "2. Import your GitHub repository"
        echo "3. Set Root Directory to 'backend'"
        echo "4. Configure environment variables"
        ;;
    3)
        echo "🌐 Frontend deployment instructions:"
        echo "1. Go to https://vercel.com"
        echo "2. Import your GitHub repository"
        echo "3. Set Root Directory to 'frontend'"
        echo "4. Set VITE_API_URL environment variable"
        ;;
    4)
        echo "📋 Full deployment checklist created!"
        echo "Check DEPLOYMENT.md for detailed instructions"
        ;;
    *)
        echo "❌ Invalid option"
        ;;
esac

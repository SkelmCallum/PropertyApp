#!/bin/bash
#
# Auto-commit script for AI agents
# This script validates the build and automatically commits changes to GitHub
# Usage: ./scripts/auto-commit.sh "Your commit message" [--skip-build] [--push]

set -e

MESSAGE=""
SKIP_BUILD=false
PUSH=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --push)
            PUSH=true
            shift
            ;;
        *)
            MESSAGE="$1"
            shift
            ;;
    esac
done

if [ -z "$MESSAGE" ]; then
    echo "❌ Error: Commit message is required"
    echo "Usage: ./scripts/auto-commit.sh \"Your commit message\" [--skip-build] [--push]"
    exit 1
fi

echo "🚀 Starting auto-commit process..."
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check for uncommitted changes
if [ -z "$(git status --porcelain)" ]; then
    echo "ℹ️  No changes to commit"
    exit 0
fi

echo "📋 Changes detected:"
git status --short
echo ""

# Run linting
if [ "$SKIP_BUILD" = false ]; then
    echo "📋 Running ESLint..."
    npm run lint
    if [ $? -ne 0 ]; then
        echo "❌ ESLint failed. Please fix linting errors before committing."
        exit 1
    fi
    echo "✅ ESLint passed"
    echo ""
fi

# Run build
if [ "$SKIP_BUILD" = false ]; then
    echo "🏗️  Building project..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Please fix build errors before committing."
        exit 1
    fi
    echo "✅ Build successful"
    echo ""
fi

# Stage all changes
echo "📦 Staging changes..."
git add -A
if [ $? -ne 0 ]; then
    echo "❌ Failed to stage changes"
    exit 1
fi

# Commit changes
echo "💾 Committing changes..."
git commit -m "$MESSAGE"
if [ $? -ne 0 ]; then
    echo "❌ Failed to commit changes"
    exit 1
fi

echo "✅ Changes committed successfully!"
echo "   Commit message: $MESSAGE"
echo ""

# Push to GitHub if requested
if [ "$PUSH" = true ]; then
    echo "📤 Pushing to GitHub..."
    git push
    if [ $? -ne 0 ]; then
        echo "⚠️  Warning: Failed to push to GitHub. You may need to push manually."
        exit 1
    fi
    echo "✅ Changes pushed to GitHub!"
else
    echo "ℹ️  Changes committed locally. Use 'git push' to push to GitHub."
fi

echo ""
echo "✨ Auto-commit completed successfully!"


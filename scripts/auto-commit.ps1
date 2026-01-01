# Auto-commit script for AI agents
# This script validates the build and automatically commits changes to GitHub
# Usage: .\scripts\auto-commit.ps1 -Message "Your commit message"

param(
    [Parameter(Mandatory=$true)]
    [string]$Message,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild,
    
    [Parameter(Mandatory=$false)]
    [switch]$Push
)

Write-Host "🚀 Starting auto-commit process..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
try {
    $null = git rev-parse --git-dir 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Not in a git repository" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error: Not in a git repository" -ForegroundColor Red
    exit 1
}

# Check for uncommitted changes
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "ℹ️  No changes to commit" -ForegroundColor Yellow
    exit 0
}

Write-Host "📋 Changes detected:" -ForegroundColor Cyan
git status --short
Write-Host ""

# Run linting
if (-not $SkipBuild) {
    Write-Host "📋 Running ESLint..." -ForegroundColor Cyan
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ESLint failed. Please fix linting errors before committing." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ ESLint passed" -ForegroundColor Green
    Write-Host ""
}

# Run build
if (-not $SkipBuild) {
    Write-Host "🏗️  Building project..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed. Please fix build errors before committing." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build successful" -ForegroundColor Green
    Write-Host ""
}

# Stage all changes
Write-Host "📦 Staging changes..." -ForegroundColor Cyan
git add -A
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to stage changes" -ForegroundColor Red
    exit 1
}

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Cyan
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to commit changes" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Changes committed successfully!" -ForegroundColor Green
Write-Host "   Commit message: $Message" -ForegroundColor Gray
Write-Host ""

# Push to GitHub if requested
if ($Push) {
    Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
    git push
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Warning: Failed to push to GitHub. You may need to push manually." -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Changes pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Changes committed locally. Use 'git push' to push to GitHub." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Auto-commit completed successfully!" -ForegroundColor Green


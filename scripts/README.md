# Auto-Commit Scripts

This directory contains scripts for automatically committing changes to GitHub after successful builds.

## Overview

The auto-commit scripts validate that the project builds successfully before committing changes. This ensures that broken code is never committed to the repository.

## Scripts

### `auto-commit.ps1` (PowerShell - Windows)

PowerShell script for Windows environments.

**Usage:**
```powershell
.\scripts\auto-commit.ps1 -Message "Your commit message" [-Push] [-SkipBuild]
```

**Parameters:**
- `-Message` (Required): Commit message describing the changes
- `-Push` (Optional): Automatically push to GitHub after commit
- `-SkipBuild` (Optional): Skip build validation (not recommended)

**Example:**
```powershell
.\scripts\auto-commit.ps1 -Message "feat: add user authentication" -Push
```

### `auto-commit.sh` (Bash - Linux/Mac/Git Bash)

Bash script for Linux, Mac, and Git Bash on Windows.

**Usage:**
```bash
./scripts/auto-commit.sh "Your commit message" [--push] [--skip-build]
```

**Options:**
- `--push`: Automatically push to GitHub after commit
- `--skip-build`: Skip build validation (not recommended)

**Example:**
```bash
./scripts/auto-commit.sh "feat: add user authentication" --push
```

## What the Scripts Do

1. **Check for changes**: Verifies there are uncommitted changes
2. **Run ESLint**: Validates code quality and style
3. **Build project**: Runs `npm run build` to ensure the project compiles
4. **Stage changes**: Adds all modified files to git staging
5. **Commit changes**: Creates a commit with the provided message
6. **Push to GitHub** (optional): Pushes changes to the remote repository

## Pre-Commit Hook

A pre-commit hook is installed in `.git/hooks/pre-commit` that automatically:
- Runs ESLint before any commit
- Builds the project before any commit
- Prevents commits if validation fails

This provides an additional safety net even if the auto-commit script is not used.

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat: add new feature`
- `fix: fix bug`
- `refactor: refactor code`
- `docs: update documentation`
- `style: formatting changes`
- `test: add tests`
- `chore: maintenance tasks`

## Best Practices

1. **Always test locally first**: Verify changes work before committing
2. **Use descriptive messages**: Commit messages should clearly describe what changed
3. **Don't skip build validation**: Only use `--skip-build` in exceptional circumstances
4. **Review before pushing**: Consider reviewing changes before using `--push` flag
5. **Follow conventional commits**: Use standard commit message prefixes

## Troubleshooting

### Build fails
- Fix build errors before committing
- Check TypeScript errors
- Verify all dependencies are installed (`npm install`)

### ESLint fails
- Fix linting errors
- Run `npm run lint` to see detailed errors

### Script not executable (Linux/Mac)
```bash
chmod +x scripts/auto-commit.sh
```

### Git hook not working
- Verify the hook is in `.git/hooks/pre-commit`
- Ensure the hook has execute permissions (Linux/Mac)
- Check that git hooks are enabled

## Integration with AI Agents

AI agents working on this project should:
1. Make code changes
2. Verify changes are correct
3. Run the auto-commit script with a descriptive message
4. Use `--push` flag to push to GitHub when ready

Example workflow:
```powershell
# After making changes
.\scripts\auto-commit.ps1 -Message "feat: implement user authentication" -Push
```


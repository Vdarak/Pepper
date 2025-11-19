# Branch Management Guide

## Current State

This repository has been migrated from a Vite/React application to a Next.js 14 application on the `pepper` branch.

## Branches

- **pepper** - New main development branch with ChartMaze MVP
- **main** - Old branch with Pepper job assistant (to be deleted)
- **copilot/create-new-pepper-branch** - Working branch (can be deleted after merge)

## How to Delete the Main Branch

**Important:** You cannot delete the default branch of a repository. You must first change the default branch before deletion.

### Steps:

1. **Navigate to Repository Settings**
   - Go to https://github.com/Vdarak/Pepper
   - Click on "Settings" tab
   - Click on "Branches" in the left sidebar

2. **Change Default Branch**
   - Under "Default branch", click the switch icon (⇄) next to "main"
   - Select "pepper" as the new default branch
   - Click "Update"
   - Confirm the change by typing the repository name when prompted

3. **Delete the Main Branch**
   - Go to https://github.com/Vdarak/Pepper/branches
   - Find the "main" branch in the list
   - Click the trash icon (🗑️) next to it
   - Confirm deletion

4. **Optional: Delete Working Branch**
   - After confirming pepper branch is stable, you can also delete `copilot/create-new-pepper-branch`

## Alternative: Using GitHub CLI (gh)

If you have the GitHub CLI installed and authenticated:

```bash
# Set pepper as default branch (requires admin permissions)
gh repo edit Vdarak/Pepper --default-branch pepper

# Delete main branch
gh api -X DELETE repos/Vdarak/Pepper/git/refs/heads/main
```

## Verification

After deletion, verify that:
- The repository's default branch is "pepper"
- All pull requests and issues reference the new default branch
- CI/CD pipelines are updated to use "pepper" branch
- Documentation references to "main" are updated

## Notes

- This operation is irreversible without restoring from a backup
- All open pull requests targeting "main" will need to be retargeted to "pepper"
- Local clones will need to update their tracking branches:
  ```bash
  git checkout pepper
  git branch -d main
  git remote set-head origin pepper
  ```

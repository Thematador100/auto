# GitHub Actions CI/CD Setup

## 📝 Note

GitHub Actions workflows have been created locally but couldn't be pushed automatically due to GitHub App permissions.

The workflow files are located at:
- `.github/workflows/deploy.yml` - Automated deployment workflow
- `.github/workflows/docker.yml` - Docker image build and push workflow

## 🔧 Manual Setup Required

To enable CI/CD automation, you need to manually add these workflow files to your repository:

### Option 1: Via GitHub Web Interface

1. Go to your repository on GitHub
2. Navigate to `.github/workflows/` directory (create if doesn't exist)
3. Click "Add file" → "Create new file"
4. Name it `deploy.yml`
5. Copy content from local `.github/workflows/deploy.yml`
6. Commit the file
7. Repeat for `docker.yml`

### Option 2: Via Git with Proper Permissions

```bash
# If you have admin access to the repository
git add .github/workflows/
git commit -m "Add CI/CD workflows"
git push origin claude/find-missing-string-014Kw2yhTNd2KecvaTpnM7wJ
```

### Option 3: Create a Pull Request

```bash
# Create a new branch
git checkout -b add-github-actions
git add .github/workflows/
git commit -m "Add CI/CD workflows"
git push origin add-github-actions

# Then create a PR on GitHub and merge it
```

## 🔐 Required GitHub Secrets

After adding the workflows, configure these secrets in your repository:

**Repository Settings → Secrets and variables → Actions → New repository secret**

### For Railway Deployment
- `RAILWAY_TOKEN` - Get from Railway dashboard → Account Settings → Tokens
- `RAILWAY_PROJECT_ID` - Get from Railway project → Settings → Project ID

### For Render Deployment
- `RENDER_API_KEY` - Get from Render dashboard → Account Settings → API Keys
- `RENDER_SERVICE_ID` - Get from Render service → Settings → Service ID

## 📋 Workflow Features

### Deploy Workflow (`deploy.yml`)

**Triggers:**
- Push to main or current branch
- Changes in `server/` directory
- Manual trigger via GitHub UI

**Actions:**
1. Runs tests
2. Builds TypeScript
3. Deploys to Railway (if configured)
4. Deploys to Render (if configured)

### Docker Workflow (`docker.yml`)

**Triggers:**
- Push to main or current branch
- Changes in `server/` or `Dockerfile`
- Manual trigger

**Actions:**
1. Builds Docker image
2. Pushes to GitHub Container Registry
3. Creates multi-platform images (amd64, arm64)
4. Uses GitHub token automatically (no setup needed)

## ✅ Verification

After setup, verify workflows are working:

1. Go to repository → Actions tab
2. You should see "Deploy Backend" and "Build and Push Docker Image" workflows
3. Make a small change and push to trigger them
4. Check workflow runs for success

## 🚀 Alternative: Platform-Native CI/CD

If you prefer not to use GitHub Actions, all deployment platforms have built-in CI/CD:

### Railway
- Auto-deploys on every push to connected branch
- No workflow files needed
- Configure in Railway dashboard

### Render
- Auto-deploys on every push
- Reads `render.yaml` automatically
- No additional setup needed

### Vercel
- Auto-deploys on every push
- Reads `vercel.json` automatically
- Preview deployments for PRs

**Recommendation:** Use platform-native CI/CD for simplicity, or add GitHub Actions for advanced control.

---

**Current Status:** Workflows created locally, manual setup required for GitHub Actions
**Alternative:** Platform-native CI/CD works without GitHub Actions

# 🚀 CI/CD Setup Guide - GitHub Actions

Complete CI/CD pipeline for automated testing, building, and deployment.

---

## 📋 What's Included

### Workflows

| Workflow | File | Purpose |
|----------|------|---------|
| **CI Tests** | `ci.yml` | Test & lint on every push |
| **Deploy Backend** | `deploy-backend.yml` | Auto-deploy to Hugging Face |
| **Deploy Frontend** | `deploy-frontend.yml` | Auto-deploy to Vercel |
| **Docker Build** | `docker-build.yml` | Build & push Docker images |
| **Security Scan** | `security.yml` | Weekly security checks |
| **Release** | `release.yml` | Auto-create GitHub releases |
| **Auto Assign** | `auto-assign.yml` | Auto-assign PRs |

---

## ⚡ Quick Setup

### Step 1: Add GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

```bash
# Vercel (Frontend Deployment)
VERCEL_TOKEN=vercel_xxxxxxxxxxxxxxxxxxxxx
VERCEL_ORG_ID=team_xxxxxxxxxxxxxxxxxxxxx
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxxxxxxxxxx

# Hugging Face (Backend Deployment)
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
HF_SPACE_ID=Uzair001/E-Shop-Backend

# Application URLs
NEXT_PUBLIC_API_URL=https://uzair001-e-shop-backend.hf.space/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://e-commerce-mu-wheat-87.vercel.app
```

### Step 2: How to Get Secrets

#### **Vercel Token:**
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Copy the token

#### **Vercel Project ID:**
1. Go to your Vercel project
2. Settings → General
3. Copy "Project ID" and "Team ID"

#### **Hugging Face Token:**
1. Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create new token with "Write" permission
3. Copy the token

#### **Hugging Face Space ID:**
1. Format: `username/space-name`
2. Example: `Uzair001/E-Shop-Backend`

---

## 🔄 Automated Workflows

### On Every Push to `main` or `develop`:

```
Push → CI Tests Run → Build Check → Pass/Fail Report
```

**CI Tests Include:**
- ✅ Backend Python tests
- ✅ Frontend TypeScript check
- ✅ ESLint validation
- ✅ Build verification

### On Push to `main` (Production):

```
Push → CI Tests Pass → Deploy Backend → Deploy Frontend → Done!
```

**Automatic Deployments:**
- Backend → Hugging Face Spaces
- Frontend → Vercel (production)

### Weekly (Every Monday):

```
Schedule → Security Scan → Report Issues
```

**Security Checks:**
- Python dependencies (safety)
- Node.js dependencies (npm audit)
- Docker images (Trivy)

---

## 📊 Workflow Details

### 1. CI Tests (`ci.yml`)

**Triggers:** Push, Pull Request

**Jobs:**
- **Backend Tests**
  - Python 3.11
  - PostgreSQL database
  - Redis cache
  - Flake8 linting
  - Pytest tests

- **Frontend Tests**
  - Node.js 20
  - TypeScript check
  - ESLint
  - Build verification

### 2. Deploy Backend (`deploy-backend.yml`)

**Triggers:** Push to main (backend changes)

**Steps:**
1. Checkout code
2. Install Python dependencies
3. Health check (imports)
4. Deploy to Hugging Face Spaces
5. Notify success

### 3. Deploy Frontend (`deploy-frontend.yml`)

**Triggers:** Push to main (frontend changes)

**Steps:**
1. Checkout code
2. Install Node dependencies
3. Build check
4. Deploy to Vercel

### 4. Docker Build (`docker-build.yml`)

**Triggers:** Push to main, Tags

**Outputs:**
- `ghcr.io/username/repo/backend:latest`
- `ghcr.io/username/repo/frontend:latest`
- Versioned tags (v1.0.0, sha-abc123)

### 5. Security Scan (`security.yml`)

**Triggers:** Weekly schedule, Manual

**Scans:**
- Python dependencies (safety)
- Code security (bandit)
- npm packages (npm audit)
- Docker images (Trivy)

### 6. Release (`release.yml`)

**Triggers:** Git tags (v*.*.*)

**Creates:**
- GitHub release
- Changelog from commits
- Docker image references

---

## 🎯 Usage Examples

### Trigger Deployment Manually

1. Go to **Actions** tab
2. Select workflow (e.g., "Deploy Backend")
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow"

### Create Release

```bash
# Tag your commit
git tag v1.0.0
git push origin v1.0.0

# Release workflow runs automatically
# GitHub release is created with changelog
```

### View Logs

1. Go to **Actions** tab
2. Click on workflow run
3. Click on job to see logs
4. Download artifacts if needed

---

## 🔧 Customization

### Change Python Version

Edit `.github/workflows/ci.yml`:

```yaml
- uses: actions/setup-python@v5
  with:
    python-version: '3.10'  # Change version
```

### Add More Tests

Edit `.github/workflows/ci.yml`:

```yaml
- name: Run integration tests
  run: pytest tests/integration/ -v
```

### Change Deployment Target

Edit `.github/workflows/deploy-backend.yml`:

```yaml
- name: Deploy to AWS
  run: |
    # Your deployment commands
```

---

## 📈 Monitoring

### Check Workflow Status

- **Green checkmark** ✅ = Success
- **Red X** ❌ = Failed
- **Yellow circle** ⏳ = Running

### Get Notifications

1. Go to repository **Settings**
2. **Notifications**
3. Enable email notifications
4. Or connect Slack/Discord

---

## 🐛 Troubleshooting

### Workflow Not Running

**Check:**
1. Actions enabled in Settings
2. Correct branch name
3. File paths in `paths:` filter

### Deployment Fails

**Check:**
1. Secrets are correct
2. Service is accessible
3. Logs in Actions tab

### Tests Fail

**Check:**
1. Test output in logs
2. Database connection
3. Environment variables

---

## 💡 Best Practices

1. **Always test locally** before pushing
2. **Use secrets** for sensitive data
3. **Keep workflows small** - one responsibility
4. **Cache dependencies** for speed
5. **Use artifacts** to share data between jobs
6. **Monitor costs** - GitHub Actions has limits

---

## 📊 GitHub Actions Limits

| Plan | Minutes/Month | Concurrent Jobs |
|------|---------------|-----------------|
| Free | 2,000 | 20 |
| Pro | 3,000 | 20 |
| Team | 3,000 | 20 |
| Enterprise | 50,000 | 60 |

**Note:** macOS and Windows runners cost 2x and 10x minutes respectively.

---

## 🎉 Success Indicators

You'll know it's working when:

- ✅ Every push triggers CI tests
- ✅ Merges to main auto-deploy
- ✅ Security scans run weekly
- ✅ Releases created from tags
- ✅ PRs auto-assigned

---

## 📚 Additional Resources

- [GitHub Actions Docs](https://docs.github.com/actions)
- [Workflow Syntax](https://docs.github.com/actions/reference/workflow-syntax)
- [Secrets Guide](https://docs.github.com/actions/security-guides/encrypted-secrets)
- [Deployment Guide](https://docs.github.com/actions/deployment)

---

**Made with ❤️ for automated deployments**

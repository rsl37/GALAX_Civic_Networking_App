# GitHub Actions Workflows Documentation

This repository implements comprehensive GitHub Actions workflows to ensure code quality, security, performance, and deployment readiness.

## Workflow Overview

### 1. Continuous Integration (CI) - `ci.yml`
**Purpose**: Ensure the application builds successfully across multiple Node.js versions.

**Triggers**: Push to main/develop, Pull Requests
**Jobs**:
- `build`: Multi-version Node.js build testing (18.x, 20.x)
- `type-check`: TypeScript type checking for frontend

**Status Check**: ✅ Build Application, ✅ TypeScript Type Check

### 2. Code Quality - `code-quality.yml`
**Purpose**: Maintain code standards and measure test coverage.

**Triggers**: Push to main/develop, Pull Requests
**Jobs**:
- `lint`: ESLint and Prettier checks (auto-setup if not configured)
- `code-coverage`: Test coverage measurement with Codecov integration

**Status Check**: ✅ Lint and Format Check, ✅ Code Coverage

### 3. Security Checks - `security.yml`
**Purpose**: Identify security vulnerabilities and potential threats.

**Triggers**: Push to main/develop, Pull Requests, Daily schedule (2 AM UTC)
**Jobs**:
- `dependency-scan`: npm audit and dependency vulnerability scanning
- `codeql-analysis`: GitHub CodeQL static analysis
- `secret-scan`: TruffleHog secret detection

**Status Check**: ✅ Dependency Vulnerability Scan, ✅ CodeQL Security Analysis, ✅ Secret Scanning

### 4. Testing - `testing.yml`
**Purpose**: Run comprehensive test suites at multiple levels.

**Triggers**: Push to main/develop, Pull Requests
**Jobs**:
- `unit-tests`: Multi-version unit test execution (Vitest/Jest)
- `integration-tests`: API and database integration testing
- `e2e-tests`: End-to-end testing with Playwright

**Status Check**: ✅ Unit Tests, ✅ Integration Tests, ✅ End-to-End Tests

### 5. Performance Checks - `performance.yml`
**Purpose**: Monitor application performance and bundle sizes.

**Triggers**: Push to main/develop, Pull Requests
**Jobs**:
- `performance-benchmarks`: Lighthouse CI performance audits
- `memory-performance`: Memory usage and performance profiling

**Status Check**: ✅ Performance Benchmarks, ✅ Memory Performance Tests

### 6. Application-Specific Checks - `application-specific.yml`
**Purpose**: Validate GALAX-specific functionality and integrations.

**Triggers**: Push to main/develop, Pull Requests
**Jobs**:
- `database-tests`: Database schema and migration validation
- `api-contract-tests`: API endpoint contract verification
- `socket-io-tests`: Real-time communication testing
- `web3-integration-tests`: Web3 wallet integration validation

**Status Check**: ✅ Database Migration Tests, ✅ API Contract Tests, ✅ Socket.IO Tests, ✅ Web3 Integration Tests

### 7. Deployment Readiness - `deployment.yml`
**Purpose**: Verify production deployment readiness.

**Triggers**: Push to main/develop, Pull Requests
**Jobs**:
- `staging-deployment-test`: Production build verification
- `deployment-health-checks`: Startup time and health monitoring
- `environment-compatibility`: Multi-version Node.js compatibility

**Status Check**: ✅ Staging Deployment Verification, ✅ Deployment Health Checks, ✅ Environment Compatibility

## Security Configuration

### Dependabot - `.github/dependabot.yml`
- **Weekly dependency updates** (Mondays at 4 AM UTC)
- **Grouped updates** for production vs development dependencies
- **Security updates** for all dependency types
- **GitHub Actions updates** to keep workflows current

### CodeQL Configuration - `.github/codeql-config.yml`
- **Security and quality queries** enabled
- **Path filtering** to focus on source code
- **Exclusions** for build artifacts and test files

## Branch Protection Configuration

To implement the full status check system, configure the following branch protection rules:

### Main Branch Protection

Navigate to **Settings → Branches → Add Rule** for the `main` branch:

#### Required Status Checks
Enable "Require status checks to pass before merging" and select:

**CI Checks:**
- Build Application (ubuntu-latest, 18.x)
- Build Application (ubuntu-latest, 20.x)
- TypeScript Type Check

**Code Quality:**
- Lint and Format Check
- Code Coverage

**Security:**
- Dependency Vulnerability Scan
- CodeQL Security Analysis / javascript
- Secret Scanning

**Testing:**
- Unit Tests (ubuntu-latest, 18.x)
- Unit Tests (ubuntu-latest, 20.x)
- Integration Tests
- End-to-End Tests

**Performance:**
- Performance Benchmarks
- Memory Performance Tests

**Application-Specific:**
- Database Migration Tests
- API Contract Tests
- Socket.IO Tests
- Web3 Integration Tests

**Deployment:**
- Staging Deployment Verification
- Deployment Health Checks
- Environment Compatibility (ubuntu-latest, 18.x)
- Environment Compatibility (ubuntu-latest, 20.x)
- Environment Compatibility (ubuntu-latest, 22.x)

#### Additional Protection Settings
- ✅ Require branches to be up to date before merging
- ✅ Require pull request reviews before merging (minimum 1)
- ✅ Dismiss stale reviews when new commits are pushed
- ✅ Require review from code owners
- ✅ Restrict pushes that create files larger than 100MB
- ✅ Require signed commits (recommended)

### Develop Branch Protection

Similar configuration with slightly relaxed requirements:
- All status checks required
- Pull request reviews optional for development
- Allow force pushes for maintainers

## Workflow Customization

### Environment Variables
Set these repository secrets for full functionality:

```bash
# Required for deployment testing
STAGING_URL=https://staging.galax.app

# Optional for enhanced reporting
CODECOV_TOKEN=your_codecov_token
LIGHTHOUSE_CI_TOKEN=your_lhci_token
```

### Performance Budgets
Current thresholds in `performance.yml`:
- JavaScript bundle: < 1MB
- CSS bundle: < 100KB
- Lighthouse scores: Performance > 70%, Accessibility > 90%

### Test Framework Support
Workflows auto-detect and support:
- **Vitest** (preferred for Vite projects)
- **Jest** (fallback)
- **Playwright** (E2E testing)
- **Supertest** (API testing)

## Maintenance

### Weekly Tasks
- Review Dependabot PRs
- Check security alert notifications
- Monitor performance trends

### Monthly Tasks
- Review and update performance budgets
- Audit workflow efficiency
- Update test coverage requirements

### Troubleshooting

**Common Issues:**

1. **Build Failures**: Check Node.js version compatibility
2. **Test Timeouts**: Increase timeout values in workflow files
3. **Permission Errors**: Verify repository permissions for GitHub Actions
4. **Large Bundle Warnings**: Implement code splitting

**Debug Commands:**
```bash
# Local testing commands
npm run build
npm run test
npm audit
npx lighthouse http://localhost:3000
```

## Contributing

When adding new workflows:
1. Follow existing naming conventions
2. Include proper error handling
3. Add documentation updates
4. Test locally before committing
5. Use semantic commit messages

## Status Badge Integration

Add these badges to your README.md:

```markdown
![CI](https://github.com/rsl37/GALAX_App/workflows/Continuous%20Integration/badge.svg)
![Security](https://github.com/rsl37/GALAX_App/workflows/Security%20Checks/badge.svg)
![Tests](https://github.com/rsl37/GALAX_App/workflows/Testing/badge.svg)
```
# GALAX App - Complete Firewall Allowlist

## Overview

This file contains the complete, consolidated list of all domains, URLs, and network requirements for the GALAX application. Use this as a comprehensive allowlist for firewall configuration.

## Critical Domains (Essential for Basic Functionality)

### GitHub Core Services
```
github.com
*.github.com
*.githubusercontent.com
api.github.com
ssh.github.com
uploads.github.com
```

### Package Management (npm)
```
registry.npmjs.org
*.npmjs.org
*.npmjs.com
audit-api.npmjs.org
```

### Map Services (OpenStreetMap)
```
*.tile.openstreetmap.org
tile.openstreetmap.org
a.tile.openstreetmap.org
b.tile.openstreetmap.org
c.tile.openstreetmap.org
```

### CDN Services
```
cdnjs.cloudflare.com
unpkg.com
jsdelivr.net
```

## GitHub Extended Services

### GitHub Actions & CI/CD
```
*.actions.githubusercontent.com
pipelines.actions.githubusercontent.com
results-receiver.actions.githubusercontent.com
vstoken.actions.githubusercontent.com
artifactcache.actions.githubusercontent.com
objects.githubusercontent.com
```

### GitHub Content & Assets
```
avatars.githubusercontent.com
raw.githubusercontent.com
gist.githubusercontent.com
camo.githubusercontent.com
github.githubassets.com
*.githubassets.com
media.githubusercontent.com
user-images.githubusercontent.com
repository-images.githubusercontent.com
```

### GitHub Packages & Registry
```
npm.pkg.github.com
maven.pkg.github.com
docker.pkg.github.com
rubygems.pkg.github.com
nuget.pkg.github.com
github-registry-files.githubusercontent.com
github-releases.githubusercontent.com
```

### GitHub Security & Code Analysis
```
*.codeql.github.com
codeql.github.com
```

### GitHub Copilot Services
```
api.githubcopilot.com
*.githubcopilot.com
copilot-proxy.githubusercontent.com
default.exp-tas.com
vscode.github.com
```

### GitHub Pages & Documentation
```
*.github.io
pages.github.com
cli.github.com
desktop.githubusercontent.com
```

### GitHub Enterprise (if applicable)
```
*.ghe.com
*.githubenterprise.com
```

### GitHub Support & Status
```
support.github.com
www.githubstatus.com
```

## External Cloud Storage (GitHub Actions)

### Azure Blob Storage
```
*.blob.core.windows.net
```

### AWS S3 Storage
```
github-production-repository-file-5c1aeb.s3.amazonaws.com
github-production-upload-manifest-file-7fdce7.s3.amazonaws.com
```

## Alternative Package Managers

### Yarn Registry
```
registry.yarnpkg.com
```

### TypeScript CDN
```
typescript.azureedge.net
```

## Email Services (SMTP)

### Email Providers
```
smtp.gmail.com
smtp.outlook.com
smtp.sendgrid.net
```

## Optional Services (Monitoring & Analytics)

### Code Quality & Security
```
sonarcloud.io
*.codecov.io
*.snyk.io
*.sentry.io
*.rollbar.com
```

### Map Services (Alternative)
```
api.mapbox.com
*.googleapis.com
```

## Required Ports

### Standard Ports
```
443/tcp   # HTTPS (Primary - Required)
80/tcp    # HTTP (Redirects to HTTPS)
22/tcp    # SSH (Git operations)
587/tcp   # SMTP (Email services)
25/tcp    # SMTP (Alternative)
```

### Development Ports (Local Development)
```
3000/tcp  # Frontend development server
3001/tcp  # Backend API server
5173/tcp  # Vite development server
8080/tcp  # Alternative development server
```

### DNS Resolution
```
53/udp    # DNS queries
53/tcp    # DNS over TCP
```

## Complete Allowlist (Copy-Paste Format)

### All Domains (Alphabetical)
```
*.actions.githubusercontent.com
*.blob.core.windows.net
*.codecov.io
*.codeql.github.com
*.ghe.com
*.github.com
*.github.io
*.githubassets.com
*.githubcopilot.com
*.githubenterprise.com
*.githubusercontent.com
*.googleapis.com
*.npmjs.com
*.npmjs.org
*.rollbar.com
*.sentry.io
*.snyk.io
*.tile.openstreetmap.org
a.tile.openstreetmap.org
api.github.com
api.githubcopilot.com
api.mapbox.com
artifactcache.actions.githubusercontent.com
audit-api.npmjs.org
avatars.githubusercontent.com
b.tile.openstreetmap.org
c.tile.openstreetmap.org
camo.githubusercontent.com
cdnjs.cloudflare.com
cli.github.com
codeql.github.com
copilot-proxy.githubusercontent.com
default.exp-tas.com
desktop.githubusercontent.com
docker.pkg.github.com
gist.githubusercontent.com
github-production-repository-file-5c1aeb.s3.amazonaws.com
github-production-upload-manifest-file-7fdce7.s3.amazonaws.com
github-registry-files.githubusercontent.com
github-releases.githubusercontent.com
github.com
github.githubassets.com
jsdelivr.net
maven.pkg.github.com
media.githubusercontent.com
npm.pkg.github.com
nuget.pkg.github.com
objects.githubusercontent.com
pages.github.com
pipelines.actions.githubusercontent.com
raw.githubusercontent.com
registry.npmjs.org
registry.yarnpkg.com
repository-images.githubusercontent.com
results-receiver.actions.githubusercontent.com
rubygems.pkg.github.com
smtp.gmail.com
smtp.outlook.com
smtp.sendgrid.net
sonarcloud.io
ssh.github.com
support.github.com
tile.openstreetmap.org
typescript.azureedge.net
unpkg.com
uploads.github.com
user-images.githubusercontent.com
vscode.github.com
vstoken.actions.githubusercontent.com
www.githubstatus.com
```

## Firewall Rule Examples

### Generic Firewall Rules
```
# Allow HTTPS to all required domains
ALLOW tcp/443 to *.github.com
ALLOW tcp/443 to *.githubusercontent.com
ALLOW tcp/443 to registry.npmjs.org
ALLOW tcp/443 to *.npmjs.org
ALLOW tcp/443 to *.tile.openstreetmap.org
ALLOW tcp/443 to cdnjs.cloudflare.com

# Allow HTTP for redirects
ALLOW tcp/80 to github.com
ALLOW tcp/80 to registry.npmjs.org

# Allow SSH for Git operations
ALLOW tcp/22 to github.com
ALLOW tcp/22 to ssh.github.com

# Allow SMTP for email
ALLOW tcp/587 to smtp.gmail.com
ALLOW tcp/587 to smtp.outlook.com

# Allow DNS resolution
ALLOW udp/53 to any
ALLOW tcp/53 to any
```

### Minimal Essential Rules (if restrictions are tight)
```
# Absolutely minimum for basic functionality
ALLOW tcp/443 to github.com
ALLOW tcp/443 to api.github.com
ALLOW tcp/443 to *.githubusercontent.com
ALLOW tcp/443 to registry.npmjs.org
ALLOW tcp/443 to *.tile.openstreetmap.org
ALLOW tcp/22 to github.com
ALLOW udp/53 to any
```

## Implementation Priority

### Phase 1 (Critical - Implement First)
1. GitHub core services (github.com, api.github.com, *.githubusercontent.com)
2. npm registry (registry.npmjs.org, *.npmjs.org)
3. OpenStreetMap tiles (*.tile.openstreetmap.org)
4. Basic ports (443, 80, 22, 53)

### Phase 2 (Important - Implement Next)
1. GitHub Actions services (*.actions.githubusercontent.com)
2. CDN services (cdnjs.cloudflare.com, unpkg.com)
3. Email services (smtp.gmail.com, smtp.outlook.com)

### Phase 3 (Optional - Implement if Needed)
1. GitHub Copilot services
2. Monitoring and analytics services
3. Alternative map providers
4. Development services

## Validation Commands

### Basic Connectivity Tests
```bash
# Test GitHub connectivity
curl -I https://github.com
curl -I https://api.github.com

# Test npm registry
curl -I https://registry.npmjs.org
npm ping

# Test map services
curl -I https://tile.openstreetmap.org/1/0/0.png

# Test CDN services
curl -I https://cdnjs.cloudflare.com

# Test SSH access
ssh -T git@github.com
```

### Comprehensive Test Script
```bash
#!/bin/bash
# Test all critical services
echo "Testing GitHub services..."
curl -s -I https://github.com && echo "✓ github.com" || echo "✗ github.com"
curl -s -I https://api.github.com && echo "✓ api.github.com" || echo "✗ api.github.com"

echo "Testing npm registry..."
curl -s -I https://registry.npmjs.org && echo "✓ registry.npmjs.org" || echo "✗ registry.npmjs.org"

echo "Testing map services..."
curl -s -I https://tile.openstreetmap.org/1/0/0.png && echo "✓ OpenStreetMap" || echo "✗ OpenStreetMap"

echo "Testing CDN services..."
curl -s -I https://cdnjs.cloudflare.com && echo "✓ Cloudflare CDN" || echo "✗ Cloudflare CDN"

echo "All tests complete!"
```

## Notes

- **Wildcards**: Ensure your firewall supports wildcard domains (*.example.com)
- **HTTPS Priority**: All external communication should use HTTPS (port 443)
- **DNS Resolution**: Ensure DNS queries are allowed for domain resolution
- **Updates**: This list may need periodic updates as services evolve
- **Testing**: Always test connectivity after implementing firewall rules
- **Documentation**: Keep a record of which rules were implemented and when

## Support

For issues with specific domains or services, refer to:
- [FIREWALL_CONFIGURATION.md](FIREWALL_CONFIGURATION.md) - Detailed configuration guide
- [GITHUB_SERVICES_FIREWALL.md](GITHUB_SERVICES_FIREWALL.md) - GitHub-specific services
- [QUICK_FIREWALL_SETUP.md](QUICK_FIREWALL_SETUP.md) - Quick setup guide

---

**Last Updated**: Generated from comprehensive analysis of GALAX App requirements  
**Total Domains**: 50+ unique domains and service endpoints  
**Coverage**: Complete GitHub ecosystem, npm registry, OpenStreetMap, CDN services, and monitoring tools
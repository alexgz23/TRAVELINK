# Deployment Guide - Viajero Conectado Frontend

Guía completa para deployment del frontend web de Viajero Conectado.

## 📋 Pre-requisitos

- Node.js 18+
- pnpm 8+

## 🚀 Deployment Options

### 1. Vercel (Recomendado)

Vercel es la plataforma recomendada para Next.js:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Environment Variables en Vercel:**
- Ve a Project Settings → Environment Variables
- Agrega todas las variables de `.env.example`
- Marca las que sean públicas con `NEXT_PUBLIC_`

### 2. Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

**Build Settings:**
- Build command: `pnpm build`
- Publish directory: `.next`
- Node version: 18

### 3. Manual Deployment

#### Build for Production

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Start production server
pnpm start
```

#### PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start npm --name "viajero-web" -- start

# Save PM2 configuration
pm2 save

# Setup auto-restart on system reboot
pm2 startup
```

### 4. AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

### 5. Railway

1. Conecta tu repositorio de GitHub
2. Configura build command: `pnpm build`
3. Configura start command: `pnpm start`
4. Agrega variables de entorno
5. Deploy automático

### 6. Render

1. Conecta tu repositorio
2. Build command: `pnpm install && pnpm build`
3. Start command: `pnpm start`
4. Configura environment variables
5. Deploy

## 🔧 Environment Variables

### Required Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.viajeroconectado.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.viajeroconectado.com

# Application URL
NEXT_PUBLIC_APP_URL=https://viajeroconectado.com

# Mapbox Token (opcional)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### Optional Variables

```bash
# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Google Maps (alternative to Mapbox)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## 📊 Performance Optimization

### 1. Enable Caching

Configure CDN caching headers:

```nginx
# Nginx example
location /_next/static {
    expires 365d;
    add_header Cache-Control "public, immutable";
}

location /static {
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

### 2. Enable Compression

```nginx
# Nginx gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### 3. Bundle Analysis

Analyze bundle size:

```bash
# Run bundle analyzer
ANALYZE=true pnpm build

# Check reports in /analyze folder
```

## 🔒 Security Checklist

- [ ] Set secure environment variables
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set security headers (already in next.config.js)
- [ ] Use environment-specific API URLs
- [ ] Remove console.logs in production (configured)
- [ ] Enable rate limiting on API
- [ ] Configure CSP headers

## 🧪 Pre-Deployment Testing

```bash
# Run all tests
pnpm test
pnpm test:e2e

# Check build
pnpm build

# Test production build locally
pnpm start

# Run linting
pnpm lint

# Check type safety
pnpm type-check
```

## 📈 Monitoring & Analytics

### Web Vitals

El proyecto ya incluye tracking de Web Vitals:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

### Sentry Integration (Optional)

```bash
# Install Sentry
pnpm add @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard@latest -i nextjs
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 🌐 Domain Configuration

### DNS Setup

```
Type    Name    Value                        TTL
A       @       your-server-ip               3600
CNAME   www     your-app.vercel.app          3600
```

### SSL/TLS

- **Vercel/Netlify:** Auto SSL (Let's Encrypt)
- **Manual:** Use Certbot

```bash
# Certbot for Let's Encrypt
sudo certbot --nginx -d viajeroconectado.com -d www.viajeroconectado.com
```

## 📱 PWA Configuration

El proyecto ya está configurado como PWA:
- Web manifest: `/public/site.webmanifest`
- Service worker: Auto-generado por Next.js
- Icons: En `/public/icons/`

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Memory Issues

```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

### API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS configuration on backend
- Verify network/firewall rules

## 📞 Support

Para soporte técnico:
- Email: tech@viajeroconectado.com
- Documentación: `/FRONTEND_GUIDE.md`

## 🔖 Version Control

```bash
# Tag release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

---

**¡Deploy exitoso!** 🚀

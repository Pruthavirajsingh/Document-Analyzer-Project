# 🚀 Deployment Guide for Document Analyzer

This guide will help you deploy your Document Analyzer to various hosting platforms.

## 📋 Prerequisites

- ✅ GitHub repository with your code
- ✅ Gemini API key
- ✅ Account on chosen hosting platform

## 🏆 Recommended: Vercel Deployment

### Step 1: Prepare for Deployment
Your project is already configured with:
- ✅ `vercel.json` - Vercel configuration
- ✅ `package.json` - Updated with deployment scripts
- ✅ Environment-aware frontend code
- ✅ Flexible port configuration

### Step 2: Deploy to Vercel

1. **Visit Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/in with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Select your GitHub repository: `Document-Analyzer-Project`
   - Click "Import"

3. **Configure Environment Variables**
   - During import, Vercel will ask about environment variables
   - OR after import, go to Project Settings → Environment Variables
   - Click "Add New"
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyAFihE_NfBeq4M1-77Fk9hewi7UGdBTYa0`
   - **Environment**: Select "Production, Preview, and Development"
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for deployment to complete
   - Get your live URL (e.g., `document-analyzer-xyz.vercel.app`)

## 🎯 Alternative: Railway Deployment

### Step 1: Deploy to Railway

1. **Visit Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Environment Variables**
   - Go to "Variables" tab
   - Add: `GEMINI_API_KEY` = `AIzaSyAFihE_NfBeq4M1-77Fk9hewi7UGdBTYa0`

4. **Deploy**
   - Railway auto-detects Node.js and deploys
   - Get your live URL

## 🌐 Alternative: Render Deployment

### Step 1: Deploy to Render

1. **Visit Render**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **New Web Service**
   - Click "New +" → "Web Service"
   - Connect your repository

3. **Configuration**
   - **Name**: `document-analyzer`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Environment Variables**
   - Add: `GEMINI_API_KEY` = `AIzaSyAFihE_NfBeq4M1-77Fk9hewi7UGdBTYa0`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Ensure Node.js version is 18+
   - Check all dependencies are in package.json

2. **API Key Not Working**
   - Verify environment variable name is exactly `GEMINI_API_KEY`
   - No quotes around the key in the hosting platform

3. **CORS Issues**
   - Already handled with `app.use(cors())`

4. **File Upload Issues**
   - Some platforms have file size limits
   - Temporary files are automatically cleaned

## 🎉 Post-Deployment

After successful deployment:

1. **Test Your Live Site**
   - Visit your deployment URL
   - Test text input functionality
   - Test file upload functionality
   - Verify AI analysis works

2. **Update Share Button**
   - Share button will automatically copy the live URL

3. **Monitor Usage**
   - Check Gemini API usage in Google Console
   - Monitor hosting platform usage

## 🔒 Security Notes

- ✅ API key is stored as environment variable (secure)
- ✅ `.env` file is git-ignored (not uploaded)
- ✅ HTTPS automatically provided by hosting platforms
- ✅ CORS properly configured

## 📊 Platform Comparison

| Platform | Free Tier | Ease of Use | Features |
|----------|-----------|-------------|----------|
| **Vercel** | ✅ Generous | ⭐⭐⭐⭐⭐ | Auto-deploy, CDN, Analytics |
| **Railway** | ✅ Limited | ⭐⭐⭐⭐ | Database support, Monitoring |
| **Render** | ✅ Good | ⭐⭐⭐ | Free SSL, Auto-deploy |
| **Netlify** | ✅ Good | ⭐⭐⭐⭐ | Form handling, Split testing |

## 🆘 Need Help?

If deployment fails:
1. Check the build logs in your hosting platform
2. Ensure all files are committed to GitHub
3. Verify environment variables are set correctly
4. Contact platform support if needed

---

**🎯 Your Document Analyzer will be live on the internet!** 

Users worldwide can access your AI-powered legal document analysis tool.

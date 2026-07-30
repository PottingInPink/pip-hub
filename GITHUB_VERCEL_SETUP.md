# PIP Hub: GitHub to Vercel Setup (No Terminal Needed)

## Step 1: Create a GitHub Repository

1. Go to **github.com**
2. Click the **+** icon in the top right corner
3. Click **New repository**
4. Fill in the details:
   - Repository name: `pip-hub`
   - Description: "Potting in Pink logging and tracking app"
   - Make it **Public** (easier for Vercel)
   - Click **Create repository**

## Step 2: Upload Your Files to GitHub

1. In your new repo, click the **Add file** button
2. Click **Upload files**
3. A file picker will open—download ALL the files from this outputs folder, then upload them:

**Files to upload:**
- package.json
- package-lock.json
- index.html
- vercel.json
- vite.config.js
- The entire `src` folder
- The entire `public` folder

(You can drag and drop multiple files at once)

4. At the bottom, click **Commit changes** (keep the default message)
5. Your repo is now ready!

## Step 3: Connect to Vercel

1. Go to **vercel.com**
2. Click **Sign Up** (you can use your GitHub login)
3. After signing in, click **+ New Project**
4. Click **Import Git Repository**
5. Paste your repo URL: `https://github.com/PottingInPink/pip-hub`
6. Click **Import**
7. Click **Deploy** (use the default settings)
8. Wait 2-3 minutes for it to build
9. You'll get a URL like: `https://pip-hub-xyz123.vercel.app`

## Step 4: Add to Your Phone's Home Screen

**iPhone (Safari):**
1. Open the Vercel link in Safari
2. Tap the Share button
3. Scroll down and tap **Add to Home Screen**
4. Name it "PIP Hub" and tap **Add**

**Android (Chrome):**
1. Open the Vercel link in Chrome
2. Tap the menu (three dots)
3. Tap **Install app**
4. Follow the prompts

## Done!

Your PIP Hub is now installed on your phone with a home screen icon. Tap it to start logging!

---

**Need help?** Let me know which step you're on.

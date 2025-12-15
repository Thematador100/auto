# 🚗 AI Auto Pro - Simple Setup Guide

This guide will help you get your AI Auto Inspection app up and running in **3 easy steps**!

---

## ✅ What You Need

1. A computer with internet access
2. A **free** Google Gemini API key (we'll show you how to get one)
3. About 10 minutes

---

## 📋 Step-by-Step Instructions

### Step 1: Get Your Free Gemini API Key

1. Go to this website: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click the **"Create API Key"** button
4. Copy the API key that appears (it looks like a long string of random letters and numbers)
5. **Keep this key safe** - you'll need it in the next step!

---

### Step 2: Add Your API Key to the Project

1. Open the project folder on your computer (the folder with all these files)
2. Find the file called **`.env.local`** and open it with any text editor (like Notepad)
3. You'll see this line:
   ```
   VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
   ```
4. Replace `YOUR_API_KEY_HERE` with the API key you copied in Step 1
5. Save the file and close it

**Example:**
```
VITE_GEMINI_API_KEY=AIzaSyBcD3fG4H5jK6lM7nO8pQ9rS0tU1vW2xY3z
```

---

### Step 3: Run the App

**Option A: Run Locally (Easiest)**

1. Open a terminal or command prompt in the project folder
2. Type this command and press Enter:
   ```
   npm run dev
   ```
3. Wait a few seconds, and you'll see a message like:
   ```
   Local: http://localhost:3000
   ```
4. Open your web browser and go to **http://localhost:3000**
5. **That's it!** Your app is now running! 🎉

**Option B: Build for Production**

If you want to create a version to deploy to a website:

1. Open a terminal in the project folder
2. Run:
   ```
   npm run build
   ```
3. The built files will be in the `dist` folder
4. You can upload the `dist` folder to any web hosting service

---

## 🎯 What This App Does

**AI Auto Pro** is a smart vehicle inspection tool that:
- Scans VIN numbers
- Reads OBD diagnostic codes
- Performs comprehensive vehicle inspections
- Generates professional inspection reports using AI
- Includes a chatbot for automotive questions

---

## 🛠️ Troubleshooting

**Problem: "VITE_GEMINI_API_KEY environment variable is not set"**
- Solution: Make sure you completed Step 2 and saved the `.env.local` file

**Problem: "npm: command not found"**
- Solution: You need to install Node.js first from https://nodejs.org/

**Problem: The app won't load**
- Solution: Make sure you have a working internet connection (the AI needs to connect to Google's servers)

**Problem: API errors or "quota exceeded"**
- Solution: Check that your API key is correct and that you haven't exceeded the free tier limits

---

## 📞 Need Help?

If you get stuck:
1. Check the troubleshooting section above
2. Make sure all the steps were followed exactly
3. Try closing everything and starting over from Step 3

---

## 🎨 Customization (Optional)

Want to change the app's appearance or features? Here are the key files:

- **App name/title**: Edit `index.html` (line 6)
- **Colors/theme**: Edit `index.html` (lines 18-27)
- **Inspection checklist items**: Edit `constants.ts`

---

## ✨ You're All Set!

Your AI Auto Inspection app is ready to use. Enjoy inspecting vehicles with the power of AI!

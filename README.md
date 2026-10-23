# ExpenseFlow — AI-Powered Personal Finance Assistant 💸

ExpenseFlow is a personal finance management web application designed to help users track expenses, manage budgets, plan savings goals, and make more informed financial decisions with the help of an AI-powered assistant named **Vajp**.

Unlike a basic expense tracker, ExpenseFlow aims to combine financial tracking with AI-powered guidance and purchase affordability analysis.

## ✨ Features

### 🤖 Vajp — AI Financial Assistant
- Ask questions about budgeting, saving, spending, and financial goals.
- Receive contextual responses based on the financial information supplied to the assistant.
- AI integration using Gemini with Groq fallback support.

### 🛍️ Before You Buy — Purchase Simulator
- Evaluate whether a planned purchase fits within the available spending limit.
- Receive a BUY, WAIT, or AVOID recommendation.
- Understand potential effects on spending and savings goals.

### 📊 Expense Tracking & Analytics
- Track income and expenses.
- Review spending patterns and financial summaries.
- Understand spending across categories.

### 🎯 Budget & Savings Goals
- Organize budgets and financial goals.
- Monitor progress toward savings targets.
- Support more intentional financial planning.

### 👤 User Profile
- Manage personal profile information.
- Access account-related settings.

## 🛠️ Tech Stack

**Frontend**
- React.js
- Vite
- CSS
- JavaScript

**Backend**
- Node.js
- Express.js
- REST APIs

**Database**
- MongoDB

**AI Integration**
- Google Gemini API
- Groq API fallback

**Deployment**
- Vercel

## 🚀 Live Demo

[Open ExpenseFlow](https://syntecxhub-vajp-expense-tracker-ckp.vercel.app/)

## 💻 Source Code

[View the GitHub Repository](https://github.com/vp51278-afk/Syntecxhub_VAJP-Expense_Tracker)

## ⚙️ Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/vp51278-afk/Syntecxhub_VAJP-Expense_Tracker.git
cd Syntecxhub_VAJP-Expense_Tracker
```

### 2. Install dependencies

Navigate to the frontend and backend directories and install dependencies using `npm install`.

```bash
npm install
```

Run this command separately in each application directory containing its own `package.json`.

### 3. Configure environment variables

Create the required `.env` files based on your application's configuration.

Typical backend variables may include:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

Configure the frontend API URL according to your backend deployment:

```env
VITE_API_URL=your_backend_api_url
```

**Important:** Replace the example values with your own configuration. Never commit API keys, database credentials, or real `.env` files to GitHub.

### 4. Start the application

Start the backend and frontend in separate terminals using the scripts defined in their respective `package.json` files.

## 🎯 Project Goal

The goal of ExpenseFlow is to go beyond recording transactions by combining expense tracking, purchase simulation, and AI-powered financial guidance in one application.

## 👩‍💻 Developer

**Vaishnavi Pandey**

Built as a full-stack development project to explore React, backend API development, database integration, deployment, and LLM-powered application features.

---

*ExpenseFlow — Track smarter. Plan better. Spend thoughtfully.*

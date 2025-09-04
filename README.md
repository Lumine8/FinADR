
# FinADR - Your Finance and Life Advisor

<h1 align="center">
  <img src="./src/assets/fullLogo.png" alt="FinADR Logo" width="300"/>
</h1>

**FinADR (Finance and Life Advisor)** is a modern, intelligent expense tracking application designed to provide users with a seamless way to manage personal finances and collaborate on shared expenses with others. Leveraging powerful AI, FinADR goes beyond simple logging to offer smart insights and suggestions, truly acting as a financial co-pilot.

## ✨ Key Features

-   **Secure Authentication:** Users can sign up and log in securely with email and password. On sign-up, a unique, random username is generated to protect privacy.
    
-   **Collaborative Expense Pools:** Create shared expense pools for trips, household bills, or any group activity. Invite others easily with a unique Pool ID.
    
-   **Intelligent Bill Splitting:** Split bills among any number of pool members with just a few clicks. The app handles the math and logs the expense for everyone involved.
    
-   **AI-Powered Insights:** Get a personalized analysis of your spending habits and actionable savings tips tailored to your location (Vellore, India) using the Google Gemini API.
    
-   **Smart Category Suggestions:** When adding an expense, the AI suggests the most relevant category based on the title, speeding up the logging process.
    
-   **Interactive Spending Chart:** Visualize your expenses with a dynamic doughnut chart that updates in real-time.
    
-   **Monthly Tracking & Filtering:** Easily filter your expenses by month and year to review your financial history and track progress over time.
    
-   **Full User Control:** Users can manage their profile, create and join pools, and have the ability to leave any pool at any time.
    

## 🚀 Tech Stack

-   **Frontend:** Built with **React** and bundled with **Vite** for a fast, modern development experience.
    
-   **Charting:** Interactive charts are powered by **Chart.js**.
    
-   **Backend & Database:** Leverages **Google Firebase** for:
    
    -   Secure User Authentication
        
    -   Real-time NoSQL database with **Firestore**
        
    -   File hosting with **Firebase Storage** (for future features like profile pictures)
        
-   **Artificial Intelligence:** All smart features are powered by the **Google Gemini API**.
    

## ⚙️ Setup and Installation

Follow these steps to get a local copy of FinADR up and running on your machine.

### Prerequisites

-   **Node.js** (v16 or later) and npm. You can download it [here](https://nodejs.org/ "null").
    
-   A **Firebase** project. You can create one for free at the [Firebase Console](https://console.firebase.google.com/ "null").
    
-   A **Google Gemini API Key**. You can get one from the [Google AI for Developers](https://ai.google.dev/ "null") website.
    

### Installation Steps

1.  **Clone the Repository**
    
    ```
    git clone [https://github.com/your-username/finadr-app.git](https://github.com/your-username/finadr-app.git)
    cd finadr-app
    
    ```
    
2.  **Install Dependencies**
    
    ```
    npm install
    
    ```
    
3.  **Firebase Setup**
    
    -   In your Firebase Console, enable **Authentication** (with the Email/Password provider), **Firestore**, and **Storage**.
        
    -   Navigate to **Project Settings > General** and register a new **Web App**.
        
    -   Firebase will give you a `firebaseConfig` object. You will need these keys for the next step.
        
4.  **Configure Environment Variables**
    
    -   Create a file named `.env.local` in the root of your project directory.
        
    -   Add your secret keys to this file. **Note:** Vite requires these variables to be prefixed with `VITE_`.
        
    
    ```
    VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
    VITE_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
    VITE_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
    VITE_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
    VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
    VITE_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
    VITE_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID"
    VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    
    ```
    
5.  **Set Up Firebase Security Rules**
    
    -   Copy the contents of `firestore.rules` from this project into the **Firestore > Rules** tab in your Firebase Console.
        
    -   Copy the contents of `storage.rules` from this project into the **Storage > Rules** tab in your Firebase Console. This is necessary for future profile picture functionality.
        
6.  **Run the Development Server**
    
    ```
    npm run dev
    
    ```
    

## 🚀 Deployment

This project is configured for easy deployment on **Vercel**.

1.  Push your project to a GitHub repository.
    
2.  Import the repository on the [Vercel Dashboard](https://vercel.com/new "null").
    
3.  Add the same environment variables from your `.env.local` file to the Vercel project settings.
    
4.  Authorize your live Vercel domain in your Firebase project's Authentication settings.
    
5.  Deploy!
    

## 🔮 Future Enhancements

-   **Budgeting & Goal Setting:** Allow users to set monthly spending limits per category.
    
-   **Recurring Expenses:** Add functionality to automatically log scheduled transactions like rent or subscriptions.
    
-   **Advanced Search and Filtering:** Implement a more robust search to find transactions by keyword, date range, or amount.

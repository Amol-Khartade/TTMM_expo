# TTMM (Tu Tera Main Mera)

TTMM is a smart, AI-powered expense splitting and personal finance management application built for modern mobile platforms using React Native, Expo, and Firebase. 

Whether you're splitting a dinner bill with friends or tracking your monthly budget and savings goals, TTMM provides a sleek, haptic-rich, and lightning-fast experience to manage your money effortlessly.

## ✨ Key Features

### 🤖 AI-Powered Receipt Scanner
- **Smart Data Extraction:** Upload or snap a photo of a receipt/screenshot. TTMM uses **Gemini AI** to automatically parse items, amounts, categories, and payment details (UPI IDs, payment apps used).
- **Auto-Fill:** Instantly populates the "Add Expense" form, saving you from manual data entry.

### 👥 Group Expense Splitting
- **Group Management:** Create groups and invite friends via their registered email addresses or a shareable invite link.
- **Flexible Splitting:** Add expenses and split them equally among members, or specify custom splits.
- **Simplified Debts:** Automatically calculates the most efficient way to settle balances (who owes whom) using advanced graph algorithms.

### 💰 Personal Finance (Spends Dashboard)
- **Monthly Budgets:** Set a custom monthly budget limit and track your real-time category spending. Includes toggleable **Budget Alerts** when you near your limit.
- **Recurring Bills:** Add and track monthly subscriptions or utility bills. Mark them as paid and never miss a due date.
- **Savings Goals:** Create custom savings goals with target amounts, initial deposits, and visual progress bars to help you stay on track.

### 🎨 Premium UI/UX & Customization
- **Glassmorphism Design:** Beautiful UI built with Tamagui and custom blur effects.
- **Customizable Profile:** Change your display name, adjust global currency preferences (USD, INR, EUR, etc.), and manage app settings.
- **Dark/Light Mode:** Full theming support with smooth transitions powered by Moti.
- **Haptic Feedback:** Native tactile responses integrated across all interactive components.

## 🛠️ Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (Expo Router)
- **UI & Styling:** [Tamagui](https://tamagui.dev/) & Moti (Animations)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) & [React Query](https://tanstack.com/query/latest)
- **Local Storage:** [React Native MMKV](https://github.com/mrousavy/react-native-mmkv) (Synchronous, ultra-fast storage)
- **Backend & Auth:** [Firebase](https://firebase.google.com/) (Auth & Firestore)
- **AI Integration:** Google Gemini 2.5 Flash API

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm
- [Expo CLI](https://docs.expo.dev/more/expo-cli/)
- Expo Go app installed on your iOS/Android device (for physical device testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ttmm.git
   cd ttmm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   The app requires API keys for Firebase and Gemini. 
   - Copy the `.env.example` file to create a `.env` file in the root directory.
   - Fill in your Firebase configuration and Gemini API Key:
   ```env
   # Firebase Config
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   
   # Gemini AI Config
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   EXPO_PUBLIC_GEMINI_MODEL=gemini-2.5-flash
   ```

### Running the App

1. **Start the Metro Bundler:**
   ```bash
   npx expo start -c
   ```

2. **Open on a Device/Emulator:**
   - Press `a` to open on an Android Emulator.
   - Press `i` to open on an iOS Simulator.
   - Scan the QR code shown in your terminal using the **Expo Go** app on your physical device.

---

## 🔒 Security & Authentication
TTMM enforces a strict routing authentication guard. User sessions are verified securely via Firebase. If a user logs out or has an expired session, they are instantly routed to the login screen, preventing unauthenticated access to the main dashboard. Local preferences (like selected currency or theme) remain cached via MMKV without exposing private user data.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

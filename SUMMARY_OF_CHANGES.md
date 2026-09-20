# TTMM — Architecture Modernization & Summary of Changes

> **Project**: TTMM ("Tera Tu Mera Mai" / Go Dutch) — Modern Splitwise Alternative  
> **Date**: September 20, 2026  
> **Target Runtime**: Expo SDK 56, React Native 0.85.3, React 19.2.3, TypeScript ~6.0.3  

---

## 📌 Executive Summary

The TTMM codebase has undergone an end-to-end modernization:
1. **Upgraded from Expo SDK 53 to Expo SDK 56**: Updated all core dependencies, babel presets, and TypeScript definitions to support React Native 0.85+ and the New Architecture.
2. **Replaced Legacy Stack**:
   - **State**: Redux Toolkit & AsyncStorage ➔ **MMKV + Zustand** (synchronous C++ persist engine) + **TanStack Query** (asynchronous server state).
   - **UI & Design**: React Native Paper ➔ **Tamagui Universal Design System**.
   - **Navigation**: React Navigation v7 manual stacks ➔ **`expo-router` v56** file-based routing with deep-link support.
   - **Lists & Animation**: `FlatList` ➔ **`@shopify/flash-list` v2** and **Moti** 60fps declarative animations.
   - **Forms**: Uncontrolled state ➔ **React Hook Form + Zod** schemas with split mathematics validation.
3. **Implemented Splitwise Alternative Features**:
   - Equal ("TTMM"), Exact Amounts, Percentage, and Shares split modes.
   - Graph-based Minimum Cash Flow (Debt Simplification) algorithm.
   - One-tap UPI Payment Intent (`upi://pay`) and Cash recording.
   - 1-on-1 Friends ledger & chronological activity audit feed.

---

## 🔄 Dependency Matrix

### ➕ Added Packages
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `expo` | `56.0.22` | Core Expo SDK 56 runtime |
| `expo-router` | `~56.2.21` | Native file-based routing and deep linking |
| `tamagui` | `^2.7.7` | Universal design system and component primitives |
| `@tamagui/config` | `^2.7.7` | Pre-bundled theme, media, and token configurations |
| `@tamagui/core` | `^2.7.7` | Zero-runtime styling engine |
| `@tamagui/lucide-icons` | `^1.144.4` | Clean vector iconography |
| `react-native-svg` | `~15.11.2` | Vector graphics support for icons |
| `react-native-mmkv` | `^4.3.2` | Ultra-fast C++ key-value storage engine |
| `zustand` | `^5.0.15` | Lightweight client-side UI state management |
| `@tanstack/react-query` | `^5.103.1` | Asynchronous API queries, cache invalidation & optimistic updates |
| `react-hook-form` | `^7.88.0` | Performant form state manager without re-render lag |
| `@hookform/resolvers` | `^5.9.1` | Resolver connecting React Hook Form with Zod |
| `zod` | `^4.6.5` | Type-safe schema validation |
| `@shopify/flash-list` | `2.0.2` | High-performance recycling virtualized lists |
| `moti` | `^0.30.0` | Declarative 60fps animations built on Reanimated |
| `react-native-worklets` | `0.8.3` | Reanimated 4 native worklet runtime |
| `react-dom` | `19.2.3` | Peer dependency for web compatibility |

### ➖ Removed Packages
- `@reduxjs/toolkit`, `react-redux`, `redux-persist` *(replaced by MMKV + Zustand & TanStack Query)*
- `@react-native-async-storage/async-storage` *(replaced by `react-native-mmkv`)*
- `react-native-paper` *(replaced by Tamagui)*
- `@react-navigation/bottom-tabs`, `@react-navigation/elements`, `@react-navigation/native`, `@react-navigation/stack` *(replaced by `expo-router`)*

---

## 📁 File System Architecture

```
D:\TTMM\TTMM_expo/
├── app/                                # expo-router File-Based Navigation
│   ├── _layout.tsx                     # Root Layout (TamaguiProvider, QueryClientProvider, Auth Gate)
│   ├── (auth)/
│   │   ├── _layout.tsx                 # Auth Stack Layout
│   │   ├── login.tsx                   # RHF + Zod Login Screen
│   │   └── signup.tsx                  # RHF + Zod Sign-up with UPI ID support
│   ├── (tabs)/
│   │   ├── _layout.tsx                 # Bottom Tabs Layout
│   │   ├── index.tsx                   # Groups List (FlashList, Net Balances Card, Moti)
│   │   ├── friends.tsx                 # 1-on-1 Friends Ledger Screen
│   │   ├── activity.tsx                # Chronological Audit Feed
│   │   └── profile.tsx                 # Settings (Dark Mode, Biometric Lock, Currency)
│   ├── group/
│   │   └── [id].tsx                    # Group Details (Expenses & Balances tabs, Simplify Debts)
│   ├── expense/
│   │   └── add.tsx                     # Add Expense Modal (Equal, Exact, %, Shares splits)
│   └── settle/
│       └── [id].tsx                    # Settle Debt Modal (UPI Intent & Cash recording)
├── queries/                            # TanStack Query Server State Hooks
│   ├── useGroups.ts                    # User groups query & creation mutations
│   ├── useExpenses.ts                  # Group expenses query & optimistic mutations
│   └── useSettlements.ts               # Settlement queries & completion mutations
├── schemas/                            # Zod Validation Schemas
│   ├── authSchema.ts                   # Login, signup, and group validation schemas
│   └── expenseSchema.ts                # Expense & settlement math validation schemas
├── services/                           # Pure Domain Services
│   ├── authService.ts                  # Firebase Authentication service
│   ├── debtSimplifier.ts               # Minimum Cash Flow debt simplification algorithm
│   ├── expensesService.ts              # Firebase Firestore expenses & settlements service
│   ├── groupsService.ts                # Firebase Firestore groups management service
│   ├── notificationService.ts          # Push notifications & in-app alerts service
│   ├── queryClient.ts                  # TanStack Query client configuration
│   └── upiService.ts                   # UPI Intent deep link URL builder & launcher
├── store/                              # Synchronous Client UI State
│   ├── useAppStore.ts                  # Zustand store with C++ MMKV persist engine
│   └── index.ts                        # Store barrel export
├── constants/
│   └── theme.ts                        # Pure theme tokens, spacing & typography
├── app.config.js                       # Expo config (New Architecture, plugins & Firebase)
├── package.json                        # Updated dependencies & "main": "expo-router/entry"
├── PLAN.md                             # Master Splitwise-Alternative implementation plan
├── SUMMARY_OF_CHANGES.md               # This summary document
└── tamagui.config.ts                   # Tamagui design system configuration
```

---

## 💡 Technical Highlights

### 1. Zero-Lag Hydration with MMKV + Zustand
```typescript
// store/useAppStore.ts
const storage = createMMKV({ id: 'ttmm-app-storage' });

export const mmkvStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.remove(name),
};
```
*Why this matters*: Unlike asynchronous AsyncStorage, MMKV is written in C++ and reads synchronously from memory-mapped files. The user's theme, session, and preferences hydrate instantaneously on app launch without UI flicker.

### 2. Debt Simplification (Minimum Cash Flow)
```typescript
// services/debtSimplifier.ts
export function simplifyDebts(balancesMap: Map<string, UserBalance>, currency: string = 'INR'): SimplifiedDebt[]
```
*Why this matters*: Converts complex n-way group debts into the theoretical minimum number of transactions using a greedy graph-reduction algorithm, saving users from multiple circular payments.

### 3. One-Tap UPI Settlement
```typescript
// services/upiService.ts
export function buildUPIUri({ payeeUpiId, payeeName, amount, currency, transactionNote }): string {
  return `upi://pay?pa=${payeeUpiId}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=${currency}&tn=${encodeURIComponent(transactionNote)}`;
}
```
*Why this matters*: Indian users can settle expenses in one tap by directly opening Google Pay, PhonePe, or Paytm with pre-filled amounts and payee details.

### 4. Split Math Verification via Zod
```typescript
// schemas/expenseSchema.ts
.refine((data) => {
  if (data.splitType === 'exact') {
    const totalSplits = data.splits.reduce((sum, s) => sum + s.amount, 0);
    return Math.abs(totalSplits - data.amount) < 0.01;
  }
  if (data.splitType === 'percentage') {
    const totalPct = data.splits.reduce((sum, s) => sum + (s.percentage ?? 0), 0);
    return Math.abs(totalPct - 100) < 0.1;
  }
  return true;
}, { message: 'Splits do not equal total expense amount', path: ['splits'] })
```
*Why this matters*: Guarantees that exact allocations or percentages match the total expense before allowing submission, preventing accounting discrepancies.

---

## 🧪 Verification & Health Check

- **TypeScript Compilation**:
  ```bash
  npx tsc --noEmit
  ```
  **Result**: `0 errors` (Clean exit code 0).

- **Expo Configuration & EAS Update**:
  - `app.config.js` updated with all required Expo 56 plugins (`expo-router`, `expo-font`, `expo-image`, `expo-status-bar`, `expo-web-browser`, `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/messaging`).
  - Configured EAS Update URL: `https://u.expo.dev/bbd3d1f1-0898-40d4-9d0a-a9a8f78a07e0`.
  - Configured runtime versions: `1.0.0` for Android, `appVersion` policy for iOS.
  - Synchronized Android native configuration: `AndroidManifest.xml` meta-data and `strings.xml` (`expo_runtime_version` set to `1.0.0`).
  - `package.json` entry point set to `"main": "expo-router/entry"`.

- **EAS Build & Hermes Fixes**:
  - **Hermes Compiler Path**: Removed legacy `hermesCommand = ... + "/sdks/hermesc/%OS-BIN%/hermesc"` from legacy build scripts.
  - **Firebase Dependencies Alignment**: Aligned `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`, and `@react-native-firebase/messaging` to synchronized version `^22.3.0`.

- **Continuous Native Generation (CNG) & Expo Doctor**:
  - Transitioned project to pure Continuous Native Generation (CNG): added `/android` and `/ios` to `.gitignore` and untracked stale native folders from Git.
  - Cleaned up deprecated `edgeToEdgeEnabled` key from [`app.config.js`](file:///D:/TTMM/TTMM_expo/app.config.js) per Expo SDK 56 / Android 16 guidelines.
  - Verified prebuild generation via `npx expo prebuild --no-install`.
  - **`npx expo-doctor` result**: **21/21 checks passed. No issues detected!**

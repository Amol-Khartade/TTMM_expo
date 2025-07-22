---
globs: "**/*{expense,Expense,split,Split,balance,Balance}*"
description: Apply when working with expense-related components, services, or calculations
alwaysApply: false
---

1. Always implement proper error handling with user-friendly messages
2. Use optimistic updates for better UX (show changes immediately, handle failures gracefully)
3. Implement proper validation for all financial calculations with floating-point precision handling
4. Use memoization for expensive calculations (React.memo, useMemo, useCallback)
5. Implement proper loading states and skeleton screens
6. Add proper accessibility labels and hints
7. Use proper TypeScript types for financial data (avoid 'any')
8. Implement proper caching and pagination for large expense lists
9. Use proper date formatting and localization
10. Always validate split amounts equal total expense amount (within floating-point tolerance)
11. Implement proper real-time updates with subscription cleanup
12. Use proper performance monitoring in development mode
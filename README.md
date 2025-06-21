# React + TypeScript + Vite + TailwindCSS

## 📂 Project Struture

src/
├── App.tsx
├── index.css
├── main.tsx
├── vite-env.d.ts

├── assets/

├── components/
│   ├── cases/
│   │   ├── CaseDetailPanel.tsx
│   │   └── CasesTable.tsx
│   └── ui/
│       ├── autocomplete-input.tsx
│       ├── background-gradient.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── popover.tsx
│       ├── select.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── ThemeToggle.tsx
│       ├── toast.tsx
│       └── toaster.tsx

├── context/
│   ├── AuthContext.tsx
│   └── ThemeProvider.tsx

├── features/
│   ├── auth/
│   │   ├── AuthCallback.tsx
│   │   ├── EmailVerificationNotice.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── dashboard/
│   │   ├── calendar/
│   │   │   └── CalendarPage.tsx
│   │   ├── cases/
│   │   │   ├── CasesPage.tsx
│   │   │   └── MainCases.tsx
│   │   ├── home/
│   │   │   ├── HomePage.tsx
│   │   │   ├── MainHome.tsx
│   │   │   └── RobotTraking.tsx
│   │   ├── reports/
│   │   │   └── ReportsPage.tsx
│   │   └── stats/
│   │       └── StatsPage.tsx
│   └── form/
│       ├── CommentsSection.tsx
│       ├── MedicalForm.tsx
│       ├── MedicalFormContainer.tsx
│       ├── PatientDataSection.tsx
│       ├── PaymentSection.tsx
│       ├── RecordsSection.tsx
│       ├── ServiceSection.tsx
│       └── payment/
│           ├── CurrencyConverter.tsx
│           ├── PaymentHeader.tsx
│           ├── PaymentMethodItem.tsx
│           ├── PaymentMethodsList.tsx
│           └── PaymentSectionSkeleton.tsx

├── hooks/
│   ├── use-toast.ts
│   ├── useAutocomplete.ts
│   ├── useDarkMode.ts
│   ├── useExchangeRate.ts
│   ├── usePatientAutofill.ts
│   └── useResetForm.ts

├── layouts/
│   ├── dashboardLayout/
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   └── Sidebar.tsx
│   └── formLayout/
│       └── Header.tsx

├── lib/
│   ├── cn.tsx
│   ├── form-schema.ts
│   ├── prepareSubmissionData.ts
│   ├── supabase-service.ts
│   ├── utils.ts
│   └── payment/
│       ├── payment-mapper.ts
│       └── payment-utils.ts

├── pages/
│   ├── Dashboard.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── Form.tsx
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx

├── routes/
│   ├── FormRoute.tsx
│   └── PrivateRoute.tsx

├── supabase/
│   ├── auth.ts
│   ├── config.ts
│   └── migrations/
│       └── 20250617034950_raspy_cave.sql

└── types/
    └── types.ts

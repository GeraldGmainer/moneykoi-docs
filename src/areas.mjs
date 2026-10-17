// One list for the sidebar (astro.config.mjs) and the home page; the id is the folder under
// src/data/ and src/content/docs/.
export const areas = [
  { id: 'monetization', name: 'Monetization', blurb: 'Free · Pro · Cloud, prices, paywall, store' },
  { id: 'accounts', name: 'Sign-in & sync', blurb: 'No-account mode, sign-in, claim, pause, the sync engine' },
  { id: 'books', name: 'Books & sharing', blurb: 'Books, invites, roles, read-only members, switching' },
  { id: 'bookings', name: 'Bookings', blurb: 'Booking form, transfers, quick booking, tags, trash, search' },
  { id: 'ledger', name: 'Categories & accounts', blurb: 'Category tree, money signs, bank accounts, balances' },
  { id: 'recurring', name: 'Recurring bookings', blurb: 'Rules, occurrences, skips, upcoming, reminders' },
  { id: 'budget-book', name: 'Budget Book', blurb: 'Periods, summary, transactions, calendar, filters, category activity' },
  { id: 'analytics', name: 'Analytics', blurb: 'Overview, spending, habits, accounts, export' },
  { id: 'budgets', name: 'Budgets, goals & loans', blurb: 'Caps, income goals, savings goals, loans, the budget calculator' },
  { id: 'forecast', name: 'Forecast', blurb: 'Balance line, safe-to-spend, planned payments, alerts' },
  { id: 'investments', name: 'Investments', blurb: 'Metals, crypto, currencies, prices, history' },
  { id: 'balance-check', name: 'Balance check', blurb: 'Count real balances, book the difference' },
  { id: 'scanner', name: 'Receipt scanner', blurb: 'On-device OCR, shop parsers, line items, photos' },
  { id: 'shopping', name: 'Shopping list', blurb: 'Lists, quantities, the board, the widget' },
  { id: 'home', name: 'Home & navigation', blurb: 'Home cards, bottom bar, drawer, widgets, the web shell' },
  { id: 'notifications', name: 'Notifications', blurb: 'Channels, opt-in, reminders, the inbox' },
  { id: 'data', name: 'Backup & data', blurb: 'Backup files, restore, CSV import and export, your data' },
  { id: 'privacy', name: 'Privacy & security', blurb: 'App lock, hide amounts, usage stats, web sign-in, what leaves the phone' },
  { id: 'settings', name: 'Settings & profile', blurb: 'Formats, language, profile, onboarding, changelog, feedback' },
  { id: 'platform', name: 'Platform & builds', blurb: 'iOS minimum, OS backup, tests, releases' },
];


// NOTE: These are simplified values for demonstration purposes.
// Actual values can change and depend on various factors.

// Social Security Contributions (paid by employee)
export const PENSION_RATE = 0.0976; // 9.76%
export const DISABILITY_RATE = 0.015; // 1.5%
export const SICKNESS_RATE = 0.0245; // 2.45%
export const TOTAL_ZUS_RATE = PENSION_RATE + DISABILITY_RATE + SICKNESS_RATE;

// Health Insurance Contribution
export const HEALTH_INSURANCE_RATE = 0.09; // 9%

// Income Tax
export const INCOME_TAX_RATE = 0.12; // 12%
export const TAX_DEDUCTIBLE_COSTS = 250; // Koszty uzyskania przychodu
export const TAX_REDUCING_AMOUNT = 300; // Kwota zmniejszająca podatek

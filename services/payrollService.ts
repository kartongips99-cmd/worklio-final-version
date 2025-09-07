
import {
  TOTAL_ZUS_RATE,
  HEALTH_INSURANCE_RATE,
  INCOME_TAX_RATE,
  TAX_DEDUCTIBLE_COSTS,
  TAX_REDUCING_AMOUNT
} from '../constants';
import { Employee, ContractType } from '../types';

export interface SalaryBreakdown {
  grossSalary: number;
  bonusAmount: number;
  totalGross: number;
  zusContributions: number;
  healthInsuranceContribution: number;
  incomeTaxAdvance: number;
  netSalary: number;
}

export function calculateNetSalary(grossSalary: number, employee: Employee, bonusAmount: number = 0): SalaryBreakdown {
  const totalGross = grossSalary + bonusAmount;

  // PIT-0 dla młodych (zwolnienie z podatku dochodowego dla osób poniżej 26 r.ż.)
  const isTaxExempt = employee.age < 26;

  // Zwolnienie ze składek ZUS dla studentów do 26 r.ż. na umowie zleceniu
  const isZusExempt = employee.age < 26 && employee.isStudent && employee.contractType === ContractType.UZ;

  const zusContributions = isZusExempt ? 0 : totalGross * TOTAL_ZUS_RATE;
  const healthInsuranceBase = totalGross - zusContributions;
  const healthInsuranceContribution = healthInsuranceBase * HEALTH_INSURANCE_RATE;

  const taxBase = Math.round(healthInsuranceBase - TAX_DEDUCTIBLE_COSTS);
  let incomeTaxAdvance = (taxBase * INCOME_TAX_RATE) - TAX_REDUCING_AMOUNT;
  
  if (incomeTaxAdvance < 0) {
      incomeTaxAdvance = 0;
  }
  
  // Zastosowanie ulgi PIT-0
  if (isTaxExempt) {
    incomeTaxAdvance = 0;
  }

  incomeTaxAdvance = Math.round(incomeTaxAdvance);

  const netSalary = totalGross - zusContributions - healthInsuranceContribution - incomeTaxAdvance;

  return {
    grossSalary,
    bonusAmount,
    totalGross,
    zusContributions,
    healthInsuranceContribution,
    incomeTaxAdvance,
    netSalary,
  };
}

import type { LoanRuleSnapshot } from '../group-rules/group-rules.types';

export interface ScheduleLine {
  installmentNo: number;
  dueDate: Date;
  principalDueMinor: number;
  interestDueMinor: number;
  penaltyDueMinor: number;
  totalDueMinor: number;
}

/**
 * Generate schedule for a loan using rule snapshot.
 * If loanInterestEnabled = false, all interest amounts are zero.
 * FLAT: total interest = principal * (rateBps/10000) * termPeriods; equal per period.
 */
export function generateSchedule(
  principalMinor: number,
  termPeriods: number,
  ruleSnapshot: LoanRuleSnapshot,
  firstDueDate: Date,
  periodLengthMonths: number = 1,
): ScheduleLine[] {
  const lines: ScheduleLine[] = [];
  const enabled = ruleSnapshot.loanInterestEnabled && ruleSnapshot.loanInterestRateBps > 0;
  const totalInterestMinor = enabled
    ? Math.round((principalMinor * ruleSnapshot.loanInterestRateBps * termPeriods) / 10000)
    : 0;
  const principalPerInstallment = Math.floor(principalMinor / termPeriods);
  const remainder = principalMinor - principalPerInstallment * termPeriods;
  const interestPerInstallment = Math.floor(totalInterestMinor / termPeriods);
  const interestRemainder = totalInterestMinor - interestPerInstallment * termPeriods;

  for (let i = 0; i < termPeriods; i++) {
    const dueDate = new Date(firstDueDate);
    dueDate.setMonth(dueDate.getMonth() + (i + 1) * periodLengthMonths);
    const principal = i === termPeriods - 1 ? principalPerInstallment + remainder : principalPerInstallment;
    const interest = i === termPeriods - 1 ? interestPerInstallment + interestRemainder : interestPerInstallment;
    const penalty = 0;
    lines.push({
      installmentNo: i + 1,
      dueDate,
      principalDueMinor: principal,
      interestDueMinor: interest,
      penaltyDueMinor: penalty,
      totalDueMinor: principal + interest + penalty,
    });
  }
  return lines;
}

import reportData from '#lib/data/reports-4471.json';
import reviewData from '#lib/data/report-review.json';
import { causeOf, groupByCause, uniqueById, type Cause, type Report } from '#lib/kb/causes';
import { tenantOf } from '#lib/kb/locales';

type Problem = Cause | 'one-day-shift' | 'cross-zone-day' | 'invite-before-booking' | 'unplaced';
type Override = { reportId: string; problem: Problem; expectedBody: string };
type Definition = {
  id: Problem;
  title: string;
  investigation: boolean;
  draft?: string;
  issueNumber?: number;
  explanation: string;
  exampleIds: string[];
};

export const definitions: Definition[] = [
  {
    id: 'parser', issueNumber: 1, title: 'The parser swaps day and month', investigation: false,
    draft: '01-parser.md',
    explanation: 'A correctly entered day-first date is interpreted month first. The shared parser needs to respect the tenant’s date convention.',
    exampleIds: ['R-41205', 'R-41200'],
  },
  {
    id: 'hint', issueNumber: 2, title: 'The form shows the wrong format hint', investigation: false,
    draft: '02-booking-v3-hint.md',
    explanation: 'booking-v3 displays MM/DD/YYYY, but the form reads the entry in the day-first tenant’s convention. The hint and interpretation must agree.',
    exampleIds: ['R-41241', 'R-41230'],
  },
  {
    id: 'one-day-shift', issueNumber: 3, title: 'Dates appear one day off', investigation: true,
    draft: '03-one-day-shifts.md',
    explanation: 'These reports share a symptom, not a proven cause. Recover the booking, stored value, invite, and displayed date before choosing a fix.',
    exampleIds: ['R-41202', 'R-41209', 'R-41620'],
  },
  {
    id: 'cross-zone-day', issueNumber: 4, title: 'The same meeting shows different local days', investigation: true,
    draft: '04-cross-zone-days.md',
    explanation: 'Check whether both invitations represent the same instant. Different calendar days across time zones can be correct; this is not yet a confirmed time-zone bug.',
    exampleIds: ['R-41344'],
  },
  {
    id: 'invite-before-booking', issueNumber: 5, title: 'An invite reportedly arrives before booking', investigation: true,
    draft: '05-invite-before-booking.md',
    explanation: 'Compare booking creation, invite generation, and delivery times. The report does not establish an exact one-day difference or a parser defect.',
    exampleIds: ['R-41236'],
  },
  {
    id: 'unplaced', title: 'Reports needing classification', investigation: true,
    explanation: 'Missing or unsupported tenant context requires review. Do not silently drop a report or merge it on subject alone.',
    exampleIds: [],
  },
];

const raw = reportData as Report[];
export const reports = uniqueById(raw).filter((r) => r.mergedInto === 4471);
export const rawRows = raw.filter((r) => r.mergedInto === 4471).length;
export const duplicateRows = rawRows - reports.length;
const overrides = new Map((reviewData as Override[]).map((item) => [item.reportId, item]));
if (overrides.size !== reviewData.length) throw new Error('Duplicate reviewed report assignment');

for (const item of overrides.values()) {
  const report = reports.find((r) => r.id === item.reportId);
  if (!report || report.body !== item.expectedBody) throw new Error('Reviewed report changed: ' + item.reportId);
  if (!definitions.some((d) => d.id === item.problem && d.investigation)) throw new Error('Invalid review assignment');
}

export const originalGroups = groupByCause(reports, tenantOf);
export const draftGroups = definitions.map((definition) => {
  const assigned = reports.filter((r) => (overrides.get(r.id)?.problem ?? causeOf(r, tenantOf(r)) ?? 'unplaced') === definition.id);
  return {
    ...definition,
    reports: assigned,
    examples: assigned.filter((r) => definition.exampleIds.includes(r.id)),
  };
}).filter((g) => g.reports.length > 0);

const ids = draftGroups.flatMap((g) => g.reports.map((r) => r.id));
if (ids.length !== reports.length || new Set(ids).size !== reports.length) throw new Error('Draft groups do not partition the report IDs');

export const movedReports = reports.filter((r) => overrides.has(r.id));
export const intakeDisagreements = reports.filter((r) => r.meta.intakeTag !== causeOf(r, tenantOf(r))).length;
export const receivedDays = reports.map((r) => r.receivedAt.slice(0, 10)).sort();
export const tenantName = (report: Report) => tenantOf(report)?.name ?? report.tenant;

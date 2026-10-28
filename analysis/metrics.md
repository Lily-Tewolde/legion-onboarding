# Metric definitions (Legion's own list, from the JD)

Write the exact definition before computing anything. Every metric has a numerator, a denominator and a time window. Adjust to the columns Legion actually sends.

| Metric | Numerator | Denominator | Notes |
|---|---|---|---|
| Activation | Patients who complete the first meaningful step (define it) | Patients who signed up | Pick the step that predicts staying |
| Intake completion | Patients who finish intake | Patients who start intake | Split by device and drop-off question |
| Scheduling conversion | Patients who book a visit | Patients who finish intake | Split by insurance and time to first slot |
| First-visit completion | Patients who attend their first visit | Patients who booked one | The inverse of first-visit no-shows |
| Time to care | Days from signup to first visit | Patients with a first visit | Report the median, not the mean |
| Repeat-visit rate | Patients with a second visit within [x] days | Patients with a first visit | |
| Renewal completion | Renewals done on time | Renewals due in the window | Utah AI renewals: also concordance and escalations |
| Retention | Patients still in care at day 30, 60, 90 | Patients who started in that cohort | Cohort by start month |
| No-show rate | Visits missed without cancelling | Visits booked | Split by lead time and reminder sent |
| Support burden | Tickets or messages | Active patients | Group by reason |
| Ops cost per visit | Ops minutes or dollars | Visits completed | Yash's unit economics |
| Clinician minutes per visit | Clinician minutes | Visits completed | Split into data collection, decision-making, education |
| NPS / CSAT | Promoters minus detractors | Responses | Note the response rate |

## Guardrails to pair with any "fewer minutes" metric

NPS, clinical quality, escalations caught, complaints, adverse events. If one gets worse, the change isn't a win.

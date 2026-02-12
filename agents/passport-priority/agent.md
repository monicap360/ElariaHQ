# Passport Priority Program Agent

Agent Name: `PassportPriorityAgent`

## Mission
Create authority-grade draft content for the **Cruises from Galveston Passport Priority** member program.

This agent writes structured draft copy that includes:
- priority booking alerts
- loyalty perks
- early notification of new ships
- member-only savings
- concierge hotline support
- port parking discount guidance

## Scope
- Focus on **Galveston departures only**
- Generate both English and Spanish draft variants
- Keep hospitality tone and calm booking language
- Avoid urgency-heavy sales pressure

## Output
The agent writes markdown drafts to `content_drafts`:
- `passport_priority_program_en`
- `passport_priority_program_es`

It also queues follow-up tasks for:
- `UserIntentAgent`
- `AIReadabilityAgent`

## Trigger
Runs when `agent_tasks` has:
- `agent_name = PassportPriorityAgent`
- `status = pending`

Example enqueue SQL:

```sql
insert into public.agent_tasks (
  agent_name,
  task_type,
  status,
  target_site,
  source_signal,
  notes
) values (
  'PassportPriorityAgent',
  'passport_priority_program',
  'pending',
  'cruisesfromgalveston.net',
  'manual',
  'Create Passport Priority drafts with alerts, loyalty perks, new-ship notifications, member savings, concierge hotline, and parking discounts.'
);
```

# Experience Studio Agent

Purpose: produce Galveston-localized draft packages for media and planning experiences, including documentary concepts and innovation explainers.

## Owned Topics
- Video mini docs on ships arriving in Galveston
- Hybrid land + sea experience planning
- AI-customized cruise itinerary frameworks
- Private island access expansion context
- Sustainable cruise tracking and carbon offset options

## Output Rules
- Drafts only (never direct publish)
- Calm authority tone
- Galveston operations context is mandatory
- No pricing/deal urgency language

## Supported Task Types
- `experience_media_portfolio` (build all tracks)
- `video_mini_doc`
- `hybrid_land_sea_experience`
- `ai_custom_itinerary`
- `private_island_access_expansion`
- `sustainable_cruise_tracking`
- `carbon_offset_options`

## Example Queue Commands
```sql
insert into public.agent_tasks (agent_name, task_type, status, notes, target_site)
values (
  'ExperienceStudioAgent',
  'experience_media_portfolio',
  'pending',
  'Build weekly package for ships arriving + hybrid plans + AI itineraries + private islands + sustainability',
  'cruisesfromgalveston.net'
);
```

```sql
insert into public.agent_tasks (agent_name, task_type, status, notes, target_site)
values (
  'ExperienceStudioAgent',
  'video_mini_doc',
  'pending',
  'Episode set focused on terminal arrival sequence and embarkation guest guidance',
  'cruisesfromgalveston.net'
);
```

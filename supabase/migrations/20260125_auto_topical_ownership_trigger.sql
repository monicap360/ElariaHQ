-- Auto-create explanation tasks when new knowledge topics arrive.
create or replace function public.run_topical_ownership_on_insert()
returns trigger
language plpgsql
security definer
as $$
declare
  subtopics text[];
begin
  if new.status not in ('missing', 'needs_update') then
    return new;
  end if;

  case new.scope
    when 'galveston' then
      subtopics := array[
        'Is Galveston the right cruise port?',
        'Driving vs flying to Galveston',
        'Best cruise length by distance',
        'Parking and arrival logistics',
        'Required documents',
        'Deposits and payment timing'
      ];
    when 'state' then
      subtopics := array[
        'Why Galveston works for this state',
        'Driving vs flying from this state',
        'Recommended cruise lengths',
        'Cost considerations'
      ];
    when 'city' then
      subtopics := array[
        'Exact drive routes and time',
        'Overnight stop guidance',
        'Parking strategy',
        'Family and group travel notes'
      ];
    when 'spanish' then
      subtopics := array[
        'Spanish explanation of full journey',
        'Document clarity',
        'Payment explanation'
      ];
    when 'operations' then
      subtopics := array[
        'Pricing consistency',
        'Listings accuracy',
        'Event alignment'
      ];
    else
      subtopics := array[]::text[];
  end case;

  insert into public.agent_tasks (agent_name, task_type, reference_id, notes)
  select
    'ExplanationQualityAgent',
    'outline',
    new.id,
    sub
  from unnest(subtopics) as sub;

  update public.knowledge_topics
  set status = 'draft'
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists knowledge_topics_auto_topical_ownership on public.knowledge_topics;
create trigger knowledge_topics_auto_topical_ownership
after insert on public.knowledge_topics
for each row execute function public.run_topical_ownership_on_insert();

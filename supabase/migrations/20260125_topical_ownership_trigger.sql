-- Trigger TopicalOwnershipAgent tasks when knowledge topics are inserted or updated.
create or replace function public.trigger_topical_ownership()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.status in ('missing', 'needs_update')
     and (tg_op = 'INSERT' or (tg_op = 'UPDATE' and new.status is distinct from old.status)) then
    insert into public.agent_tasks (
      agent_name,
      task_type,
      reference_id,
      status,
      notes
    )
    values (
      'TopicalOwnershipAgent',
      'map_topic',
      new.id,
      'pending',
      'Triggered automatically from knowledge_topics'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_knowledge_topic_created on public.knowledge_topics;
drop trigger if exists knowledge_topics_auto_topical_ownership on public.knowledge_topics;
create trigger on_knowledge_topic_created
after insert or update of status on public.knowledge_topics
for each row execute function public.trigger_topical_ownership();

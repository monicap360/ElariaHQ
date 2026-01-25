-- Seed brand entity (yours).
insert into public.brand_entities (name, domain, entity_type, is_yours)
select 'Cruises From Galveston', 'cruisesfromgalveston.net', 'business', true
where not exists (
  select 1 from public.brand_entities where is_yours = true
);

-- Seed core authority topics.
insert into public.authority_topics (topic, topic_type, intent)
select * from (
  values
    ('Cruises from Galveston', 'hub', 'explainer'),
    ('Ships Sailing from Galveston', 'hub', 'guide'),
    ('Carnival Breeze from Galveston', 'ship', 'context'),
    ('Galveston Cruise Ports of Call', 'logistics', 'guide')
) as t(topic, topic_type, intent)
where not exists (
  select 1 from public.authority_topics at where at.topic = t.topic
);

-- Seed guardrails.
insert into public.content_guardrails (rule, applies_to, active)
select * from (
  values
    ('No implied affiliation or official status', 'all', true),
    ('No "best", "#1", "official", or "exclusive" language', 'all', true),
    ('No competitor naming in authority content', 'authority', true),
    ('Explanatory tone only; no sales copy', 'authority', true)
) as r(rule, applies_to, active)
where not exists (
  select 1 from public.content_guardrails cg where cg.rule = r.rule
);

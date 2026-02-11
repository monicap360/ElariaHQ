# Agent → Website Assignment Map

## cruisesfromgalveston.net
Role: Decision Authority (advisor/editor)

Agents:
- Authority Editor Agent
- News Desk Agent
- Journal Agent
- Passport Priority Agent

Content:
- "What this means for Galveston cruisers"
- Ship guides (advisor-grade)
- Port logic and context
- News explained, not repeated
- Passport Priority member planning architecture
- Priority booking alert framework
- Concierge hotline and parking discount guidance

No:
- deals
- rates
- urgency

Exception framework:
- Member savings can be discussed as structured loyalty perks
- No flash-sale language and no urgency pressure

Supabase inputs:
- news_signals
- content_drafts (site_target = cruisesfromgalveston)
- authority_topics
- brand_entities

Allowed authority_role:
- explainer
- journal
- context
- pr

## texascruiseport.com
Role: Regional Authority Feeder

Agents:
- Publisher Agent
- Market Signal Agent

Content:
- Port developments
- Deployment timelines (2026–2028)
- Infrastructure and capacity explainers

Supabase inputs:
- content_drafts (site_target = texascruiseport)

Allowed authority_role:
- explainer
- context

## houstoncruisetips.com
Role: Education & Prep

Agents:
- Publisher Agent
- Journal Agent (lite)

Content:
- First-time cruiser prep
- Driving vs flying
- What to pack
- When to arrive
- Galveston vs Florida cruising differences

Supabase inputs:
- content_drafts (site_target = houstoncruisetips)

Allowed authority_role:
- guide

## houstoncruiseshuttle.com
Role: Transportation Operations

Agents:
- Transportation Ops Agent
- Q&A Bot (logistics only)
- Revenue Manager (rates/inclusions)

Content:
- Airport ↔ ship transportation
- Hotel ↔ ship transportation
- Pickup timing logic
- "How it works" explainers

Language guardrails:
- Use "Transportation to/from"
- Never "port shuttle"
- Never "official"

Supabase inputs:
- transfer_locations
- transfer_requests
- pickup_events
- transfer_rules

## pier10parking.com / pier25parking.com
Role: Parking Capacity + Logistics

Agents:
- Ops Publisher Agent
- Parking Capacity Monitor Agent

Content:
- Availability updates
- Walking distance info
- When lots fill
- Cruise-day timing tips

Supabase inputs:
- parking_facilities
- parking_inventory
- parking_rules

## Social Platforms (Facebook, Events)
Role: Context distribution (no pricing, no urgency)

Supabase inputs:
- content_drafts (read-only, draft-only)

-- Seed major cruise lines as signal entities.
insert into public.competitor_entities (name, domain, type, notes)
values
  (
    'Royal Caribbean International',
    'royalcaribbean.com',
    'cruise_line',
    'Public announcements, ship tours, agent webinars, incentive programs'
  ),
  (
    'Carnival Cruise Line',
    'carnival.com',
    'cruise_line',
    'Bonus commissions, group promos, ship events, sales incentives'
  ),
  (
    'Disney Cruise Line',
    'disneycruise.disney.go.com',
    'cruise_line',
    'Ship previews, training webinars, onboard events'
  ),
  (
    'Norwegian Cruise Line',
    'ncl.com',
    'cruise_line',
    'Promotions, agent education, ship tours'
  ),
  (
    'MSC Cruises',
    'msccruises.com',
    'cruise_line',
    'Incentives, ship launches, trade events'
  ),
  (
    'Princess Cruises',
    'princess.com',
    'cruise_line',
    'Training events, destination marketing, group offers'
  );

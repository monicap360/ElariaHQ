-- Lock down EXECUTE permissions on trigger-only functions.
-- These functions are intended to be called only by table triggers.

revoke execute on function public.update_public_sailing_prices_updated_at() from public;
revoke execute on function public.update_public_sailing_prices_updated_at() from anon;
revoke execute on function public.update_public_sailing_prices_updated_at() from authenticated;

revoke execute on function public.trigger_topical_ownership() from public;
revoke execute on function public.trigger_topical_ownership() from anon;
revoke execute on function public.trigger_topical_ownership() from authenticated;

revoke execute on function public.run_topical_ownership_on_insert() from public;
revoke execute on function public.run_topical_ownership_on_insert() from anon;
revoke execute on function public.run_topical_ownership_on_insert() from authenticated;

revoke execute on function public.enqueue_agent_task() from public;
revoke execute on function public.enqueue_agent_task() from anon;
revoke execute on function public.enqueue_agent_task() from authenticated;

CREATE INDEX CONCURRENTLY "events_index_date_trunc_ts_event" ON events (DATE_TRUNC('minute', ts), event);

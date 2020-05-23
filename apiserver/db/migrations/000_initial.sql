-- TODO automatically migrate!

CREATE USER postgres;


CREATE TYPE event_data_type AS ENUM ('int', 'bigint', 'real', 'text', 'json');


CREATE TABLE "events" (ts TIMESTAMP NOT NULL,
                                    event TEXT NOT NULL,
                                               source_major TEXT NOT NULL,
                                                                 source_minor TEXT NOT NULL,
                                                                                   type event_data_type NOT NULL,
                                                                                                        data_int INTEGER, data_bigint BIGINT, data_real DOUBLE PRECISION, data_text TEXT, data_json JSON,
                                                                                                                                                                                          CONSTRAINT "events_pkey" PRIMARY KEY (source_major,
                                                                                                                                                                                                                                source_minor,
                                                                                                                                                                                                                                event,
                                                                                                                                                                                                                                ts));


CREATE INDEX CONCURRENTLY "events_index_ts" ON events (ts);


CREATE INDEX CONCURRENTLY "events_index_source_major_ts" ON events (source_major,
                                                                    ts);


CREATE INDEX CONCURRENTLY "events_index_event_ts" ON events(event, ts);


CREATE INDEX CONCURRENTLY "events_index_source_major_event_ts" ON events(source_major, event, ts);
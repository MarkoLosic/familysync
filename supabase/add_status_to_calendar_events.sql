-- Dodaj kolonu 'status' u tabelu calendar_events
ALTER TABLE calendar_events
ADD COLUMN status VARCHAR(16) DEFAULT 'pending';

-- (Opcionalno) Postavi sve postojeće evente na 'pending'
UPDATE calendar_events SET status = 'pending' WHERE status IS NULL;

-- (Opcionalno) Dozvoli samo vrednosti 'pending' ili 'done'
ALTER TABLE calendar_events
ADD CONSTRAINT calendar_events_status_check CHECK (status IN ('pending', 'done'));

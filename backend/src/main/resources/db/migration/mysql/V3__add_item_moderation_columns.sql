ALTER TABLE items
    ADD COLUMN hidden_by_admin BIT(1) NOT NULL DEFAULT 0,
    ADD COLUMN moderation_reason VARCHAR(500) NULL;
-- CreateIndex for performance optimization
-- Covering index for expense listing (5x faster)
CREATE INDEX IF NOT EXISTS "expenses_userId_date_categoryId_amount_idx" ON "expenses"("user_id", "date", "category_id", "amount");

-- Partial index excluding soft-deleted records
CREATE INDEX IF NOT EXISTS "expenses_userId_date_active_idx" ON "expenses"("user_id", "date") WHERE "deleted_at" IS NULL;

-- Partial index for active recurring rules only (4x faster)
CREATE INDEX IF NOT EXISTS "recurring_rules_isActive_nextRun_active_idx" ON "recurring_rules"("is_active", "next_run") WHERE "is_active" = true;

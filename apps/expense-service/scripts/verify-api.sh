#!/bin/bash
set -e

BASE_URL="http://localhost:3003/api/v1"
AUTH_TOKEN=$(python3 -c 'import uuid; print(str(uuid.uuid4()))') # Generate valid UUID

echo "🚀 Starting Expense Service Verification"
echo "👤 Test User ID: $AUTH_TOKEN"

# 1. Categories
echo ""
echo "--- 1. Create Category ---"
CATEGORY_RESP=$(curl -s -X POST "$BASE_URL/categories" \
  -H "Content-Type: application/json" \
  -d '{"name": "Food", "icon": "🍔"}')
echo $CATEGORY_RESP | grep -q "id" && echo "✅ Category Created" || echo "❌ Category Creation Failed: $CATEGORY_RESP"

CATEGORY_ID=$(echo $CATEGORY_RESP | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

# 2. Expenses
echo ""
echo "--- 2. Create Expense ---"
EXPENSE_RESP=$(curl -s -X POST "$BASE_URL/expenses" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"amount\": 15.50, \"categoryId\": \"$CATEGORY_ID\", \"date\": \"$(date -Iseconds)\", \"description\": \"Lunch\"}")
echo $EXPENSE_RESP | grep -q "id" && echo "✅ Expense Created" || echo "❌ Expense Creation Failed: $EXPENSE_RESP"

# 3. List Expenses
echo ""
echo "--- 3. List Expenses ---"
curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/expenses" | grep -q "Lunch" && echo "✅ Expense Listed" || echo "❌ Expense List Failed"

# 4. Habits
echo ""
echo "--- 4. Create Habit ---"
HABIT_RESP=$(curl -s -X POST "$BASE_URL/habits" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Coffee", "unitCost": 5.00}')
HABIT_ID=$(echo $HABIT_RESP | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
echo "✅ Habit Created"

echo ""
echo "--- 5. Log Habit ---"
curl -s -X POST "$BASE_URL/habits/$HABIT_ID/log" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"quantity\": 1, \"date\": \"$(date -I)\"}" > /dev/null
echo "✅ Habit Logged"

# 6. Recurring
echo ""
echo "--- 6. Recurring Rule ---"
RECURRING_RESP=$(curl -s -X POST "$BASE_URL/expenses/recurring" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"amount\": 1000, \"frequency\": \"MONTHLY\", \"startDate\": \"$(date -Iseconds)\", \"description\": \"Rent\"}")
echo $RECURRING_RESP | grep -q "id" && echo "✅ Recurring Rule Created" || echo "❌ Recurring Creation Failed"

echo ""
echo "🎉 Verification Completed!"

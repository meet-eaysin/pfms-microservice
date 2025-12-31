#!/bin/bash
# RabbitMQ Initialization Script
# Creates exchanges, queues, and bindings for PFMS

set -e

echo "Waiting for RabbitMQ to be ready..."
until rabbitmq-diagnostics -q ping; do
  sleep 5
done

echo "RabbitMQ is ready. Initializing..."

# Enable management plugin
rabbitmq-plugins enable rabbitmq_management

# ============================================
# CREATE USERS
# ============================================
echo "Creating users..."

# Use environment variables if provided, otherwise use defaults
RABBIT_USER=${RABBITMQ_USER:-pfms_user}
RABBIT_PASS=${RABBITMQ_PASSWORD:-placeholder_rabbitmq_password}

# Create pfms user if not exists
rabbitmqctl add_user "$RABBIT_USER" "$RABBIT_PASS" 2>/dev/null || true
rabbitmqctl set_permissions -p / "$RABBIT_USER" ".*" ".*" ".*"
rabbitmqctl set_user_tags "$RABBIT_USER" administrator

# ============================================
# CREATE VIRTUAL HOSTS
# ============================================
echo "Creating virtual hosts..."
rabbitmqctl add_vhost pfms 2>/dev/null || true
rabbitmqctl set_permissions -p pfms guest ".*" ".*" ".*"
rabbitmqctl set_permissions -p pfms "$RABBIT_USER" ".*" ".*" ".*"

# ============================================
# CREATE EXCHANGES
# ============================================
echo "Creating exchanges..."

# Fanout exchanges
rabbitmqadmin declare exchange name=user.events type=fanout durable=true
rabbitmqadmin declare exchange name=notification.events type=fanout durable=true

# Topic exchanges
rabbitmqadmin declare exchange name=financial.events type=topic durable=true
rabbitmqadmin declare exchange name=analytics.events type=topic durable=true
rabbitmqadmin declare exchange name=automation.events type=topic durable=true

# Direct exchanges
rabbitmqadmin declare exchange name=dlx.exchange type=direct durable=true

# ============================================
# CREATE QUEUES
# ============================================
echo "Creating queues..."

# User service queues
rabbitmqadmin declare queue name=user.created durable=true
rabbitmqadmin declare queue name=user.updated durable=true
rabbitmqadmin declare queue name=user.deleted durable=true

# Expense service queues
rabbitmqadmin declare queue name=expense.created durable=true
rabbitmqadmin declare queue name=expense.updated durable=true

# Income service queues
rabbitmqadmin declare queue name=income.created durable=true
rabbitmqadmin declare queue name=income.updated durable=true

# Investment service queues
rabbitmqadmin declare queue name=investment.created durable=true
rabbitmqadmin declare queue name=investment.updated durable=true

# Loan service queues
rabbitmqadmin declare queue name=loan.created durable=true
rabbitmqadmin declare queue name=loan.payment_made durable=true

# Group service queues
rabbitmqadmin declare queue name=group.created durable=true
rabbitmqadmin declare queue name=group.expense_added durable=true
rabbitmqadmin declare queue name=group.settlement_completed durable=true

# Tax service queues
rabbitmqadmin declare queue name=tax.calculation durable=true

# Notification service queues
rabbitmqadmin declare queue name=notification.email durable=true
rabbitmqadmin declare queue name=notification.sms durable=true
rabbitmqadmin declare queue name=notification.push durable=true

# Analytics queues
rabbitmqadmin declare queue name=analytics.insights durable=true
rabbitmqadmin declare queue name=analytics.cache durable=true

# Automation queues
rabbitmqadmin declare queue name=automation.rule_execution durable=true
rabbitmqadmin declare queue name=automation.trigger durable=true

# Dead letter queue
rabbitmqadmin declare queue name=dlq durable=true

# ============================================
# CREATE BINDINGS
# ============================================
echo "Creating bindings..."

# User event bindings
rabbitmqadmin declare binding source=user.events destination=user.created destination_type=queue
rabbitmqadmin declare binding source=user.events destination=user.updated destination_type=queue
rabbitmqadmin declare binding source=user.events destination=user.deleted destination_type=queue

# Financial event bindings (topic)
rabbitmqadmin declare binding source=financial.events destination=expense.created destination_type=queue routing_key="expense.created"
rabbitmqadmin declare binding source=financial.events destination=expense.updated destination_type=queue routing_key="expense.updated"
rabbitmqadmin declare binding source=financial.events destination=income.created destination_type=queue routing_key="income.created"
rabbitmqadmin declare binding source=financial.events destination=income.updated destination_type=queue routing_key="income.updated"
rabbitmqadmin declare binding source=financial.events destination=investment.created destination_type=queue routing_key="investment.created"
rabbitmqadmin declare binding source=financial.events destination=loan.created destination_type=queue routing_key="loan.created"
rabbitmqadmin declare binding source=financial.events destination=loan.payment_made destination_type=queue routing_key="loan.payment_made"
rabbitmqadmin declare binding source=financial.events destination=group.created destination_type=queue routing_key="group.created"
rabbitmqadmin declare binding source=financial.events destination=group.expense_added destination_type=queue routing_key="group.expense_added"

# Notification bindings
rabbitmqadmin declare binding source=notification.events destination=notification.email destination_type=queue
rabbitmqadmin declare binding source=notification.events destination=notification.sms destination_type=queue
rabbitmqadmin declare binding source=notification.events destination=notification.push destination_type=queue

# Analytics bindings
rabbitmqadmin declare binding source=analytics.events destination=analytics.insights destination_type=queue routing_key="*.insights"
rabbitmqadmin declare binding source=analytics.events destination=analytics.cache destination_type=queue routing_key="*.cache"

# Automation bindings
rabbitmqadmin declare binding source=automation.events destination=automation.rule_execution destination_type=queue routing_key="rule.executed"
rabbitmqadmin declare binding source=automation.events destination=automation.trigger destination_type=queue routing_key="automation.trigger"

# ============================================
# SET QUEUE ARGUMENTS
# ============================================
echo "Configuring queue parameters..."

# Set TTL and DLX for critical queues
for queue in user.created expense.created investment.created loan.payment_made; do
  rabbitmqadmin declare queue name=$queue arguments='{"x-message-ttl":86400000,"x-dead-letter-exchange":"dlx.exchange"}' durable=true || true
done

echo "RabbitMQ initialization completed successfully!"
echo ""
echo "========================================"
echo "RabbitMQ Initialization Summary:"
echo "========================================"
echo "Management UI: http://localhost:15672"
echo "Username: guest / $RABBIT_USER"
echo "Default VHOST: /"
echo "PFMS VHOST: pfms"
echo "========================================"

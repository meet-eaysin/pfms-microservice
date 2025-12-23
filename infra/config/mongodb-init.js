// MongoDB initialization script for PFMS AI/Analytics Service
db = db.getSiblingDB('admin');

// Create user if needed
try {
  db.createUser({
    user: 'pfms_user',
    pwd: 'pfms_password',
    roles: [
      { role: 'readWrite', db: 'ai_analytics_db' },
      { role: 'dbAdmin', db: 'ai_analytics_db' },
    ],
  });
  print('User created successfully');
} catch (e) {
  if (e.code === 48) {
    print('User already exists');
  } else {
    throw e;
  }
}

// Switch to AI database
db = db.getSiblingDB('ai_analytics_db');

// Create collections
db.createCollection('ml_models', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'modelType', 'version'],
      properties: {
        _id: { bsonType: 'objectId' },
        userId: { bsonType: 'string' },
        modelType: { enum: ['categorization', 'prediction', 'anomaly'] },
        version: { bsonType: 'string' },
        accuracy: { bsonType: 'number', minimum: 0, maximum: 1 },
        trainedAt: { bsonType: 'date' },
        features: { bsonType: 'object' },
        weights: { bsonType: 'object' },
      },
    },
  },
});

db.createCollection('expense_insights', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'insightType', 'title'],
      properties: {
        _id: { bsonType: 'objectId' },
        userId: { bsonType: 'string' },
        insightType: { enum: ['spending_pattern', 'savings_opportunity', 'risk_alert', 'anomaly'] },
        title: { bsonType: 'string' },
        description: { bsonType: 'string' },
        severity: { enum: ['low', 'medium', 'high', 'critical'] },
        category: { bsonType: 'string' },
        amount: { bsonType: ['double', 'null'] },
        date: { bsonType: 'date' },
        metadata: { bsonType: 'object' },
        isRead: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' },
      },
    },
  },
});

db.createCollection('ai_chat_history', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'sessionId', 'role', 'message', 'timestamp'],
      properties: {
        _id: { bsonType: 'objectId' },
        userId: { bsonType: 'string' },
        sessionId: { bsonType: 'string' },
        role: { enum: ['user', 'assistant'] },
        message: { bsonType: 'string' },
        intent: { bsonType: ['string', 'null'] },
        entities: { bsonType: ['object', 'null'] },
        response: { bsonType: 'object' },
        timestamp: { bsonType: 'date' },
      },
    },
  },
});

db.createCollection('analytics_cache', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'cacheKey', 'data'],
      properties: {
        _id: { bsonType: 'objectId' },
        userId: { bsonType: 'string' },
        cacheKey: { bsonType: 'string' },
        data: { bsonType: 'object' },
        expiresAt: { bsonType: 'date' },
        createdAt: { bsonType: 'date' },
      },
    },
  },
});

// Create indexes for optimal query performance
db.ml_models.createIndex({ userId: 1, modelType: 1 });
db.ml_models.createIndex({ trainedAt: -1 });

db.expense_insights.createIndex({ userId: 1, createdAt: -1 });
db.expense_insights.createIndex({ userId: 1, severity: 1 });
db.expense_insights.createIndex({ userId: 1, isRead: 1 });
db.expense_insights.createIndex({ date: 1 });

db.ai_chat_history.createIndex({ userId: 1, sessionId: 1, timestamp: -1 });
db.ai_chat_history.createIndex({ userId: 1, timestamp: -1 });
db.ai_chat_history.createIndex({ sessionId: 1 });

db.analytics_cache.createIndex({ userId: 1, cacheKey: 1 }, { unique: true });
db.analytics_cache.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Create text indexes for search
db.expense_insights.createIndex({ title: 'text', description: 'text' });

print('MongoDB collections and indexes created successfully');

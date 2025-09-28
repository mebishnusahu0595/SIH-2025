# 🗄️ MongoDB Atlas Database Structure

## 📊 Overview
- **Cluster**: Cluster0 (Your existing cluster)
- **Database**: `mindsupport`
- **Current Data**: 5.28 MB (preserved)
- **Status**: ✅ Connected and Ready

## 📋 Collections (Tables) Structure

### 👥 `users`
```javascript
{
  "_id": ObjectId,
  "email": "user@example.com",
  "password_hash": "hashed_password",
  "full_name": "John Doe",
  "role": "user", // or "admin", "doctor"
  "is_active": true,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### 👩‍⚕️ `doctor_applications`
```javascript
{
  "_id": ObjectId,
  "email": "doctor@example.com",
  "full_name": "Dr. Jane Smith",
  "medical_license": "ML123456",
  "specialty": "Psychiatry",
  "experience_years": 5,
  "phone": "+1234567890",
  "status": "pending", // "approved", "rejected"
  "created_at": ISODate,
  "reviewed_at": ISODate,
  "reviewed_by": ObjectId // admin user id
}
```

### 💬 `chat_sessions` (Auto-created)
```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId, // null for anonymous
  "session_id": "uuid",
  "messages": [
    {
      "role": "user", // or "assistant"
      "content": "message text",
      "timestamp": ISODate
    }
  ],
  "crisis_detected": false,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### 📝 `journal_entries` (Auto-created)
```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "title": "My Day",
  "content": "journal content",
  "mood_score": 7, // 1-10
  "tags": ["anxiety", "work"],
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### 🧠 `screening_results` (Auto-created)
```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId, // null for anonymous
  "test_type": "PHQ-9", // or "GAD-7"
  "responses": [
    {
      "question": "Little interest in doing things",
      "score": 2
    }
  ],
  "total_score": 15,
  "severity": "moderate",
  "recommendations": ["Consider therapy"],
  "created_at": ISODate
}
```

## 🔧 Indexes Created
- `users.email` (unique)
- `users.created_at`
- `doctor_applications.email` (unique)
- `doctor_applications.status`
- `chat_sessions.user_id`
- `chat_sessions.session_id`

## 🌍 Connection Details
```env
MONGODB_URL=mongodb+srv://sih-project:mebishnusahu0595@cluster0.fzo0qav.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DATABASE_NAME=mindsupport
```

## 🚀 Status
✅ **Ready to Use!** Your app is now connected to MongoDB Atlas in the cloud. All new users, chat sessions, and data will be automatically stored in your Atlas cluster.

## 📱 Test Your Setup
1. Go to `http://localhost:3000/auth/register`
2. Create a new account
3. Check MongoDB Atlas dashboard to see the new user appear in the `users` collection!

Your existing 5.28 MB of data is preserved and your app now runs entirely in the cloud! 🎉
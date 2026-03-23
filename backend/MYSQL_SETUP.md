# MySQL Database Setup Guide

## Overview
This pharmacy project now supports MySQL database for storing:
- **Users** (patients and admins)
- **Products** (medicines)
- **Orders** (purchases)
- **Reminders** (medication refills)
- **Chat History** (conversations)

---

## Setup Instructions

### 1. **Install MySQL Server**

#### On Windows:
- Download from: https://dev.mysql.com/downloads/mysql/
- Run installer and follow the wizard
- Default port: `3306`
- Create a user (recommended: `root` with password `password`)

#### On macOS:
```bash
brew install mysql
brew services start mysql
```

#### On Linux (Ubuntu/Debian):
```bash
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

---

### 2. **Create Database**

Open MySQL terminal and run:
```sql
CREATE DATABASE pharmacy_db;
```

Or from command line:
```bash
mysql -u root -p -e "CREATE DATABASE pharmacy_db;"
```

---

### 3. **Install Python Dependencies**

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- `sqlalchemy` - ORM framework
- `pymysql` - MySQL Python driver

---

### 4. **Configure Environment**

Create `.env` file in `backend/` directory:

```env
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=pharmacy_db
```

Adjust these values based on your MySQL configuration!

---

### 5. **Initialize Database**

```bash
cd backend
python init_db.py
```

This will:
✅ Create all database tables
✅ Seed initial test data (users, products)

To reset the database (development only):
```bash
python init_db.py reset
```

---

## Database Schema

### **users** table
```
id (VARCHAR) - Primary Key
name (VARCHAR) - User name
phone (VARCHAR) - Phone number (unique for patients)
shop_id (VARCHAR) - Shop ID (unique for admins)
password_hash (VARCHAR) - Hashed password
age (INT) - Patient age
role (ENUM) - "user" or "admin"
created_at, updated_at (DATETIME)
```

### **products** table
```
id (INT) - Primary Key
product_id (VARCHAR) - Unique product identifier
product_name (VARCHAR) - Medicine name
description (TEXT) - Product description
stock (INT) - Available quantity
price (FLOAT) - Price in rupees
prescription_required (BOOLEAN) - Needs prescription?
created_at, updated_at (DATETIME)
```

### **orders** table
```
id (INT) - Primary Key
patient_id (VARCHAR) - Foreign Key to users
order_date (DATETIME) - When ordered
total_amount (FLOAT) - Order total
status (VARCHAR) - "pending", "completed", "cancelled"
created_at, updated_at (DATETIME)
```

### **order_items** table
```
id (INT) - Primary Key
order_id (INT) - Foreign Key to orders
product_id (INT) - Foreign Key to products
quantity (INT) - Items ordered
price (FLOAT) - Price at purchase time
```

### **reminders** table
```
id (INT) - Primary Key
user_id (VARCHAR) - Foreign Key to users
product_id (INT) - Foreign Key to products
scheduled_date (DATETIME) - Reminder date
is_sent (BOOLEAN) - Reminder sent?
created_at (DATETIME)
```

### **chat_history** table
```
id (INT) - Primary Key
session_id (VARCHAR) - Chat session ID
user_id (VARCHAR) - Foreign Key to users (nullable)
message (TEXT) - User message
response (TEXT) - Bot response
created_at (DATETIME)
```

---

## Verify Installation

After initialization, verify tables were created:

```sql
USE pharmacy_db;
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
```

---

## Updating Backend Code

Your backend API routes can now use these database models. Example:

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.models import User, Product

@app.get("/users/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    return user
```

---

## Migration from JSON

The `init_db.py` script automatically migrates data from:
- `users_database.json` → `users` table
- `order_history.json` → `orders` table

Your existing JSON files remain unchanged!

---

## Troubleshooting

### Connection Error: "Can't connect to MySQL"
- Check MySQL is running: `mysql -u root -p`
- Verify `.env` credentials match your MySQL setup
- Ensure database `pharmacy_db` exists

### Permission Denied
- Create a new MySQL user:
```sql
CREATE USER 'pharmacy'@'localhost' IDENTIFIED BY 'safe_password';
GRANT ALL PRIVILEGES ON pharmacy_db.* TO 'pharmacy'@'localhost';
FLUSH PRIVILEGES;
```

### Table Already Exists
- Run: `python init_db.py reset` (WARNING: deletes all data)
- Or manually drop and recreate tables

---

## Next Steps

1. ✅ Run `python init_db.py` to create tables
2. ✅ Update your API routes to use SQLAlchemy models
3. ✅ Replace JSON file operations with database queries
4. ✅ Test with `pytest` or Postman

Happy coding! 🚀

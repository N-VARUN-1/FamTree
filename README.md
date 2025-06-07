# Famtree 🌳

**A modern web application for family tree management**  
*Visualize, organize, and explore your family connections interactively.*

![Famtree Demo](https://via.placeholder.com/800x400?text=Famtree+Demo) <!-- Replace with actual screenshot -->

---

## ✨ Features
- **Interactive Family Tree Visualization**  
  🎨 React Flow-powered drag-and-drop interface  
  🔗 Dynamic node connections for complex relationships

- **Secure & Scalable Backend**  
  🔒 JWT authentication with protected routes  
  🚀 Express.js RESTful APIs with MySQL optimization

- **User-Friendly Tools**  
  📧 Nodemailer integration for notifications  
  📱 Responsive design for all devices

---

## 🛠 Tech Stack
| Frontend               | Backend              | Database       | Utilities           |
|------------------------|----------------------|----------------|---------------------|
| React.js               | Node.js              | MySQL          | JWT                 |
| React Flow             | Express.js           |                | Nodemailer          |
| CSS Modules            | RESTful APIs         |                | FetchAPI            |

---

## 🚀 Installation
### Prerequisites
- Node.js ≥ v14
- MySQL ≥ 5.7
- npm/yarn

### Step-by-Step Setup
```bash
# Clone repository
git clone https://github.com/your-username/famtree.git
cd famtree

# Install dependencies
cd client && npm install
cd ../server && npm install

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your credentials

# Initialize database
mysql -u root -p < server/database/schema.sql

# Run development servers
cd ../server && npm start  # Backend (port 5000)
cd ../client && npm start  # Frontend (port 3000)

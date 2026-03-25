# Secure Login System - Complete Implementation

A comprehensive secure authentication and authorization system implementing multiple security layers including multi-factor authentication, encryption, digital signatures, and role-based access control.

## 🎯 Features

### Authentication
- ✅ **Single-Factor Authentication**: Username + Password
- ✅ **Multi-Factor Authentication**: Password + Email OTP
- ✅ **Email Verification**: Required for account activation
- ✅ **Account Locking**: After 3 failed login attempts

### Authorization & Access Control
- ✅ **3 Subjects**: Admin, Moderator, User
- ✅ **3 Objects**: Secure Data, User Data, System Config
- ✅ **Role-Based Access Control (RBAC)**: Enforced on all endpoints
- ✅ **Access Control Policy**: Documented and implemented

### Encryption & Security
- ✅ **AES-256-CBC Encryption**: For sensitive data
- ✅ **RSA Key Exchange**: 2048-bit RSA key pairs
- ✅ **Digital Signatures**: RSA-SHA256 for data integrity
- ✅ **Password Hashing**: bcrypt with salt (10 rounds)

### Encoding
- ✅ **QR Code Generation**: For OTP encoding (Base64)
- ✅ **Base64 Encoding**: Used in QR code generation

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Gmail account (for email OTP - optional, OTPs shown in console if not configured)

### Installation

1. **Install Backend Dependencies**
```bash
cd backend
npm install
```

2. **Configure Email (Optional)**
Edit `backend/mailer.js` and update:
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASS`: Your Gmail App Password

Or set environment variables:
```bash
export EMAIL_USER=your-email@gmail.com
export EMAIL_PASS=your-app-password
```

3. **Start the Server**
```bash
node server.js
```

The server will run on `http://localhost:3000`

4. **Open Frontend**
Open `frontend/index.html` in your browser or use a local server:
```bash
cd frontend
python -m http.server 8000
```

Then visit `http://localhost:8000`

## 📁 Project Structure

```
secure-login-system/
├── backend/
│   ├── auth.js              # Authentication & Authorization endpoints
│   ├── authz.js             # Authorization middleware
│   ├── cryptoUtil.js        # AES encryption/decryption
│   ├── signature.js         # Digital signature functions
│   ├── keygen.js            # RSA key generation
│   ├── qrUtil.js            # QR code generation
│   ├── mailer.js            # Email OTP sending
│   ├── db.js                # Database setup
│   ├── server.js            # Express server
│   └── users.db             # SQLite database
├── frontend/
│   ├── index.html           # Landing page
│   ├── register.html        # Registration
│   ├── login.html           # Login
│   ├── otp.html             # OTP verification
│   ├── verify-registration.html  # Email verification
│   ├── dashboard.html       # User dashboard
│   ├── secure.html          # Secure data access (Admin)
│   ├── user-data.html       # User data access (Admin/Mod)
│   ├── system-config.html   # System config (Admin)
│   ├── admin.html           # Admin panel
│   └── style.css            # Styling
├── ACCESS_CONTROL_POLICY.md # Access control documentation
├── SECURITY_DOCUMENTATION.md # Security risks & attacks
└── README.md                # This file
```

## 🔐 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login (sends OTP)
- `POST /api/verify-otp` - Verify OTP for login
- `POST /api/verify-registration` - Verify email for registration

### Access Control (3 Objects)
- `POST /api/secure-access` - Secure data (Admin only)
- `POST /api/user-data` - User data (Admin + Moderator)
- `POST /api/system-config` - System config (Admin only)

### Security Features
- `POST /api/decrypt-data` - Decrypt encrypted data
- `POST /api/verify-signature` - Verify digital signature
- `GET /api/qr-code/:username` - Get QR code for OTP

## 👥 User Roles

### Admin
- Full system access
- Can access: Secure Data, User Data, System Config
- Can manage all users

### Moderator
- User management access
- Can access: User Data only
- Cannot access: Secure Data, System Config

### User
- Basic authenticated access
- Can access: Own profile only
- Cannot access: Any administrative functions

## 🔒 Security Features

### Password Security
- bcrypt hashing with salt (10 rounds)
- Minimum 6 characters
- Requires special character
- Account locking after 3 failed attempts

### Multi-Factor Authentication
- Password (something you know)
- Email OTP (something you receive)
- OTP expires in 2 minutes
- Single-use OTPs

### Data Protection
- AES-256-CBC encryption for sensitive data
- RSA-SHA256 digital signatures for integrity
- Encrypted data storage in database
- Secure key management

### Access Control
- Role-based access control (RBAC)
- Server-side authorization checks
- Access control matrix implementation
- Policy-based access decisions

## 📚 Documentation

- **ACCESS_CONTROL_POLICY.md**: Complete access control policy with matrix
- **SECURITY_DOCUMENTATION.md**: Security levels, risks, attacks, and countermeasures
- **RUBRIC_COVERAGE_ANALYSIS.md**: Detailed rubric coverage analysis

## 🧪 Testing

### Test Users
Create users with different roles:
1. Admin user
2. Moderator user
3. Regular user

### Test Scenarios
1. Register → Verify Email → Login → Access Resources
2. Test access control for each role
3. Test encryption/decryption
4. Test digital signature verification
5. Test QR code generation

## ⚠️ Important Notes

- **Email Configuration**: If not configured, OTPs are displayed in console
- **Database**: SQLite database is created automatically
- **Keys**: RSA keys are generated automatically on first run
- **RSA keys are encrypted-at-rest**: Set `KEY_ENC_SECRET` before first run so RSA keys can be encrypted and later decrypted
- **Production**: This is a demonstration system. For production:
  - Use HTTPS
  - Implement rate limiting
  - Add comprehensive logging
  - Use secure key management
  - Regular security audits

## 📝 License

This project is for educational purposes.

---

**Status**: ✅ All rubric requirements implemented and documented

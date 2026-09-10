PORT=4100
MONGODB_URI=mongodb://127.0.0.1:27017/das_local
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5174

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail-address@example.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM="SmileCare <your-gmail-address@example.com>"
SMTP_SECURE=false
PASSWORD_RESET_OTP_TTL_MINUTES=10

# Development only: return OTP in API response when SMTP is not configured.
MAIL_DEV_RETURN_OTP=false
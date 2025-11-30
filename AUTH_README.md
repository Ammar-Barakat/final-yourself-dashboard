# Authentication Implementation

## Overview

The project now includes a complete authentication system with login functionality and protected routes.

## Files Created

### 1. `login.html`

- Clean, modern login page design
- Email and password input fields
- Password visibility toggle
- Responsive design matching the project's style
- Toast notifications for user feedback

### 2. `styles/login.css`

- Custom styling for the login page
- Teal/orange color scheme matching the brand
- Background with overlay effect
- Fully responsive design for all devices

### 3. `scripts/auth.js`

- Core authentication logic
- API integration with `/api/Auth/login` endpoint
- Token storage in localStorage
- Route protection for all pages except login
- Automatic redirect to login if not authenticated
- Logout functionality

### 4. Placeholder Images

- `media/imgs/logo-placeholder.png` - Replace with your actual logo
- `media/imgs/background-placeholder.png` - Replace with your actual background image

## API Integration

### Login Endpoint

```javascript
URL: "api/Auth/login"
Method: POST
Body: {
  "email": "user@example.com",
  "password": "password123",
  "deviceToken": ""  // Left empty as requested
}
```

### Expected Response

The auth system expects a response containing a token in one of these formats:

- `{ token: "..." }`
- `{ accessToken: "..." }`
- `{ data: { token: "..." } }`

If no token is found in the response, it will store "logged-in" as a placeholder.

## Protected Pages

All pages except `login.html` are now protected and require authentication:

- index.html
- products.html
- portfolio.html
- schools.html
- schools_add.html
- schools_edit.html
- schools_view.html
- students.html
- design.html
- settings.html

## Features

### Login Page

- ✅ Email validation
- ✅ Password visibility toggle
- ✅ Form validation
- ✅ Loading state during authentication
- ✅ Success/error toast notifications
- ✅ Automatic redirect after successful login

### Auth System

- ✅ Token-based authentication
- ✅ Automatic route protection
- ✅ Redirect to login if not authenticated
- ✅ Redirect to dashboard if already logged in (on login page)
- ✅ Logout functionality with confirmation
- ✅ Token persistence using localStorage

### Logout

- Available in the mobile navigation menu
- Confirmation dialog before logout
- Clears authentication token
- Redirects to login page

## Usage

### Testing

1. Open `login.html` in your browser
2. Enter credentials (connect to your API)
3. On successful login, you'll be redirected to `index.html`
4. To logout, click the logout button in the navigation menu

### Customization

1. Replace placeholder images:

   - Add your logo to `media/imgs/logo-placeholder.png`
   - Add your background to `media/imgs/background-placeholder.png`

2. Update API Base URL in `scripts/auth.js`:

   ```javascript
   const API_BASE_URL = "https://your-api-url.com";
   ```

3. Adjust colors in `styles/login.css` if needed

## Security Notes

- Tokens are stored in localStorage
- All protected routes check authentication on page load
- Token is automatically cleared on logout
- Login page redirects to dashboard if already authenticated

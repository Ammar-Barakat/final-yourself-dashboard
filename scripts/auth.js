import {
  showToast,
  showServerDownPage,
  isServerError,
} from "./utilis/pop-ups.js";

const API_BASE_URL = "https://yourself-demo.runasp.net";
// const API_BASE_URL = "https://localhost:44372";

function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
    setTimeout(() => loadingScreen.remove(), 300);
  }
}

const API = {
  Auth: {
    async login(email, password) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/ManageAuth/login-system-user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
              password: password,
            }),
          }
        );

        if (!response.ok) {
          try {
            const error = await response.json();
            console.error("Login error response:", error);
            throw new Error(error.message || error.title || "Login failed");
          } catch (parseError) {
            if (parseError.message && !parseError.message.includes("HTTP")) {
              throw parseError;
            }
            throw new Error(`HTTP ${response.status}: Login failed`);
          }
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },

    async refreshToken(refreshToken) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/ManageAuth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Utilis.getAuthToken()}`,
          },
          body: JSON.stringify(refreshToken),
        });

        if (!response.ok) {
          console.error(
            `[TokenRefresh] HTTP ${response.status}: Refresh failed`
          );
          return null;
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error("[TokenRefresh] Error:", error);
        return null;
      }
    },

    async getSystemUserProfile(accountId) {
      try {
        const token = Utilis.getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageAuth/get-system-user-profile/${accountId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          try {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch profile");
          } catch (parseError) {
            if (parseError.message && !parseError.message.includes("HTTP")) {
              throw parseError;
            }
            throw new Error(`HTTP ${response.status}: Failed to fetch profile`);
          }
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error("Get profile error:", error);
        throw error;
      }
    },
  },
};

// Role-Based Access Control Configuration
const RBAC = {
  // Define role hierarchy and permissions
  // Note: Role names must match exactly what comes from the API (with spaces)
  roles: {
    "Super Admin": {
      allowedPages: [
        "index.html",
        "products.html",
        "schools.html",
        "schools_add.html",
        "schools_edit.html",
        "schools_view.html",
        "students.html",
        "translations.html",
        "design.html",
        "portfolio.html",
        "settings.html",
        "account.html",
        "help.html",
      ],
      defaultPage: "index.html",
      settingsAccess: {
        account: true,
        systemUsers: true,
      },
    },
    Admin: {
      allowedPages: [
        "index.html",
        "products.html",
        "schools.html",
        "schools_add.html",
        "schools_edit.html",
        "schools_view.html",
        "students.html",
        "translations.html",
        "portfolio.html",
        "settings.html",
        "account.html",
        "help.html",
      ],
      defaultPage: "index.html",
      settingsAccess: {
        account: true,
        systemUsers: false,
      },
    },
    Designer: {
      allowedPages: [
        "design.html",
        "settings.html",
        "account.html",
        "help.html",
      ],
      defaultPage: "design.html",
      settingsAccess: {
        account: true,
        systemUsers: false,
      },
    },
  },

  // Get current page name
  getCurrentPage() {
    const path = window.location.pathname;
    let pageName = path.substring(path.lastIndexOf("/") + 1);

    // Handle empty path or paths ending with /
    if (!pageName || pageName === "") {
      pageName = "index.html";
    }

    // Handle paths without .html extension
    if (!pageName.includes(".")) {
      pageName = pageName + ".html";
    }

    return pageName;
  },

  // Check if role has access to a specific page
  hasPageAccess(role, pageName) {
    const roleConfig = this.roles[role];
    if (!roleConfig) return false;
    return roleConfig.allowedPages.includes(pageName);
  },

  // Get the default/redirect page for a role
  getDefaultPage(role) {
    const roleConfig = this.roles[role];
    // Default to index.html if role not found (not login.html to avoid loops)
    return roleConfig ? roleConfig.defaultPage : "index.html";
  },

  // Get settings access for a role
  getSettingsAccess(role) {
    const roleConfig = this.roles[role];
    return roleConfig
      ? roleConfig.settingsAccess
      : { account: false, systemUsers: false };
  },
};

const Utilis = {
  // Token management
  saveAuthToken(token) {
    localStorage.setItem("authToken", token);
  },

  getAuthToken() {
    return localStorage.getItem("authToken");
  },

  removeAuthToken() {
    localStorage.removeItem("authToken");
  },

  // Admin data management
  getAdminData() {
    const data = localStorage.getItem("adminData");
    return data ? JSON.parse(data) : null;
  },

  saveAdminData(adminData) {
    localStorage.setItem("adminData", JSON.stringify(adminData));
  },

  removeAdminData() {
    localStorage.removeItem("adminData");
    localStorage.removeItem("refreshToken");
  },

  // JWT Token expiration check
  isTokenExpired() {
    const token = this.getAuthToken();
    if (!token) return true;

    try {
      // JWT structure: header.payload.signature
      const parts = token.split(".");
      if (parts.length !== 3) return true;

      // Decode the payload (base64url encoded)
      const payload = parts[1];
      // Handle base64url encoding (replace - with + and _ with /)
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const decoded = JSON.parse(jsonPayload);

      // Check if exp claim exists
      if (!decoded.exp) {
        console.warn("[Auth] Token has no expiration claim");
        return false; // If no exp, assume valid
      }

      // exp is in seconds, Date.now() is in milliseconds
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();

      // Add a small buffer (30 seconds) to account for clock skew
      const isExpired = currentTime >= expirationTime - 30000;

      if (isExpired) {
        console.log("[Auth] Token expired at:", new Date(expirationTime));
      }

      return isExpired;
    } catch (error) {
      console.error("[Auth] Error decoding token:", error);
      return true; // If we can't decode, assume expired
    }
  },

  // Get token expiration date
  getTokenExpiration() {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const decoded = JSON.parse(jsonPayload);
      return decoded.exp ? new Date(decoded.exp * 1000) : null;
    } catch (error) {
      return null;
    }
  },

  // Auth check - checks for valid token or refresh token
  isAuthenticated() {
    const hasToken = !!this.getAuthToken();
    if (!hasToken) return false;

    // Check if token is expired
    if (this.isTokenExpired()) {
      // Check if refresh token is also expired
      if (this.isRefreshTokenExpired()) {
        console.log(
          "[Auth] Both access and refresh tokens expired, clearing auth data"
        );
        this.clearAuth();
        return false;
      }

      // If we have a valid refresh token, consider still authenticated
      // TokenRefresher will handle the refresh
      const hasRefreshToken = !!this.getRefreshToken();
      if (hasRefreshToken) {
        console.log(
          "[Auth] Access token expired but refresh token still valid"
        );
        return true;
      }

      console.log(
        "[Auth] Token is expired and no refresh token, clearing auth data"
      );
      this.clearAuth();
      return false;
    }

    return true;
  },

  // Role check
  getRole() {
    const adminData = this.getAdminData();
    return adminData?.role || null;
  },

  logout() {
    this.removeAuthToken();
    this.removeAdminData();
    // Clear session storage (landscape recommendation, etc.)
    sessionStorage.clear();
    // Use replace to prevent back navigation, but don't immediately redirect
    // as the caller should handle any additional cleanup
    window.location.replace("./login.html");
  },

  // Force clear all auth data synchronously
  clearAuth() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminData");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("refreshTokenExpiry");
  },

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  },

  // Save refresh token
  saveRefreshToken(token) {
    localStorage.setItem("refreshToken", token);
  },

  // Get refresh token expiry time
  getRefreshTokenExpiry() {
    const expiry = localStorage.getItem("refreshTokenExpiry");
    return expiry ? new Date(expiry) : null;
  },

  // Save refresh token expiry time
  saveRefreshTokenExpiry(expiryTime) {
    localStorage.setItem("refreshTokenExpiry", expiryTime);
  },

  // Check if refresh token is expired
  isRefreshTokenExpired() {
    const expiry = this.getRefreshTokenExpiry();
    if (!expiry) return true;

    // Add 30 second buffer
    return Date.now() >= expiry.getTime() - 30000;
  },
};

// Token Refresher - Automatically refreshes access token before expiration
const TokenRefresher = {
  timerId: null,
  isRefreshing: false,

  // Start the token refresh timer
  start() {
    // Clear any existing timer
    this.stop();

    const expirationDate = Utilis.getTokenExpiration();
    if (!expirationDate) {
      console.log("[TokenRefresher] No expiration date found");
      return;
    }

    const now = Date.now();
    const expiresIn = expirationDate.getTime() - now;

    if (expiresIn <= 0) {
      // Token already expired, try to refresh immediately
      console.log("[TokenRefresher] Token already expired, attempting refresh");
      this.refresh();
      return;
    }

    // Refresh 1 minute before expiration (or immediately if less than 1 minute left)
    const refreshIn = Math.max(expiresIn - 60000, 0);

    console.log(
      `[TokenRefresher] Token expires in ${Math.round(expiresIn / 1000)}s`
    );
    console.log(
      `[TokenRefresher] Will refresh in ${Math.round(refreshIn / 1000)}s`
    );

    // Set refresh timer
    this.timerId = setTimeout(() => {
      this.refresh();
    }, refreshIn);
  },

  // Stop the timer
  stop() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  },

  // Refresh the access token
  async refresh() {
    if (this.isRefreshing) {
      console.log("[TokenRefresher] Already refreshing, skipping");
      return;
    }

    // Check if refresh token itself is expired
    if (Utilis.isRefreshTokenExpired()) {
      console.log("[TokenRefresher] Refresh token expired, logging out");
      this.handleLogout();
      return;
    }

    this.isRefreshing = true;
    console.log("[TokenRefresher] Refreshing access token...");

    try {
      const refreshToken = Utilis.getRefreshToken();

      if (!refreshToken) {
        console.log("[TokenRefresher] No refresh token available, logging out");
        this.handleLogout();
        return;
      }

      const result = await API.Auth.refreshToken(refreshToken);

      if (result && result.accessToken) {
        // Save new access token
        Utilis.saveAuthToken(result.accessToken);
        console.log("[TokenRefresher] Token refreshed successfully");

        // Restart the timer for the new token
        this.isRefreshing = false;
        this.start();
      } else {
        // Refresh failed (refresh token expired or invalid)
        console.log("[TokenRefresher] Refresh failed, logging out");
        this.handleLogout();
      }
    } catch (error) {
      console.error("[TokenRefresher] Error refreshing token:", error);

      // If server is down, show server down page instead of logging out
      if (isServerError(error)) {
        this.isRefreshing = false;
        showServerDownPage();
        return;
      }

      this.handleLogout();
    }
  },

  // Handle logout when refresh fails
  handleLogout() {
    this.isRefreshing = false;
    this.stop();
    Utilis.clearAuth();
    window.location.replace("./login.html");
  },
};

const UI = {
  AdminBadge: {
    async render() {
      try {
        const adminData = Utilis.getAdminData();
        if (!adminData?.accountId) {
          console.error("No accountId found in localStorage");
          return;
        }

        // Fetch fresh profile data from API
        const profileData = await API.Auth.getSystemUserProfile(
          adminData.accountId
        );

        // Update localStorage with fresh data
        const updatedAdminData = {
          accountId: profileData.id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phoneNumber: profileData.phoneNumber,
          role: profileData.role,
          profilePictureUrl: profileData.profilePictureUrl,
        };
        Utilis.saveAdminData(updatedAdminData);

        const fullName =
          `${profileData.firstName} ${profileData.lastName}`.trim();
        const profilePicUrl =
          profileData.profilePictureUrl || "./media/imgs/profile-icon.png";

        // Update page header profile section
        const pageHeaderProfile = document.querySelector(
          ".page-header-profile"
        );
        if (pageHeaderProfile) {
          pageHeaderProfile.innerHTML = `
            <div class="admin-badge">
              <button class="admin-badge-button" type="button">
                <img src="${profilePicUrl}" alt="${fullName}" class="admin-avatar js-header-profile-img" onerror="this.src='./media/imgs/profile-icon.png'">
                <span class="admin-name">${fullName}</span>
                <i class="bi bi-chevron-down"></i>
              </button>
              <div class="admin-dropdown">
                <div class="admin-dropdown-header">
                  <img src="${profilePicUrl}" alt="${fullName}" class="admin-dropdown-avatar" onerror="this.src='./media/imgs/profile-icon.png'">
                  <div class="admin-dropdown-info">
                    <div class="admin-dropdown-name">${fullName}</div>
                    <div class="admin-dropdown-role">${profileData.role}</div>
                  </div>
                </div>
                <div class="admin-dropdown-divider"></div>
                <div class="admin-dropdown-email">
                  <i class="bi bi-envelope"></i>
                  <span>${profileData.email}</span>
                </div>
                <div class="admin-dropdown-divider"></div>
                <a href="settings.html" class="admin-dropdown-item">
                  <i class="bi bi-gear"></i>
                  <span>Settings</span>
                </a>
                <button class="admin-dropdown-item admin-dropdown-logout" type="button">
                  <i class="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          `;

          // Setup dropdown toggle
          const badgeButton = pageHeaderProfile.querySelector(
            ".admin-badge-button"
          );
          const dropdown = pageHeaderProfile.querySelector(".admin-dropdown");

          badgeButton.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("show");
          });

          // Close dropdown when clicking outside
          document.addEventListener("click", () => {
            dropdown.classList.remove("show");
          });

          // Prevent dropdown from closing when clicking inside it
          dropdown.addEventListener("click", (e) => {
            e.stopPropagation();
          });

          // Setup logout button
          const logoutButton = pageHeaderProfile.querySelector(
            ".admin-dropdown-logout"
          );
          logoutButton.addEventListener("click", () => {
            if (confirm("Are you sure you want to logout?")) {
              Utilis.logout();
            }
          });

          // Update mobile admin badge
          this.updateMobileAdminBadge(
            profilePicUrl,
            fullName,
            profileData.role,
            profileData.email
          );
        }
      } catch (error) {
        console.error("Error rendering admin badge:", error);

        // If server is down and we have no cached data, show server down page
        const adminData = Utilis.getAdminData();
        if (isServerError(error) && !adminData) {
          showServerDownPage();
          return;
        }

        // Fallback to localStorage data if API call fails
        if (!adminData) return;

        const fullName = `${adminData.firstName} ${adminData.lastName}`.trim();
        const profilePicUrl =
          adminData.profilePictureUrl || "./media/imgs/profile-icon.png";

        const pageHeaderProfile = document.querySelector(
          ".page-header-profile"
        );
        if (pageHeaderProfile) {
          pageHeaderProfile.innerHTML = `
            <div class="admin-badge">
              <button class="admin-badge-button" type="button">
                <img src="${profilePicUrl}" alt="${fullName}" class="admin-avatar js-header-profile-img" onerror="this.src='./media/imgs/profile-icon.png'">
                <span class="admin-name">${fullName}</span>
                <i class="bi bi-chevron-down"></i>
              </button>
              <div class="admin-dropdown">
                <div class="admin-dropdown-header">
                  <img src="${profilePicUrl}" alt="${fullName}" class="admin-dropdown-avatar" onerror="this.src='./media/imgs/profile-icon.png'">
                  <div class="admin-dropdown-info">
                    <div class="admin-dropdown-name">${fullName}</div>
                    <div class="admin-dropdown-role">${adminData.role}</div>
                  </div>
                </div>
                <div class="admin-dropdown-divider"></div>
                <div class="admin-dropdown-email">
                  <i class="bi bi-envelope"></i>
                  <span>${adminData.email}</span>
                </div>
                <div class="admin-dropdown-divider"></div>
                <a href="settings.html" class="admin-dropdown-item">
                  <i class="bi bi-gear"></i>
                  <span>Settings</span>
                </a>
                <button class="admin-dropdown-item admin-dropdown-logout" type="button">
                  <i class="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          `;

          const badgeButton = pageHeaderProfile.querySelector(
            ".admin-badge-button"
          );
          const dropdown = pageHeaderProfile.querySelector(".admin-dropdown");

          badgeButton.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("show");
          });

          document.addEventListener("click", () => {
            dropdown.classList.remove("show");
          });

          dropdown.addEventListener("click", (e) => {
            e.stopPropagation();
          });

          const logoutButton = pageHeaderProfile.querySelector(
            ".admin-dropdown-logout"
          );
          logoutButton.addEventListener("click", () => {
            if (confirm("Are you sure you want to logout?")) {
              Utilis.logout();
            }
          });
        }

        // Update mobile admin badge with fallback data
        this.updateMobileAdminBadge(
          profilePicUrl,
          fullName,
          adminData.role,
          adminData.email
        );
      }
    },

    // Update mobile admin badge with user data
    updateMobileAdminBadge(profilePicUrl, fullName, role, email) {
      const mobileAdminBadge = document.querySelector(".mobile-admin-badge");
      if (!mobileAdminBadge) return;

      // Update profile image
      const mobileProfileImg = mobileAdminBadge.querySelector(
        ".mobile-profile-img"
      );
      if (mobileProfileImg) {
        mobileProfileImg.src = profilePicUrl;
        mobileProfileImg.alt = fullName;
        mobileProfileImg.onerror = function () {
          this.src = "./media/imgs/profile-icon.png";
        };
      }

      // Update dropdown content
      const dropdownAvatar = mobileAdminBadge.querySelector(
        ".mobile-dropdown-avatar"
      );
      if (dropdownAvatar) {
        dropdownAvatar.src = profilePicUrl;
        dropdownAvatar.alt = fullName;
        dropdownAvatar.onerror = function () {
          this.src = "./media/imgs/profile-icon.png";
        };
      }

      const dropdownName = mobileAdminBadge.querySelector(
        ".mobile-dropdown-name"
      );
      if (dropdownName) {
        dropdownName.textContent = fullName;
      }

      const dropdownRole = mobileAdminBadge.querySelector(
        ".mobile-dropdown-role"
      );
      if (dropdownRole) {
        dropdownRole.textContent = role;
      }

      const dropdownEmail = mobileAdminBadge.querySelector(
        ".mobile-dropdown-email span"
      );
      if (dropdownEmail) {
        dropdownEmail.textContent = email;
      }

      // Setup dropdown toggle
      const badgeButton = mobileAdminBadge.querySelector(
        ".mobile-admin-badge-button"
      );
      const dropdown = mobileAdminBadge.querySelector(".mobile-admin-dropdown");

      if (badgeButton && dropdown) {
        // Remove existing listeners by cloning
        const newBadgeButton = badgeButton.cloneNode(true);
        badgeButton.parentNode.replaceChild(newBadgeButton, badgeButton);

        newBadgeButton.addEventListener("click", (e) => {
          e.stopPropagation();
          dropdown.classList.toggle("show");
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", () => {
          dropdown.classList.remove("show");
        });

        // Prevent dropdown from closing when clicking inside it
        dropdown.addEventListener("click", (e) => {
          e.stopPropagation();
        });

        // Setup logout button
        const logoutButton = mobileAdminBadge.querySelector(
          ".mobile-dropdown-logout"
        );
        if (logoutButton) {
          const newLogoutButton = logoutButton.cloneNode(true);
          logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);

          newLogoutButton.addEventListener("click", () => {
            if (confirm("Are you sure you want to logout?")) {
              Utilis.logout();
            }
          });
        }
      }
    },
  },

  Login: {
    setupPasswordToggle() {
      const togglePasswordButton = document.querySelector(
        ".js-toggle-password"
      );
      const passwordInput = document.getElementById("password");

      if (togglePasswordButton && passwordInput) {
        togglePasswordButton.addEventListener("click", () => {
          const type = passwordInput.type === "password" ? "text" : "password";
          passwordInput.type = type;

          const icon = togglePasswordButton.querySelector("i");
          if (type === "password") {
            icon.className = "bi bi-eye";
          } else {
            icon.className = "bi bi-eye-slash";
          }
        });
      }
    },

    setupLoginForm() {
      const loginForm = document.querySelector(".js-login-form");
      if (!loginForm) return;

      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const submitButton = loginForm.querySelector('button[type="submit"]');

        // Validation
        if (!email) {
          showToast("Please enter your email address.", "warning");
          return;
        }

        if (!password) {
          showToast("Please enter your password.", "warning");
          return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          showToast("Please enter a valid email address.", "warning");
          return;
        }

        // Disable submit button during login
        submitButton.disabled = true;
        submitButton.textContent = "Logging in...";

        try {
          const result = await API.Auth.login(email, password);

          // Save tokens and admin data from response
          if (result.accessToken) {
            Utilis.saveAuthToken(result.accessToken);

            if (result.refreshToken) {
              Utilis.saveRefreshToken(result.refreshToken);
            }

            if (result.refreshTokenExpiryTime) {
              Utilis.saveRefreshTokenExpiry(result.refreshTokenExpiryTime);
            }

            // Fetch full profile data using accountId from login response
            const profileData = await API.Auth.getSystemUserProfile(
              result.accountId
            );

            // Save complete admin data
            const adminData = {
              accountId: profileData.id,
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              email: profileData.email,
              phoneNumber: profileData.phoneNumber,
              role: profileData.role,
              profilePictureUrl: profileData.profilePictureUrl,
            };
            Utilis.saveAdminData(adminData);

            showToast("Login successful! Redirecting...", "success");

            // Redirect to appropriate default page based on role
            const defaultPage = RBAC.getDefaultPage(profileData.role);
            setTimeout(() => {
              window.location.href = `./${defaultPage}`;
            }, 1000);
          } else {
            throw new Error("No access token received from server");
          }
        } catch (error) {
          console.error("Login failed:", error);

          // Check if it's a server/network error
          if (isServerError(error)) {
            showServerDownPage();
            return;
          }

          showToast(
            error.message || "Login failed. Please check your credentials.",
            "error"
          );
          submitButton.disabled = false;
          submitButton.textContent = "Login";
        }
      });
    },
  },
};

const Events = {
  isRedirecting: false,

  checkAuth() {
    // Prevent multiple redirects
    if (this.isRedirecting) {
      console.log("[Auth] Already redirecting, skipping checkAuth");
      return;
    }

    const currentPage = RBAC.getCurrentPage();
    console.log("[Auth] checkAuth() called");
    console.log("[Auth] Current page:", currentPage);
    console.log("[Auth] isAuthenticated:", Utilis.isAuthenticated());
    console.log("[Auth] Role:", Utilis.getRole());

    // Skip auth check on login page
    if (currentPage === "login.html") {
      console.log("[Auth] On login page");
      // If already logged in, redirect to appropriate default page based on role
      if (Utilis.isAuthenticated()) {
        const role = Utilis.getRole();
        const defaultPage = RBAC.getDefaultPage(role);
        console.log(
          "[Auth] Already authenticated, redirecting to:",
          defaultPage
        );
        this.isRedirecting = true;
        window.location.replace(`./${defaultPage}`);
      }
      return;
    }

    // For all other pages, require authentication
    if (!Utilis.isAuthenticated()) {
      console.log("[Auth] Not authenticated, redirecting to login");
      this.isRedirecting = true;
      window.location.replace("./login.html");
      return;
    }

    // Check role-based page access
    const role = Utilis.getRole();
    if (!role) {
      // No role found, clear auth and redirect to login
      console.log(
        "[Auth] No role found, clearing auth and redirecting to login"
      );
      this.isRedirecting = true;
      Utilis.clearAuth();
      window.location.replace("./login.html");
      return;
    }

    // Check if user has access to current page
    if (!RBAC.hasPageAccess(role, currentPage)) {
      // Redirect to their default page (no toast, just redirect)
      const defaultPage = RBAC.getDefaultPage(role);
      console.log("[Auth] No access to page, redirecting to:", defaultPage);
      this.isRedirecting = true;
      window.location.replace(`./${defaultPage}`);
      return;
    }

    console.log("[Auth] Access granted to page:", currentPage);
  },

  setupProtectedPage() {
    // Don't setup if redirecting
    if (this.isRedirecting) return;

    const self = this;

    // Start token refresh timer
    TokenRefresher.start();

    // Setup admin badge and logout button for protected pages
    document.addEventListener("DOMContentLoaded", async () => {
      // Double check we're not redirecting
      if (self.isRedirecting) return;

      // Render admin badge with fresh data from API
      await UI.AdminBadge.render();

      // Apply role-based UI restrictions
      self.applyRoleBasedUI();

      // Setup logout buttons (desktop and mobile)
      const logoutButtons = document.querySelectorAll(".js-logout-button");
      logoutButtons.forEach((logoutButton) => {
        logoutButton.addEventListener("click", (e) => {
          e.preventDefault();
          if (confirm("Are you sure you want to logout?")) {
            Utilis.logout();
          }
        });
      });
    });
  },

  applyRoleBasedUI() {
    const role = Utilis.getRole();
    const currentPage = RBAC.getCurrentPage();

    // Settings page specific restrictions
    if (currentPage === "settings.html") {
      const settingsAccess = RBAC.getSettingsAccess(role);

      // Show System Users tab only for Super Admin
      if (settingsAccess.systemUsers) {
        const systemUsersTab = document.querySelector(
          '.tab-btn[data-tab="add-system-user"]'
        );
        if (systemUsersTab) {
          systemUsersTab.classList.add("visible");
        }

        // Also show the tab content
        const systemUsersContent = document.getElementById(
          "add-system-user-tab"
        );
        if (systemUsersContent) {
          systemUsersContent.classList.add("visible");
        }
      }
    }

    // Hide navbar items based on role
    this.applyNavbarRestrictions(role);
  },

  applyNavbarRestrictions(role) {
    const roleConfig = RBAC.roles[role];
    if (!roleConfig) return;

    const allowedPages = roleConfig.allowedPages;

    // Pages that should be hidden for restricted roles
    const restrictedPages = [
      "index.html",
      "products.html",
      "schools.html",
      "students.html",
      "translations.html",
      "design.html",
      "portfolio.html",
    ];

    // For each restricted page, hide the nav items if not allowed
    restrictedPages.forEach((pageName) => {
      if (!allowedPages.includes(pageName)) {
        // Desktop navbar links
        const desktopLinks = document.querySelectorAll(
          `.navbar a[href="${pageName}"], .navbar a[href="./${pageName}"]`
        );
        desktopLinks.forEach((link) => {
          link.style.display = "none";
        });

        // Mobile sidebar links
        const mobileLinks = document.querySelectorAll(
          `.mobile-sidebar a[href="${pageName}"], .mobile-sidebar a[href="./${pageName}"]`
        );
        mobileLinks.forEach((link) => {
          const parentLi = link.closest("li");
          if (parentLi) {
            parentLi.style.display = "none";
          }
        });
      }
    });

    // Hide the entire "Manage" dropdown if none of the manage pages are accessible
    const managePages = ["products.html", "schools.html", "students.html"];
    const hasManageAccess = managePages.some((page) =>
      allowedPages.includes(page)
    );

    if (!hasManageAccess) {
      // Hide desktop manage dropdown
      const desktopManageDropdown = document.querySelector(".navbar .dropdown");
      if (desktopManageDropdown) {
        desktopManageDropdown.style.display = "none";
      }

      // Hide mobile manage dropdown
      const mobileManageDropdowns = document.querySelectorAll(
        ".mobile-sidebar .mobile-dropdown-toggle"
      );
      mobileManageDropdowns.forEach((toggle) => {
        const parentLi = toggle.closest("li");
        if (parentLi) {
          parentLi.style.display = "none";
        }
      });

      // Hide the first HR (divider) above the App section in desktop navbar
      const navbarHrs = document.querySelectorAll(".navbar .navbar-links > hr");
      if (navbarHrs.length > 0) {
        navbarHrs[0].style.display = "none";
      }

      // Hide the mobile nav divider after Manage section
      const mobileNavSections = document.querySelectorAll(
        ".mobile-sidebar .mobile-nav-section"
      );
      if (mobileNavSections.length > 0) {
        // The first divider is after the main navigation (Dashboard + Manage)
        const firstDivider = mobileNavSections[0].nextElementSibling;
        if (
          firstDivider &&
          firstDivider.classList.contains("mobile-nav-divider")
        ) {
          firstDivider.style.display = "none";
        }
      }
    }

    // Hide Dashboard link if not allowed
    if (!allowedPages.includes("index.html")) {
      // Desktop
      const dashboardLinks = document.querySelectorAll(
        '.navbar a[href="index.html"], .navbar a[href="./index.html"]'
      );
      dashboardLinks.forEach((link) => {
        link.style.display = "none";
      });

      // Mobile
      const mobileDashboardLinks = document.querySelectorAll(
        '.mobile-sidebar a[href="index.html"], .mobile-sidebar a[href="./index.html"]'
      );
      mobileDashboardLinks.forEach((link) => {
        const parentLi = link.closest("li");
        if (parentLi) {
          parentLi.style.display = "none";
        }
      });
    }
  },

  setupLoginPage() {
    document.addEventListener("DOMContentLoaded", () => {
      hideLoadingScreen();
      UI.Login.setupPasswordToggle();
      UI.Login.setupLoginForm();
    });
  },
};

// Apply role class to document immediately to prevent flash
(function applyRoleClass() {
  const role = Utilis.getRole();
  if (role) {
    // Convert role to CSS-safe class name (e.g., "Super Admin" -> "role-super-admin")
    const roleClass = "role-" + role.toLowerCase().replace(/\s+/g, "-");
    document.documentElement.classList.add(roleClass);
  }
})();

// Initialize based on current page
if (window.location.pathname.endsWith("login.html")) {
  Events.checkAuth();
  Events.setupLoginPage();
} else {
  Events.checkAuth();
  Events.setupProtectedPage();
}

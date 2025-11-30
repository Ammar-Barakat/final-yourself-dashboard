import {
  togglePopUpOff,
  togglePopUpOn,
  showServerDownPage,
  isServerError,
  showToast,
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
  Account: {
    async updateProfile(accountId, profileData) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${API_BASE_URL}/api/ManageAuth/update-system-user-profile/${accountId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);
          throw new Error(error.message || "Failed to update profile");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("updateProfile error:", error);
        throw error;
      }
    },

    async updateProfilePicture(accountId, imageFile) {
      try {
        const token = localStorage.getItem("authToken");
        const formData = new FormData();
        formData.append("imageFile", imageFile);

        console.log(
          "Sending profile picture update request for accountId:",
          accountId
        );
        console.log(
          "Image file:",
          imageFile.name,
          imageFile.type,
          imageFile.size
        );

        const response = await fetch(
          `${API_BASE_URL}/api/ManageAuth/update-system-user-profile-picture/${accountId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        console.log("Profile picture upload response status:", response.status);

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error: ${error.message}`);
          throw new Error(error.message || "Failed to update profile picture");
        }

        const result = await response.json();
        console.log("Profile picture upload successful:", result);
        return (
          result.Message ||
          result.message ||
          "Profile picture updated successfully"
        );
      } catch (error) {
        console.error("updateProfilePicture error:", error);
        throw error;
      }
    },

    async changePassword(accountId, passwordData) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${API_BASE_URL}/api/ManageAuth/change-system-user-password/${accountId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(passwordData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);
          throw new Error(error.message || "Failed to change password");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("changePassword error:", error);
        throw error;
      }
    },

    async getSystemUserProfile(accountId) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${API_BASE_URL}/api/ManageAuth/get-system-user-profile/${accountId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);
          throw new Error(error.message || "Failed to fetch user profile");
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error("getSystemUserProfile error:", error);
        throw error;
      }
    },
  },

  SystemUsers: {
    async getAllSystemUsers() {
      try {
        const token = localStorage.getItem("authToken");
        console.log(token);
        const response = await fetch(
          `${API_BASE_URL}/api/ManageSystemUsers/get-all-system-users`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error(
            `HTTP ${response.status}: Failed to fetch system users`
          );
          return [];
        }

        const result = await response.json();
        console.log(result);
        return result;
      } catch (error) {
        console.error("getAllSystemUsers error:", error);
        // Re-throw network errors
        if (error instanceof TypeError || error.message?.includes("fetch")) {
          throw error;
        }
        return [];
      }
    },

    async addSystemUser(userData) {
      try {
        // const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${API_BASE_URL}/api/ManageSystemUsers/add-system-user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 400) {
            throw new Error(
              "Invalid system user data. Please check all fields."
            );
          } else if (error.statusCode === 422) {
            throw new Error(error.message || "System user validation failed.");
          } else if (error.statusCode === 409) {
            throw new Error("A user with this email already exists.");
          }
          throw new Error(error.message || "Failed to add system user");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("addSystemUser error:", error);
        throw error;
      }
    },

    async updateSystemUser(systemUserId, userData) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${API_BASE_URL}/api/ManageSystemUsers/update-system-user/${systemUserId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`System user not found with ID: ${systemUserId}`);
          } else if (error.statusCode === 400) {
            throw new Error(
              "Invalid system user data. Please check all fields."
            );
          } else if (error.statusCode === 422) {
            throw new Error(error.message || "System user validation failed.");
          }
          throw new Error(error.message || "Failed to update system user");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("updateSystemUser error:", error);
        throw error;
      }
    },

    async updateSystemUserRole(accountId, newRole) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${API_BASE_URL}/api/ManageSystemUsers/update-system-user-role/${accountId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newRole),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`Account not found with ID: ${accountId}`);
          }
          throw new Error(error.message || "Failed to update system user role");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("updateSystemUserRole error:", error);
        throw error;
      }
    },

    async getSystemUserById(systemUserId) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${API_BASE_URL}/api/ManageSystemUsers/get-system-user-by-id/${systemUserId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`System user not found with ID: ${systemUserId}`);
          }
          throw new Error(error.message || "Failed to fetch system user");
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error("getSystemUserById error:", error);
        throw error;
      }
    },

    async deleteSystemUser(systemUserId) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${API_BASE_URL}/api/ManageSystemUsers/delete-system-user/${systemUserId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`System user not found with ID: ${systemUserId}`);
          }
          throw new Error(error.message || "Failed to delete system user");
        }

        return response;
      } catch (error) {
        console.error("deleteSystemUser error:", error);
        throw error;
      }
    },
  },
};

const Utilis = {
  generateRandomPassword(length) {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  },

  Events: {
    openClosePopUp(popUp) {
      togglePopUpOn(popUp);

      const closeButtons = popUp.querySelectorAll(".js-close-button");
      const cancelButtons = popUp.querySelectorAll(".js-cancel-button");

      closeButtons.forEach((button) => {
        button.addEventListener("click", () => {
          togglePopUpOff(popUp);
        });
      });

      cancelButtons.forEach((button) => {
        button.addEventListener("click", () => {
          togglePopUpOff(popUp);
        });
      });
    },

    setupTabNavigation() {
      const tabButtons = document.querySelectorAll(".tab-btn");
      const tabContents = document.querySelectorAll(".tab-content");

      console.log("Tab navigation initialized", {
        tabButtons: tabButtons.length,
        tabContents: tabContents.length,
      });

      tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const targetTab = button.getAttribute("data-tab");
          console.log("Tab clicked:", targetTab);

          // Remove active class from all buttons and contents
          tabButtons.forEach((btn) => btn.classList.remove("active"));
          tabContents.forEach((content) => content.classList.remove("active"));

          // Add active class to clicked button and corresponding content
          button.classList.add("active");
          const targetContent = document.getElementById(`${targetTab}-tab`);

          if (targetContent) {
            targetContent.classList.add("active");
            console.log("Tab activated:", targetTab);
          } else {
            console.error("Tab content not found:", `${targetTab}-tab`);
          }
        });
      });
    },

    setupPasswordToggles() {
      // Handle security tab password toggles
      const toggleButtons = document.querySelectorAll(".js-toggle-password");

      toggleButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const input = button.parentElement.querySelector("input");
          const icon = button.querySelector("i");

          if (input.type === "password") {
            input.type = "text";
            icon.classList.remove("bi-eye");
            icon.classList.add("bi-eye-slash");
          } else {
            input.type = "password";
            icon.classList.remove("bi-eye-slash");
            icon.classList.add("bi-eye");
          }
        });
      });

      // Handle system user password toggle
      const systemUserToggleButton = document.querySelector(
        ".js-toggle-system-user-password"
      );
      if (systemUserToggleButton) {
        systemUserToggleButton.addEventListener("click", () => {
          const input = document.querySelector(".js-system-user-password");
          const icon = systemUserToggleButton.querySelector("i");

          if (input.type === "password") {
            input.type = "text";
            icon.classList.remove("bi-eye");
            icon.classList.add("bi-eye-slash");
          } else {
            input.type = "password";
            icon.classList.remove("bi-eye-slash");
            icon.classList.add("bi-eye");
          }
        });
      }
    },
  },
};

const AccountUI = {
  getAdminData() {
    const data = localStorage.getItem("adminData");
    return data ? JSON.parse(data) : null;
  },

  async fetchAndRenderProfile() {
    try {
      const adminData = this.getAdminData();
      if (!adminData?.accountId) {
        console.error("Account ID not found in localStorage");
        return null;
      }

      // Fetch fresh profile data from API
      const profileData = await API.Account.getSystemUserProfile(
        adminData.accountId
      );

      // Render the profile with fresh data
      this.renderAccountInfo(profileData);

      return profileData;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      showToast("Failed to load profile data", "error");
      return null;
    }
  },

  renderAccountInfo(profileData) {
    if (!profileData) return;

    // Populate form fields
    const firstNameInput = document.querySelector(".js-firstname");
    const lastNameInput = document.querySelector(".js-lastname");
    const emailInput = document.querySelector(".js-email");
    const phoneInput = document.querySelector(".js-phone");
    const profileImage = document.querySelector(".js-account-profile-img");
    const mobileProfileImage = document.querySelector(".mobile-profile-img");

    if (firstNameInput) firstNameInput.value = profileData.firstName || "";
    if (lastNameInput) lastNameInput.value = profileData.lastName || "";
    if (emailInput) emailInput.value = profileData.email || "";
    if (phoneInput) phoneInput.value = profileData.phoneNumber || "";

    // Seed profile pictures - use API URL if available, otherwise keep default
    const profilePicUrl =
      profileData.profilePictureUrl && profileData.profilePictureUrl !== ""
        ? profileData.profilePictureUrl
        : "./media/imgs/profile-icon.png";

    if (profileImage) {
      profileImage.src = profilePicUrl;
    }
    if (mobileProfileImage) {
      mobileProfileImage.src = profilePicUrl;
    }

    // Update any user name/role badges in the UI
    const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
    const userNameElements = document.querySelectorAll(
      ".js-user-name, .user-name"
    );
    const userEmailElements = document.querySelectorAll(
      ".js-user-email, .user-email"
    );
    const userRoleElements = document.querySelectorAll(
      ".js-user-role, .user-role"
    );

    userNameElements.forEach((el) => {
      if (el) el.textContent = fullName;
    });
    userEmailElements.forEach((el) => {
      if (el) el.textContent = profileData.email || "";
    });
    userRoleElements.forEach((el) => {
      if (el) el.textContent = profileData.role || "";
    });

    return profileData;
  },

  Events: {
    async setupAccountUI() {
      // Fetch and seed the form with fresh data from API
      await AccountUI.fetchAndRenderProfile();

      // Setup profile picture upload
      const uploadPhotoButton = document.querySelector(".js-upload-photo");
      const photoInput = document.querySelector(".js-photo-input");
      const profileImage = document.querySelector(".profile-image");

      if (uploadPhotoButton && photoInput) {
        uploadPhotoButton.addEventListener("click", () => {
          photoInput.click();
        });

        photoInput.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (!file) return;

          // Validate file type
          if (!file.type.startsWith("image/")) {
            showToast("Please select a valid image file", "warning");
            photoInput.value = ""; // Clear the input
            return;
          }

          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            showToast("Image size should be less than 5MB", "warning");
            photoInput.value = ""; // Clear the input
            return;
          }

          // Preview the selected image
          const reader = new FileReader();
          reader.onload = (event) => {
            const profileImage = document.querySelector(
              ".js-account-profile-img"
            );
            if (profileImage) {
              profileImage.src = event.target.result;
            }
          };
          reader.readAsDataURL(file);

          showToast("Image selected. Click Save Changes to upload.", "info");
        });
      }

      // Setup save changes button
      const editButton = document.querySelector(".js-edit-account");
      if (!editButton) return;

      editButton.addEventListener("click", async () => {
        const adminData = AccountUI.getAdminData();
        if (!adminData?.accountId) {
          showToast("Account ID not found", "error");
          return;
        }

        const firstName = document.querySelector(".js-firstname").value.trim();
        const lastName = document.querySelector(".js-lastname").value.trim();
        const email = document.querySelector(".js-email").value.trim();
        const phoneNumber = document.querySelector(".js-phone").value.trim();

        // Validation
        if (!firstName || !email || !phoneNumber) {
          showToast("Please fill all required fields", "warning");
          return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          showToast("Please enter a valid email address", "warning");
          return;
        }

        try {
          // Disable button during API call
          editButton.disabled = true;
          editButton.innerHTML =
            '<i class="bi bi-hourglass-split"></i> Saving...';

          // Update profile information
          const profileData = {
            firstName,
            lastName,
            email,
            phoneNumber,
          };

          await API.Account.updateProfile(adminData.accountId, profileData);

          // Upload profile picture if one was selected
          const photoInput = document.querySelector(".js-photo-input");
          if (photoInput && photoInput.files.length > 0) {
            const file = photoInput.files[0];
            console.log("Uploading profile picture:", file.name, file.size);
            try {
              const uploadResult = await API.Account.updateProfilePicture(
                adminData.accountId,
                file
              );
              console.log("Profile picture upload result:", uploadResult);
            } catch (uploadError) {
              console.error("Profile picture upload failed:", uploadError);
              showToast(
                "Profile updated but picture upload failed: " +
                  uploadError.message,
                "warning"
              );
              // Still refresh to show the profile updates
              setTimeout(() => {
                window.location.reload();
              }, 2000);
              return;
            }
          }

          showToast("Profile updated successfully! Refreshing...", "success");

          // Refresh the page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          console.error("Failed to update profile:", error);
          showToast(
            error.message || "Failed to update profile. Please try again.",
            "error"
          );
          editButton.disabled = false;
          editButton.innerHTML = "Save Changes";
        }
      });
    },
  },
};

const SecurityUI = {
  Events: {
    setupSecurityUI() {
      const updateButton = document.querySelector(".js-update-password");
      if (!updateButton) return;

      updateButton.addEventListener("click", async () => {
        const currentPassword = document.querySelector(
          ".js-current-password"
        ).value;
        const newPassword = document.querySelector(".js-new-password").value;
        const confirmPassword = document.querySelector(
          ".js-confirm-password"
        ).value;

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
          showToast("Please fill all password fields", "warning");
          return;
        }

        if (newPassword !== confirmPassword) {
          showToast("New passwords do not match", "error");
          return;
        }

        if (newPassword.length < 4) {
          showToast("Password must be at least 4 characters", "warning");
          return;
        }

        try {
          const adminData = AccountUI.getAdminData();
          if (!adminData?.accountId) {
            showToast("Account ID not found", "error");
            return;
          }

          // Disable button during API call
          updateButton.disabled = true;
          updateButton.innerHTML =
            '<i class="bi bi-hourglass-split"></i> Updating...';

          const passwordData = {
            currentPassword,
            newPassword,
          };

          await API.Account.changePassword(adminData.accountId, passwordData);

          showToast("Password updated successfully! Logging out...", "success");

          // Clear auth data and redirect to login after a short delay
          setTimeout(() => {
            localStorage.removeItem("authToken");
            localStorage.removeItem("adminData");
            localStorage.removeItem("refreshToken");
            window.location.href = "./login.html";
          }, 1500);
        } catch (error) {
          console.error("Failed to update password:", error);
          showToast(
            error.message || "Failed to update password. Please try again.",
            "error"
          );
          updateButton.disabled = false;
          updateButton.innerHTML = "Update Password";
        }
      });
    },
  },
};

const SystemUserUI = {
  renderSystemUsers(systemUsers) {
    const listContainer = document.querySelector(".js-system-users-list");
    if (!listContainer) return;

    if (systemUsers.length === 0) {
      listContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #6c757d;">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.3; margin-bottom: 20px;">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
            <line x1="18" y1="8" x2="23" y2="8"></line>
          </svg>
          <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #495057;">No System Users Found</h3>
          <p style="font-size: 14px; margin: 0; color: #6c757d;">Add system users to get started</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = "";

    // Get available roles from the add form select
    const roleSelect = document.querySelector(".js-system-user-role");
    const availableRoles = roleSelect
      ? Array.from(roleSelect.options).map((opt) => ({
          value: opt.value,
          text: opt.textContent,
        }))
      : [];

    systemUsers.forEach((systemUser) => {
      const systemUserItem = document.createElement("div");
      systemUserItem.className = "system-user-item";
      const fullName = `${systemUser.firstName} ${systemUser.lastName}`;
      const profilePic =
        systemUser.profilePictureUrl || "./media/imgs/profile-icon.png";

      // Create role options HTML
      const roleOptionsHTML = availableRoles
        .map((role) => {
          // Normalize both role text and system user role for comparison
          const normalizedRoleText = role.text
            .toLowerCase()
            .replace(/\s+/g, "");
          const normalizedUserRole = systemUser.role
            .toLowerCase()
            .replace(/\s+/g, "");
          const isSelected = normalizedRoleText === normalizedUserRole;
          return `<option value="${role.value}" ${
            isSelected ? "selected" : ""
          }>${role.text}</option>`;
        })
        .join("");

      systemUserItem.innerHTML = `
        <div class="system-user-info">
          <div class="system-user-icon">
            <img src="${profilePic}" alt="${fullName}">
          </div>
          <div class="system-user-details">
            <h4>${fullName}</h4>
            <p>${systemUser.email}</p>
            <p>${systemUser.phoneNumber}</p>
          </div>
        </div>
        <div class="system-user-actions">
          <select class="system-user-role-select js-role-select" data-system-user-id="${
            systemUser.id
          }" data-user-data='${JSON.stringify(systemUser)}'>
            ${roleOptionsHTML}
          </select>
          <div class="system-user-buttons">
            <button class="btn-icon delete js-delete-system-user-button" data-system-user-id="${
              systemUser.id
            }">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;

      listContainer.appendChild(systemUserItem);
    });

    // Setup action buttons after rendering
    SystemUserUI.Events.setupSystemUserActions();
  },

  Events: {
    async setupSystemUserUI() {
      const systemUsers = await API.SystemUsers.getAllSystemUsers();
      SystemUserUI.renderSystemUsers(systemUsers);

      // Setup create system user button (direct form, not popup)
      const createButton = document.querySelector(".js-create-system-user");
      if (createButton) {
        createButton.addEventListener("click", async () => {
          const firstName = document
            .querySelector(".js-system-user-firstname")
            .value.trim();
          const lastName = document
            .querySelector(".js-system-user-lastname")
            .value.trim();
          const email = document
            .querySelector(".js-system-user-email")
            .value.trim();
          const phone = document
            .querySelector(".js-system-user-phone")
            .value.trim();
          const roleSelect = document.querySelector(".js-system-user-role");
          const role = roleSelect.value;
          const roleText =
            roleSelect.options[roleSelect.selectedIndex].textContent;
          const password = document.querySelector(
            ".js-system-user-password"
          ).value;

          // Validation
          if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !role ||
            role === "Select Role" ||
            !password
          ) {
            showToast("Please fill all fields", "warning");
            return;
          }

          if (password.length < 8) {
            showToast(
              "Password must be at least 8 characters with uppercase, lowercase, digit, and special character",
              "warning"
            );
            return;
          }

          // Password complexity validation
          const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
          if (!passwordRegex.test(password)) {
            showToast(
              "Password must contain uppercase, lowercase, number, and special character",
              "warning"
            );
            return;
          }

          // Email format validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            showToast("Please enter a valid email address", "warning");
            return;
          }

          try {
            // Disable button during API call
            createButton.disabled = true;
            createButton.innerHTML =
              '<i class="bi bi-hourglass-split"></i> Creating...';

            const userData = {
              firstName,
              lastName,
              email,
              phoneNumber: phone,
              password,
              role: roleText,
            };

            console.log(userData);

            await API.SystemUsers.addSystemUser(userData);

            showToast("System user created successfully", "success");

            // Clear form
            document.querySelector(".js-system-user-firstname").value = "";
            document.querySelector(".js-system-user-lastname").value = "";
            document.querySelector(".js-system-user-email").value = "";
            document.querySelector(".js-system-user-phone").value = "";
            document.querySelector(".js-system-user-role").value =
              "Select Role";
            document.querySelector(".js-system-user-password").value = "";

            // Refresh page after short delay
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } catch (error) {
            console.error("Failed to create system user:", error);
            showToast(
              error.message ||
                "Failed to create system user. Please try again.",
              "error"
            );
          } finally {
            createButton.disabled = false;
            createButton.innerHTML = "Create System User";
          }
        });
      }

      // Setup generate password button
      const generateButton = document.querySelector(".js-generate-password");
      if (generateButton) {
        generateButton.addEventListener("click", () => {
          const password = Utilis.generateRandomPassword(12);
          document.querySelector(".js-system-user-password").value = password;
          showToast("Password generated", "info");
        });
      }

      // Setup add role functionality
      SystemUserUI.Events.setupAddRole();
    },

    setupSystemUserActions() {
      const roleSelects = document.querySelectorAll(".js-role-select");
      const deleteButtons = document.querySelectorAll(
        ".js-delete-system-user-button"
      );

      roleSelects.forEach((select) => {
        select.addEventListener("change", async () => {
          const systemUserId = select.getAttribute("data-system-user-id");
          const userData = JSON.parse(select.getAttribute("data-user-data"));
          const newRoleText = select.options[select.selectedIndex].textContent;
          const originalRole = userData.role;

          try {
            await API.SystemUsers.updateSystemUserRole(
              systemUserId,
              newRoleText
            );
            showToast("Role updated successfully", "success");

            // Update the stored data attribute
            userData.role = newRoleText;
            select.setAttribute("data-user-data", JSON.stringify(userData));
          } catch (error) {
            console.error("Failed to update role:", error);
            showToast(
              error.message || "Failed to update role. Please try again.",
              "error"
            );
            // Revert the select to the original value
            const originalRoleValue = originalRole
              .toLowerCase()
              .replace(/\s+/g, "-");
            select.value = originalRoleValue;
          }
        });
      });

      deleteButtons.forEach((button) => {
        button.addEventListener("click", async () => {
          const systemUserId = parseInt(
            button.getAttribute("data-system-user-id")
          );

          if (!confirm("Are you sure you want to delete this system user?")) {
            return;
          }

          try {
            await API.SystemUsers.deleteSystemUser(systemUserId);
            showToast("System user deleted successfully", "success");

            // Refresh page after short delay
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } catch (error) {
            console.error("Failed to delete system user:", error);
            showToast(
              error.message ||
                "Failed to delete system user. Please try again.",
              "error"
            );
          }
        });
      });
    },

    setupAddRole() {
      const addRoleBtn = document.querySelector(".js-add-role");
      if (!addRoleBtn) return;

      addRoleBtn.addEventListener("click", () => {
        const addRolePopUp = document.querySelector(".js-add-role-pop-up");
        Utilis.Events.openClosePopUp(addRolePopUp);

        const confirmButton = addRolePopUp.querySelector(
          ".js-confirm-add-role"
        );

        // Remove existing listeners by cloning
        const newConfirmButton = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

        newConfirmButton.addEventListener("click", () => {
          const roleName = addRolePopUp.querySelector(".js-role-name").value;

          if (!roleName) {
            showToast("Please enter a role name", "warning");
            return;
          }

          // Add new role to the select
          const addSelect = document.querySelector(".js-system-user-role");

          const addOption = document.createElement("option");
          addOption.value = roleName.toLowerCase().replace(/\s+/g, "-");
          addOption.textContent = roleName;
          addSelect.appendChild(addOption);

          togglePopUpOff(addRolePopUp);
          addRolePopUp.querySelector(".js-role-name").value = "";
          showToast("Role added successfully", "success");
        });
      });
    },
  },
};

async function main() {
  // Setup utilities
  Utilis.Events.setupTabNavigation();
  Utilis.Events.setupPasswordToggles();

  try {
    // Setup all UI components
    AccountUI.Events.setupAccountUI();
    SecurityUI.Events.setupSecurityUI();
    await SystemUserUI.Events.setupSystemUserUI();
    hideLoadingScreen();
  } catch (error) {
    if (isServerError(error)) {
      showServerDownPage();
    } else {
      hideLoadingScreen();
      throw error;
    }
  }
}

await main();

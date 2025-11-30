const popUps = document.querySelector(".js-pop-ups");

export function togglePopUpOn(popUp) {
  popUps.classList.add("pop-ups-visible");
  popUp.classList.add("pop-up-visible");
}

export function togglePopUpOff(popUp) {
  popUps.classList.add("closing");
  popUp.classList.add("closing");

  popUp.addEventListener(
    "transitionend",
    () => {
      popUp.classList.remove("pop-up-visible", "closing");
    },
    { once: true }
  );

  popUps.addEventListener(
    "transitionend",
    () => {
      popUps.classList.remove("pop-ups-visible", "closing");
    },
    { once: true }
  );
}

// export function OpenPopUp(button, popUp) {
//   button.addEventListener("click", () => {
//     togglePopUpOn(popUp);
//   });

//   //   SubmitPopUp(popUp, fun);
//   ClosePopUp(popUp);
// }

// export function SubmitPopUp(button, popUp, fun) {
//   button.addEventListener("click", async () => {
//     await fun(popUp);
//   });
// }

// function ClosePopUp(popUp) {
//   const buttons = popUp.querySelectorAll(".js-close-button, .js-cancel-button");

//   buttons.forEach((button) => {
//     button.addEventListener("click", () => {
//       togglePopUpOff(popUp);
//     });
//   });
// }

// Server status display
export function showServerDownPage() {
  // Load server status stylesheet if not already loaded
  if (!document.querySelector('link[href*="server-status.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/styles/utilis/server-status.css";
    document.head.appendChild(link);
  }

  document.body.innerHTML = `
    <div class="server-down-container">
      <div class="server-down-card">
        <svg class="server-down-icon" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
          <line x1="7" y1="7" x2="7" y2="7.01"></line>
          <line x1="7" y1="11" x2="7" y2="11.01"></line>
        </svg>
        <h1 class="server-down-title">Server Offline</h1>
        <p class="server-down-message">Unable to connect to the API server. Please check if the server is running.</p>
        <div class="server-down-actions">
          <button class="server-down-retry-btn" onclick="location.reload()">
            Retry Connection
          </button>
          <p class="server-down-status">
            Status: <span class="server-down-status-dot"></span>Disconnected
          </p>
        </div>
      </div>
    </div>
  `;
}

// Check if error is a network/server error
export function isServerError(error) {
  // Check for fetch network errors (TypeError is thrown when network request fails)
  if (error instanceof TypeError) {
    return true;
  }

  // Check for common connection error messages
  const errorMessage = error.message?.toLowerCase() || "";
  return (
    errorMessage.includes("failed to fetch") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("network") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("econnrefused") ||
    errorMessage.includes("err_connection") ||
    errorMessage.includes("net::err") ||
    errorMessage.includes("networkerror") ||
    errorMessage.includes("unable to connect")
  );
}

// Show toast notification
export function showToast(message, type = "error") {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const icon = type === "success" ? "✓" : type === "warning" ? "⚠" : "✕";

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add("toast-show"), 10);

  // Remove toast after 5 seconds
  setTimeout(() => {
    toast.classList.remove("toast-show");
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

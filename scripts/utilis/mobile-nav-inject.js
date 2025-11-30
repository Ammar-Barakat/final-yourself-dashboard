// Mobile Navigation HTML Injector
// This script injects the mobile header and sidebar HTML into all pages

(function () {
  "use strict";

  // Mobile Header HTML
  const mobileHeaderHTML = `
    <header class="mobile-header">
      <div class="mobile-header-left">
        <button class="mobile-menu-toggle" aria-label="Open menu">
          <i class="bi bi-list"></i>
        </button>
      </div>
      <div class="mobile-header-center">
        <div class="mobile-logo">
          <img src="/media/imgs/logo-short.png" width="32" alt="yourself-logo">
        </div>
      </div>
      <div class="mobile-header-right">
        <!-- <button class="mobile-notification-btn" aria-label="Notifications">
          <i class="bi bi-bell"></i>
          <span class="mobile-notification-badge"></span>
        </button> -->
        <img src="/media/imgs/profile-icon.png" class="mobile-profile-img" alt="Profile" />
      </div>
    </header>
  `;

  // Mobile Sidebar HTML
  const mobileSidebarHTML = `
    <div class="mobile-sidebar-overlay"></div>
    <nav class="mobile-sidebar">
      <div class="mobile-sidebar-header">
        <h3>Menu</h3>
        <button class="mobile-sidebar-close" aria-label="Close menu">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="mobile-sidebar-content">
        <div class="mobile-nav-section">
          <ul class="mobile-nav-links">
            <li>
              <a href="index.html">
                <i class="bi bi-house"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <button class="mobile-dropdown-toggle">
                <div class="mobile-dropdown-toggle-left">
                  <i class="bi bi-pencil-square"></i>
                  <span>Manage</span>
                </div>
                <i class="bi bi-chevron-down mobile-dropdown-icon"></i>
              </button>
              <ul class="mobile-dropdown-menu">
                <li>
                  <a href="products.html">
                    <i class="bi bi-bag"></i>
                    <span>Manage Products</span>
                  </a>
                </li>
                <li>
                  <a href="schools.html">
                    <i class="bi bi-buildings"></i>
                    <span>Manage Schools</span>
                  </a>
                </li>
                <li>
                  <a href="students.html">
                    <i class="bi bi-person"></i>
                    <span>Manage Students</span>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <div class="mobile-nav-divider"></div>

        <div class="mobile-nav-section">
          <div class="mobile-nav-section-title">App</div>
          <ul class="mobile-nav-links">
            <li>
              <a href="portfolio.html">
                <i class="bi bi-card-heading"></i>
                <span>Portfolio</span>
              </a>
            </li>
            <li>
              <a href="design.html">
                <i class="bi bi-vector-pen"></i>
                <span>Design</span>
              </a>
            </li>
          </ul>
        </div>

        <div class="mobile-nav-divider"></div>

        <div class="mobile-nav-section">
          <div class="mobile-nav-section-title">Other</div>
          <ul class="mobile-nav-links">
            <li>
              <a href="settings.html">
                <i class="bi bi-gear"></i>
                <span>Settings</span>
              </a>
            </li>
            <!-- <li>
              <a href="account.html">
                <i class="bi bi-person-gear"></i>
                <span>Account</span>
              </a>
            </li>
            <li>
              <a href="help.html">
                <i class="bi bi-info-circle"></i>
                <span>Help</span>
              </a>
            </li> -->
          </ul>
        </div>

        <div class="mobile-nav-divider"></div>

        <div class="mobile-nav-section">
          <ul class="mobile-nav-links">
            <li>
              <a href="#" onclick="alert('Logout functionality')">
                <i class="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `;

  // Inject HTML when DOM is ready
  function injectMobileNavigation() {
    // Check if mobile navigation already exists
    if (document.querySelector(".mobile-header")) {
      return; // Already injected
    }

    // Create a container for the mobile navigation
    const container = document.createElement("div");
    container.innerHTML = mobileHeaderHTML + mobileSidebarHTML;

    // Insert at the beginning of body
    const body = document.body;
    while (container.firstChild) {
      body.insertBefore(container.firstChild, body.firstChild);
    }
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectMobileNavigation);
  } else {
    injectMobileNavigation();
  }
})();

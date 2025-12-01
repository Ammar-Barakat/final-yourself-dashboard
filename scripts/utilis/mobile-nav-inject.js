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
          <img src="./media/imgs/logo-short.png" width="32" alt="yourself-logo">
        </div>
      </div>
      <div class="mobile-header-right">
        <div class="mobile-admin-badge">
          <button class="mobile-admin-badge-button" type="button">
            <img src="./media/imgs/profile-icon.png" class="mobile-profile-img" alt="Profile" />
          </button>
          <div class="mobile-admin-dropdown">
            <div class="admin-dropdown-header">
              <img src="./media/imgs/profile-icon.png" alt="Profile" class="admin-dropdown-avatar mobile-dropdown-avatar">
              <div class="admin-dropdown-info">
                <div class="admin-dropdown-name mobile-dropdown-name">Loading...</div>
                <div class="admin-dropdown-role mobile-dropdown-role">-</div>
              </div>
            </div>
            <div class="admin-dropdown-divider"></div>
            <div class="admin-dropdown-email mobile-dropdown-email">
              <i class="bi bi-envelope"></i>
              <span>-</span>
            </div>
            <div class="admin-dropdown-divider"></div>
            <a href="settings.html" class="admin-dropdown-item">
              <i class="bi bi-gear"></i>
              <span>Settings</span>
            </a>
            <button class="admin-dropdown-item admin-dropdown-logout mobile-dropdown-logout" type="button">
              <i class="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `;

  // Mobile Sidebar HTML - matches desktop navbar structure
  const mobileSidebarHTML = `
    <div class="mobile-sidebar-overlay"></div>
    <nav class="mobile-sidebar">
      <div class="mobile-sidebar-header">
        <h3>Menu</h3>
        <button class="mobile-sidebar-close" aria-label="Close menu">
          <i class="bi bi-box-arrow-left"></i>
        </button>
      </div>
      <div class="mobile-sidebar-content">
        <div class="mobile-nav-links">
          <ul>
            <a href="index.html">
              <li>
                <i class="bi bi-house"></i>
                <span>Dashboard</span>
              </li>
            </a>
            <div class="mobile-dropdown">
              <li class="mobile-dropdown-toggle">
                <i class="bi bi-pencil-square"></i>
                <span>
                  Manage
                  <i class="bi bi-caret-down mobile-dropdown-icon"></i>
                </span>
              </li>
              <ul class="mobile-dropdown-menu">
                <a href="products.html">
                  <li>
                    <i class="bi bi-bag"></i>
                    <span>Manage Products</span>
                  </li>
                </a>
                <a href="schools.html">
                  <li>
                    <i class="bi bi-buildings"></i>
                    <span>Manage Schools</span>
                  </li>
                </a>
                <a href="students.html">
                  <li>
                    <i class="bi bi-person"></i>
                    <span>Manage Students</span>
                  </li>
                </a>
              </ul>
            </div>
          </ul>
        </div>
        <hr />
        <div class="mobile-nav-links">
          <ul>
            <a href="portfolio.html">
              <li>
                <i class="bi bi-card-heading"></i>
                <span>Portfolio</span>
              </li>
            </a>
            <a href="design.html">
              <li>
                <i class="bi bi-vector-pen"></i>
                <span>Design</span>
              </li>
            </a>
          </ul>
        </div>
        <hr />
        <div class="mobile-nav-links">
          <ul>
            <a href="settings.html">
              <li>
                <i class="bi bi-gear"></i>
                <span>Settings</span>
              </li>
            </a>
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

/**
 * Navbar functionality - handles active states, dropdowns, and collapse toggle
 */

const Navbar = {
  // ==================== State ====================
  State: {
    isCollapsed: localStorage.getItem("isCollapsed") === "true",
  },

  // ==================== Selectors ====================
  Selectors: {
    navbarLinks: null,
    dropdownToggle: null,
    dropdownMenu: null,
    toggleIcon: null,
    navbarToggle: null,
    navbar: null,
  },

  // ==================== UI ====================
  UI: {
    initSelectors() {
      Navbar.Selectors.navbarLinks = document.querySelectorAll("li");
      Navbar.Selectors.dropdownToggle = document.querySelector(".js-dropdown");
      Navbar.Selectors.dropdownMenu =
        document.querySelector(".js-dropdown-menu");
      Navbar.Selectors.toggleIcon = document.querySelector(".js-manage-icon");
      Navbar.Selectors.navbarToggle =
        document.querySelector(".js-navbar-toggle");
      Navbar.Selectors.navbar = document.querySelector(".js-navbar");
    },

    setActiveLink(activeLink) {
      const { navbarLinks } = Navbar.Selectors;
      navbarLinks.forEach((link) => link.classList.remove("active"));
      activeLink.classList.add("active");
    },

    toggleDropdown() {
      const { dropdownMenu, toggleIcon } = Navbar.Selectors;
      if (!dropdownMenu || !toggleIcon) return;

      dropdownMenu.classList.toggle("dropdown-menu-active");

      if (dropdownMenu.classList.contains("dropdown-menu-active")) {
        toggleIcon.classList.remove("bi-caret-down");
        toggleIcon.classList.add("bi-caret-up");
      } else {
        toggleIcon.classList.remove("bi-caret-up");
        toggleIcon.classList.add("bi-caret-down");
      }
    },

    closeDropdown() {
      const { dropdownMenu, toggleIcon } = Navbar.Selectors;
      if (!dropdownMenu || !toggleIcon) return;

      dropdownMenu.classList.remove("dropdown-menu-active");
      toggleIcon.classList.remove("bi-caret-up");
      toggleIcon.classList.add("bi-caret-down");
    },

    applyCollapseState() {
      const { navbar, navbarToggle } = Navbar.Selectors;
      if (!navbar) return;

      if (Navbar.State.isCollapsed) {
        navbar.classList.add("navbar-collapsed");
        if (navbarToggle) {
          navbarToggle.innerHTML = '<i class="bi bi-box-arrow-right"></i>';
        }
      } else {
        navbar.classList.remove("navbar-collapsed");
        if (navbarToggle) {
          navbarToggle.innerHTML = '<i class="bi bi-box-arrow-left"></i>';
        }
      }
    },

    toggleCollapse() {
      const { navbar, navbarToggle } = Navbar.Selectors;
      if (!navbar) return;

      navbar.classList.toggle("navbar-collapsed");
      Navbar.State.isCollapsed = navbar.classList.contains("navbar-collapsed");
      localStorage.setItem("isCollapsed", Navbar.State.isCollapsed);

      if (navbarToggle) {
        if (Navbar.State.isCollapsed) {
          navbarToggle.innerHTML = '<i class="bi bi-box-arrow-right"></i>';
        } else {
          navbarToggle.innerHTML = '<i class="bi bi-box-arrow-left"></i>';
        }
      }
    },
  },

  // ==================== Events ====================
  Events: {
    bindNavbarLinkClicks() {
      const { navbarLinks } = Navbar.Selectors;

      navbarLinks.forEach((navbarLink) => {
        navbarLink.addEventListener("click", () => {
          Navbar.UI.setActiveLink(navbarLink);

          // Close dropdown when clicking non-dropdown links
          if (
            !navbarLink.closest(".dropdown-menu") &&
            !navbarLink.classList.contains("js-dropdown")
          ) {
            Navbar.UI.closeDropdown();
          }
        });
      });
    },

    bindDropdownToggle() {
      const { dropdownToggle } = Navbar.Selectors;
      if (!dropdownToggle) return;

      dropdownToggle.addEventListener("click", () => {
        Navbar.UI.toggleDropdown();
      });
    },

    bindCollapseToggle() {
      const { navbarToggle } = Navbar.Selectors;
      if (!navbarToggle) return;

      navbarToggle.addEventListener("click", () => {
        Navbar.UI.toggleCollapse();
      });
    },

    init() {
      this.bindNavbarLinkClicks();
      this.bindDropdownToggle();
      this.bindCollapseToggle();
    },
  },

  // ==================== Init ====================
  init() {
    this.UI.initSelectors();
    this.UI.applyCollapseState();
    this.Events.init();
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  Navbar.init();
});

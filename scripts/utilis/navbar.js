/**
 * Unified Navbar - Handles both desktop and mobile navigation
 * Uses the same logic and structure for consistency
 */

const Navigation = {
  // ==================== State ====================
  State: {
    isCollapsed: localStorage.getItem("isCollapsed") === "true",
    isMobileSidebarOpen: false,
  },

  // ==================== Selectors ====================
  Selectors: {
    // Desktop
    navbar: null,
    navbarToggle: null,
    navbarLinks: null,
    dropdownToggle: null,
    dropdownMenu: null,
    dropdownIcon: null,

    // Mobile
    mobileHeader: null,
    mobileSidebar: null,
    mobileOverlay: null,
    mobileMenuToggle: null,
    mobileCloseBtn: null,
    mobileDropdownToggle: null,
    mobileDropdownMenu: null,
    mobileDropdownIcon: null,
  },

  // ==================== UI ====================
  UI: {
    initSelectors() {
      const S = Navigation.Selectors;

      // Desktop selectors
      S.navbar = document.querySelector(".navbar.js-navbar");
      S.navbarToggle = document.querySelector(".js-navbar-toggle");
      S.navbarLinks = document.querySelectorAll(".navbar .links-group ul li");
      S.dropdownToggle = document.querySelector(".navbar .js-dropdown");
      S.dropdownMenu = document.querySelector(".navbar .js-dropdown-menu");
      S.dropdownIcon = document.querySelector(".navbar .js-manage-icon");

      // Mobile selectors
      S.mobileHeader = document.querySelector(".mobile-header");
      S.mobileSidebar = document.querySelector(".mobile-sidebar");
      S.mobileOverlay = document.querySelector(".mobile-sidebar-overlay");
      S.mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
      S.mobileCloseBtn = document.querySelector(".mobile-sidebar-close");
      S.mobileDropdownToggle = document.querySelector(
        ".mobile-sidebar li.mobile-dropdown-toggle"
      );
      S.mobileDropdownMenu = document.querySelector(
        ".mobile-sidebar .mobile-dropdown-menu"
      );
      S.mobileDropdownIcon = document.querySelector(
        ".mobile-sidebar .mobile-dropdown-icon"
      );
    },

    // ==================== Desktop UI ====================
    setActiveLink(activeLink) {
      Navigation.Selectors.navbarLinks.forEach((link) =>
        link.classList.remove("active")
      );
      activeLink.classList.add("active");
    },

    toggleDesktopDropdown() {
      const { dropdownMenu, dropdownIcon } = Navigation.Selectors;
      if (!dropdownMenu || !dropdownIcon) return;

      dropdownMenu.classList.toggle("dropdown-menu-active");

      if (dropdownMenu.classList.contains("dropdown-menu-active")) {
        dropdownIcon.classList.remove("bi-caret-down");
        dropdownIcon.classList.add("bi-caret-up");
      } else {
        dropdownIcon.classList.remove("bi-caret-up");
        dropdownIcon.classList.add("bi-caret-down");
      }
    },

    closeDesktopDropdown() {
      const { dropdownMenu, dropdownIcon } = Navigation.Selectors;
      if (!dropdownMenu || !dropdownIcon) return;

      dropdownMenu.classList.remove("dropdown-menu-active");
      dropdownIcon.classList.remove("bi-caret-up");
      dropdownIcon.classList.add("bi-caret-down");
    },

    applyCollapseState() {
      const { navbar, navbarToggle } = Navigation.Selectors;
      if (!navbar) return;

      if (Navigation.State.isCollapsed) {
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
      const { navbar, navbarToggle } = Navigation.Selectors;
      if (!navbar) return;

      navbar.classList.toggle("navbar-collapsed");
      Navigation.State.isCollapsed =
        navbar.classList.contains("navbar-collapsed");
      localStorage.setItem("isCollapsed", Navigation.State.isCollapsed);

      if (navbarToggle) {
        if (Navigation.State.isCollapsed) {
          navbarToggle.innerHTML = '<i class="bi bi-box-arrow-right"></i>';
        } else {
          navbarToggle.innerHTML = '<i class="bi bi-box-arrow-left"></i>';
        }
      }
    },

    // ==================== Mobile UI ====================
    openMobileSidebar() {
      const { mobileSidebar, mobileOverlay } = Navigation.Selectors;
      if (!mobileSidebar || !mobileOverlay) return;

      mobileSidebar.classList.add("active");
      mobileOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
      Navigation.State.isMobileSidebarOpen = true;
    },

    closeMobileSidebar() {
      const { mobileSidebar, mobileOverlay } = Navigation.Selectors;
      if (!mobileSidebar || !mobileOverlay) return;

      mobileSidebar.classList.remove("active");
      mobileOverlay.classList.remove("active");
      document.body.style.overflow = "";
      Navigation.State.isMobileSidebarOpen = false;
    },

    toggleMobileDropdown() {
      const { mobileDropdownMenu, mobileDropdownIcon } = Navigation.Selectors;
      if (!mobileDropdownMenu) return;

      mobileDropdownMenu.classList.toggle("active");
      if (mobileDropdownIcon) {
        mobileDropdownIcon.classList.toggle("rotated");
      }
    },

    setMobileActiveLink() {
      const currentPage =
        window.location.pathname.split("/").pop() || "index.html";
      const links = document.querySelectorAll(
        ".mobile-sidebar .mobile-nav-links ul > a"
      );

      links.forEach((link) => {
        const href = link.getAttribute("href");
        if (href === currentPage || href === `./${currentPage}`) {
          // Add active class to the li inside the link
          const li = link.querySelector("li");
          if (li) {
            li.classList.add("active");
          }

          // If it's in dropdown, open the dropdown
          const { mobileDropdownMenu, mobileDropdownIcon } =
            Navigation.Selectors;
          if (link.closest(".mobile-dropdown-menu") && mobileDropdownMenu) {
            mobileDropdownMenu.classList.add("active");
            if (mobileDropdownIcon) {
              mobileDropdownIcon.classList.add("rotated");
            }
          }
        }
      });
    },

    // Close mobile sidebar on window resize to desktop
    handleResize() {
      if (window.innerWidth > 768 && Navigation.State.isMobileSidebarOpen) {
        Navigation.UI.closeMobileSidebar();
      }
    },
  },

  // ==================== Events ====================
  Events: {
    // Desktop events
    bindDesktopNavbarClicks() {
      const { navbarLinks } = Navigation.Selectors;

      navbarLinks.forEach((navbarLink) => {
        navbarLink.addEventListener("click", () => {
          Navigation.UI.setActiveLink(navbarLink);

          // Close dropdown when clicking non-dropdown links
          if (
            !navbarLink.closest(".dropdown-menu") &&
            !navbarLink.classList.contains("js-dropdown")
          ) {
            Navigation.UI.closeDesktopDropdown();
          }
        });
      });
    },

    bindDesktopDropdownToggle() {
      const { dropdownToggle } = Navigation.Selectors;
      if (!dropdownToggle) return;

      dropdownToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        Navigation.UI.toggleDesktopDropdown();
      });
    },

    bindDesktopCollapseToggle() {
      const { navbarToggle } = Navigation.Selectors;
      if (!navbarToggle) return;

      navbarToggle.addEventListener("click", () => {
        Navigation.UI.toggleCollapse();
      });
    },

    // Mobile events
    bindMobileMenuToggle() {
      const { mobileMenuToggle } = Navigation.Selectors;
      if (!mobileMenuToggle) return;

      mobileMenuToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        Navigation.UI.openMobileSidebar();
      });
    },

    bindMobileCloseBtn() {
      const { mobileCloseBtn } = Navigation.Selectors;
      if (!mobileCloseBtn) return;

      mobileCloseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        Navigation.UI.closeMobileSidebar();
      });
    },

    bindMobileOverlayClick() {
      const { mobileOverlay } = Navigation.Selectors;
      if (!mobileOverlay) return;

      mobileOverlay.addEventListener("click", () => {
        Navigation.UI.closeMobileSidebar();
      });
    },

    bindMobileDropdownToggle() {
      const { mobileDropdownToggle } = Navigation.Selectors;
      if (!mobileDropdownToggle) return;

      mobileDropdownToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        Navigation.UI.toggleMobileDropdown();
      });
    },

    bindMobileNavLinks() {
      // Close sidebar when clicking a nav link (except dropdown toggle)
      const navLinks = document.querySelectorAll(
        ".mobile-sidebar .mobile-nav-links ul > a"
      );
      navLinks.forEach((link) => {
        link.addEventListener("click", () => {
          Navigation.UI.closeMobileSidebar();
        });
      });
    },

    bindWindowResize() {
      let resizeTimer;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          Navigation.UI.handleResize();
        }, 250);
      });
    },

    initDesktop() {
      this.bindDesktopNavbarClicks();
      this.bindDesktopDropdownToggle();
      this.bindDesktopCollapseToggle();
    },

    initMobile() {
      this.bindMobileMenuToggle();
      this.bindMobileCloseBtn();
      this.bindMobileOverlayClick();
      this.bindMobileDropdownToggle();
      this.bindMobileNavLinks();
      this.bindWindowResize();
    },

    init() {
      this.initDesktop();
      this.initMobile();
    },
  },

  // ==================== Init ====================
  init() {
    this.UI.initSelectors();
    this.UI.applyCollapseState();
    this.UI.setMobileActiveLink();
    this.Events.init();
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Small delay to ensure mobile-nav-inject.js has finished
  setTimeout(() => {
    Navigation.init();
  }, 10);
});

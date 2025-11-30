// Mobile Navigation Handler

class MobileNav {
  constructor() {
    this.overlay = document.querySelector(".mobile-sidebar-overlay");
    this.sidebar = document.querySelector(".mobile-sidebar");
    this.menuToggle = document.querySelector(".mobile-menu-toggle");
    this.closeBtn = document.querySelector(".mobile-sidebar-close");
    this.dropdownToggle = document.querySelector(".mobile-dropdown-toggle");
    this.dropdownMenu = document.querySelector(".mobile-dropdown-menu");
    this.dropdownIcon = document.querySelector(".mobile-dropdown-icon");

    this.init();
  }

  init() {
    if (!this.menuToggle || !this.sidebar || !this.overlay) return;

    // Open sidebar
    this.menuToggle.addEventListener("click", () => this.openSidebar());

    // Close sidebar
    this.closeBtn?.addEventListener("click", () => this.closeSidebar());
    this.overlay?.addEventListener("click", () => this.closeSidebar());

    // Dropdown toggle
    this.dropdownToggle?.addEventListener("click", () => this.toggleDropdown());

    // Close sidebar when clicking a link (except dropdown)
    const navLinks = document.querySelectorAll(
      ".mobile-nav-links a:not(.mobile-dropdown-toggle)"
    );
    navLinks.forEach((link) => {
      link.addEventListener("click", () => this.closeSidebar());
    });

    // Set active state for current page
    this.setActiveLink();
  }

  openSidebar() {
    this.sidebar.classList.add("active");
    this.overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeSidebar() {
    this.sidebar.classList.remove("active");
    this.overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  toggleDropdown() {
    this.dropdownMenu.classList.toggle("active");
    this.dropdownIcon.classList.toggle("rotated");
  }

  setActiveLink() {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll(".mobile-nav-links a");

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === currentPage) {
        link.classList.add("active");

        // If it's in dropdown, open the dropdown
        if (link.closest(".mobile-dropdown-menu")) {
          this.dropdownMenu?.classList.add("active");
          this.dropdownIcon?.classList.add("rotated");
        }
      }
    });
  }
}

// Initialize mobile navigation when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new MobileNav();
});

// Handle window resize
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (window.innerWidth > 768) {
      const sidebar = document.querySelector(".mobile-sidebar");
      const overlay = document.querySelector(".mobile-sidebar-overlay");
      sidebar?.classList.remove("active");
      overlay?.classList.remove("active");
      document.body.style.overflow = "";
    }
  }, 250);
});

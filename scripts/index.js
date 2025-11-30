import { TotalInfo } from "./data/analytics.js";
import {
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

function getAuthToken() {
  return localStorage.getItem("authToken");
}

// ==================== DATA ====================

const DashboardData = {
  // Sample pickup dates (date: badge text)
  pickupDates: {
    // "2025-11-05": "G1S",
    // "2025-11-08": "G2B",
    // "2025-11-12": "G3S",
    // "2025-11-15": "G1B",
    // "2025-11-18": "G4S",
    // "2025-11-22": "G2S",
    // "2025-11-25": "G3B",
    // "2025-11-29": "G1S",
  },

  // Stats - will be populated from API
  stats: {
    totalProducts: 0,
    totalSchools: 0,
    totalStudents: 0,
    totalPacks: 0,
  },

  async fetchTotalInfo() {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/api/Analytics/GetTotalInfo`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error(`HTTP ${response.status}: Failed to fetch total info`);
        throw new Error(error.message || "Failed to fetch total info");
      }

      const data = await response.json();
      console.log(data);

      this.stats = {
        totalProducts: data.totalProducts,
        totalSchools: data.totalSchools,
        totalStudents: data.totalStudents,
        totalPacks: data.totalPacks,
      };

      return this.stats;
    } catch (error) {
      console.error("Error fetching total info:", error);
      // Re-throw network errors for server down handling
      if (error instanceof TypeError || error.message?.includes("fetch")) {
        throw error;
      }
      return this.stats;
    }
  },

  // Top schools data
  topSchools: [
    // { rank: 1, name: "MCS", totalPacks: 2, totalUsers: 325 },
    // { rank: 2, name: "DIS", totalPacks: 1, totalUsers: 250 },
    // { rank: 3, name: "Clary SC", totalPacks: 2, totalUsers: 180 },
    // { rank: 4, name: "Clary SC", totalPacks: 2, totalUsers: 180 },
    // { rank: 5, name: "Clary SC", totalPacks: 2, totalUsers: 180 },
  ],

  packData: {
    // labels: ["Pack A", "Pack B", "Pack C"],
    // data: [50, 30, 20],
    // colors: ["#305d62", "#6b9fa3", "#a8d5d8"],
  },
};

// ==================== UI RENDERING ====================

const DashboardUI = {
  renderStats() {
    const totalProductsEl = document.querySelector(".js-total-products");
    const totalSchoolsEl = document.querySelector(".js-total-schools");
    const totalStudentsEl = document.querySelector(".js-total-students");
    const totalPacksEl = document.querySelector(".js-total-packs");

    if (totalProductsEl)
      totalProductsEl.textContent =
        DashboardData.stats.totalProducts.toLocaleString();
    if (totalSchoolsEl)
      totalSchoolsEl.textContent =
        DashboardData.stats.totalSchools.toLocaleString();
    if (totalStudentsEl)
      totalStudentsEl.textContent =
        DashboardData.stats.totalStudents.toLocaleString();
    if (totalPacksEl)
      totalPacksEl.textContent =
        DashboardData.stats.totalPacks.toLocaleString();
  },

  renderTopSchools() {
    const tbody = document.querySelector(".js-schools-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    DashboardData.topSchools.forEach((school) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${school.rank}</td>
        <td>${school.name}</td>
        <td>${school.totalPacks}</td>
        <td>${school.totalUsers}</td>
      `;
      tbody.appendChild(row);
    });
  },
};

// ==================== CALENDAR ====================

const CalendarUI = {
  currentMonth: 10, // November (0-indexed)
  currentYear: 2025,

  init() {
    this.setupEventListeners();
    this.renderCalendar();
  },

  setupEventListeners() {
    const monthSelect = document.querySelector(".js-calendar-month");
    const yearSelect = document.querySelector(".js-calendar-year");

    if (!monthSelect || !yearSelect) return;

    monthSelect.addEventListener("change", (e) => {
      this.currentMonth = parseInt(e.target.value);
      this.renderCalendar();
    });

    yearSelect.addEventListener("change", (e) => {
      this.currentYear = parseInt(e.target.value);
      this.renderCalendar();
    });
  },

  renderCalendar() {
    const calendarGrid = document.querySelector(".js-calendar-grid");
    if (!calendarGrid) return;

    calendarGrid.innerHTML = "";

    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const prevLastDay = new Date(this.currentYear, this.currentMonth, 0);

    const firstDayOfWeek = firstDay.getDay();
    const lastDateOfMonth = lastDay.getDate();
    const lastDateOfPrevMonth = prevLastDay.getDate();

    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === this.currentMonth &&
      today.getFullYear() === this.currentYear;

    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = lastDateOfPrevMonth - i;
      const dayEl = this.createDayElement(day, true);
      calendarGrid.appendChild(dayEl);
    }

    // Current month days
    for (let day = 1; day <= lastDateOfMonth; day++) {
      const dateStr = `${this.currentYear}-${String(
        this.currentMonth + 1
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isToday = isCurrentMonth && day === today.getDate();
      const hasPickup = DashboardData.pickupDates[dateStr];

      const dayEl = this.createDayElement(day, false, isToday, hasPickup);
      calendarGrid.appendChild(dayEl);
    }

    // Next month days
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
      const dayEl = this.createDayElement(day, true);
      calendarGrid.appendChild(dayEl);
    }
  },

  createDayElement(day, isOtherMonth, isToday = false, pickupBadge = null) {
    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";

    if (isOtherMonth) {
      dayEl.classList.add("other-month");
    }
    if (isToday) {
      dayEl.classList.add("today");
    }
    if (pickupBadge) {
      dayEl.classList.add("has-pickup");
      dayEl.innerHTML = `
        ${day}
        <span class="pickup-badge">${pickupBadge}</span>
      `;
    } else {
      dayEl.textContent = day;
    }

    return dayEl;
  },
};

// ==================== CHARTS ====================

const ChartsUI = {
  revenueChart: null,
  packChart: null,

  init() {
    this.setupRevenueFilters();
    this.renderRevenueChart();
    this.renderPackChart();
  },

  renderRevenueChart(month = 10, year = 2025) {
    const ctx = document.getElementById("revenueChart");
    if (!ctx) return;

    // Get first and last day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Calculate weeks in the month
    const weeks = [];
    let currentWeekStart = new Date(firstDay);
    let weekNumber = 1;

    while (currentWeekStart <= lastDay) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // If week extends beyond month, cap it at last day
      const effectiveEnd = weekEnd > lastDay ? lastDay : weekEnd;

      weeks.push({
        label: `Week ${weekNumber}`,
        startDate: new Date(currentWeekStart),
        endDate: new Date(effectiveEnd),
      });

      // Move to next week
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNumber++;
    }

    // Generate fake data for each week
    const labels = weeks.map((w) => {
      const startStr = `${w.startDate.getDate()}/${w.startDate.getMonth() + 1}`;
      const endStr = `${w.endDate.getDate()}/${w.endDate.getMonth() + 1}`;
      return `${startStr} - ${endStr}`;
    });
    const revenueData = weeks.map(
      () => Math.floor(Math.random() * 4000) + 2000
    );

    // Destroy existing chart if it exists
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }

    this.revenueChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Revenue",
            data: revenueData,
            backgroundColor: "#305d62",
            borderColor: "#305d62",
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#305d62",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            showLine: true,
            tension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            titleFont: {
              family: "Poppins",
              size: 14,
            },
            bodyFont: {
              family: "Poppins",
              size: 13,
            },
            callbacks: {
              title: function (context) {
                return context[0].label;
              },
              label: function (context) {
                return "Revenue: EGP " + context.parsed.y.toLocaleString();
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                family: "Poppins",
                size: 11,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
            ticks: {
              font: {
                family: "Poppins",
                size: 11,
              },
              callback: function (value) {
                return value.toLocaleString();
              },
            },
          },
        },
      },
    });
  },

  setupRevenueFilters() {
    const monthSelect = document.querySelector(".js-revenue-month");
    const yearSelect = document.querySelector(".js-revenue-year");

    if (!monthSelect || !yearSelect) return;

    // Only setup listeners once
    if (this._revenueFiltersSetup) return;
    this._revenueFiltersSetup = true;

    monthSelect.addEventListener("change", () => {
      const month = parseInt(monthSelect.value);
      const year = parseInt(yearSelect.value);
      this.renderRevenueChart(month, year);
    });

    yearSelect.addEventListener("change", () => {
      const month = parseInt(monthSelect.value);
      const year = parseInt(yearSelect.value);
      this.renderRevenueChart(month, year);
    });
  },

  renderPackChart() {
    const ctx = document.getElementById("packChart");
    if (!ctx) return;

    packChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: packData.labels,
        datasets: [
          {
            data: packData.data,
            backgroundColor: packData.colors,
            borderWidth: 0,
            spacing: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "60%",
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              padding: 20,
              font: {
                family: "Poppins",
                size: 12,
              },
              // generateLabels: function (chart) {
              //   const data = chart.data;
              //   return data.labels.map((label, i) => ({
              //     text: `${label} (${data.datasets[0].data[i]}%)`,
              //     fillStyle: data.datasets[0].backgroundColor[i],
              //     hidden: false,
              //     index: i,
              //   }));
              // },
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            titleFont: {
              family: "Poppins",
              size: 14,
            },
            bodyFont: {
              family: "Poppins",
              size: 13,
            },
            callbacks: {
              label: function (context) {
                return context.label + ": " + context.parsed + "%";
              },
            },
          },
        },
      },
    });
  },
};

// ==================== MAIN FUNCTION ====================

async function main() {
  try {
    // Fetch total info data
    await DashboardData.fetchTotalInfo();

    // Render UI components
    DashboardUI.renderStats();
    DashboardUI.renderTopSchools();

    // Initialize calendar
    CalendarUI.init();

    // Initialize charts
    // ChartsUI.init();

    hideLoadingScreen();
  } catch (error) {
    if (isServerError(error)) {
      showServerDownPage();
    } else {
      hideLoadingScreen();
      console.error("Dashboard initialization error:", error);
    }
  }
}

await main();

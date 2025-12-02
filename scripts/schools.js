import { School } from "./data/school.js";

const API_BASE_URL = "https://yourself-demo.runasp.net";
// const API_BASE_URL = "https://localhost:44372";

function getAuthToken() {
  return localStorage.getItem("authToken");
}

const API = {
  Schools: {
    async getAllSchools() {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageSchools/GetAllSchools`,
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
          // Return empty array for HTTP errors (404, 500, etc.) but not network errors
          return [];
        }

        const result = await response.json();
        return result.map((school) => new School(school));
      } catch (error) {
        console.error("getAllSchools error:", error);
        // Re-throw network errors so they can be caught by main()
        throw error;
      }
    },
  },
};

// ==================== SCHOOL UI OBJECT ====================
const SchoolUI = {
  async renderSchoolsTable() {
    const schools = await API.Schools.getAllSchools();
    const schoolsTable = document.querySelector(".js-schools-table");
    const tbody = schoolsTable.querySelector("tbody");
    tbody.innerHTML = "";

    if (schools.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 60px 20px;">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; color: #6c757d;">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.3; margin-bottom: 20px;">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="15"></line>
                <line x1="15" y1="9" x2="9" y2="15"></line>
              </svg>
              <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #495057;">No Data Found</h3>
              <p style="font-size: 14px; margin: 0; color: #6c757d;">Add schools to get started</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    schools.forEach((school) => {
      tbody.innerHTML += `
        <tr>
          <td>${school.code}</td>
          <td>${school.name || school.abbreviation || ""}</td>
          <td>${school.location}</td>
          <td>${school.phoneNumber || school.contactPhoneNumber || ""}</td>
          <td>${school.totalStudents}</td>
          <td>${school.totalPacks ?? 0}</td>
          <td><span>${school.status}</span></td>
          <td>
            <a href="/schools_view.html?id=${
              school.id
            }" class="icon-button js-view-button" style="color: gray"><i class="bi bi-eye"></i></a>
            <a href="/schools_edit.html?id=${
              school.id
            }" class="icon-button js-edit-button" style="color: var(--primary-color)"><i class="bi bi-pencil"></i></a>
            <a class="icon-button js-delete-button" style="color: #dd0000ff" data-id="${
              school.id
            }"><i class="bi bi-trash"></i></a>
          </td>
        </tr>
      `;
    });
  },

  setupAddButton() {
    const addButton = document.querySelector(".js-add-button");
    addButton.addEventListener("click", () => {
      window.location.href = "./schools_add.html";
    });
  },

  setupDeleteButton() {
    const schoolsTable = document.querySelector(".js-schools-table");
    schoolsTable.querySelector("tbody").addEventListener("click", (e) => {
      if (e.target.closest(".js-delete-button")) {
        const btn = e.target.closest(".js-delete-button");
        const id = btn.dataset.id;
        console.log(`school with ${id} was deleted`);
        // TODO: Implement delete confirmation and API call
      }
    });
  },
};

// ==================== MAIN FUNCTION ====================
import {
  showServerDownPage,
  isServerError,
  showLandscapeRecommendation,
} from "./utilis/pop-ups.js";

function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
    setTimeout(() => loadingScreen.remove(), 300);
  }
}

async function main() {
  try {
    SchoolUI.setupAddButton();
    SchoolUI.setupDeleteButton();
    await SchoolUI.renderSchoolsTable();
    hideLoadingScreen();
    showLandscapeRecommendation();
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

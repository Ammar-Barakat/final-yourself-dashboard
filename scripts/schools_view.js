import { SchoolDetails } from "./data/school.js";

const API_BASE_URL = "https://yourself-demo.runasp.net";
// const API_BASE_URL = "https://localhost:44372";

function getAuthToken() {
  return localStorage.getItem("authToken");
}

// ==================== URL PARAMETERS ====================
const params = new URLSearchParams(window.location.search);
const schoolId = params.get("id");

// ==================== API OBJECT ====================
const API = {
  Schools: {
    async getSchoolById(schoolId) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageSchools/GetSchoolById/${schoolId}`,
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
            throw new Error(`School not found with ID: ${schoolId}`);
          }
          throw new Error(error.message || "Failed to fetch school");
        }

        const result = await response.json();
        const school = new SchoolDetails(result);
        console.log("School loaded:", school);
        return school;
      } catch (error) {
        console.error("getSchoolById error:", error);
        throw error;
      }
    },
  },
};

// ==================== UTILIS OBJECT ====================
const Utilis = {
  Events: {
    renderStatus(status, statusSpan) {
      const statusColors = {
        Pending: "gray",
        Processed: "#ff9900ff",
        Designing: "#8b5cf6",
        Completed: "#387400ff",
        Canceled: "#dd0000ff",
      };
      statusSpan.style.backgroundColor = statusColors[status] || "gray";
    },
  },
};

// ==================== PACKS UI OBJECT ====================
const PacksUI = {
  renderPacksData(packs) {
    const packsContainer = document.querySelector(".js-packs-content");

    if (packs.length === 0) {
      packsContainer.innerHTML = `
        <div class="no-packs-found">
          <i class="bi bi-box-seam"></i>
          <p>No packs added yet</p>
        </div>
      `;
      return;
    }

    packsContainer.innerHTML = "";

    packs.forEach((pack) => {
      // Format pack name as 'English / Arabic'
      const packDisplayName = pack.name_AR
        ? `${pack.name} / ${pack.name_AR}`
        : pack.name;

      packsContainer.innerHTML += `
        <div class="card">
          <div class="card-title">
            <span class="special">${packDisplayName}</span>
            <p>${pack.price} EGP per student</p>
          </div>
          <div>
            <p>Items Included:</p>
            ${pack.products
              .map((product) => {
                // Format product name as 'English / Arabic'
                const productDisplayName = product.productName_AR
                  ? `${product.productName} / ${product.productName_AR}`
                  : product.productName;
                return `<span>${productDisplayName}</span>`;
              })
              .join(" ")}
          </div>
        </div>
      `;
    });
  },
};

// ==================== EXTRAS UI OBJECT ====================
const ExtrasUI = {
  renderExtrasData(extras) {
    const extrasContainer = document.querySelector(".js-extras-content");

    if (extras.length === 0) {
      extrasContainer.innerHTML = `
        <div class="no-extras-found">
          <i class="bi bi-bag-plus"></i>
          <p>No extras added yet</p>
        </div>
      `;
      return;
    }

    extrasContainer.innerHTML = "";

    extras.forEach((extra) => {
      // Format product name as 'English / Arabic'
      const productDisplayName = extra.productName_AR
        ? `${extra.productName} / ${extra.productName_AR}`
        : extra.productName;

      extrasContainer.innerHTML += `
        <div class="card">
          <div class="card-title">
            <span class="special">${productDisplayName}</span>
            <p>Price: ${extra.productPrice} EGP</p>
          </div>
        </div>
      `;
    });
  },
};

// ==================== SCHOOL VIEW UI OBJECT ====================
const SchoolViewUI = {
  renderSchoolHeader(school) {
    const titleElement = document.querySelector(".js-title-content");

    titleElement.innerHTML = `
      <h2>${school.abbreviation}</h2>
      <p>School Code: #${school.code} • Created: ${
      school.addDate ? dayjs(school.addDate).format("MMMM D, YYYY") : "N/A"
    }</p>
    `;
  },

  Events: {
    setupEditButton(schoolId) {
      const editButton = document.querySelector(".js-edit-school");

      editButton.addEventListener("click", () => {
        window.location.href = `/schools_edit.html?id=${schoolId}`;
      });
    },
  },

  renderSchoolData(school) {
    const schoolData = document.querySelector(".js-school-data");

    schoolData.querySelector(".js-school-name").innerHTML = school.name;
    schoolData.querySelector(".js-school-location").innerHTML = school.location;
    schoolData.querySelector(".js-total-students").innerHTML =
      school.totalStudents;

    const statusSpan = schoolData.querySelector(".js-status");
    statusSpan.innerHTML = school.status;
    Utilis.Events.renderStatus(school.status, statusSpan);
  },

  renderLeaderData(school) {
    const leaderData = document.querySelector(".js-leader-data");

    leaderData.querySelector(".js-leader-name").innerHTML = school.contactName;
    leaderData.querySelector(".js-phone-number").innerHTML =
      school.contactPhoneNumber;
  },

  renderQuickStateData(school) {
    const quickStateContainer = document.querySelector(".js-quick-state");

    quickStateContainer.querySelector(".js-total-students").innerHTML =
      school.totalStudents;
    quickStateContainer.querySelector(".js-total-packs").innerHTML =
      school.packs.length;
  },

  renderSchoolStatusData(school) {
    const schoolStatusContainer = document.querySelector(".js-school-status");

    const statusSpan = schoolStatusContainer.querySelector(".js-status");
    statusSpan.innerHTML = school.status;
    Utilis.Events.renderStatus(school.status, statusSpan);

    schoolStatusContainer.querySelector(
      ".js-school-code"
    ).innerHTML = `#${school.code}`;

    schoolStatusContainer.querySelector(".js-school-addDate").innerHTML =
      school.addDate ? dayjs(school.addDate).format("MMMM D, YYYY") : "N/A";

    schoolStatusContainer.querySelector(".js-school-deliveryDate").innerHTML =
      school.deliveryDate
        ? dayjs(school.deliveryDate).format("MMMM D, YYYY")
        : "N/A";

    schoolStatusContainer.querySelector(".js-school-depositAmount").innerHTML =
      school.depositAmount ? `${school.depositAmount} EGP` : "N/A";
  },
};

// ==================== MAIN FUNCTION ====================
import { showServerDownPage, isServerError } from "./utilis/pop-ups.js";

function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
    setTimeout(() => loadingScreen.remove(), 300);
  }
}

async function main() {
  try {
    const school = await API.Schools.getSchoolById(schoolId);

    SchoolViewUI.renderSchoolHeader(school);
    SchoolViewUI.renderSchoolData(school);
    SchoolViewUI.renderLeaderData(school);
    SchoolViewUI.renderQuickStateData(school);
    SchoolViewUI.renderSchoolStatusData(school);

    PacksUI.renderPacksData(school.packs);
    ExtrasUI.renderExtrasData(school.extraProducts);
    hideLoadingScreen();
  } catch (error) {
    if (isServerError(error)) {
      showServerDownPage();
      return;
    } else {
      hideLoadingScreen();
      throw error;
    }
  }

  SchoolViewUI.Events.setupEditButton(schoolId);
}

await main();

import { School, SchoolDetails } from "./data/school.js";
import {
  showServerDownPage,
  isServerError,
  showToast,
} from "./utilis/pop-ups.js";

const API_BASE_URL = "https://yourself-demo.runasp.net";
// const API_BASE_URL = "https://localhost:44372";

function getAuthToken() {
  return localStorage.getItem("authToken");
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
    setTimeout(() => loadingScreen.remove(), 300);
  }
}

const API = {
  async getSchools() {
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
        try {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);
          throw new Error(error.message || "Failed to fetch schools");
        } catch {
          throw new Error(`HTTP ${response.status}: Failed to fetch schools`);
        }
      }

      const result = await response.json();

      const schoolsData = result.map((school) => new School(school));
      return schoolsData.map((school) => ({
        id: school.id,
        name: school.name,
        totalPacks: school.totalPacks,
      }));
    } catch (error) {
      console.error("getSchools error:", error);
      if (error instanceof TypeError || error.message?.includes("fetch")) {
        throw error;
      }
      return [];
    }
  },

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
        try {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`School not found with ID: ${schoolId}`);
          }
          throw new Error(error.message || "Failed to fetch school");
        } catch {
          throw new Error(`HTTP ${response.status}: Failed to fetch school`);
        }
      }

      const result = await response.json();

      const school = new SchoolDetails(result);

      return school;
    } catch (error) {
      console.error("getSchoolById error:", error);
      throw error;
    }
  },

  async addPackProductDesigns(packProductId, imageFiles) {
    const token = getAuthToken();
    const formData = new FormData();

    Object.keys(imageFiles).forEach((index) => {
      formData.append("designImagesFiles", imageFiles[index]);
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ManageDesign/AddPackProductDesigns/${packProductId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        try {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`Pack product not found with ID: ${packProductId}`);
          } else if (error.statusCode === 400) {
            throw new Error("Invalid design files. Please check the images.");
          } else if (error.statusCode === 500) {
            throw new Error("File upload failed. Please try again.");
          }
          throw new Error(error.message || "Failed to upload designs");
        } catch {
          throw new Error(`HTTP ${response.status}: Failed to upload designs`);
        }
      }
      const result = await response.text();
      return result;
    } catch (error) {
      console.error("addPackProductDesigns error:", error);
      throw error;
    }
  },
};

const DesignUploadHandler = {
  uploadedDesigns: {},

  initialize(packId) {
    if (!this.uploadedDesigns[packId]) {
      this.uploadedDesigns[packId] = {};
    }
  },

  handleUpload(event, packId, productId, slotIndex) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    if (!this.uploadedDesigns[packId][productId]) {
      this.uploadedDesigns[packId][productId] = {};
    }
    this.uploadedDesigns[packId][productId][slotIndex] = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      const uploadBox = event.target.closest(".upload-box");
      const preview = uploadBox.querySelector("img");
      preview.src = e.target.result;
      uploadBox.classList.add("has-image");
      this.updateCounter(uploadBox.closest(".product-category"));
    };
    reader.readAsDataURL(file);

    console.log("Current uploads:", this.uploadedDesigns);
  },

  remove(event, packId, productId, slotIndex) {
    event.stopPropagation();

    if (
      this.uploadedDesigns[packId] &&
      this.uploadedDesigns[packId][productId] &&
      this.uploadedDesigns[packId][productId][slotIndex]
    ) {
      delete this.uploadedDesigns[packId][productId][slotIndex];
    }

    const uploadBox = event.target.closest(".upload-box");
    const input = uploadBox.querySelector('input[type="file"]');
    const preview = uploadBox.querySelector("img");

    input.value = "";
    preview.src = "";
    uploadBox.classList.remove("has-image");

    this.updateCounter(uploadBox.closest(".product-category"));
    console.log("Current uploads:", this.uploadedDesigns);
  },

  triggerInput(uploadBox) {
    const input = uploadBox.querySelector('input[type="file"]');
    input.click();
  },

  updateCounter(category) {
    const uploadBoxes = category.querySelectorAll(".upload-box");
    const uploadedCount = category.querySelectorAll(
      ".upload-box.has-image"
    ).length;
    const counter = category.querySelector(".js-upload-counter");
    counter.textContent = `${uploadedCount}/${uploadBoxes.length} photos uploaded`;
  },

  getUploads(packId) {
    return this.uploadedDesigns[packId] || {};
  },

  async save(packId) {
    const uploads = this.getUploads(packId);
    if (Object.keys(uploads).length === 0) {
      showToast("No designs uploaded yet!", "warning");
      return;
    }

    console.log("Uploading designs:", uploads);

    try {
      for (const productId of Object.keys(uploads)) {
        // Filter out existing designs (URL strings) and only upload new files
        const newFiles = {};
        Object.entries(uploads[productId]).forEach(([slotIndex, fileOrUrl]) => {
          if (fileOrUrl instanceof File) {
            newFiles[slotIndex] = fileOrUrl;
          }
        });

        // Only upload if there are new files
        if (Object.keys(newFiles).length > 0) {
          console.log(
            `Uploading new designs for product ${productId}:`,
            newFiles
          );

          const result = await API.addPackProductDesigns(productId, newFiles);

          console.log(`Upload result for product ${productId}:`, result);
        } else {
          console.log(`No new designs to upload for product ${productId}`);
        }
      }

      showToast("Designs uploaded successfully!", "success");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Failed to upload designs:", error);
      showToast(
        error.message || "Failed to upload designs. Please try again.",
        "error"
      );
    }
  },
};

const DesignUI = {
  async renderPackProductDesigns(pack) {
    const chooseContainer = document.querySelector(".js-choose");
    chooseContainer.style.display = "none";

    const uploadContainer = document.querySelector(".js-upload");
    uploadContainer.style.display = "flex";

    const packProducts = pack.products;
    DesignUploadHandler.initialize(pack.id);

    uploadContainer.innerHTML = `
      <div class="designs-header">
        <h2>Upload item designs</h2>
        <button class="primary-button js-save-button">Save Changes</button>
      </div>
      <div class="designs-container js-designs-container">
        ${packProducts
          .map(
            (packProduct) => `
            <div class="product-category" data-product-id="${packProduct.id}">
              <h3 class="category-title">${packProduct.productName}</h3>
              <div class="upload-grid">
                ${[
                  { index: 0, label: "Front" },
                  { index: 1, label: "Back" },
                  { index: 2, label: "Side" },
                ]
                  .map((slot) => {
                    const designImage =
                      packProduct.designImages[slot.index] || "";
                    const hasImage = designImage ? "has-image" : "";
                    return `
                  <div class="upload-slot">
                    <label class="slot-label">${slot.label}</label>
                    <div class="upload-box ${hasImage}" data-slot-index="${slot.index}">
                      <i class="bi bi-upload upload-box-icon"></i>
                      <span class="upload-box-text">Upload</span>
                      <img alt="preview" src="${designImage}" />
                      <button class="remove-button"><i class="bi bi-x"></i></button>
                      <input type="file" accept="image/*"
                        data-pack-id="${pack.id}"
                        data-product-id="${packProduct.id}"
                        data-slot-index="${slot.index}" />
                    </div>
                  </div>`;
                  })
                  .join("")}
              </div>
              <div class="upload-counter js-upload-counter">${
                packProduct.designImages.length
              }/3 photos uploaded</div>
            </div>`
          )
          .join("")}
      </div>`;

    this.seedExistingDesigns(pack, packProducts);
    this.attachUploadEventListeners(pack.id);
  },

  seedExistingDesigns(pack, packProducts) {
    packProducts.forEach((packProduct) => {
      if (packProduct.designImages && packProduct.designImages.length > 0) {
        packProduct.designImages.forEach((imageUrl, index) => {
          if (imageUrl) {
            // Mark as existing design (URL string instead of File object)
            if (!DesignUploadHandler.uploadedDesigns[pack.id]) {
              DesignUploadHandler.uploadedDesigns[pack.id] = {};
            }
            if (!DesignUploadHandler.uploadedDesigns[pack.id][packProduct.id]) {
              DesignUploadHandler.uploadedDesigns[pack.id][packProduct.id] = {};
            }
            DesignUploadHandler.uploadedDesigns[pack.id][packProduct.id][
              index
            ] = imageUrl;
          }
        });
      }
    });
  },

  attachUploadEventListeners(packId) {
    const uploadContainer = document.querySelector(".js-upload");
    const saveBtn = uploadContainer.querySelector(".js-save-button");
    saveBtn.addEventListener("click", () => DesignUploadHandler.save(packId));

    const uploadBoxes = uploadContainer.querySelectorAll(".upload-box");
    uploadBoxes.forEach((uploadBox) => {
      uploadBox.addEventListener("click", (e) => {
        if (!e.target.closest(".remove-button")) {
          DesignUploadHandler.triggerInput(uploadBox);
        }
      });

      const input = uploadBox.querySelector('input[type="file"]');
      input.addEventListener("change", (e) => {
        const { packId, productId, slotIndex } = e.target.dataset;
        DesignUploadHandler.handleUpload(e, packId, productId, slotIndex);
      });

      const removeBtn = uploadBox.querySelector(".remove-button");
      removeBtn.addEventListener("click", (e) => {
        const input = uploadBox.querySelector('input[type="file"]');
        const { packId, productId, slotIndex } = input.dataset;
        DesignUploadHandler.remove(e, packId, productId, slotIndex);
      });
    });
  },

  async renderSchoolPacksDropdown(school) {
    const packsDropdownContainer = document.querySelector(
      ".js-packs-dropdown-container"
    );
    packsDropdownContainer.style.display = "flex";

    const packsDropdownHTML = packsDropdownContainer.querySelector(
      "select[name='packs-dropdown']"
    );
    packsDropdownHTML.innerHTML = `<option selected disabled>Choose a pack</option>`;

    const packs = school.packs;
    packs.forEach((pack) => {
      packsDropdownHTML.innerHTML += `<option value="${pack.id}">${pack.name}</option>`;
    });

    packsDropdownHTML.addEventListener("change", async (e) => {
      const selectedPack = packs.find((pack) => pack.id == e.target.value);
      await DesignUI.renderPackProductDesigns(selectedPack);
    });
  },

  async renderSchoolsDropdown() {
    const schools = await API.getSchools();
    const schoolsDropdownHTML = document.querySelector(".js-schools-dropdown");

    if (schools.length === 0) {
      schoolsDropdownHTML.innerHTML = `<option selected disabled>No schools available</option>`;
      schoolsDropdownHTML.disabled = true;

      document.querySelector(".js-page-main-data .js-choose").innerHTML = `
        <div class="choose">
          <i class="bi bi-buildings"></i>
          <p style="color: #6c757d;">No schools found. Please add schools first.</p>
        </div>`;
      return;
    }

    schools.forEach((school) => {
      schoolsDropdownHTML.innerHTML += `
        <option value="${school.id}" data-total-packs="${school.totalPacks}">
          ${school.name}
        </option>`;
    });

    schoolsDropdownHTML.addEventListener("change", async (e) => {
      document.querySelector(".js-page-main-data .card").innerHTML = `
        <div class="choose">
          <i class="bi bi-box-seam"></i>
          <p>Choose pack to get started</p>
        </div>`;
      const school = await API.getSchoolById(e.target.value);
      await DesignUI.renderSchoolPacksDropdown(school);
    });
  },

  Events: {
    async setupDesignUI() {
      const packsDropdownContainer = document.querySelector(
        ".js-packs-dropdown-container"
      );
      const uploadContainer = document.querySelector(".js-upload");

      packsDropdownContainer.style.display = "none";
      uploadContainer.style.display = "none";

      await DesignUI.renderSchoolsDropdown();
    },
  },
};

async function main() {
  try {
    await DesignUI.Events.setupDesignUI();
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

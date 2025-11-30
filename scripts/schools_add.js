import { togglePopUpOff, togglePopUpOn, showToast } from "./utilis/pop-ups.js";
import { Product } from "./data/product.js";

const API_BASE_URL = "https://yourself-demo.runasp.net";
// const API_BASE_URL = "https://localhost:44372";

function getAuthToken() {
  return localStorage.getItem("authToken");
}

const API = {
  Products: {
    async getAllProducts() {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageProducts/GetAllProducts`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error(`HTTP ${response.status}: Failed to fetch products`);
          return [];
        }

        const result = await response.json();
        console.log(result);

        const products = result.map((product) => new Product(product));
        return products;
      } catch (error) {
        console.error("getAllProducts error:", error);
        // Re-throw network errors, but return empty for HTTP errors
        if (error instanceof TypeError || error.message?.includes("fetch")) {
          throw error;
        }
        return [];
      }
    },
  },

  Schools: {
    async addSchool(schoolData) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageSchools/AddSchool`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(schoolData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 400) {
            throw new Error(
              "Invalid school data. Please check all required fields."
            );
          } else if (error.statusCode === 422) {
            throw new Error(error.message || "School validation failed.");
          } else if (error.statusCode === 409) {
            throw new Error("A school with this name already exists.");
          }
          throw new Error(error.message || "Failed to add school");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("addSchool error:", error);
        throw error;
      }
    },
  },
};

const Utilis = {
  Events: {
    openClosePopUp(popUp) {
      togglePopUpOn(popUp);

      const closeCancelButtons = popUp.querySelectorAll(
        ".js-close-button, .js-cancel-button"
      );

      closeCancelButtons.forEach((button) => {
        button.addEventListener("click", () => {
          togglePopUpOff(popUp);
        });
      });
    },

    preventFormSubmission() {
      const form = document.querySelector("form");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
        });
      }
    },

    renderTooltips(formSelectors = []) {
      const forms = formSelectors.map((selector) =>
        document.querySelector(selector)
      );

      const labels = forms
        .filter((form) => form !== null)
        .flatMap((form) => Array.from(form.querySelectorAll("label")));

      if (labels.length === 0) return;

      const tooltip = document.createElement("div");
      tooltip.classList.add("tooltip");
      document.body.appendChild(tooltip);

      labels.forEach((label) => {
        // Show tooltip on mouseenter
        label.addEventListener("mouseenter", (e) => {
          tooltip.style.display = "block";
          // Use custom attribute if available, otherwise default message
          tooltip.textContent =
            label.dataset.tooltip || "This field is required";
        });

        // Move tooltip with mouse
        label.addEventListener("mousemove", (e) => {
          tooltip.style.left = e.pageX + 10 + "px";
          tooltip.style.top = e.pageY + 10 + "px";
        });

        // Hide tooltip on mouseleave
        label.addEventListener("mouseleave", () => {
          tooltip.style.display = "none";
        });
      });
    },
  },
};

// ==================== PRODUCTS UI OBJECT ====================
const ProductsUI = {
  selectedProducts: [],

  async seedProductsDropdown(productDropdown, selectedId = null) {
    const products = await API.Products.getAllProducts();

    const selId =
      selectedId !== null && selectedId !== undefined
        ? Number(selectedId)
        : productDropdown.dataset && productDropdown.dataset.selected
        ? Number(productDropdown.dataset.selected)
        : null;

    // Filter products, excluding already selected ones (except the current selection)
    const filteredProducts = products.filter(
      (p) => !ProductsUI.selectedProducts.includes(p.id) || p.id === selId
    );

    // Build a fresh <select> element to avoid stacking event listeners
    const newSelect = document.createElement("select");
    newSelect.name = productDropdown.name || "product";
    newSelect.className = productDropdown.className || "js-product-dropdown";

    newSelect.innerHTML =
      '<option disabled selected value="">Select a Product</option>';

    filteredProducts.forEach((product) => {
      // Format display as 'English / Arabic' if Arabic name exists
      const displayName = product.name_AR
        ? `${product.name} / ${product.name_AR}`
        : product.name;
      newSelect.innerHTML += `<option value="${product.id}|${product.name}">${displayName}</option>`;
    });

    // If this dropdown had a selected id, set it again and store it on dataset
    if (selId) {
      const selProduct = products.find((p) => p.id === Number(selId));
      if (selProduct) {
        newSelect.value = `${selProduct.id}|${selProduct.name}`;
        newSelect.dataset.selected = String(selProduct.id);
      } else {
        newSelect.dataset.selected = "";
      }
    } else {
      newSelect.dataset.selected = "";
    }

    // Replace the old select with the newly built select (removes old listeners)
    productDropdown.parentNode.replaceChild(newSelect, productDropdown);

    // Attach a single change handler
    newSelect.addEventListener("change", (e) => {
      const value = e.target.value;
      const newProductId = Number(value.split("|")[0]);
      const prevSelected = e.target.dataset.selected
        ? Number(e.target.dataset.selected)
        : null;

      // Remove previous selection (if any) and add the new selection
      if (prevSelected) {
        ProductsUI.onProductRemoved(prevSelected);
      }
      ProductsUI.onProductSelected(newProductId);

      // Store the new selection on the element
      e.target.dataset.selected = String(newProductId);

      // Re-render other dropdowns so their option lists update
      document.querySelectorAll(".js-product-dropdown").forEach((ddl) => {
        if (ddl === e.target) return; // Skip the one we just changed
        const currentSel =
          ddl.dataset && ddl.dataset.selected
            ? Number(ddl.dataset.selected)
            : ddl.value
            ? Number(ddl.value.split("|")[0])
            : null;
        ProductsUI.seedProductsDropdown(ddl, currentSel);
      });
    });
  },

  renderAddProductDropdown() {
    const container = document.querySelector(".js-products-dropdown");

    if (!container) return;

    // Check if this is the first dropdown
    const isFirst =
      container.querySelectorAll(".product-dropdown").length === 0;

    const wrapper = document.createElement("div");
    wrapper.classList.add("product-dropdown");

    if (isFirst) {
      // First dropdown: only select + Add button
      wrapper.innerHTML = `
        <select name="product" class="js-product-dropdown"></select>
        <button type="button" class="js-add-product-button primary-button">Add Product</button>
      `;
    } else {
      // Subsequent dropdowns: select + Remove + Add buttons
      wrapper.innerHTML = `
        <select name="product" class="js-product-dropdown"></select>
        <div>
          <button type="button" class="js-remove-product-button secondary-button">Remove</button>
          <button type="button" class="js-add-product-button primary-button">Add</button>
        </div>
      `;
    }

    container.appendChild(wrapper);

    const dropdown = wrapper.querySelector(".js-product-dropdown");
    ProductsUI.seedProductsDropdown(dropdown);
  },

  onProductSelected(productId) {
    const numericId = Number(productId);

    if (!productId) return;

    if (!ProductsUI.selectedProducts.includes(numericId)) {
      ProductsUI.selectedProducts.push(numericId);
      console.log("Product selected:", numericId);
      console.log("Selected products:", ProductsUI.selectedProducts);
    }
  },

  onProductRemoved(productId) {
    const numericId = Number(productId);

    if (!productId) return;

    if (ProductsUI.selectedProducts.includes(numericId)) {
      ProductsUI.selectedProducts = ProductsUI.selectedProducts.filter(
        (id) => id !== numericId
      );
      console.log("Product removed:", numericId);
      console.log("Selected products:", ProductsUI.selectedProducts);
    }
  },

  Events: {
    setupProductButtonHandlers() {
      // Handle Add button click
      document.addEventListener("click", (e) => {
        if (e.target.classList.contains("js-add-product-button")) {
          ProductsUI.renderAddProductDropdown();
        }
      });

      // Handle Remove button click
      document.addEventListener("click", (e) => {
        if (e.target.classList.contains("js-remove-product-button")) {
          const wrapper = e.target.closest(".product-dropdown");
          const select = wrapper.querySelector(".js-product-dropdown");

          // Get selected id (prefer dataset.selected)
          const selectedValue =
            select?.dataset?.selected ??
            (select?.value ? select.value.split("|")[0] : null);

          if (selectedValue) {
            ProductsUI.onProductRemoved(Number(selectedValue));
          }

          // Remove the dropdown
          wrapper.remove();

          // Re-render remaining dropdowns and preserve their selections
          document.querySelectorAll(".js-product-dropdown").forEach((ddl) => {
            const currentSel =
              ddl.dataset?.selected ??
              (ddl.value ? Number(ddl.value.split("|")[0]) : null);
            ProductsUI.seedProductsDropdown(ddl, Number(currentSel));
          });
        }
      });
    },
  },
};

// ==================== SCHOOL ADD UI OBJECT ====================
const SchoolAddUI = {
  packs: [],
  schoolInputs: null,
  leaderInputs: null,

  renderPacksContent() {
    const packsContent = document.querySelector(".js-packs-content");
    const totalPacksElement = document.querySelector(".js-total-packs");

    if (totalPacksElement) {
      totalPacksElement.innerHTML = SchoolAddUI.packs.length;
    }

    if (SchoolAddUI.packs.length === 0) {
      packsContent.innerHTML = `
        <div class="no-packs-found">
          <i class="bi bi-box-seam"></i>
          <p>No packs added yet</p>
        </div>
      `;
      return;
    }

    packsContent.innerHTML = "";

    SchoolAddUI.packs.forEach((pack) => {
      // Format pack name as 'English / Arabic'
      const packNameParts = pack.name.split("|");
      const packDisplayName =
        packNameParts.length > 1
          ? `${packNameParts[0]} / ${packNameParts[1]}`
          : pack.name;

      packsContent.innerHTML += `
        <div class="card">
          <div class="card-title">
            <span class="special">${packDisplayName}</span>
            <p>${pack.basePrice} EGP per student</p>
          </div>
          <div>
            <p>Items Included:</p>
            ${pack.packProducts
              .map((product) => {
                // Format product name as 'English / Arabic'
                const productNameParts = product.name.split("|");
                const productDisplayName =
                  productNameParts.length > 1
                    ? `${productNameParts[0]} / ${productNameParts[1]}`
                    : product.name;
                return `<span>${productDisplayName}</span>`;
              })
              .join(" ")}
          </div>
        </div>
      `;
    });

    SchoolAddUI.renderRequiredFieldsSection();
  },

  renderOverviewSection() {
    const schoolForm = document.querySelector(".js-school-form");
    const leaderForm = document.querySelector(".js-leader-form");

    if (!schoolForm || !leaderForm) return;

    SchoolAddUI.schoolInputs = schoolForm.querySelectorAll("input");
    const schoolSelect = schoolForm.querySelector("select");
    SchoolAddUI.leaderInputs = leaderForm.querySelectorAll("input");

    const overviewSection = document.querySelector(".js-overview");

    if (!overviewSection) return;

    // School inputs listener
    SchoolAddUI.schoolInputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        const targetElement = overviewSection.querySelector(
          `.js-${e.target.name}`
        );
        if (targetElement) {
          targetElement.innerHTML = e.target.value;
        }
        SchoolAddUI.renderRequiredFieldsSection();
      });
    });

    // School select listener
    if (schoolSelect) {
      schoolSelect.addEventListener("change", (e) => {
        const value = e.target.value;
        const statusSpan = document.querySelector(".js-status");

        if (statusSpan) {
          statusSpan.innerHTML = value;

          if (value === "Pending") {
            statusSpan.style.backgroundColor = "gray";
          } else if (value === "Processed") {
            statusSpan.style.backgroundColor = "#ff9900ff";
          } else if (value === "Completed") {
            statusSpan.style.backgroundColor = "#387400ff";
          } else if (value === "Canceled") {
            statusSpan.style.backgroundColor = "#dd0000ff";
          }
        }
      });
    }

    // Leader inputs listener
    SchoolAddUI.leaderInputs.forEach((input) => {
      input.addEventListener("input", () => {
        SchoolAddUI.renderRequiredFieldsSection();
      });
    });
  },

  renderRequiredFieldsSection() {
    const requiredFieldsSection = document.querySelector(".js-required-fields");

    if (!requiredFieldsSection) return;

    const totalInputs = [
      ...Array.from(SchoolAddUI.schoolInputs || []),
      ...Array.from(SchoolAddUI.leaderInputs || []),
    ];

    requiredFieldsSection.innerHTML = "<h3>Required Fields</h3>";

    totalInputs.forEach((input) => {
      if (!input.value) {
        const fieldName = input.name
          .replace(/-/g, " ")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        requiredFieldsSection.innerHTML += `<p class="missing">${fieldName}</p>`;
      }
    });

    if (SchoolAddUI.packs.length === 0) {
      requiredFieldsSection.innerHTML += `<p class="missing">Pack Details</p>`;
    }
  },

  Events: {
    setupAddPackButton(button, popUp) {
      button.addEventListener("click", async () => {
        Utilis.Events.openClosePopUp(popUp);

        // Initialize first product dropdown
        ProductsUI.renderAddProductDropdown();
      });
    },

    setupSubmitPackButton(button, popUp) {
      button.addEventListener("click", () => {
        const packForm = document.querySelector(".js-pack-form");

        if (!packForm) return;

        // Get pack name value and format as 'english|arabic'
        const packNameSelect = packForm.querySelector("[name='pack-name']");
        const packNameValue = packNameSelect?.value.trim() || "";

        const pack = {
          name: packNameValue,
          basePrice:
            parseFloat(
              packForm.querySelector("[name='pack-base-price']")?.value
            ) || 0,
          packProducts: [],
        };

        // Collect selected products from dropdowns
        packForm
          .querySelectorAll(".js-products-dropdown select")
          .forEach((select) => {
            if (select.value) {
              const valueParts = select.value.split("|");
              const id = valueParts[0];
              const nameEn = valueParts[1];

              // Get the Arabic name from the products list
              const selectedOption = select.options[select.selectedIndex];
              const displayText = selectedOption.text; // This is 'English / Arabic'

              // Extract Arabic name from display text if it exists
              let nameAr = "";
              if (displayText.includes(" / ")) {
                nameAr = displayText.split(" / ")[1];
              }

              // Store in 'english|arabic' format for API, but keep both parts
              const product = {
                id: id,
                name: nameAr ? `${nameEn}|${nameAr}` : nameEn,
              };
              pack.packProducts.push(product);
            }
          });

        // Add pack to the list
        SchoolAddUI.packs.push(pack);

        // Update UI
        SchoolAddUI.renderRequiredFieldsSection();
        SchoolAddUI.renderPacksContent();

        // Close popup
        togglePopUpOff(popUp);

        // Reset form and selected products
        packForm.reset();
        ProductsUI.selectedProducts = [];

        // Clear products dropdown container
        const productsDropdownContainer = document.querySelector(
          ".js-products-dropdown"
        );
        if (productsDropdownContainer) {
          productsDropdownContainer.innerHTML = "";
        }

        console.log("Pack added:", pack);
        console.log("All packs:", SchoolAddUI.packs);
      });
    },

    setupBackButton(button) {
      button.addEventListener("click", () => {
        window.location.href = "../../menu/schools.html";
      });
    },

    setupCreateSchoolButton(button) {
      button.addEventListener("click", async () => {
        const schoolForm = document.querySelector(".js-school-form");
        const leaderForm = document.querySelector(".js-leader-form");

        if (!schoolForm || !leaderForm) return;

        // Collect school data
        const school = {
          name:
            schoolForm.querySelector("[name='school-name']")?.value.trim() ||
            "",
          location:
            schoolForm
              .querySelector("[name='school-location']")
              ?.value.trim() || "",
          totalStudents:
            parseInt(
              schoolForm.querySelector("[name='total-number']")?.value
            ) || 0,
          status: schoolForm.querySelector("select")?.value || "Pending",
          depositAmount:
            parseFloat(
              schoolForm.querySelector("[name='deposit-amount']")?.value
            ) || 0,
          deliveredAt:
            schoolForm.querySelector("[name='delivered-at']")?.value || "",
        };

        // Collect leader data
        const leader = {
          name:
            leaderForm.querySelector("[name='leader-name']")?.value.trim() ||
            "",
          phone:
            leaderForm
              .querySelector("[name='leader-phone-number']")
              ?.value.trim() || "",
        };

        // Validate required fields
        if (!school.name || !school.location || !leader.name || !leader.phone) {
          showToast(
            "Please fill in all required school and leader information.",
            "warning"
          );
          return;
        }

        // Prepare packs for API
        const orderPacks = SchoolAddUI.packs.map((pack) => ({
          name: pack.name,
          basePrice: pack.basePrice,
          packProducts: pack.packProducts.map((p) => Number(p.id)),
        }));

        // Build the school data object for API
        const schoolData = {
          contactName: leader.name,
          contactPhoneNumber: leader.phone,
          name: school.name,
          address: school.location,
          estimatedStudents: school.totalStudents,
          status: school.status,
          deliveredAt: school.deliveredAt,
          depositAmount: school.depositAmount,
          packs: orderPacks,
        };

        console.log("School data to submit:", schoolData);

        try {
          // Submit to API
          const schoolCode = await API.Schools.addSchool(schoolData);
          console.log("School created with code:", schoolCode);

          // Show success popup
          SchoolAddUI.showSuccessPopUp(school.name, schoolCode);
          showToast("School created successfully!", "success");
        } catch (error) {
          console.error("Error creating school:", error);
          showToast(
            error.message || "Failed to create school. Please try again.",
            "error"
          );
        }
      });
    },
  },

  showSuccessPopUp(schoolName, schoolCode) {
    const successPopUp = document.querySelector(".js-success-pop-up");

    if (!successPopUp) return;

    successPopUp.innerHTML = `
      <h2>You have successfully added '${schoolName}'</h2>
      <p>Please share the provided code, to allow students to join:</p>
      <span class="js-school-code">${schoolCode}</span>
      <button class="js-done-button">Done</button>
    `;

    const codeSpan = successPopUp.querySelector(".js-school-code");

    // Copy code to clipboard when clicked
    codeSpan.addEventListener("click", async () => {
      const text = codeSpan.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        codeSpan.textContent = "Code Copied!";
        setTimeout(() => (codeSpan.textContent = text), 1000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    });

    togglePopUpOn(successPopUp);

    // Done button redirects to schools page
    successPopUp
      .querySelector(".js-done-button")
      .addEventListener("click", () => {
        togglePopUpOff(successPopUp);
        window.location.href = "/schools.html";
      });
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
    Utilis.Events.preventFormSubmission();
    Utilis.Events.renderTooltips([".js-school-form", ".js-leader-form"]);

    SchoolAddUI.renderPacksContent();
    SchoolAddUI.renderOverviewSection();
    SchoolAddUI.renderRequiredFieldsSection();
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

  const addPackButton = document.querySelector(".js-add-pack-button");
  const addPackPopUp = document.querySelector(".js-add-pack-pop-up");

  SchoolAddUI.Events.setupAddPackButton(addPackButton, addPackPopUp);

  const submitPackButton = document.querySelector(".js-submit-button");
  SchoolAddUI.Events.setupSubmitPackButton(submitPackButton, addPackPopUp);

  ProductsUI.Events.setupProductButtonHandlers();

  const backButton = document.querySelector(".js-cancel-button");
  SchoolAddUI.Events.setupBackButton(backButton);

  const createSchoolButton = document.querySelector(".js-create-school-button");
  SchoolAddUI.Events.setupCreateSchoolButton(createSchoolButton);
}

await main();

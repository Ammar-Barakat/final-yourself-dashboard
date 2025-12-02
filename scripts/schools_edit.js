import {
  togglePopUpOff,
  togglePopUpOn,
  showToast,
  showLandscapeRecommendation,
} from "./utilis/pop-ups.js";
import { SchoolDetails } from "./data/school.js";
import { Product } from "./data/product.js";

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

    async updateSchool(schoolId, schoolData) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageSchools/UpdateSchool/${schoolId}`,
          {
            method: "PUT",
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

          if (error.statusCode === 404) {
            throw new Error(`School not found with ID: ${schoolId}`);
          } else if (error.statusCode === 400) {
            throw new Error(
              "Invalid school data. Please check all required fields."
            );
          } else if (error.statusCode === 422) {
            throw new Error(error.message || "School validation failed.");
          } else if (error.statusCode === 409) {
            throw new Error("A school with this name already exists.");
          }
          throw new Error(error.message || "Failed to update school");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("updateSchool error:", error);
        throw error;
      }
    },
  },

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
        const products = result.map((p) => new Product(p));
        return products;
      } catch (error) {
        console.error("getAllProducts error:", error);
        // Re-throw network errors
        if (error instanceof TypeError || error.message?.includes("fetch")) {
          throw error;
        }
        return [];
      }
    },
  },
};

// ==================== UTILIS OBJECT ====================
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
        label.addEventListener("mouseenter", (e) => {
          tooltip.style.display = "block";
          tooltip.textContent =
            label.dataset.tooltip || "This field is required";
        });

        label.addEventListener("mousemove", (e) => {
          tooltip.style.left = e.pageX + 10 + "px";
          tooltip.style.top = e.pageY + 10 + "px";
        });

        label.addEventListener("mouseleave", () => {
          tooltip.style.display = "none";
        });
      });
    },

    renderProductTooltips() {
      const productContainers = document.querySelectorAll(
        '.js-product[data-school-product-id="undefined"]'
      );

      if (productContainers.length === 0) return;

      const tooltip = document.createElement("div");
      tooltip.classList.add("tooltip");
      document.body.appendChild(tooltip);

      productContainers.forEach((container) => {
        container.addEventListener("mouseenter", (e) => {
          tooltip.style.display = "block";
          tooltip.textContent =
            "You need to save changes before you can edit this item.";
        });

        container.addEventListener("mousemove", (e) => {
          tooltip.style.left = e.pageX + 10 + "px";
          tooltip.style.top = e.pageY + 10 + "px";
        });

        container.addEventListener("mouseleave", () => {
          tooltip.style.display = "none";
        });
      });
    },
  },

  showSuccessPopUp(result) {
    const popUp = document.querySelector(".js-success-pop-up");

    popUp.innerHTML = `
      <h2>${result}</h2>
      <button class="primary-button js-done-button">Done</button>
    `;

    togglePopUpOn(popUp);

    popUp.querySelector(".js-done-button").addEventListener("click", () => {
      togglePopUpOff(popUp);
      window.location.href = "/schools.html";
    });
  },
};

// ==================== PRODUCTS UI OBJECT ====================
const ProductsUI = {
  selectedProducts: [],
  selectedCustomsTemp: {},
  selectedCustomsFinal: {},

  async seedProductsDropdown(mode, productDropdown, selectedId = null) {
    const products = await API.Products.getAllProducts();
    const isAddMode = mode === "add";
    const prefix = isAddMode ? "add" : "edit";
    const dropdownClass = `js-${prefix}-product-dropdown`;

    const selId =
      selectedId !== null && selectedId !== undefined
        ? Number(selectedId)
        : productDropdown.dataset && productDropdown.dataset.selected
        ? Number(productDropdown.dataset.selected)
        : null;

    let selectedProductsList;
    let packContainer;

    if (isAddMode) {
      selectedProductsList = ProductsUI.selectedProducts;
    } else {
      packContainer = productDropdown.closest(".js-edit-products-dropdown");
      selectedProductsList = JSON.parse(
        packContainer.dataset.selectedProducts || "[]"
      );
    }

    const filteredProducts = products.filter(
      (p) => !selectedProductsList.includes(p.id) || p.id === selId
    );

    const newSelect = document.createElement("select");
    newSelect.name = productDropdown.name || "product";
    newSelect.className = productDropdown.className || dropdownClass;

    newSelect.innerHTML =
      '<option disabled selected value="">Select a Product</option>';

    filteredProducts.forEach((product) => {
      // Format display as 'English / Arabic' if Arabic name exists
      const displayName = product.name_AR
        ? `${product.name} / ${product.name_AR}`
        : product.name;
      newSelect.innerHTML += `<option value="${product.id}|${product.name}">${displayName}</option>`;
    });

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

    // Preserve the schoolProductId if it exists (from dropdown or container)
    if (productDropdown.dataset.schoolProductId) {
      newSelect.dataset.schoolProductId =
        productDropdown.dataset.schoolProductId;
    } else if (
      !isAddMode &&
      packContainer &&
      packContainer.dataset.schoolProductId
    ) {
      newSelect.dataset.schoolProductId = packContainer.dataset.schoolProductId;
    }

    productDropdown.parentNode.replaceChild(newSelect, productDropdown);

    newSelect.addEventListener("change", (e) => {
      const value = e.target.value;
      const newProductId = Number(value.split("|")[0]);
      const prevSelected = e.target.dataset.selected
        ? Number(e.target.dataset.selected)
        : null;

      // Clear old customs for this school product ID when product changes
      const schoolProductId = e.target.dataset.schoolProductId;
      if (schoolProductId && prevSelected && prevSelected !== newProductId) {
        // Clear both temp and final selections for this school product ID
        delete ProductsUI.selectedCustomsTemp[schoolProductId];
        delete ProductsUI.selectedCustomsFinal[schoolProductId];
      }

      if (isAddMode) {
        if (prevSelected) ProductsUI.onProductRemoved("add", prevSelected);
        ProductsUI.onProductSelected("add", newProductId);
      } else {
        const container = e.target.closest(".js-edit-products-dropdown");
        if (prevSelected)
          ProductsUI.onProductRemoved("edit", prevSelected, container);
        ProductsUI.onProductSelected("edit", newProductId, container);
      }

      e.target.dataset.selected = String(newProductId);

      const containerSelector = isAddMode
        ? document
        : e.target.closest(".js-edit-products-dropdown");

      containerSelector.querySelectorAll(`.${dropdownClass}`).forEach((ddl) => {
        if (ddl === e.target) return;
        const currentSel =
          ddl.dataset && ddl.dataset.selected
            ? Number(ddl.dataset.selected)
            : ddl.value
            ? Number(ddl.value.split("|")[0])
            : null;
        ProductsUI.seedProductsDropdown(mode, ddl, currentSel);
      });
    });
  },

  renderAddRemoveProductsDropdown(
    mode,
    containerOrElement,
    selectedId = null,
    schoolProductId = null
  ) {
    const container =
      mode === "add"
        ? document.querySelector(".js-add-products-dropdown")
        : containerOrElement;

    const prefix = mode === "add" ? "add" : "edit";

    const wrapper = document.createElement("div");
    wrapper.classList.add("product-dropdown");

    wrapper.innerHTML = `
      <select name="product" class="js-${prefix}-product-dropdown"></select>
      <div>
        <button type="button" class="js-${prefix}-remove-product-button secondary-button">Remove</button>
        <button type="button" class="js-${prefix}-add-product-button primary-button">Add</button>
      </div>
    `;

    container.appendChild(wrapper);

    const productDropdown = wrapper.querySelector(
      `.js-${prefix}-product-dropdown`
    );

    // Store the school product ID on the dropdown for tracking customs
    if (schoolProductId) {
      productDropdown.dataset.schoolProductId = schoolProductId;
    }

    ProductsUI.seedProductsDropdown(mode, productDropdown, selectedId);
  },

  renderProductCustoms(schoolProductId, productCustoms, allowedCustomOptions) {
    const productPopUp = document.querySelector(".js-product-pop-up");

    if (!ProductsUI.selectedCustomsTemp[schoolProductId]) {
      ProductsUI.selectedCustomsTemp[schoolProductId] = allowedCustomOptions
        ? allowedCustomOptions.split("-").filter((x) => x)
        : [];
    }

    const checkedCustoms = ProductsUI.selectedCustomsTemp[schoolProductId];

    // Handle both array format (from data model) and object format
    let customOptions;
    if (Array.isArray(productCustoms)) {
      customOptions = productCustoms;
    } else {
      customOptions = Object.entries(productCustoms).map(([id, name]) => ({
        id,
        name,
      }));
    }

    if (customOptions.length !== 0) {
      productPopUp.querySelector(".body").innerHTML = `
        <div class="card">
          <div class="row">
            <div>
              <label>Customization Options</label>
              <div class="custom-options">
                ${customOptions
                  .map(
                    (option) => `
                      <div class="custom-option js-custom-option">
                        <input 
                          type="checkbox" 
                          id="${option.id}" 
                          data-custom-name="${option.name}" 
                          name="custom-option"
                          ${
                            checkedCustoms.includes(String(option.id))
                              ? "checked"
                              : ""
                          }
                        >
                        <label for="${option.id}">${option.name}</label>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      `;

      productPopUp.querySelector(".footer").innerHTML = `
        <button class="primary-button js-product-${schoolProductId}-submit-button">Save</button>
      `;

      const selectedCustoms = {};

      document
        .querySelectorAll('input[name="custom-option"]')
        .forEach((checkbox) => {
          if (checkbox.checked)
            selectedCustoms[checkbox.id] = checkbox.dataset.customName;

          checkbox.addEventListener("change", (e) => {
            const id = String(e.target.id);
            const name = e.target.dataset.customName;

            if (e.target.checked) {
              selectedCustoms[id] = name;
              if (!checkedCustoms.includes(id)) checkedCustoms.push(id);
            } else {
              delete selectedCustoms[id];
              const index = checkedCustoms.indexOf(id);
              if (index !== -1) checkedCustoms.splice(index, 1);
            }

            ProductsUI.selectedCustomsTemp[schoolProductId] = [
              ...checkedCustoms,
            ];
          });
        });

      productPopUp
        .querySelector(`.js-product-${schoolProductId}-submit-button`)
        .addEventListener("click", () => {
          ProductsUI.selectedCustomsFinal[schoolProductId] = {
            ...selectedCustoms,
          };

          console.log("Selected customs temp:", ProductsUI.selectedCustomsTemp);
          console.log(
            "Selected customs final:",
            ProductsUI.selectedCustomsFinal
          );
          togglePopUpOff(productPopUp);
        });
    } else {
      productPopUp.querySelector(".body").innerHTML = `
        <div class="card">
          <div class="row">
            <div>
              <label>Customization Options</label>
              <div class="custom-options">
                <div class="custom-option js-custom-option">
                  <label>This product doesn't have any customizations.</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      productPopUp.querySelector(".footer").innerHTML = ``;
    }
  },

  onProductSelected(mode, productId, container = null) {
    const numericId = Number(productId);

    if (!productId) return;

    if (mode === "add") {
      if (!ProductsUI.selectedProducts.includes(numericId)) {
        ProductsUI.selectedProducts.push(numericId);
      }
    } else {
      const localSelected = JSON.parse(
        container.dataset.selectedProducts || "[]"
      );
      if (!localSelected.includes(numericId)) {
        localSelected.push(numericId);
        container.dataset.selectedProducts = JSON.stringify(localSelected);
      }
    }
  },

  onProductRemoved(mode, productId, container = null) {
    const numericId = Number(productId);

    if (!productId) return;

    if (mode === "add") {
      if (ProductsUI.selectedProducts.includes(numericId)) {
        ProductsUI.selectedProducts = ProductsUI.selectedProducts.filter(
          (id) => id !== numericId
        );
      }
    } else {
      const localSelected = JSON.parse(
        container.dataset.selectedProducts || "[]"
      );
      const updated = localSelected.filter((id) => id !== numericId);
      container.dataset.selectedProducts = JSON.stringify(updated);
    }
  },

  Events: {
    setupProductButtonHandlers(mode) {
      const prefix = mode.toLowerCase();
      const addBtnClass = `.js-${prefix}-add-product-button`;
      const removeBtnClass = `.js-${prefix}-remove-product-button`;
      const dropdownClass = `.js-${prefix}-product-dropdown`;
      const containerClass = `.js-${prefix}-products-dropdown`;

      document.addEventListener("click", (e) => {
        if (e.target.classList.contains(addBtnClass.slice(1))) {
          const container =
            e.target.closest(containerClass) ||
            document.querySelector(containerClass);

          ProductsUI.renderAddRemoveProductsDropdown(mode, container);
        }
      });

      document.addEventListener("click", (e) => {
        if (e.target.classList.contains(removeBtnClass.slice(1))) {
          const wrapper = e.target.closest(".product-dropdown");
          const select = wrapper.querySelector(dropdownClass);
          const container = wrapper.closest(containerClass);

          const selectedValue =
            select?.dataset?.selected ??
            (select?.value ? select.value.split("|")[0] : null);

          if (selectedValue) {
            ProductsUI.onProductRemoved(mode, selectedValue, container);
          }

          wrapper.remove();

          const dropdowns = container
            ? container.querySelectorAll(dropdownClass)
            : document.querySelectorAll(dropdownClass);

          dropdowns.forEach((ddl) => {
            const currentSelected =
              ddl.dataset?.selected ??
              (ddl.value ? Number(ddl.value.split("|")[0]) : null);

            ProductsUI.seedProductsDropdown(mode, ddl, Number(currentSelected));
          });
        }
      });
    },

    setupProductCustomsButtons() {
      document.addEventListener("click", async (e) => {
        if (e.target.classList.contains("js-product")) {
          const button = e.target;

          // Don't open popup for products that are not yet saved (have not-product class)
          if (button.classList.contains("not-product")) {
            return;
          }

          const schoolProductId = button.dataset.schoolProductId;

          if (schoolProductId === "undefined") {
            return;
          }

          const productPopUp = document.querySelector(".js-product-pop-up");
          togglePopUpOn(productPopUp);

          // Get product customs from the button's data
          const productCustomsData = button.dataset.productCustoms;
          const allowedCustoms = button.dataset.productAllowedCustoms;

          const productCustoms = productCustomsData
            ? JSON.parse(productCustomsData)
            : {};

          ProductsUI.renderProductCustoms(
            schoolProductId,
            productCustoms,
            allowedCustoms
          );

          const closeButton = document.querySelector(
            ".js-product-close-button"
          );
          closeButton.addEventListener("click", () => {
            togglePopUpOff(productPopUp);
          });
        }
      });
    },
  },
};

// ==================== PACKS UI OBJECT ====================
const PacksUI = {
  packs: [],

  renderPacksData() {
    document
      .querySelector(".js-overview")
      .querySelector(".js-total-packs").innerHTML = PacksUI.packs.length;

    const packsSection = document.querySelector(".js-packs-content");

    if (PacksUI.packs.length === 0) {
      packsSection.innerHTML = `
        <div class="no-packs-found">
          <i class="bi bi-box-seam"></i>
          <p>No packs added yet</p>
        </div>
      `;
      return;
    }

    packsSection.innerHTML = "";

    PacksUI.packs.forEach((pack, packIndex) => {
      // Format pack name as 'English / Arabic'
      const packDisplayName = pack.name_AR
        ? `${pack.name} / ${pack.name_AR}`
        : pack.name;

      packsSection.innerHTML += `
        <div class="card" data-pack-id="${
          pack.id
        }" data-pack-index="${packIndex}">
          <div class="card-title">
            <span class="special">${packDisplayName}</span>
            <p>${pack.price} EGP per student</p>
            <button class="secondary-button js-remove-pack-button" data-pack-index="${packIndex}" >
                <i class="bi bi-trash"></i>
            </button>
          </div>
          <div>
            <p>Items Included:</p>
            ${pack.products
              .map((product) => {
                // Format product name as 'English / Arabic'
                const productDisplayName = product.productName_AR
                  ? `${product.productName} / ${product.productName_AR}`
                  : product.productName;
                return `
                <span 
                  class="product js-product ${
                    product.id === "undefined" ? "not-product" : ""
                  }" 
                  data-product-id="${product.productId}"
                  data-school-product-id="${product.id}"
                  data-product-customs='${JSON.stringify(
                    product.productCustoms
                  )}'
                  data-product-allowed-customs="${
                    product.productAllowedCustoms
                  }"
                >${productDisplayName}</span>
              `;
              })
              .join(" ")}
          </div>
        </div>
      `;
    });
  },

  renderAddPackPopUp(popUp) {
    popUp.querySelector(".body").innerHTML = `
      <div class="card">
        <form class="js-add-pack-form">
          <div class="row">
            <div class="row-cell">
              <label for="pack-name">Pack Name</label>
              <select name="pack-name">
                <option selected disabled>Select Pack Type</option>
                <option value="Basic|أساسي">Basic / أساسي</option>
                <option value="Silver|فضي">Silver / فضي</option>
                <option value="Gold|ذهبي">Gold / ذهبي</option>
                <option value="Platinum|بلاتيني">Platinum / بلاتيني</option>
                <option value="Premium|مميز">Premium / مميز</option>
              </select>
            </div>
            <div class="row-cell">
              <label for="pack-base-price">Pack Base Price</label>
              <input
                type="text"
                name="pack-base-price"
                placeholder="Enter pack base price"
              />
            </div>
          </div>

          <div>
            <label for="product">Choose Products:</label>
            <div class="products-dropdown js-add-products-dropdown"></div>
          </div>
        </form>
      </div>
    `;

    ProductsUI.renderAddRemoveProductsDropdown("add");
  },

  renderEditPacksPopUp(popUp, packs) {
    popUp.querySelector(".body").innerHTML = "";

    packs.forEach((pack, packIndex) => {
      const packWrapper = document.createElement("div");
      packWrapper.classList.add("card");

      packWrapper.innerHTML = `
        <form class="js-edit-pack-form" data-pack-id="${
          pack.id
        }" data-pack-index="${packIndex}">
          <div class="row">
            <div class="row-cell">
              <label for="pack-name">Pack Name</label>
              <select name="pack-name">
                <option disabled>Select Pack Type</option>
                <option value="Basic|أساسي" ${
                  pack.name === "Basic|أساسي" || pack.name === "Basic"
                    ? "selected"
                    : ""
                }>Basic / أساسي</option>
                <option value="Silver|فضي" ${
                  pack.name === "Silver|فضي" || pack.name === "Silver"
                    ? "selected"
                    : ""
                }>Silver / فضي</option>
                <option value="Gold|ذهبي" ${
                  pack.name === "Gold|ذهبي" || pack.name === "Gold"
                    ? "selected"
                    : ""
                }>Gold / ذهبي</option>
                <option value="Platinum|بلاتيني" ${
                  pack.name === "Platinum|بلاتيني" || pack.name === "Platinum"
                    ? "selected"
                    : ""
                }>Platinum / بلاتيني</option>
                <option value="Premium|مميز" ${
                  pack.name === "Premium|مميز" || pack.name === "Premium"
                    ? "selected"
                    : ""
                }>Premium / مميز</option>
              </select>
            </div>
            <div class="row-cell">
              <label for="pack-base-price">Pack Base Price</label>
              <input
                type="text"
                name="pack-base-price"
                placeholder="Enter pack base price"
                value="${pack.price}"
              />
            </div>
          </div>

          <div>
            <label for="product">Choose Products:</label>
            <div class="products-dropdown js-edit-products-dropdown" data-pack-index="${packIndex}"></div>
          </div>
        </form>
      `;

      popUp.querySelector(".body").appendChild(packWrapper);

      const container = packWrapper.querySelector(".js-edit-products-dropdown");

      container.dataset.selectedProducts = JSON.stringify(
        pack.products.map((p) => Number(p.productId))
      );

      pack.products.forEach((product) => {
        ProductsUI.renderAddRemoveProductsDropdown(
          "edit",
          container,
          product.productId,
          product.id
        );
      });
    });
  },

  Events: {
    setupAddPackButton(button, popUp) {
      button.addEventListener("click", () => {
        togglePopUpOn(popUp);
        PacksUI.renderAddPackPopUp(popUp);

        const closeButton = popUp.querySelector(".js-add-close-button");
        closeButton.addEventListener("click", () => {
          togglePopUpOff(popUp);
        });
      });
    },

    setupEditPacksButton(button, popUp) {
      button.addEventListener("click", () => {
        togglePopUpOn(popUp);
        PacksUI.renderEditPacksPopUp(popUp, PacksUI.packs);

        const closeButton = popUp.querySelector(".js-edit-close-button");
        closeButton.addEventListener("click", () => {
          togglePopUpOff(popUp);
        });
      });
    },

    setupSubmitPackButton(mode, popUp) {
      const prefix = mode.toLowerCase();
      const submitBtn = document.querySelector(`.js-${prefix}-submit-button`);

      if (!submitBtn) return;

      submitBtn.addEventListener("click", () => {
        if (mode === "add") {
          const packForm = document.querySelector(".js-add-pack-form");

          // Split pack name into English and Arabic
          const packNameValue =
            packForm.querySelector("[name='pack-name']")?.value || "";
          const packNameParts = packNameValue.split("|");
          const packNameEn = packNameParts[0] || "";
          const packNameAr = packNameParts[1] || "";

          const pack = {
            name: packNameEn,
            name_AR: packNameAr,
            price:
              parseFloat(
                packForm.querySelector("[name='pack-base-price']")?.value
              ) || 0,
            products: [],
          };

          packForm
            .querySelectorAll(".js-add-products-dropdown select")
            .forEach((select) => {
              if (select.value) {
                const valueParts = select.value.split("|");
                const productId = valueParts[0];
                const nameEn = valueParts[1];

                // Get the Arabic name from the option display text
                const selectedOption = select.options[select.selectedIndex];
                const displayText = selectedOption.text; // 'English / Arabic'

                let nameAr = "";
                if (displayText.includes(" / ")) {
                  nameAr = displayText.split(" / ")[1];
                }

                pack.products.push({
                  id: "undefined",
                  productId: Number(productId),
                  productName: nameEn,
                  productName_AR: nameAr,
                  productCustoms: {},
                  productAllowedCustoms: "",
                });
              }
            });

          PacksUI.packs.push(pack);

          packForm.reset();
          ProductsUI.selectedProducts = [];
        } else if (mode === "edit") {
          const allPackForms = popUp.querySelectorAll(".js-edit-pack-form");
          PacksUI.packs = [];

          allPackForms.forEach((form) => {
            // Split pack name into English and Arabic
            const packNameValue =
              form.querySelector("[name='pack-name']")?.value || "";
            const packNameParts = packNameValue.split("|");
            const packNameEn = packNameParts[0] || "";
            const packNameAr = packNameParts[1] || "";

            const pack = {
              id: form.dataset.packId || "",
              name: packNameEn,
              name_AR: packNameAr,
              price:
                parseFloat(
                  form.querySelector("[name='pack-base-price']")?.value
                ) || 0,
              products: [],
            };

            form
              .querySelectorAll(".js-edit-products-dropdown select")
              .forEach((select) => {
                if (select.value) {
                  const valueParts = select.value.split("|");
                  const productId = valueParts[0];
                  const nameEn = valueParts[1];

                  // Get the Arabic name from the option display text
                  const selectedOption = select.options[select.selectedIndex];
                  const displayText = selectedOption.text; // 'English / Arabic'

                  let nameAr = "";
                  if (displayText.includes(" / ")) {
                    nameAr = displayText.split(" / ")[1];
                  }

                  pack.products.push({
                    id: "undefined",
                    productId: Number(productId),
                    productName: nameEn,
                    productName_AR: nameAr,
                    productCustoms: {},
                    productAllowedCustoms: "",
                  });
                }
              });

            PacksUI.packs.push(pack);
          });
        }

        PacksUI.renderPacksData();
        SchoolEditUI.applyStatusPermissions(SchoolEditUI.currentStatus);
        Utilis.Events.renderProductTooltips();

        togglePopUpOff(popUp);
      });
    },

    setupRemovePackButtons() {
      document.addEventListener("click", (e) => {
        if (e.target.closest(".js-remove-pack-button")) {
          const button = e.target.closest(".js-remove-pack-button");
          const packIndex = Number(button.dataset.packIndex);

          // Remove pack from array
          PacksUI.packs.splice(packIndex, 1);

          // Re-render packs
          PacksUI.renderPacksData();
          SchoolEditUI.applyStatusPermissions(SchoolEditUI.currentStatus);
          Utilis.Events.renderProductTooltips();
        }
      });
    },
  },
};

// ==================== EXTRAS UI OBJECT ====================
const ExtrasUI = {
  extras: [],

  renderExtrasData() {
    document
      .querySelector(".js-overview")
      .querySelector(".js-total-extra-products").innerHTML =
      ExtrasUI.extras.length;

    const extrasSection = document.querySelector(".js-extras-content");

    if (ExtrasUI.extras.length === 0) {
      extrasSection.innerHTML = `
        <div class="no-extras-found">
          <i class="bi bi-bag-plus"></i>
          <p>No extras added yet</p>
        </div>
      `;
      return;
    }

    extrasSection.innerHTML = "";

    ExtrasUI.extras.forEach((extra, extraIndex) => {
      // Format product name as 'English / Arabic'
      const productDisplayName = extra.productName_AR
        ? `${extra.productName} / ${extra.productName_AR}`
        : extra.productName;

      extrasSection.innerHTML += `
        <div class="card" data-extra-index="${extraIndex}">
          <div class="card-title">
            <span 
              class="product js-product ${
                extra.id === "undefined" ? "not-product" : ""
              }" 
              data-product-id="${extra.productId}"
              data-school-product-id="${extra.id}"
              data-product-customs='${JSON.stringify(extra.productCustoms)}'
              data-product-allowed-customs="${extra.productAllowedCustoms}"
            >${productDisplayName}</span>
            <p>Price: ${extra.productPrice} EGP</p>
            <button class="secondary-button js-remove-extra-button" data-extra-index="${extraIndex}">
                <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;
    });
  },

  renderAddExtraPopUp(popUp) {
    popUp.querySelector(".body").innerHTML = `
      <div class="card">
        <form class="js-add-extra-form">
          <div class="row">
            <div class="row-cell">
              <label for="product">Extra Name</label>
              <select name="product" class="js-add-product-dropdown"></select>
            </div>
            <div class="row-cell">
              <label for="extra-price">Extra Price</label>
              <input
                type="text"
                name="extra-price"
                placeholder="Enter extra price"
              />
            </div>
          </div>
        </form>
      </div>
    `;

    const productDropdown = popUp.querySelector(".js-add-product-dropdown");
    ProductsUI.seedProductsDropdown("add", productDropdown);
  },

  renderEditExtrasPopUp(popUp, extras) {
    popUp.querySelector(".body").innerHTML = "";

    extras.forEach((extra, extraIndex) => {
      const extraWrapper = document.createElement("div");
      extraWrapper.classList.add("card");

      extraWrapper.innerHTML = `
        <form class="js-edit-extra-form" data-extra-id="${extra.id}" data-extra-index="${extraIndex}">
          <div class="row">
            <div class="row-cell">
              <label for="product">Extra Name</label>
              <select name="product" class="js-edit-products-dropdown" data-extra-index="${extraIndex}"></select>
            </div>
            <div class="row-cell">
              <label for="extra-price">Extra Price</label>
              <input
                type="text"
                name="extra-price"
                placeholder="Enter extra price"
                value="${extra.productPrice}"
              />
            </div>
          </div>
        </form>
      `;

      popUp.querySelector(".body").appendChild(extraWrapper);

      const container = extraWrapper.querySelector(
        ".js-edit-products-dropdown"
      );

      container.dataset.selectedProducts = JSON.stringify([
        Number(extra.productId),
      ]);

      // Store school product ID on the container for tracking
      container.dataset.schoolProductId = extra.id;

      ProductsUI.seedProductsDropdown("edit", container, extra.productId);
    });
  },

  Events: {
    setupAddExtraButton(button, popUp) {
      button.addEventListener("click", () => {
        togglePopUpOn(popUp);
        ExtrasUI.renderAddExtraPopUp(popUp);

        const closeButton = popUp.querySelector(".js-extra-close-button");
        closeButton.addEventListener("click", () => {
          togglePopUpOff(popUp);
        });
      });
    },

    setupEditExtrasButton(button, popUp) {
      button.addEventListener("click", () => {
        togglePopUpOn(popUp);
        ExtrasUI.renderEditExtrasPopUp(popUp, ExtrasUI.extras);

        const closeButton = popUp.querySelector(".js-extra-close-button");
        closeButton.addEventListener("click", () => {
          togglePopUpOff(popUp);
        });
      });
    },

    setupSubmitExtraButton(mode, popUp) {
      const prefix = mode.toLowerCase();
      const submitBtn = document.querySelector(
        `.js-${prefix}-extra-submit-button`
      );

      if (!submitBtn) return;

      submitBtn.addEventListener("click", () => {
        if (mode === "add") {
          const extraForm = document.querySelector(".js-add-extra-form");

          const select = extraForm.querySelector("[name='product']");
          const valueParts = select.value.split("|");
          const productId = valueParts[0];
          const nameEn = valueParts[1];

          // Get the Arabic name from the option display text
          const selectedOption = select.options[select.selectedIndex];
          const displayText = selectedOption.text; // 'English / Arabic'

          let nameAr = "";
          if (displayText.includes(" / ")) {
            nameAr = displayText.split(" / ")[1];
          }

          const extra = {
            id: "undefined",
            productName: nameEn,
            productName_AR: nameAr,
            productPrice:
              parseFloat(
                extraForm.querySelector("[name='extra-price']").value
              ) || 0,
            productId: Number(productId),
            productCustoms: {},
            productAllowedCustoms: "",
          };

          ExtrasUI.extras.push(extra);

          extraForm.reset();
          ProductsUI.selectedProducts = [];
        } else if (mode === "edit") {
          const allExtraForms = popUp.querySelectorAll(".js-edit-extra-form");
          ExtrasUI.extras = [];

          allExtraForms.forEach((form) => {
            const select = form.querySelector("[name='product']");
            const valueParts = select.value.split("|");
            const productId = valueParts[0];
            const nameEn = valueParts[1];

            // Get the Arabic name from the option display text
            const selectedOption = select.options[select.selectedIndex];
            const displayText = selectedOption.text; // 'English / Arabic'

            let nameAr = "";
            if (displayText.includes(" / ")) {
              nameAr = displayText.split(" / ")[1];
            }

            const extra = {
              id: form.dataset.extraId || "undefined",
              productName: nameEn,
              productName_AR: nameAr,
              productPrice:
                parseFloat(form.querySelector("[name='extra-price']").value) ||
                0,
              productId: Number(productId),
              productCustoms: {},
              productAllowedCustoms: "",
            };

            ExtrasUI.extras.push(extra);
          });
        }

        ExtrasUI.renderExtrasData();
        SchoolEditUI.applyStatusPermissions(SchoolEditUI.currentStatus);
        Utilis.Events.renderProductTooltips();

        togglePopUpOff(popUp);
      });
    },

    setupRemoveExtraButtons() {
      document.addEventListener("click", (e) => {
        if (e.target.closest(".js-remove-extra-button")) {
          const button = e.target.closest(".js-remove-extra-button");
          const extraIndex = Number(button.dataset.extraIndex);

          // Remove extra from array
          ExtrasUI.extras.splice(extraIndex, 1);

          // Re-render extras
          ExtrasUI.renderExtrasData();
          SchoolEditUI.applyStatusPermissions(SchoolEditUI.currentStatus);
          Utilis.Events.renderProductTooltips();
        }
      });
    },
  },
};

// ==================== SCHOOL EDIT UI OBJECT ====================
const SchoolEditUI = {
  currentStatus: "Pending",

  applyStatusPermissions(status) {
    SchoolEditUI.currentStatus = status;
    const schoolForm = document.querySelector(".js-school-form");
    const leaderForm = document.querySelector(".js-leader-form");
    const statusSelect = schoolForm.querySelector("select");

    // Pack buttons and overlay
    const addPackButton = document.querySelector(".js-add-pack-button");
    const editPacksButton = document.querySelector(".js-edit-packs-button");
    const packsCard = document.querySelector(".packs-card");

    // Extras buttons and overlay
    const addExtraButton = document.querySelector(".js-add-extra-button");
    const editExtrasButton = document.querySelector(".js-edit-extras-button");
    const extrasCard = document.querySelector(".extras-card");

    // Remove existing overlays
    document
      .querySelectorAll(".status-overlay")
      .forEach((overlay) => overlay.remove());

    if (status === "Pending") {
      // Pending: Can edit main info & packs, no extras
      // Enable main info inputs
      schoolForm
        .querySelectorAll("input")
        .forEach((input) => (input.disabled = false));
      leaderForm
        .querySelectorAll("input")
        .forEach((input) => (input.disabled = false));
      statusSelect.disabled = false;

      // Enable packs
      addPackButton.disabled = false;
      editPacksButton.disabled = false;
      packsCard.classList.remove("disabled-section");

      // Disable extras with overlay
      addExtraButton.disabled = true;
      editExtrasButton.disabled = true;
      extrasCard.classList.add("disabled-section");

      const extrasOverlay = document.createElement("div");
      extrasOverlay.className = "status-overlay";
      extrasOverlay.innerHTML = `
        <div class="overlay-content">
          <i class="bi bi-lock"></i>
          <p>Extras are locked in 'Pending' stage.</p>
          <p>Change to 'Processed' or 'Designing' to edit extras.</p>
        </div>
      `;
      extrasCard.querySelector(".card-content").appendChild(extrasOverlay);
    } else if (status === "Processed" || status === "Designing") {
      // Processed/Designing: Can edit main info, packs, and extras
      // Enable main info inputs
      schoolForm
        .querySelectorAll("input")
        .forEach((input) => (input.disabled = false));
      leaderForm
        .querySelectorAll("input")
        .forEach((input) => (input.disabled = false));
      statusSelect.disabled = false;

      // Enable packs
      addPackButton.disabled = false;
      editPacksButton.disabled = false;
      packsCard.classList.remove("disabled-section");

      // Enable extras
      addExtraButton.disabled = false;
      editExtrasButton.disabled = false;
      extrasCard.classList.remove("disabled-section");
    } else if (status === "Completed" || status === "Canceled") {
      // Completed/Canceled: Can't edit anything
      // Disable all inputs including status
      schoolForm
        .querySelectorAll("input")
        .forEach((input) => (input.disabled = true));
      leaderForm
        .querySelectorAll("input")
        .forEach((input) => (input.disabled = true));
      statusSelect.disabled = true;

      // Disable packs with overlay
      addPackButton.disabled = true;
      editPacksButton.disabled = true;
      packsCard.classList.add("disabled-section");

      const packsOverlay = document.createElement("div");
      packsOverlay.className = "status-overlay";
      packsOverlay.innerHTML = `
        <div class="overlay-content">
          <i class="bi bi-lock"></i>
          <p>School is ${status}.</p>
          <p>No editing is allowed.</p>
        </div>
      `;
      packsCard.querySelector(".card-content").appendChild(packsOverlay);

      // Disable extras with overlay
      addExtraButton.disabled = true;
      editExtrasButton.disabled = true;
      extrasCard.classList.add("disabled-section");

      const extrasOverlay = document.createElement("div");
      extrasOverlay.className = "status-overlay";
      extrasOverlay.innerHTML = `
        <div class="overlay-content">
          <i class="bi bi-lock"></i>
          <p>School is ${status}.</p>
          <p>No editing is allowed.</p>
        </div>
      `;
      extrasCard.querySelector(".card-content").appendChild(extrasOverlay);
    }
  },

  renderSchoolHeader(school) {
    const titleElement = document.querySelector(".js-title-content");

    titleElement.innerHTML = `
      <h2>Edit School Information: ${school.abbreviation}</h2>
      <p>School Code: #${school.code} • Created: ${
      school.addDate ? new Date(school.addDate).toLocaleDateString() : "N/A"
    }</p>
    `;
  },

  renderSchoolData(school) {
    const schoolForm = document.querySelector(".js-school-form");
    const leaderForm = document.querySelector(".js-leader-form");

    schoolForm.querySelector("[name='school-name']").value = school.name;
    schoolForm.querySelector("[name='school-location']").value =
      school.location;
    schoolForm.querySelector("[name='total-number']").value =
      school.totalStudents;
    schoolForm.querySelector("[name='deposit-amount']").value =
      school.depositAmount || "";
    schoolForm.querySelector("[name='delivered-at']").value =
      school.deliveryDate ? school.deliveryDate.split("T")[0] : "";

    const statusSelect = schoolForm.querySelector("select");
    statusSelect.innerHTML = `
      <option value="Pending" ${
        school.status === "Pending" ? "selected" : ""
      }>Pending</option>
      <option value="Processed" ${
        school.status === "Processed" ? "selected" : ""
      }>Processed</option>
      <option value="Designing" ${
        school.status === "Designing" ? "selected" : ""
      }>Designing</option>
      <option value="Completed" ${
        school.status === "Completed" ? "selected" : ""
      }>Completed</option>
      <option value="Canceled" ${
        school.status === "Canceled" ? "selected" : ""
      }>Canceled</option>
    `;

    leaderForm.querySelector("[name='leader-name']").value = school.contactName;
    leaderForm.querySelector("[name='leader-phone-number']").value =
      school.contactPhoneNumber;

    SchoolEditUI.renderOverviewSection(schoolForm, leaderForm);
    SchoolEditUI.applyStatusPermissions(school.status);
  },

  renderOverviewSection(schoolForm, leaderForm) {
    const overviewSection = document.querySelector(".js-overview");

    const updateOverview = () => {
      overviewSection.querySelector(".js-school-name").innerHTML =
        schoolForm.querySelector("[name='school-name']").value;
      overviewSection.querySelector(".js-school-location").innerHTML =
        schoolForm.querySelector("[name='school-location']").value;
      overviewSection.querySelector(".js-total-number").innerHTML =
        schoolForm.querySelector("[name='total-number']").value;

      const statusSpan = overviewSection.querySelector(".js-status");
      const statusValue = schoolForm.querySelector("select").value;
      statusSpan.innerHTML = statusValue;
      Utilis.Events.renderStatus(statusValue, statusSpan);
    };

    updateOverview();

    [
      ...schoolForm.querySelectorAll("input"),
      ...leaderForm.querySelectorAll("input"),
    ].forEach((input) => {
      input.addEventListener("input", updateOverview);
    });

    const statusSelect = schoolForm.querySelector("select");
    statusSelect.addEventListener("change", () => {
      updateOverview();
      SchoolEditUI.applyStatusPermissions(statusSelect.value);
    });
  },

  Events: {
    setupSaveChangesButton(button) {
      button.addEventListener("click", async () => {
        const schoolForm = document.querySelector(".js-school-form");
        const leaderForm = document.querySelector(".js-leader-form");

        // Validate required fields first
        const schoolName = schoolForm
          .querySelector("[name='school-name']")
          ?.value.trim();
        const leaderName = leaderForm
          .querySelector("[name='leader-name']")
          ?.value.trim();
        const leaderPhone = leaderForm
          .querySelector("[name='leader-phone-number']")
          ?.value.trim();

        if (!schoolName || !leaderName || !leaderPhone) {
          showToast(
            "Please fill in all required school and leader information.",
            "warning"
          );
          return;
        }

        const orderPacks = PacksUI.packs.map((pack) => ({
          id: pack.id && pack.id !== "undefined" ? pack.id : "",
          name: pack.name,
          basePrice: pack.price,
          packProducts: pack.products.map((p) => ({
            productId: Number(p.productId),
            customOptions: ProductsUI.selectedCustomsFinal[p.id]
              ? Object.keys(ProductsUI.selectedCustomsFinal[p.id]).join("-")
              : "",
          })),
        }));

        const orderExtraProducts = ExtrasUI.extras.map((extra) => ({
          id: extra.id && extra.id !== "undefined" ? extra.id : "",
          price: extra.productPrice,
          productId: Number(extra.productId),
          customOptions: ProductsUI.selectedCustomsFinal[extra.id]
            ? Object.keys(ProductsUI.selectedCustomsFinal[extra.id]).join("-")
            : "",
        }));

        const schoolData = {
          contactName: leaderName,
          contactPhoneNumber: leaderPhone,
          name: schoolName,
          address: schoolForm
            .querySelector("[name='school-location']")
            .value.trim(),
          estimatedStudents:
            parseInt(schoolForm.querySelector("[name='total-number']").value) ||
            0,
          status: schoolForm.querySelector("select").value,
          deliveredAt:
            schoolForm.querySelector("[name='delivered-at']").value || "",
          depositAmount:
            parseFloat(
              schoolForm.querySelector("[name='deposit-amount']").value
            ) || 0,
          packs: orderPacks,
          extraProducts: orderExtraProducts,
        };

        console.log("School data to update:", schoolData);

        try {
          const result = await API.Schools.updateSchool(schoolId, schoolData);
          showToast("School updated successfully!", "success");
          Utilis.showSuccessPopUp(result);
        } catch (error) {
          console.error("Error updating school:", error);
          showToast(
            error.message || "Failed to update school. Please try again.",
            "error"
          );
        }
      });
    },

    setupBackButton(button) {
      button.addEventListener("click", () => {
        window.location.href = "schools.html";
      });
    },
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
    PacksUI.packs.push(...school.packs);
    ExtrasUI.extras.push(...school.extraProducts);

    SchoolEditUI.renderSchoolHeader(school);
    SchoolEditUI.renderSchoolData(school);
    PacksUI.renderPacksData();
    ExtrasUI.renderExtrasData();
    SchoolEditUI.applyStatusPermissions(school.status);
    hideLoadingScreen();
    showLandscapeRecommendation();
  } catch (error) {
    if (isServerError(error)) {
      showServerDownPage();
      return;
    } else {
      hideLoadingScreen();
      throw error;
    }
  }

  Utilis.Events.renderTooltips([".js-school-form", ".js-leader-form"]);
  Utilis.Events.renderProductTooltips();

  ProductsUI.Events.setupProductButtonHandlers("add");
  ProductsUI.Events.setupProductButtonHandlers("edit");
  ProductsUI.Events.setupProductCustomsButtons();

  const addPackButton = document.querySelector(".js-add-pack-button");
  const addPackPopUp = document.querySelector(".js-add-pack-pop-up");
  PacksUI.Events.setupAddPackButton(addPackButton, addPackPopUp);

  const editPacksButton = document.querySelector(".js-edit-packs-button");
  const editPacksPopUp = document.querySelector(".js-edit-packs-pop-up");
  PacksUI.Events.setupEditPacksButton(editPacksButton, editPacksPopUp);

  PacksUI.Events.setupSubmitPackButton("add", addPackPopUp);
  PacksUI.Events.setupSubmitPackButton("edit", editPacksPopUp);
  PacksUI.Events.setupRemovePackButtons();

  const addExtraButton = document.querySelector(".js-add-extra-button");
  const addExtraPopUp = document.querySelector(".js-add-extra-pop-up");
  ExtrasUI.Events.setupAddExtraButton(addExtraButton, addExtraPopUp);

  const editExtrasButton = document.querySelector(".js-edit-extras-button");
  const editExtrasPopUp = document.querySelector(".js-edit-extras-pop-up");
  ExtrasUI.Events.setupEditExtrasButton(editExtrasButton, editExtrasPopUp);

  ExtrasUI.Events.setupSubmitExtraButton("add", addExtraPopUp);
  ExtrasUI.Events.setupSubmitExtraButton("edit", editExtrasPopUp);
  ExtrasUI.Events.setupRemoveExtraButtons();

  const saveChangesButton = document.querySelector(".js-save-changes-button");
  SchoolEditUI.Events.setupSaveChangesButton(saveChangesButton);

  const backButton = document.querySelector(".js-cancel-button");
  SchoolEditUI.Events.setupBackButton(backButton);
}

await main();

import { togglePopUpOff, togglePopUpOn, showToast } from "./utilis/pop-ups.js";
import { Product, ProductDetails } from "./data/product.js";

const API_BASE_URL = "https://yourself-demo.runasp.net";
// const API_BASE_URL = "https://localhost:44372";

function getAuthToken() {
  return localStorage.getItem("authToken");
}

// ==================== API OBJECT ====================
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
        // Re-throw network errors
        if (error instanceof TypeError || error.message?.includes("fetch")) {
          throw error;
        }
        return [];
      }
    },

    async getProduct(productId) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageProducts/GetProductById/${productId}`,
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
            throw new Error(`Product not found with ID: ${productId}`);
          }
          throw new Error(error.message || "Failed to fetch product");
        }

        const result = await response.json();
        console.log(result);

        const product = new ProductDetails(result);
        return product;
      } catch (error) {
        console.error("getProduct error:", error);
        throw error;
      }
    },

    async addProduct(productData) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageProducts/AddProduct`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(productData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 400) {
            throw new Error("Invalid product data. Please check all fields.");
          } else if (error.statusCode === 422) {
            throw new Error(error.message || "Product validation failed.");
          } else if (error.statusCode === 409) {
            throw new Error("A product with this name already exists.");
          }
          throw new Error(error.message || "Failed to add product");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("addProduct error:", error);
        throw error;
      }
    },

    async addProductIcon(productId, iconFile) {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("iconFile", iconFile);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/ManageProducts/AddProductIcon/${productId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`Product not found with ID: ${productId}`);
          } else if (error.statusCode === 400) {
            throw new Error("Invalid icon file.");
          } else if (error.statusCode === 500) {
            throw new Error("Icon upload failed. Please try again.");
          }
          throw new Error(error.message || "Failed to add product icon");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("addProductIcon error:", error);
        throw error;
      }
    },

    async addProductMockup(productId, mockupFile) {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("mockupFile", mockupFile);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/ManageProducts/AddProductMockup/${productId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`Product not found with ID: ${productId}`);
          } else if (error.statusCode === 400) {
            throw new Error("Invalid mockup file.");
          } else if (error.statusCode === 500) {
            throw new Error("Mockup upload failed. Please try again.");
          }
          throw new Error(error.message || "Failed to add product mockup");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("addProductMockup error:", error);
        throw error;
      }
    },

    async updateProductIcon(productId, iconFile) {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("iconFile", iconFile);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/ManageProducts/UpdateProductIcon/${productId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`Product not found with ID: ${productId}`);
          } else if (error.statusCode === 400) {
            throw new Error("Invalid icon file.");
          } else if (error.statusCode === 500) {
            throw new Error("Icon update failed. Please try again.");
          }
          throw new Error(error.message || "Failed to update product icon");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("updateProductIcon error:", error);
        throw error;
      }
    },

    async updateProductMockup(productId, mockupFile) {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("mockupFile", mockupFile);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/ManageProducts/UpdateProductMockup/${productId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`Product not found with ID: ${productId}`);
          } else if (error.statusCode === 400) {
            throw new Error("Invalid mockup file.");
          } else if (error.statusCode === 500) {
            throw new Error("Mockup update failed. Please try again.");
          }
          throw new Error(error.message || "Failed to update product mockup");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("updateProductMockup error:", error);
        throw error;
      }
    },

    async updateProduct(productId, productData) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageProducts/UpdateProduct/${productId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(productData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`Product not found with ID: ${productId}`);
          } else if (error.statusCode === 400) {
            throw new Error("Invalid product data. Please check all fields.");
          } else if (error.statusCode === 422) {
            throw new Error(error.message || "Product validation failed.");
          } else if (error.statusCode === 409) {
            throw new Error("A product with this name already exists.");
          }
          throw new Error(error.message || "Failed to update product");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("updateProduct error:", error);
        throw error;
      }
    },

    async deleteProduct(productId) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageProducts/DeleteProduct/${productId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`Product not found with ID: ${productId}`);
          }
          throw new Error(error.message || "Failed to delete product");
        }

        return response;
      } catch (error) {
        console.error("deleteProduct error:", error);
        throw error;
      }
    },
  },

  async getImageProxy(url) {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/api/Media/ProxyImage?url=${encodeURIComponent(url)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error(`Error ${error.statusCode}: ${error.message}`);
        throw new Error(error.message || "Failed to fetch image");
      }

      const blob = await response.blob();

      const fileName =
        response.headers
          .get("Content-Disposition")
          ?.split("filename=")[1]
          ?.replace(/"/g, "") ||
        url.split("/").pop().split("?")[0] ||
        "image.jpg";

      return new File([blob], fileName, { type: blob.type });
    } catch (error) {
      console.error("getImageProxy error:", error);
      throw error;
    }
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

          window.location.reload();
        });
      });
    },

    getImageData(popUp, existingImage = null, uploadType = "") {
      const uploadButton = popUp.querySelector(
        `.js-upload-button${uploadType}`
      );
      const filesInput = popUp.querySelector(
        `input[name='product${uploadType}-file']`
      );
      const imagesPreview = popUp.querySelector(`.js-preview${uploadType}`);

      let image = null;

      async function initializeForEdit() {
        if (existingImage) {
          image = await API.getImageProxy(existingImage);

          updatePreview();
        }
      }

      function updatePreview() {
        imagesPreview.innerHTML = "";

        if (!image) {
          imagesPreview.innerHTML = '<i class="bi bi-upload"></i>';
          return;
        }

        if (image instanceof File || image instanceof Blob) {
          const reader = new FileReader();

          reader.onload = (e) => {
            imagesPreview.innerHTML = `<img src="${e.target.result}" alt="${image.name}" width="50" />`;
          };

          reader.readAsDataURL(image);
        }
      }

      uploadButton.addEventListener("click", () => filesInput.click());

      filesInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          image = files[0];
          updatePreview();
        }
      });

      updatePreview();

      initializeForEdit();

      // Return a unique getter function for this specific image
      return function () {
        return image;
      };
    },
  },
};

// ==================== PRODUCT UI OBJECT ====================
const ProductUI = {
  renderProducts(products) {
    const productsTable = document.querySelector(".js-products-table");
    const productsTableBody = productsTable.querySelector("tbody");

    productsTableBody.innerHTML = "";

    if (products.length === 0) {
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 60px 20px;">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; color: #6c757d;">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.3; margin-bottom: 20px;">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="15"></line>
                <line x1="15" y1="9" x2="9" y2="15"></line>
              </svg>
              <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #495057;">No Data Found</h3>
              <p style="font-size: 14px; margin: 0; color: #6c757d;">Add products to get started</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    products.forEach((product) => {
      productsTableBody.innerHTML += `
        <tr>
          <td>${product.id}</td>
          <td>${product.name}</td>
          <td>${product.sizes.map((s) => s.label || s).join(", ")}</td>
          <td>${product.price}</td>
          <td>${product.options.map((o) => o.name || o).join(", ")}</td>
          <td>${product.isCustomizable ? "Yes" : "No"}</td>
          <td>
            <a class="icon-button js-view-button" style="color: gray" data-product-id="${
              product.id
            }"><i class="bi bi-eye"></i></a>
            <a class="icon-button js-edit-button" style="color: var(--primary-color)" data-product-id="${
              product.id
            }"><i class="bi bi-pencil"></i></a>
            <a class="icon-button js-delete-button" style="color: #dd0000ff" data-product-id="${
              product.id
            }"><i class="bi bi-trash"></i></a>
          </td>
        </tr>
      `;
    });
  },

  renderProductViewPopUp(product, popUp) {
    const productData = popUp.querySelector(".js-product-data");

    // Parse product name (format: "english|arabic")
    const nameParts = product.name.split("|");
    const nameEn = nameParts[0] || product.name;
    const nameAr = nameParts[1] || "";

    // Clear previous data
    productData.querySelector(".js-product-name").innerHTML = nameEn;
    const arabicNameElement = productData.querySelector(".js-product-name-ar");
    arabicNameElement.innerHTML = nameAr || "—";
    arabicNameElement.style.direction = "rtl";
    arabicNameElement.style.textAlign = "right";
    productData.querySelector(".js-product-price").innerHTML = product.price;

    // Render icon
    productData.querySelector(".js-preview-icon").innerHTML =
      '<img src="" alt="Product Icon" width="50" />';
    productData.querySelector(".js-preview-icon").querySelector("img").src =
      product.iconUrl;

    // Render mockup
    productData.querySelector(".js-preview-mockup").innerHTML =
      '<img src="" alt="Product Mockup" width="50" />';
    productData.querySelector(".js-preview-mockup").querySelector("img").src =
      product.mockupUrl;

    // Clear and render options
    const optionsContainer = productData.querySelector(".js-options");
    optionsContainer.innerHTML = "";

    product.options.forEach((option) => {
      // Parse option name (format: "english|arabic")
      const optionNameParts = option.name.split("|");
      const optionNameEn = optionNameParts[0] || option.name;
      const optionNameAr = optionNameParts[1] || "";

      optionsContainer.innerHTML += `
        <div class="option">
          <div class="card">
            <div class="option-title">
              <label for="option-name">Option Key</label>
              <input type="text" name="option-name" value="${optionNameEn}" disabled/>
              <label for="option-name-ar" class="arabic-label">مفتاح الخيار</label>
              <input type="text" name="option-name-ar" value="${optionNameAr}" disabled dir="rtl"/>
            </div>
            <div class="values-title">
              <label style="margin-bottom: 0;">Values</label>
            </div>
            <div class="values-container js-values">
              ${option.values
                .map((value) => {
                  // Parse value (format: "english|arabic")
                  const valueParts = (
                    typeof value === "string" ? value : value.value || value
                  ).split("|");
                  const valueEn = valueParts[0] || value;
                  const valueAr = valueParts[1] || "";
                  return `
                <div class="value-row">
                  <input type="text" name="value-name" value="${valueEn}" disabled/>
                  <input type="text" name="value-name-ar" value="${valueAr}" disabled dir="rtl"/>
                </div>
              `;
                })
                .join("")}
            </div>
          </div>
        </div>
      `;
    });

    // Clear and render sizes
    const sizesContainer = productData.querySelector(".js-sizes");
    sizesContainer.innerHTML = "";

    product.sizes.forEach((size) => {
      sizesContainer.innerHTML += `
        <div class="size">
          <div class="card">
            <div style="width: 100%; display: flex; flex-direction: column;">
              <label for="size-label">Size Label</label>
              <input type="text" name="size-label" value="${size.label}" disabled/>
            </div>
            <div class="row">
              <div>
                <label for="size-width">Width</label>
                <input type="text" name="size-width" value="${size.width}" disabled/>
              </div>
              <div>
                <label for="size-height">Height</label>
                <input type="text" name="size-height" value="${size.height}" disabled/>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    // Clear and render customs
    const customsContainer = productData.querySelector(".js-customs");
    customsContainer.innerHTML = "";

    product.customs.forEach((custom) => {
      // Parse custom name (format: "english|arabic")
      const customNameParts = custom.name.split("|");
      const customNameEn = customNameParts[0] || custom.name;
      const customNameAr = customNameParts[1] || "";

      customsContainer.innerHTML += `
        <div class="custom">
          <div class="card">
            <div class="row">
              <div>
                <label for="custom-key">Custom Key</label>
                <input type="text" name="custom-key" value="${customNameEn}" disabled/>
              </div>
              <div>
                <label for="custom-key-ar" class="arabic-label">مفتاح التخصيص</label>
                <input type="text" name="custom-key-ar" value="${customNameAr}" disabled dir="rtl"/>
              </div>
            </div>
            <div class="row">
              <div>
                <label for="custom-type">Custom Type</label>
                <input type="text" name="custom-type" value="${custom.type}" disabled/>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  },

  renderProductEditPopUp(product, popUp) {
    const productData = popUp.querySelector(".js-product-data");

    // Parse product name (format: "english|arabic")
    const nameParts = product.name.split("|");
    const nameEn = nameParts[0] || product.name;
    const nameAr = nameParts[1] || "";

    // Populate basic information
    productData.querySelector('input[name="product-name"]').value = nameEn;
    productData.querySelector('input[name="product-name-ar"]').value = nameAr;
    productData.querySelector('input[name="product-price"]').value =
      product.price;

    // Render icon
    productData.querySelector(".js-preview-icon").innerHTML =
      '<img src="" alt="Product Icon" width="50" />';
    productData.querySelector(".js-preview-icon").querySelector("img").src =
      product.iconUrl;

    // Render mockup
    productData.querySelector(".js-preview-mockup").innerHTML =
      '<img src="" alt="Product Mockup" width="50" />';
    productData.querySelector(".js-preview-mockup").querySelector("img").src =
      product.mockupUrl;

    // Clear and render options
    const optionsContainer = productData.querySelector(".js-options");
    optionsContainer.innerHTML = "";

    product.options.forEach((option) => {
      // Parse option name (format: "english|arabic")
      const optionNameParts = option.name.split("|");
      const optionNameEn = optionNameParts[0] || option.name;
      const optionNameAr = optionNameParts[1] || "";

      optionsContainer.innerHTML += `
        <div class="option js-option">
          <div class="card">
            <div class="option-title">
              <label for="option-name">Option Key</label>
              <input type="text" name="option-name" value="${optionNameEn}" />
              <label for="option-name-ar" class="arabic-label">مفتاح الخيار</label>
              <input type="text" name="option-name-ar" value="${optionNameAr}" dir="rtl" />
            </div>
            <div class="values-title">
              <label style="margin-bottom: 0;">Values</label>
              <div>
                <button class="secondary-button js-delete-value">
                  Delete 
                </button>
                <button class="primary-button js-add-value">
                  Add 
                </button>
              </div>
            </div>
            <div class="values-container js-values">
              ${option.values
                .map((value) => {
                  // Parse value (format: "english|arabic")
                  const valueParts = (
                    typeof value === "string" ? value : value.value || value
                  ).split("|");
                  const valueEn = valueParts[0] || value;
                  const valueAr = valueParts[1] || "";
                  return `
                <div class="value-row">
                  <input type="text" name="value-name" value="${valueEn}" />
                  <input type="text" name="value-name-ar" value="${valueAr}" dir="rtl" placeholder="القيمة بالعربي" />
                </div>
              `;
                })
                .join("")}
            </div>
          </div>
        </div>
      `;
    });

    // Clear and render sizes
    const sizesContainer = productData.querySelector(".js-sizes");
    sizesContainer.innerHTML = "";

    product.sizes.forEach((size) => {
      sizesContainer.innerHTML += `
        <div class="size js-size">
          <div class="card">
            <div style="width: 100%; display: flex; flex-direction: column;">
              <label for="size-label">Size Label</label>
              <select name="size-label">
                <option disabled>Select Size</option>
                <option value="XS" ${
                  size.label === "XS" ? "selected" : ""
                }>XS</option>
                <option value="S"  ${
                  size.label === "S" ? "selected" : ""
                }>S</option>
                <option value="M"  ${
                  size.label === "M" ? "selected" : ""
                }>M</option>
                <option value="L"  ${
                  size.label === "L" ? "selected" : ""
                }>L</option>
                <option value="XL" ${
                  size.label === "XL" ? "selected" : ""
                }>XL</option>
              </select>
            </div>
            <div class="row">
              <div>
                <label for="size-width">Width</label>
                <input type="text" name="size-width" value="${size.width}" />
              </div>
              <div>
                <label for="size-height">Height</label>
                <input type="text" name="size-height" value="${size.height}" />
              </div>
            </div>
          </div>
        </div>
      `;
    });

    // Clear and render customs
    const customsContainer = productData.querySelector(".js-customs");
    customsContainer.innerHTML = "";

    product.customs.forEach((custom) => {
      // Parse custom name (format: "english|arabic")
      const customNameParts = custom.name.split("|");
      const customNameEn = customNameParts[0] || custom.name;
      const customNameAr = customNameParts[1] || "";

      customsContainer.innerHTML += `
        <div class="custom js-custom">
          <div class="card">
            <div class="row">
              <div>
                <label for="custom-key">Custom Key</label>
                <input type="text" name="custom-key" value="${customNameEn}" />
              </div>
              <div>
                <label for="custom-key-ar" class="arabic-label">مفتاح التخصيص</label>
                <input type="text" name="custom-key-ar" value="${customNameAr}" dir="rtl" placeholder="أدخل مفتاح التخصيص" />
              </div>
            </div>
            <div class="row">
              <div style="width: 100%">
                <label for="custom-type">Custom Type</label>
                <select name="custom-type" style="width: 100%">
                  <option value="Text" ${
                    custom.type === "Text" ? "selected" : ""
                  }>Text</option>
                  <option value="Photo" ${
                    custom.type === "Photo" ? "selected" : ""
                  }>Photo</option>
                  <option value="Video" ${
                    custom.type === "Video" ? "selected" : ""
                  }>Video</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  },

  Events: {
    async setupProductUI() {
      var products = await API.Products.getAllProducts();
      console.log(products);
      ProductUI.renderProducts(products);

      const productsTableBody = document.querySelector(
        ".js-products-table tbody"
      );

      // Add button event listener
      const addButton = document.querySelector(".js-add-button");
      addButton.addEventListener("click", () => {
        const addProductPopUp = document.querySelector(".js-add-pop-up");

        Utilis.Events.openClosePopUp(addProductPopUp);

        // Setup image upload handlers
        const getIconImage = Utilis.Events.getImageData(
          addProductPopUp,
          null,
          "-icon"
        );

        const getMockupImage = Utilis.Events.getImageData(
          addProductPopUp,
          null,
          "-mockup"
        );

        // Setup options control
        ProductUI.Events.setupOptionsControl(addProductPopUp);

        // Setup sizes control
        ProductUI.Events.setupSizesControl(addProductPopUp);

        // Setup customs control
        ProductUI.Events.setupCustomsControl(addProductPopUp);

        ProductUI.Events.submitProductData(
          addProductPopUp,
          "add",
          null,
          getIconImage,
          getMockupImage
        );
      });

      // View button event listener
      productsTableBody.addEventListener("click", async (e) => {
        if (e.target.closest(".js-view-button")) {
          const button = e.target.closest(".js-view-button");
          const productId = button.dataset.productId;

          const viewProductPopUp = document.querySelector(".js-view-pop-up");

          Utilis.Events.openClosePopUp(viewProductPopUp);

          const product = await API.Products.getProduct(productId);
          console.log(product);

          ProductUI.renderProductViewPopUp(product, viewProductPopUp);
        }
      });

      // Edit button event listener
      productsTableBody.addEventListener("click", async (e) => {
        if (e.target.closest(".js-edit-button")) {
          const button = e.target.closest(".js-edit-button");
          const productId = button.dataset.productId;

          const editProductPopUp = document.querySelector(".js-edit-pop-up");

          Utilis.Events.openClosePopUp(editProductPopUp);

          const product = await API.Products.getProduct(productId);
          console.log(product);

          ProductUI.renderProductEditPopUp(product, editProductPopUp);

          // Setup image upload handlers
          const getIconImage = Utilis.Events.getImageData(
            editProductPopUp,
            product.iconUrl,
            "-icon"
          );

          const getMockupImage = Utilis.Events.getImageData(
            editProductPopUp,
            product.mockupUrl,
            "-mockup"
          );

          // Setup options control
          ProductUI.Events.setupOptionsControl(editProductPopUp);

          // Setup sizes control
          ProductUI.Events.setupSizesControl(editProductPopUp);

          // Setup customs control
          ProductUI.Events.setupCustomsControl(editProductPopUp);

          ProductUI.Events.submitProductData(
            editProductPopUp,
            "edit",
            productId,
            getIconImage,
            getMockupImage
          );
        }
      });

      //   // Delete button event listener
      //   productsTableBody.addEventListener("click", async (e) => {
      //     if (e.target.closest(".js-delete-button")) {
      //       const button = e.target.closest(".js-delete-button");
      //       const productId = button.dataset.productId;
      //       console.log(`Product with ID ${productId} will be deleted`);

      //       // TODO: Implement delete confirmation and API call
      //       // const result = await API.Products.deleteProduct(productId);
      //       // window.location.reload();
      //     }
      //   });
    },

    setupOptionsControl(popUp) {
      // Add Option button
      const addOptionButton = popUp.querySelector(".js-add-option");
      addOptionButton.addEventListener("click", () => {
        const optionsContainer = popUp.querySelector(".js-options");

        optionsContainer.innerHTML += `
          <div class="option js-option">
            <div class="card">
              <div class="option-title">
                <label for="option-name">Option Key</label>
                <input
                  type="text"
                  name="option-name"
                  placeholder="Enter option key"
                />
                <label for="option-name-ar" class="arabic-label">مفتاح الخيار</label>
                <input
                  type="text"
                  name="option-name-ar"
                  placeholder="أدخل مفتاح الخيار"
                  dir="rtl"
                />
              </div>
              <div class="values-title">
                <label for="values" style="margin-bottom: 0;">Values</label>
                <div>
                  <button class="secondary-button js-delete-value">
                    Delete 
                  </button>
                  <button class="primary-button js-add-value">
                    Add 
                  </button>
                </div>
              </div>
              <div class="values-container js-values">
                <div class="value-row">
                  <input
                    type="text"
                    name="value-name"
                    placeholder="Enter value"
                  />
                  <input
                    type="text"
                    name="value-name-ar"
                    placeholder="القيمة بالعربي"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          </div>
        `;
      });

      // Delete Option button
      const deleteOptionButton = popUp.querySelector(".js-delete-option");
      deleteOptionButton.addEventListener("click", () => {
        const optionsContainer = popUp.querySelector(".js-options");

        if (optionsContainer.lastElementChild) {
          optionsContainer.lastElementChild.remove();
        }
      });

      // Add/Delete Value buttons (using event delegation)
      const optionsContainer = popUp.querySelector(".js-options");
      optionsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("js-add-value")) {
          const valuesContainer = e.target
            .closest(".card")
            .querySelector(".js-values");

          const valueRow = document.createElement("div");
          valueRow.className = "value-row";
          valueRow.innerHTML = `
            <input
              type="text"
              name="value-name"
              placeholder="Enter value"
            />
            <input
              type="text"
              name="value-name-ar"
              placeholder="القيمة بالعربي"
              dir="rtl"
            />
          `;

          valuesContainer.appendChild(valueRow);
        } else if (e.target.classList.contains("js-delete-value")) {
          const valuesContainer = e.target
            .closest(".card")
            .querySelector(".js-values");

          if (valuesContainer.lastElementChild) {
            valuesContainer.lastElementChild.remove();
          }
        }
      });
    },

    setupSizesControl(popUp) {
      // Add Size button
      const addSizeButton = popUp.querySelector(".js-add-size");
      addSizeButton.addEventListener("click", () => {
        const sizesContainer = popUp.querySelector(".js-sizes");

        sizesContainer.innerHTML += `
          <div class="size js-size">
            <div class="card">
              <div style="width: 100%; display: flex; flex-direction: column;">
                <label for="size-label">Size Label</label>
                <select name="size-label">
                  <option disabled selected>Select Size</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              </div>
              <div class="row">
                <div>
                  <label for="size-width">Width</label>
                  <input
                    type="text"
                    name="size-width"
                    placeholder="Enter size width"
                  />
                </div>
                <div>
                  <label for="size-height">Height</label>
                  <input
                    type="text"
                    name="size-height"
                    placeholder="Enter size height"
                  />
                </div>
              </div>
            </div>
          </div>
        `;
      });

      // Delete Size button
      const deleteSizeButton = popUp.querySelector(".js-delete-size");
      deleteSizeButton.addEventListener("click", () => {
        const sizesContainer = popUp.querySelector(".js-sizes");

        if (sizesContainer.lastElementChild) {
          sizesContainer.lastElementChild.remove();
        }
      });
    },

    setupCustomsControl(popUp) {
      // Add Custom button
      const addCustomButton = popUp.querySelector(".js-add-custom");
      addCustomButton.addEventListener("click", () => {
        const customsContainer = popUp.querySelector(".js-customs");

        customsContainer.innerHTML += `
          <div class="custom js-custom">
            <div class="card">
              <div class="row">
                <div>
                  <label for="custom-key">Custom Key</label>
                  <input
                    type="text"
                    name="custom-key"
                    placeholder="Enter custom key"
                  />
                </div>
                <div>
                  <label for="custom-key-ar" class="arabic-label">مفتاح التخصيص</label>
                  <input
                    type="text"
                    name="custom-key-ar"
                    placeholder="أدخل مفتاح التخصيص"
                    dir="rtl"
                  />
                </div>
              </div>
              <div class="row">
                <div style="width: 100%">
                  <label for="custom-type">Custom Type</label>
                  <select name="custom-type" style="width: 100%">
                    <option disabled selected>Select Custom Type</option>
                    <option value="Text">Text</option>
                    <option value="Photo">Photo</option>
                    <option value="Video">Video</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      // Delete Custom button
      const deleteCustomButton = popUp.querySelector(".js-delete-custom");
      deleteCustomButton.addEventListener("click", () => {
        const customsContainer = popUp.querySelector(".js-customs");

        if (customsContainer.lastElementChild) {
          customsContainer.lastElementChild.remove();
        }
      });
    },

    submitProductData(
      popUp,
      mode = "add",
      productId = null,
      getIconImage = null,
      getMockupImage = null
    ) {
      const submitButton = popUp.querySelector(
        mode === "add" ? ".js-save-add-button" : ".js-save-edit-button"
      );

      submitButton.addEventListener("click", async () => {
        const productData = popUp.querySelector(".js-product-data");

        // Get basic information
        const nameInput = productData.querySelector(
          'input[name="product-name"]'
        );
        const nameInputAr = productData.querySelector(
          'input[name="product-name-ar"]'
        );

        const priceInput = productData.querySelector(
          'input[name="product-price"]'
        );

        // Validate required fields
        if (
          !nameInput.value.trim() ||
          !priceInput.value ||
          parseFloat(priceInput.value) <= 0
        ) {
          showToast("Please fill in product name and valid price.", "warning");
          return;
        }

        // Format product name as 'english|arabic'
        const productName = nameInputAr?.value.trim()
          ? `${nameInput.value.trim()}|${nameInputAr.value.trim()}`
          : nameInput.value.trim();

        // Collect Options - { "optionName": ["value1", "value2"] }
        const options = {};
        const optionElements = popUp.querySelectorAll(".js-option");

        optionElements.forEach((optionEl) => {
          const optionName = optionEl
            .querySelector('input[name="option-name"]')
            ?.value.trim();
          const optionNameAr = optionEl
            .querySelector('input[name="option-name-ar"]')
            ?.value.trim();

          // Format option name as 'english|arabic'
          const formattedOptionName = optionNameAr
            ? `${optionName}|${optionNameAr}`
            : optionName;

          const valuesContainer = optionEl.querySelector(".js-values");
          const valueRows = valuesContainer?.querySelectorAll(".value-row");

          if (formattedOptionName && valueRows) {
            const values = [];

            valueRows.forEach((row) => {
              const valueEn = row
                .querySelector('input[name="value-name"]')
                ?.value.trim();
              const valueAr = row
                .querySelector('input[name="value-name-ar"]')
                ?.value.trim();

              if (valueEn) {
                // Format value as 'english|arabic'
                const formattedValue = valueAr
                  ? `${valueEn}|${valueAr}`
                  : valueEn;
                values.push(formattedValue);
              }
            });

            if (values.length > 0) {
              options[formattedOptionName] = values;
            }
          }
        });

        // Collect Sizes - { "sizeLabel": { "width": 1, "height": 1 } }
        const sizes = {};
        const sizeElements = popUp.querySelectorAll(".js-size");

        sizeElements.forEach((sizeEl) => {
          const label = sizeEl
            .querySelector('select[name="size-label"]')
            ?.value.trim();
          const width = sizeEl.querySelector('input[name="size-width"]')?.value;
          const height = sizeEl.querySelector(
            'input[name="size-height"]'
          )?.value;

          if (label && !isNaN(width) && !isNaN(height)) {
            sizes[label] = {
              width: width,
              height: height,
            };
          }
        });

        // Collect Customs - { "customName": "type" }
        const customs = {};
        const customElements = popUp.querySelectorAll(".js-custom");

        customElements.forEach((customEl) => {
          const customName = customEl
            .querySelector('input[name="custom-key"]')
            ?.value.trim();
          const customNameAr = customEl
            .querySelector('input[name="custom-key-ar"]')
            ?.value.trim();
          const customType = customEl.querySelector(
            'select[name="custom-type"]'
          )?.value;

          if (customName && customType && customType !== "Select Custom Type") {
            // Format custom name as 'english|arabic'
            const formattedCustomName = customNameAr
              ? `${customName}|${customNameAr}`
              : customName;

            customs[formattedCustomName] = customType;
          }
        });

        // Build the ProductRequestDTO
        const product = {
          name: productName,
          price: parseFloat(priceInput.value),
          options: options,
          sizes: sizes,
          customs: customs,
        };

        // Validate at least one size exists
        if (Object.keys(sizes).length === 0) {
          showToast("Please add at least one product size.", "warning");
          return;
        }

        // Get uploaded images
        const iconImage = getIconImage ? getIconImage() : null;
        const mockupImage = getMockupImage ? getMockupImage() : null;

        // Validate images are uploaded for add mode
        if (mode === "add" && (!iconImage || !mockupImage)) {
          showToast("Please upload both icon and mockup images.", "warning");
          return;
        }

        try {
          if (mode === "add") {
            console.log("Add Mode - Product Data:", product);
            console.log("Add Mode - Icon Image:", iconImage);
            console.log("Add Mode - Mockup Image:", mockupImage);

            //   // First, create the product with data
            const newProductId = await API.Products.addProduct(product);

            // Then, upload the media files separately
            if (iconImage) {
              await API.Products.addProductIcon(newProductId, iconImage);
            }
            if (mockupImage) {
              await API.Products.addProductMockup(newProductId, mockupImage);
            }

            showToast("Product added successfully!", "success");
          } else {
            console.log("Edit Mode - Product Data:", product);
            console.log("Edit Mode - Icon Image:", iconImage);
            console.log("Edit Mode - Mockup Image:", mockupImage);

            //   // Update the product data
            await API.Products.updateProduct(productId, product);

            // Update media files if new ones were uploaded
            if (iconImage) {
              await API.Products.updateProductIcon(productId, iconImage);
            }
            if (mockupImage) {
              await API.Products.updateProductMockup(productId, mockupImage);
            }

            showToast("Product updated successfully!", "success");
          }

          togglePopUpOff(popUp);
          setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
          console.error("Failed to save product:", error);
          showToast(
            error.message || "Failed to save product. Please try again.",
            "error"
          );
        }
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
    await ProductUI.Events.setupProductUI();
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

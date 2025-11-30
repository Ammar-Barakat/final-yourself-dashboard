import {
  showToast,
  showServerDownPage,
  isServerError,
} from "./utilis/pop-ups.js";
import { Product } from "./data/product.js";

// Demo data - simulating products from your database
const demoProducts = [
  {
    id: 1,
    name: "Oversized T-Shirt",
    name_ar: "تيشيرت واسع",
    description: "Premium cotton oversized t-shirt",
    description_ar: "تيشيرت قطني واسع فاخر",
    category: "Apparel",
    category_ar: "ملابس",
    price: 150,
    options: [
      {
        id: 1,
        name: "Color",
        name_ar: "اللون",
        values: [
          { value: "Red", value_ar: "أحمر" },
          { value: "Blue", value_ar: "أزرق" },
          { value: "Green", value_ar: "أخضر" },
        ],
      },
    ],
    sizes: [
      { label: "Small", label_ar: "صغير" },
      { label: "Medium", label_ar: "متوسط" },
      { label: "Large", label_ar: "كبير" },
    ],
    customs: [
      {
        name: "Player Name",
        name_ar: "اسم اللاعب",
        type: "text",
        type_ar: "نص",
      },
      {
        name: "Player Number",
        name_ar: "رقم اللاعب",
        type: "number",
        type_ar: "رقم",
      },
    ],
  },
  {
    id: 2,
    name: "Polo Shirt",
    name_ar: "", // Missing translation
    description: "Classic polo shirt with collar",
    description_ar: "", // Missing translation
    category: "Apparel",
    category_ar: "ملابس",
    price: 200,
    options: [
      {
        id: 2,
        name: "Size",
        name_ar: "", // Missing
        values: [
          { value: "S", value_ar: "" },
          { value: "M", value_ar: "" },
          { value: "L", value_ar: "" },
          { value: "XL", value_ar: "" },
        ],
      },
      {
        id: 3,
        name: "Fit",
        name_ar: "", // Missing
        values: [
          { value: "Regular", value_ar: "" },
          { value: "Slim", value_ar: "" },
        ],
      },
    ],
    sizes: [],
    customs: [],
  },
  {
    id: 3,
    name: "Hoodie",
    name_ar: "هودي",
    description: "Comfortable hoodie with front pocket",
    description_ar: "", // Missing translation
    category: "Apparel",
    category_ar: "ملابس",
    price: 350,
    options: [],
    sizes: [
      { label: "XS", label_ar: "" },
      { label: "S", label_ar: "" },
      { label: "M", label_ar: "" },
      { label: "L", label_ar: "" },
    ],
    customs: [{ name: "Custom Text", name_ar: "", type: "text", type_ar: "" }],
  },
];

// ==================== TRANSLATION MANAGER ====================

const TranslationManager = {
  items: [],
  filteredItems: [],

  init() {
    // Load demo data (in real app, fetch from API)
    this.items = demoProducts;
    this.filteredItems = [...this.items];

    this.updateStats();
    this.renderTranslations();
    this.setupEventListeners();
  },

  updateStats() {
    const total = this.items.length;
    const translated = this.items.filter((item) =>
      this.isTranslated(item)
    ).length;
    const missing = total - translated;

    document.querySelector(".js-total-items").textContent = total;
    document.querySelector(".js-translated-items").textContent = translated;
    document.querySelector(".js-missing-items").textContent = missing;
  },

  isTranslated(item) {
    // Check if all Arabic fields are filled
    const basicTranslated =
      item.name_ar &&
      item.name_ar.trim() !== "" &&
      item.description_ar &&
      item.description_ar.trim() !== "";

    // Check options translations
    const optionsTranslated =
      !item.options ||
      item.options.length === 0 ||
      item.options.every(
        (opt) =>
          opt.name_ar &&
          opt.name_ar.trim() !== "" &&
          opt.values.every((v) => v.value_ar && v.value_ar.trim() !== "")
      );

    // Check sizes translations
    const sizesTranslated =
      !item.sizes ||
      item.sizes.length === 0 ||
      item.sizes.every((size) => size.label_ar && size.label_ar.trim() !== "");

    // Check customs translations
    const customsTranslated =
      !item.customs ||
      item.customs.length === 0 ||
      item.customs.every(
        (custom) => custom.name_ar && custom.name_ar.trim() !== ""
      );

    return (
      basicTranslated &&
      optionsTranslated &&
      sizesTranslated &&
      customsTranslated
    );
  },

  renderTranslations() {
    const container = document.querySelector(".js-translations-list");

    if (this.filteredItems.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>No items found</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.filteredItems
      .map((item) => this.createTranslationCard(item))
      .join("");

    // Attach save handlers
    this.filteredItems.forEach((item) => {
      const saveBtn = document.querySelector(`.js-save-translation-${item.id}`);
      if (saveBtn) {
        saveBtn.onclick = () => this.saveTranslation(item.id);
      }
    });
  },

  createTranslationCard(item) {
    const isTranslated = this.isTranslated(item);
    const statusClass = isTranslated ? "translated" : "missing";
    const statusText = isTranslated ? "Translated" : "Missing Translation";
    const statusIcon = isTranslated
      ? "check-circle-fill"
      : "exclamation-circle-fill";

    return `
      <div class="translation-item" data-id="${item.id}">
        <div class="translation-header">
          <div class="translation-header-info">
            <div class="translation-category">
              <i class="bi bi-bag"></i>
              <span>Product</span>
            </div>
            <h3 class="translation-title">${item.name}</h3>
          </div>
          <div class="translation-status ${statusClass}">
            <i class="bi bi-${statusIcon}"></i>
            <span>${statusText}</span>
          </div>
        </div>
        
        <div class="translation-content">
          <div class="translation-grid">
            <!-- English Column (Read-only) -->
            <div class="translation-column">
              <h4>
                <i class="bi bi-flag"></i>
                English
              </h4>
              
              <div class="translation-field">
                <label>Product Name</label>
                <div class="read-only">${item.name}</div>
              </div>
              
              <div class="translation-field">
                <label>Description</label>
                <div class="read-only">${item.description}</div>
              </div>
              
              <div class="translation-field">
                <label>Category</label>
                <div class="read-only">${item.category}</div>
              </div>
            </div>
            
            <!-- Arabic Column (Editable) -->
            <div class="translation-column">
              <h4>
                <i class="bi bi-translate"></i>
                Arabic (عربي)
              </h4>
              
              <div class="translation-field">
                <label>اسم المنتج</label>
                <input 
                  type="text" 
                  dir="rtl"
                  placeholder="أدخل اسم المنتج"
                  value="${item.name_ar || ""}"
                  data-field="name_ar"
                  class="js-translation-input"
                />
              </div>
              
              <div class="translation-field">
                <label>الوصف</label>
                <textarea 
                  dir="rtl"
                  placeholder="أدخل الوصف"
                  data-field="description_ar"
                  class="js-translation-input"
                >${item.description_ar || ""}</textarea>
              </div>
              
              <div class="translation-field">
                <label>الفئة</label>
                <input 
                  type="text" 
                  dir="rtl"
                  placeholder="أدخل الفئة"
                  value="${item.category_ar || ""}"
                  data-field="category_ar"
                  class="js-translation-input"
                />
              </div>
            </div>
          </div>
          
          ${this.renderOptionsTranslation(item)}
          ${this.renderSizesTranslation(item)}
          ${this.renderCustomsTranslation(item)}
        </div>
        
        <div class="translation-actions">
          <button class="secondary-button">Cancel</button>
          <button class="primary-button js-save-translation-${item.id}">
            <i class="bi bi-save"></i> Save Translation
          </button>
        </div>
      </div>
    `;
  },

  renderOptionsTranslation(item) {
    if (!item.options || item.options.length === 0) return "";

    return `
      <div class="translation-section">
        <h4 class="section-title">
          <i class="bi bi-list-ul"></i>
          Options / الخيارات
        </h4>
        ${item.options
          .map(
            (option, optIdx) => `
          <div class="translation-subsection">
            <div class="subsection-header">Option ${optIdx + 1}: ${
              option.name
            }</div>
            <div class="translation-grid">
              <div class="translation-column">
                <div class="translation-field">
                  <label>Option Name</label>
                  <div class="read-only">${option.name}</div>
                </div>
                <div class="translation-field">
                  <label>Values</label>
                  ${option.values
                    .map((val) => `<div class="read-only">${val.value}</div>`)
                    .join("")}
                </div>
              </div>
              <div class="translation-column">
                <div class="translation-field">
                  <label>اسم الخيار</label>
                  <input 
                    type="text" 
                    dir="rtl"
                    placeholder="أدخل اسم الخيار"
                    value="${option.name_ar || ""}"
                    data-type="option"
                    data-option-id="${option.id}"
                    data-field="name_ar"
                    class="js-translation-input"
                  />
                </div>
                <div class="translation-field">
                  <label>القيم</label>
                  ${option.values
                    .map(
                      (val, valIdx) => `
                    <input 
                      type="text" 
                      dir="rtl"
                      placeholder="أدخل القيمة"
                      value="${val.value_ar || ""}"
                      data-type="option-value"
                      data-option-id="${option.id}"
                      data-value-index="${valIdx}"
                      class="js-translation-input"
                    />
                  `
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  },

  renderSizesTranslation(item) {
    if (!item.sizes || item.sizes.length === 0) return "";

    return `
      <div class="translation-section">
        <h4 class="section-title">
          <i class="bi bi-rulers"></i>
          Sizes / المقاسات
        </h4>
        <div class="translation-grid">
          <div class="translation-column">
            <div class="translation-field">
              <label>Size Labels</label>
              ${item.sizes
                .map((size) => `<div class="read-only">${size.label}</div>`)
                .join("")}
            </div>
          </div>
          <div class="translation-column">
            <div class="translation-field">
              <label>تسميات المقاسات</label>
              ${item.sizes
                .map(
                  (size, idx) => `
                <input 
                  type="text" 
                  dir="rtl"
                  placeholder="أدخل المقاس"
                  value="${size.label_ar || ""}"
                  data-type="size"
                  data-size-index="${idx}"
                  class="js-translation-input"
                />
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderCustomsTranslation(item) {
    if (!item.customs || item.customs.length === 0) return "";

    return `
      <div class="translation-section">
        <h4 class="section-title">
          <i class="bi bi-pencil-square"></i>
          Customizations / التخصيصات
        </h4>
        <div class="translation-grid">
          <div class="translation-column">
            <div class="translation-field">
              <label>Customization Names</label>
              ${item.customs
                .map((custom) => `<div class="read-only">${custom.name}</div>`)
                .join("")}
            </div>
          </div>
          <div class="translation-column">
            <div class="translation-field">
              <label>أسماء التخصيصات</label>
              ${item.customs
                .map(
                  (custom, idx) => `
                <input 
                  type="text" 
                  dir="rtl"
                  placeholder="أدخل اسم التخصيص"
                  value="${custom.name_ar || ""}"
                  data-type="custom"
                  data-custom-index="${idx}"
                  class="js-translation-input"
                />
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  saveTranslation(itemId) {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) return;

    const card = document.querySelector(
      `.translation-item[data-id="${itemId}"]`
    );
    const inputs = card.querySelectorAll(".js-translation-input");

    // Update item with new translations
    inputs.forEach((input) => {
      const type = input.dataset.type;

      if (!type) {
        // Basic field
        const field = input.dataset.field;
        item[field] = input.value.trim();
      } else if (type === "option") {
        // Option name
        const optionId = parseInt(input.dataset.optionId);
        const option = item.options.find((o) => o.id === optionId);
        if (option) {
          option.name_ar = input.value.trim();
        }
      } else if (type === "option-value") {
        // Option value
        const optionId = parseInt(input.dataset.optionId);
        const valueIndex = parseInt(input.dataset.valueIndex);
        const option = item.options.find((o) => o.id === optionId);
        if (option && option.values[valueIndex]) {
          option.values[valueIndex].value_ar = input.value.trim();
        }
      } else if (type === "size") {
        // Size label
        const sizeIndex = parseInt(input.dataset.sizeIndex);
        if (item.sizes[sizeIndex]) {
          item.sizes[sizeIndex].label_ar = input.value.trim();
        }
      } else if (type === "custom") {
        // Custom name
        const customIndex = parseInt(input.dataset.customIndex);
        if (item.customs[customIndex]) {
          item.customs[customIndex].name_ar = input.value.trim();
        }
      }
    });

    // In real app, send to API:
    // await API.updateTranslation(itemId, translations);

    this.updateStats();
    this.renderTranslations();
    showToast("Translation saved successfully", "success");
  },

  setupEventListeners() {
    // Category filter
    document
      .querySelector(".js-category-filter")
      .addEventListener("change", (e) => {
        this.filterItems();
      });

    // Status filter
    document
      .querySelector(".js-status-filter")
      .addEventListener("change", (e) => {
        this.filterItems();
      });

    // Search
    document
      .querySelector(".js-search-input")
      .addEventListener("input", (e) => {
        this.filterItems();
      });
  },

  filterItems() {
    const category = document.querySelector(".js-category-filter").value;
    const status = document.querySelector(".js-status-filter").value;
    const search = document
      .querySelector(".js-search-input")
      .value.toLowerCase();

    this.filteredItems = this.items.filter((item) => {
      // Category filter (demo only has products)
      if (category !== "all" && category !== "products") return false;

      // Status filter
      if (status === "translated" && !this.isTranslated(item)) return false;
      if (status === "missing" && this.isTranslated(item)) return false;

      // Search filter
      if (search && !item.name.toLowerCase().includes(search)) return false;

      return true;
    });

    this.renderTranslations();
  },
};

// ==================== INITIALIZATION ====================

document.addEventListener("DOMContentLoaded", () => {
  TranslationManager.init();
});

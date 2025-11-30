import { School, SchoolDetails } from "./data/school.js";
import { StudentPack, StudentPackDetails } from "./data/student.js";
import { togglePopUpOn, togglePopUpOff, showToast } from "./utilis/pop-ups.js";

const API_BASE_URL = "https://yourself-demo.runasp.net";
// const API_BASE_URL = "https://localhost:44372";

function getAuthToken() {
  return localStorage.getItem("authToken");
}

// ==================== API OBJECT ====================
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
          console.error(`HTTP ${response.status}: Failed to fetch schools`);
          return [];
        }

        const result = await response.json();

        console.log(result);

        const schools = result.map((school) => new School(school));

        return schools;
      } catch (error) {
        console.error("getAllSchools error:", error);
        // Re-throw network errors
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
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`School not found with ID: ${schoolId}`);
          }
          throw new Error(error.message || "Failed to fetch school");
        }

        const result = await response.json();

        const school = new SchoolDetails(result);

        return school;
      } catch (error) {
        console.error("getSchoolById error:", error);
        throw error;
      }
    },
  },

  StudentPacks: {
    async getAllStudentPacks(packId) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageStudents/GetAllStudentPacks/${packId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error(
            `HTTP ${response.status}: Failed to fetch student packs for pack ID: ${packId}`
          );
          return [];
        }

        const result = await response.json();

        console.log(result);

        const studentPacks = result.map(
          (studentPack) => new StudentPack(studentPack)
        );

        return studentPacks;
      } catch (error) {
        console.error("getAllStudentPacks error:", error);
        // Re-throw network errors
        if (error instanceof TypeError || error.message?.includes("fetch")) {
          throw error;
        }
        return [];
      }
    },

    async getStudentPackDetails(studentPackId) {
      try {
        const token = getAuthToken();
        const response1 = await fetch(
          `${API_BASE_URL}/api/ManageStudents/GetStudentPackMainInfo/${studentPackId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response1.ok) {
          const error = await response1.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(
              `Student pack main info not found with ID: ${studentPackId}`
            );
          }
          throw new Error(
            error.message || "Failed to fetch student pack main info"
          );
        }
        const basicData = await response1.json();

        const response2 = await fetch(
          `${API_BASE_URL}/api/ManageStudents/GetStudentPackProducts/${studentPackId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response2.ok) {
          const error = await response2.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(
              `Student pack products not found with ID: ${studentPackId}`
            );
          }
          throw new Error(
            error.message || "Failed to fetch student pack products"
          );
        }
        const packProducts = await response2.json();

        const response3 = await fetch(
          `${API_BASE_URL}/api/ManageStudents/GetStudentPackExtras/${studentPackId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response3.ok) {
          const error = await response3.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(
              `Student pack extras not found with ID: ${studentPackId}`
            );
          }
          throw new Error(
            error.message || "Failed to fetch student pack extras"
          );
        }
        const extras = await response3.json();

        const combinedData = {
          ...basicData,
          pack: {
            ...basicData.pack,
            packProducts: packProducts,
          },
          extras: extras,
        };

        const studentPackDetails = new StudentPackDetails(combinedData);

        return studentPackDetails;
      } catch (error) {
        console.error("getStudentPackDetails error:", error);
        throw error;
      }
    },

    async updateStudentPackMainInfo(studentPackId, coupons) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageStudents/UpdateStudentPackMainInfo/${studentPackId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(coupons),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`Student pack not found with ID: ${studentPackId}`);
          } else if (error.statusCode === 400) {
            throw new Error("Invalid coupon data. Please check all fields.");
          } else if (error.statusCode === 422) {
            throw new Error(error.message || "Coupon validation failed.");
          }
          throw new Error(
            error.message || "Failed to update student pack main info"
          );
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("updateStudentPackMainInfo error:", error);
        throw error;
      }
    },

    async updateStudentPackProducts(studentPackId, products) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageStudents/UpdateStudentPackProducts/${studentPackId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(products),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`Student pack not found with ID: ${studentPackId}`);
          } else if (error.statusCode === 400) {
            throw new Error("Invalid product data. Please check all fields.");
          } else if (error.statusCode === 422) {
            throw new Error(error.message || "Product validation failed.");
          }
          throw new Error(
            error.message || "Failed to update student pack products"
          );
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("updateStudentPackProducts error:", error);
        throw error;
      }
    },

    async updateStudentPackExtras(studentPackId, extras) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageStudents/UpdateStudentPackExtras/${studentPackId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(extras),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`Student pack not found with ID: ${studentPackId}`);
          } else if (error.statusCode === 400) {
            throw new Error("Invalid extras data. Please check all fields.");
          } else if (error.statusCode === 422) {
            throw new Error(error.message || "Extras validation failed.");
          }
          throw new Error(
            error.message || "Failed to update student pack extras"
          );
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("updateStudentPackExtras error:", error);
        throw error;
      }
    },

    async updateStudentProductCustomPhoto(
      studentPackId,
      productId,
      productType,
      customId,
      imageFile
    ) {
      try {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append("imageFile", imageFile);

        const response = await fetch(
          `${API_BASE_URL}/api/ManageStudents/UpdateStudentProductCustomPhoto/${studentPackId}/${productId}/${productType}/${customId}`,
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
            throw new Error(`Student pack, product, or custom not found`);
          } else if (error.statusCode === 400) {
            throw new Error("Invalid image file. Please upload a valid image.");
          } else if (error.statusCode === 500) {
            throw new Error("File upload failed. Please try again.");
          }
          throw new Error(error.message || "Failed to update custom photo");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("updateStudentProductCustomPhoto error:", error);
        throw error;
      }
    },

    async deleteStudentPack(studentPackId) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageStudents/DeleteStudentPack/${studentPackId}`,
          {
            method: "DELETE",
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
            throw new Error(`Student pack not found with ID: ${studentPackId}`);
          }
          throw new Error(error.message || "Failed to delete student pack");
        }

        return response;
      } catch (error) {
        console.error("deleteStudentPack error:", error);
        throw error;
      }
    },
  },
};

// ==================== UTILIS OBJECT ====================
const Utilis = {
  getProductAllowedCustoms(product) {
    if (
      !product.productAllowedCustoms ||
      product.productAllowedCustoms === ""
    ) {
      return [];
    }

    const allowedIds = product.productAllowedCustoms.split("-");
    return product.productCustoms.filter((custom) =>
      allowedIds.includes(custom.id)
    );
  },

  generateRandomCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  },

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
  },
};

// ==================== STUDENTS UI OBJECT ====================
const StudentsUI = {
  currentSchool: null,

  renderSchoolsDropdown(schools) {
    const schoolsDropdown = document.querySelector(".js-schools-dropdown");

    if (schools.length === 0) {
      schoolsDropdown.innerHTML =
        "<option selected disabled>No schools available</option>";
      schoolsDropdown.disabled = true;

      const chooseCard = document.querySelector(".js-choose");
      chooseCard.innerHTML = `
        <div class="choose">
          <i class="bi bi-buildings"></i>
          <p style="color: #6c757d;">No schools found. Please add schools first.</p>
        </div>`;
      return;
    }

    schoolsDropdown.innerHTML =
      "<option selected disabled>Choose a school</option>";

    schools.forEach((school) => {
      schoolsDropdown.innerHTML += `
        <option value="${school.id}" data-total-packs="${school.totalPacks}">
          ${school.name}
        </option>
      `;
    });
  },

  renderSchoolPacksDropdown(school) {
    const schoolPacksDropdown = document.querySelector(
      ".js-school-packs-dropdown"
    );

    schoolPacksDropdown.style.display = "inline";
    schoolPacksDropdown.innerHTML = `
      <option selected disabled>Choose a pack</option>
    `;

    const packs = school.packs || [];

    packs.forEach((pack) => {
      schoolPacksDropdown.innerHTML += `
        <option value="${pack.id}">${pack.name}</option>
      `;
    });
  },

  hideSchoolPacksDropdown() {
    const schoolPacksDropdown = document.querySelector(
      ".js-school-packs-dropdown"
    );
    schoolPacksDropdown.style.display = "none";
  },

  renderStudentsTable(studentPacks, products) {
    const studentsTable = document.querySelector(".js-students-table");
    const studentsTableBody = studentsTable.querySelector("tbody");
    const studentsTableHead = studentsTable.querySelector("thead");

    console.log(studentPacks);

    studentsTableHead.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Phone Number</th>
        ${products.map((p) => `<th>${p.productName} Size</th>`).join("")}
        ${products
          .map((p) =>
            p.productOptions
              ? p.productOptions
                  .map((po) => `<th>${p.productName} ${po.name}</th>`)
                  .join("")
              : ""
          )
          .join("")}
        ${products
          .map((p) => {
            const allowedCustoms = Utilis.getProductAllowedCustoms(p);
            return allowedCustoms
              .map((custom) => `<th>${p.productName} ${custom.name}</th>`)
              .join("");
          })
          .join("")}
        <th>1st Payment</th>
        <th>2nd Payment</th>
        <th>Extras</th>
        <th>Actions</th>
      </tr>
    `;

    studentsTableBody.innerHTML = "";

    if (studentPacks.length === 0) {
      const columnCount =
        5 +
        products.length * 3 +
        products.reduce((acc, p) => {
          const allowedCustoms = Utilis.getProductAllowedCustoms(p);
          return (
            acc +
            allowedCustoms.length +
            (p.productOptions ? p.productOptions.length : 0)
          );
        }, 0);

      studentsTableBody.innerHTML = `
        <tr>
          <td colspan="${columnCount}" style="text-align: center; padding: 60px 20px;">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; color: #6c757d;">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.3; margin-bottom: 20px;">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="15"></line>
                <line x1="15" y1="9" x2="9" y2="15"></line>
              </svg>
              <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #495057;">No Data Found</h3>
              <p style="font-size: 14px; margin: 0; color: #6c757d;">No student packs found for this pack</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    studentPacks.forEach((studentPack) => {
      studentsTableBody.innerHTML += `
        <tr>
          <td>${studentPack.studentName}</td>
          <td>${studentPack.studentPhoneNumber}</td>
          ${studentPack.pack.packProducts
            .map((pp) => `<td>${pp.selectedSize}</td>`)
            .join("")}
          ${studentPack.pack.packProducts
            .map((pp) =>
              pp.selectedOptions
                ? pp.selectedOptions.map((po) => `<td>${po}</td>`).join("")
                : ""
            )
            .join("")}
          ${studentPack.pack.packProducts
            .map((pp) =>
              pp.selectedCustoms
                ? pp.selectedCustoms
                    .map((customValue) => {
                      // Check if it's a URL (photo custom)
                      if (customValue && customValue.startsWith("http")) {
                        // Extract filename from URL
                        const parts = customValue.split("/").pop();
                        const match = parts.match(
                          /_([^_]+\.(jpg|jpeg|png|gif|webp))$/i
                        );
                        const displayName = match ? match[1] : parts;
                        return `<td><span onclick="window.open('${customValue}', '_blank')" style="cursor: pointer; text-decoration:underline;">${displayName}</span></td>`;
                      } else {
                        // Regular text custom
                        return `<td>${customValue}</td>`;
                      }
                    })
                    .join("")
                : ""
            )
            .join("")}
          <td><span>${studentPack.studentFirstPaymentStatus}</span></td>
          <td><span>${studentPack.studentLastPaymentStatus}</span></td>
          <td><span>${studentPack.hasExtras ? "Yes" : "No"}</span></td>
          <td>
            <a class="icon-button js-view-button" style="color: gray" 
            data-student-pack-id="${studentPack.id}">
              <i class="bi bi-eye"></i>
            </a>
            <a class="icon-button js-edit-button" 
            style="color: var(--primary-color)" 
            data-student-pack-id="${studentPack.id}">
              <i class="bi bi-pencil"></i>
            </a>
            <a class="icon-button js-delete-button" 
            style="color: #dd0000ff" 
            data-student-pack-id="${studentPack.id}">
              <i class="bi bi-trash"></i>
            </a>
          </td>
        </tr>
      `;
    });
  },

  renderStudentPackViewPopUp(studentPackDetails, popUp) {
    const studentPackData = popUp.querySelector(".js-student-data");

    // Render basic info
    studentPackData.querySelector(".js-student-name").innerHTML =
      studentPackDetails.studentName || "";
    studentPackData.querySelector(".js-student-phone-number").innerHTML =
      studentPackDetails.studentPhoneNumber || "";
    studentPackData.querySelector(".js-student-first-payment").innerHTML =
      studentPackDetails.studentFirstPaymentStatus;
    studentPackData.querySelector(".js-student-second-payment").innerHTML =
      studentPackDetails.studentLastPaymentStatus;

    // Render coupons
    const couponsContainer = studentPackData.querySelector(".js-coupons");
    couponsContainer.innerHTML = "";

    studentPackDetails.studentCoupons.forEach((coupon) => {
      const code = coupon.code || "";
      const percentage = coupon.discountPercentage || 0;
      const expiryDate = coupon.expiryDate || "";
      const isUsed = coupon.isUsed || false;

      // Format expiry date to readable format (only if not used)
      let formattedDate = "N/A";
      if (expiryDate && !isUsed) {
        const date = new Date(expiryDate);
        const now = new Date();

        // Check if expired
        if (date < now) {
          formattedDate = "Expired";
        } else {
          formattedDate = date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      }

      couponsContainer.innerHTML += `
        <div class="card">
          <div class="row">
            <div class="row-view-cell">
              <i class="bi bi-ticket"></i>
              <div class="content">
                <p>Code</p>
                <p>${code}</p>
              </div>
            </div>
            <div class="row-view-cell">
              <i class="bi bi-percent"></i>
              <div class="content">
                <p>Discount</p>
                <p>${percentage}%</p>
              </div>
            </div>
          </div>
          <div class="row">
            ${
              !isUsed
                ? `
            <div class="row-view-cell">
              <i class="bi bi-calendar"></i>
              <div class="content">
                <p>Valid Until</p>
                <p>${formattedDate}</p>
              </div>
            </div>
            `
                : ""
            }
            <div class="row-view-cell">
              <i class="bi bi-${isUsed ? "check-circle-fill" : "circle"}"></i>
              <div class="content">
                <p>Status</p>
                <p>${isUsed ? "Used" : "Not Used"}</p>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    // Render pack products
    const packsContainer = studentPackData.querySelector(".js-packs-content");
    packsContainer.innerHTML = "";

    packsContainer.innerHTML += `
      <div class="card" data-pack-id="${studentPackDetails.pack.id}">
        <div class="card-title">
          <span class="special">${studentPackDetails.pack.name}</span>
          <p>${studentPackDetails.pack.price} EGP</p>
        </div>
        <div>
          <p>Items Included:</p>
          <div class="pack-products">
            ${studentPackDetails.pack.packProducts
              .map((packProduct) => {
                const selectedSize =
                  packProduct.sizes.find((s) => s.isSelected)?.size || "";
                const selectedOptions = packProduct.options
                  .map((option) => {
                    const selected = option.values.find((v) => v.isSelected);
                    return selected ? `[${selected.value}]` : "";
                  })
                  .filter((v) => v)
                  .join("-");

                return `<span class="product">${packProduct.name} (${selectedSize}) ${selectedOptions}</span>`;
              })
              .join(" ")}
          </div>
        </div>
      </div>
    `;

    // Render extras
    const extrasContainer = studentPackData.querySelector(".js-extras-content");
    extrasContainer.innerHTML = "";

    studentPackDetails.extras.forEach((extra) => {
      const selectedSize = extra.sizes.find((s) => s.isSelected)?.size || "";
      const selectedOptions = extra.options
        .map((option) => {
          const selected = option.values.find((v) => v.isSelected);
          return selected ? `[${selected.value}]` : "";
        })
        .filter((v) => v)
        .join("-");

      extrasContainer.innerHTML += `
        <div class="card">
          <div class="card-title">
            <span class="product">${extra.name} (${selectedSize}) ${selectedOptions}</span>
            <p>Price: ${extra.price} EGP</p>
          </div>
        </div>
      `;
    });
  },

  renderStudentPackEditPopUp(studentPackDetails, popUp) {
    // Render coupons
    const couponsContainer = popUp.querySelector(".js-coupons-content");
    couponsContainer.innerHTML = "";

    studentPackDetails.studentCoupons.forEach((coupon) => {
      const couponId = coupon.id || "";
      const code = coupon.code || "";
      const percentage = coupon.discountPercentage || "";
      const expiryDate = coupon.expiryDate || "";
      const isUsed = coupon.isUsed || false;

      // Check if expired
      const isExpired = expiryDate ? new Date(expiryDate) < new Date() : false;

      // Determine if coupon should be disabled (used or expired)
      const isDisabled = isUsed || isExpired;

      // Render with disabled state if used or expired
      couponsContainer.innerHTML += `
        <div class="card js-coupon-card" data-coupon-id="${couponId}">
          ${
            isUsed
              ? '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;"><i class="bi bi-check-circle-fill" style="color: green;"></i><span style="color: green; font-weight: 500;">Used Coupon</span></div>'
              : ""
          }
          ${
            isExpired
              ? '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;"><i class="bi bi-exclamation-circle-fill" style="color: #dd0000ff;"></i><span style="color: #dd0000ff; font-weight: 500;">Expired Coupon</span></div>'
              : ""
          }
          <div class="row">
                <div class="row-cell">
                <label for="coupon-code">Coupon Code</label>
                <div class="code-input-wrapper">
                    <input
                    type="text"
                    name="coupon-code"
                    value="${code}"
                    placeholder="Enter code"
                    ${isDisabled ? "disabled" : ""}
                    />
                    <button class="primary-button primary-icon-button js-generate-code" ${
                      isDisabled ? "disabled" : ""
                    }>
                    <i class="bi bi-arrow-clockwise"></i>
                    </button>
                </div>
                </div>
                <div class="row-cell">
                <label for="coupon-percentage">Percentage</label>
                <div class="code-input-wrapper">
                    <input
                    type="number"
                    name="coupon-percentage"
                    value="${percentage}"
                    placeholder="%"
                    min="0"
                    max="100"
                    ${isDisabled ? "disabled" : ""}
                    />
                    
                </div>
                </div>
                <div class="row-cell">
                <label for="coupon-valid-until">Valid Until</label>
                <div class="code-input-wrapper">
                    <input type="datetime-local"
                    name="coupon-valid-until"
                    value="${expiryDate}"
                    ${isDisabled ? "disabled" : ""}>
                    <button class="primary-button remove-icon-button js-remove-coupon" data-coupon-id="${couponId}">
                      <i class="bi bi-trash"></i>
                    </button>
                </div>
                </div>
            </div>
        </div>
      `;
    });

    // Render pack products
    const packsContainer = popUp
      .querySelector(".js-student-data")
      .querySelector(".js-packs-content");

    packsContainer.innerHTML = "";

    studentPackDetails.pack.packProducts.forEach((packProduct) => {
      packsContainer.innerHTML += `
        <div class="card" data-pack-product-id="${packProduct.id}">
          <div class="card-title">
            <h3>${packProduct.name}</h3>
          </div>
          <div class="user-values">
            <div>
              <label>Size Label</label>
              <select name="size">
                <option selected disabled>Choose Size</option>
                ${packProduct.sizes
                  .map(
                    (size) =>
                      `<option ${size.isSelected ? "selected" : ""} value="${
                        size.id
                      }">${size.size}</option>`
                  )
                  .join("")}
              </select>
            </div>
          </div>
          <div class="user-values">
            ${packProduct.options
              .map((option) => {
                return `
                  <div>
                    <label>${option.name}</label>
                    <select name="option-${option.id}">
                      <option selected disabled>Choose Option</option>
                      ${option.values
                        .map(
                          (value) =>
                            `<option ${value.isSelected ? "selected" : ""}>${
                              value.value
                            }</option>`
                        )
                        .join("")}
                    </select>
                  </div>
                `;
              })
              .join("")}
          </div>
          <div class="user-values">
            ${packProduct.customs
              .map((custom) => {
                if (custom.type === "Text") {
                  return `
                    <div>
                      <label>${custom.name}</label>
                      <input 
                        type="text" 
                        name="custom-${custom.id}" 
                        value="${custom.value}" 
                        placeholder="Enter ${custom.name}" 
                      />
                    </div>
                  `;
                } else {
                  // Photo type
                  const currentPhoto = custom.value || "";
                  // Extract filename from URL (everything after the last underscore before the extension)
                  let displayName = "";
                  if (currentPhoto) {
                    const parts = currentPhoto.split("/").pop(); // Get filename
                    const match = parts.match(
                      /_([^_]+\.(jpg|jpeg|png|gif|webp))$/i
                    );
                    displayName = match ? match[1] : parts;
                  }
                  return `
                    <div>
                      <label>${custom.name}</label>
                      ${
                        currentPhoto
                          ? `<span class="custom-photo-link" onclick="window.open('${currentPhoto}', '_blank')" style="cursor: pointer; font-size: 12px; color: var(--primary-color); text-decoration: underline; display: block; margin: 4px 0;">${displayName}</span>`
                          : ""
                      }
                      <input 
                        type="file" 
                        name="custom-${custom.id}" 
                        accept="image/*"
                      />
                    </div>
                  `;
                }
              })
              .join("")}
          </div>
        </div>
      `;
    });

    // Render extras
    const extrasContainer = popUp
      .querySelector(".js-student-data")
      .querySelector(".js-extras-content");

    extrasContainer.innerHTML = "";

    studentPackDetails.extras.forEach((extraProduct) => {
      extrasContainer.innerHTML += `
        <div class="card" data-extra-product-id="${extraProduct.id}">
          <div class="card-title">
            <h3>${extraProduct.name}</h3>
          </div>
          <div class="user-values">
            <div>
              <label>Size Label</label>
              <select name="size">
                <option selected disabled>Choose Size</option>
                ${extraProduct.sizes
                  .map(
                    (size) =>
                      `<option ${size.isSelected ? "selected" : ""} value="${
                        size.id
                      }">${size.size}</option>`
                  )
                  .join("")}
              </select>
            </div>
          </div>
          <div class="user-values">
            ${extraProduct.options
              .map((option) => {
                return `
                  <div>
                    <label>${option.name}</label>
                    <select name="option-${option.id}">
                      <option selected disabled>Choose Option</option>
                      ${option.values
                        .map(
                          (value) =>
                            `<option ${value.isSelected ? "selected" : ""}>${
                              value.value
                            }</option>`
                        )
                        .join("")}
                    </select>
                  </div>
                `;
              })
              .join("")}
          </div>
          <div class="user-values">
            ${extraProduct.customs
              .map((custom) => {
                if (custom.type === "Text") {
                  return `
                    <div>
                      <label>${custom.name}</label>
                      <input 
                        type="text" 
                        name="custom-${custom.id}" 
                        value="${custom.value}" 
                        placeholder="Enter ${custom.name}" 
                      />
                    </div>
                  `;
                } else {
                  // Photo type
                  const currentPhoto = custom.value || "";
                  // Extract filename from URL (everything after the last underscore before the extension)
                  let displayName = "";
                  if (currentPhoto) {
                    const parts = currentPhoto.split("/").pop(); // Get filename
                    const match = parts.match(
                      /_([^_]+\.(jpg|jpeg|png|gif|webp))$/i
                    );
                    displayName = match ? match[1] : parts;
                  }
                  return `
                    <div>
                      <label>${custom.name}</label>
                      ${
                        currentPhoto
                          ? `<span class="custom-photo-link" onclick="window.open('${currentPhoto}', '_blank')" style="cursor: pointer; font-size: 12px; color: var(--primary-color); text-decoration: underline; display: block; margin: 4px 0;">${displayName}</span>`
                          : ""
                      }
                      <input 
                        type="file" 
                        name="custom-${custom.id}" 
                        accept="image/*"
                      />
                    </div>
                  `;
                }
              })
              .join("")}
          </div>
        </div>
      `;
    });
  },

  Events: {
    async setupStudentsUI() {
      const schools = await API.Schools.getAllSchools();
      console.log(schools);
      StudentsUI.renderSchoolsDropdown(schools);
      StudentsUI.hideSchoolPacksDropdown();

      const schoolsDropdown = document.querySelector(".js-schools-dropdown");
      const schoolPacksDropdown = document.querySelector(
        ".js-school-packs-dropdown"
      );

      // School dropdown change event
      schoolsDropdown.addEventListener("change", async (e) => {
        const selectedSchoolId = e.target.value;

        const school = await API.Schools.getSchoolById(selectedSchoolId);
        StudentsUI.currentSchool = school;

        const tableContainer = document.querySelector(".js-table-container");
        tableContainer.style.display = "none";

        const pageMainData = document.querySelector(".js-page-main-data");
        pageMainData.querySelector(".card").innerHTML = `
          <div class="choose js-choose">
            <i class="bi bi-box-seam"></i>
            <p>Choose pack to get started</p>
          </div>
        `;

        StudentsUI.renderSchoolPacksDropdown(school);
      });

      // Pack dropdown change event
      schoolPacksDropdown.addEventListener("change", async (e) => {
        const selectedPackId = e.target.value;
        const chooseElement = document.querySelector(".js-choose");
        if (chooseElement) chooseElement.style.display = "none";

        const selectedPack = StudentsUI.currentSchool?.packs?.find(
          (pack) => pack.id === selectedPackId
        );

        if (!selectedPack) {
          console.error("Pack not found");
          return;
        }

        const products = selectedPack.products || [];
        const studentPacks = await API.StudentPacks.getAllStudentPacks(
          selectedPackId
        );

        const tableContainer = document.querySelector(".js-table-container");
        tableContainer.style.display = "flex";
        tableContainer.style.flexDirection = "column";

        StudentsUI.renderStudentsTable(studentPacks, products);
      });

      const studentsTableBody = document.querySelector(
        ".js-students-table tbody"
      );

      // View button event listener
      studentsTableBody.addEventListener("click", async (e) => {
        if (e.target.closest(".js-view-button")) {
          const button = e.target.closest(".js-view-button");
          const studentPackId = button.dataset.studentPackId;

          const viewStudentPackPopUp =
            document.querySelector(".js-view-pop-up");

          Utilis.Events.openClosePopUp(viewStudentPackPopUp);

          const studentPackDetails =
            await API.StudentPacks.getStudentPackDetails(studentPackId);
          console.log(studentPackDetails);

          StudentsUI.renderStudentPackViewPopUp(
            studentPackDetails,
            viewStudentPackPopUp
          );
        }
      });

      // Edit button event listener
      studentsTableBody.addEventListener("click", async (e) => {
        if (e.target.closest(".js-edit-button")) {
          const button = e.target.closest(".js-edit-button");
          const studentPackId = button.dataset.studentPackId;

          const editStudentPackPopUp =
            document.querySelector(".js-edit-pop-up");

          Utilis.Events.openClosePopUp(editStudentPackPopUp);

          const studentPackDetails =
            await API.StudentPacks.getStudentPackDetails(studentPackId);
          console.log(studentPackDetails);

          StudentsUI.renderStudentPackEditPopUp(
            studentPackDetails,
            editStudentPackPopUp
          );

          // Setup coupon controls
          StudentsUI.Events.setupCouponControls(editStudentPackPopUp);

          StudentsUI.Events.submitStudentPackData(
            editStudentPackPopUp,
            studentPackId
          );
        }
      });

      // Delete button event listener
      studentsTableBody.addEventListener("click", async (e) => {
        if (e.target.closest(".js-delete-button")) {
          const button = e.target.closest(".js-delete-button");
          const studentPackId = button.dataset.studentPackId;

          const confirmed = confirm(
            "Are you sure you want to delete this student pack?"
          );

          if (confirmed) {
            try {
              await API.StudentPacks.deleteStudentPack(studentPackId);
              console.log(`Student pack with ID ${studentPackId} was deleted`);
              showToast("Student pack deleted successfully!", "success");
              setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
              console.error("Failed to delete student pack:", error);
              showToast(
                error.message ||
                  "Failed to delete student pack. Please try again.",
                "error"
              );
            }
          }
        }
      });
    },

    setupCouponControls(popUp) {
      // Add Coupon button
      const addCouponButton = popUp.querySelector(".js-add-coupon");
      if (addCouponButton) {
        addCouponButton.addEventListener("click", () => {
          const couponsContainer = popUp.querySelector(".js-coupons-content");

          const newCouponCard = document.createElement("div");
          newCouponCard.className = "card js-coupon-card";
          newCouponCard.innerHTML = `
            <div class="row">
                <div class="row-cell">
                <label for="coupon-code">Coupon Code</label>
                <div class="code-input-wrapper">
                    <input
                    type="text"
                    name="coupon-code"
                    value=""
                    placeholder="Enter code"
                    />
                    <button class="primary-button primary-icon-button js-generate-code">
                    <i class="bi bi-arrow-clockwise"></i>
                    </button>
                </div>
                </div>
                <div class="row-cell">
                <label for="coupon-percentage">Percentage</label>
                <div class="code-input-wrapper">
                    <input
                    type="number"
                    name="coupon-percentage"
                    value=""
                    placeholder="%"
                    min="0"
                    max="100"
                    />
                    
                </div>
                </div>
                <div class="row-cell">
                <label for="coupon-valid-until">Valid Until</label>
                <div class="code-input-wrapper">
                    <input type="datetime-local" name="coupon-valid-until" value="">
                    <button class="primary-button remove-icon-button js-remove-coupon">
                    <i class="bi bi-trash"></i>
                    </button>
                </div>
                </div>
            </div>
          `;

          couponsContainer.appendChild(newCouponCard);
        });
      }

      // Generate/Remove buttons (using event delegation)
      const couponsContainer = popUp.querySelector(".js-coupons-content");
      couponsContainer.addEventListener("click", (e) => {
        if (e.target.closest(".js-generate-code")) {
          const button = e.target.closest(".js-generate-code");
          const card = button.closest(".js-coupon-card");
          const codeInput = card.querySelector("input[name='coupon-code']");

          if (codeInput) {
            codeInput.value = Utilis.generateRandomCode();
          }
        } else if (e.target.closest(".js-remove-coupon")) {
          const button = e.target.closest(".js-remove-coupon");
          const card = button.closest(".js-coupon-card");

          if (card) {
            card.remove();
          }
        }
      });
    },

    submitStudentPackData(popUp, studentPackId) {
      const submitButton = popUp.querySelector(".js-save-edit-button");

      submitButton.addEventListener("click", async () => {
        try {
          // Collect coupon data as array
          const coupons = [];
          const couponCards = popUp.querySelectorAll(".js-coupon-card");

          couponCards.forEach((card) => {
            const couponId = card.dataset.couponId || "";
            const code =
              card.querySelector("input[name='coupon-code']")?.value || "";
            const percentage =
              card.querySelector("input[name='coupon-percentage']")?.value ||
              "";
            const validUntil =
              card.querySelector("input[name='coupon-valid-until']")?.value ||
              "";

            if (code && percentage) {
              coupons.push({
                id: couponId,
                code: code,
                discountPercentage: parseInt(percentage),
                expiryDate: validUntil,
              });
            }
          });

          console.log(coupons);

          // Update coupons (main info)
          if (coupons.length > 0) {
            await API.StudentPacks.updateStudentPackMainInfo(
              studentPackId,
              coupons
            );
            console.log("Coupons updated successfully");
          }

          // Collect pack products as array
          const packProductCards = popUp.querySelectorAll(
            ".js-packs-content .card[data-pack-product-id]"
          );

          const packProducts = [];

          packProductCards.forEach((packProductCard) => {
            const packProductId = packProductCard.dataset.packProductId;

            // Get the actual size value (text content) instead of ID
            const sizeSelect = packProductCard.querySelector(
              "select[name='size']"
            );
            const selectedSize =
              sizeSelect?.options[sizeSelect.selectedIndex]?.text || "";

            const selectedOptions = {};
            packProductCard
              .querySelectorAll("select[name^='option-']")
              .forEach((select) => {
                const optionId = select.name.replace("option-", "");
                // Get the actual option value (text content)
                const optionValue =
                  select.options[select.selectedIndex]?.text || "";
                selectedOptions[optionId] = optionValue;
              });

            const selectedCustoms = {};
            packProductCard
              .querySelectorAll("input[name^='custom-']")
              .forEach((input) => {
                const customId = input.name.replace("custom-", "");
                const value =
                  input.type === "file"
                    ? input.files?.[0]?.name || ""
                    : input.value.trim();
                selectedCustoms[customId] = value;
              });

            packProducts.push({
              id: packProductId,
              selectedSize: selectedSize,
              selectedOptions: selectedOptions,
              selectedCustoms: selectedCustoms,
            });
          });

          console.log(packProducts);

          // Update pack products
          if (packProducts.length > 0) {
            await API.StudentPacks.updateStudentPackProducts(
              studentPackId,
              packProducts
            );
            console.log("Pack products updated successfully");
          }

          // Update pack product photo customs separately
          for (const packProductCard of packProductCards) {
            const packProductId = packProductCard.dataset.packProductId;

            const photoInputs = packProductCard.querySelectorAll(
              "input[type='file'][name^='custom-']"
            );

            for (const input of photoInputs) {
              if (input.files && input.files[0]) {
                const customId = input.name.replace("custom-", "");
                const imageFile = input.files[0];

                await API.StudentPacks.updateStudentProductCustomPhoto(
                  studentPackId,
                  packProductId,
                  "Pack",
                  customId,
                  imageFile
                );
                console.log(
                  `Photo custom ${customId} updated for pack product ${packProductId}`
                );
              }
            }
          }

          // Collect extra products as array
          const extraProductCards = popUp.querySelectorAll(
            ".js-extras-content .card[data-extra-product-id]"
          );

          const extraProducts = [];

          extraProductCards.forEach((extraProductCard) => {
            const extraProductId = extraProductCard.dataset.extraProductId;

            // Get the actual size value (text content) instead of ID
            const sizeSelect = extraProductCard.querySelector(
              "select[name='size']"
            );
            const selectedSize =
              sizeSelect?.options[sizeSelect.selectedIndex]?.text || "";

            const selectedOptions = {};
            extraProductCard
              .querySelectorAll("select[name^='option-']")
              .forEach((select) => {
                const optionId = select.name.replace("option-", "");
                // Get the actual option value (text content)
                const optionValue =
                  select.options[select.selectedIndex]?.text || "";
                selectedOptions[optionId] = optionValue;
              });

            const selectedCustoms = {};
            extraProductCard
              .querySelectorAll("input[name^='custom-']")
              .forEach((input) => {
                const customId = input.name.replace("custom-", "");
                const value =
                  input.type === "file"
                    ? input.files?.[0]?.name || ""
                    : input.value.trim();
                selectedCustoms[customId] = value;
              });

            extraProducts.push({
              id: extraProductId,
              selectedSize: selectedSize,
              selectedOptions: selectedOptions,
              selectedCustoms: selectedCustoms,
            });
          });

          console.log(extraProducts);

          // Update extra products
          if (extraProducts.length > 0) {
            await API.StudentPacks.updateStudentPackExtras(
              studentPackId,
              extraProducts
            );
            console.log("Extra products updated successfully");
          }

          // Update extra product photo customs separately
          for (const extraProductCard of extraProductCards) {
            const extraProductId = extraProductCard.dataset.extraProductId;

            const photoInputs = extraProductCard.querySelectorAll(
              "input[type='file'][name^='custom-']"
            );

            for (const input of photoInputs) {
              if (input.files && input.files[0]) {
                const customId = input.name.replace("custom-", "");
                const imageFile = input.files[0];

                await API.StudentPacks.updateStudentProductCustomPhoto(
                  studentPackId,
                  extraProductId,
                  "Extra",
                  customId,
                  imageFile
                );
                console.log(
                  `Photo custom ${customId} updated for extra product ${extraProductId}`
                );
              }
            }
          }

          showToast("Student pack updated successfully!", "success");
          togglePopUpOff(popUp);
          setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
          console.error("Failed to update student pack:", error);
          showToast(
            error.message || "Failed to update student pack. Please try again.",
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
    await StudentsUI.Events.setupStudentsUI();
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

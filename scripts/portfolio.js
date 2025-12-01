import {
  togglePopUpOff,
  togglePopUpOn,
  showServerDownPage,
  isServerError,
  showToast,
  showLandscapeRecommendation,
} from "./utilis/pop-ups.js";
import { Collection } from "./data/collection.js";
import { Category } from "./data/category.js";
import { ContentSlide } from "./data/banner.js";
import { AdSlide } from "./data/banner.js";
import { School } from "./data/school.js";

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
  Collections: {
    async getAllCollections() {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageCollection/GetAllCollections`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error(`HTTP ${response.status}: Failed to fetch collections`);
          return [];
        }

        const result = await response.json();
        console.log(result);

        const collections = result.map(
          (collection) => new Collection(collection)
        );
        return collections;
      } catch (error) {
        console.error("getAllCollections error:", error);
        // Re-throw network errors
        if (error instanceof TypeError || error.message?.includes("fetch")) {
          throw error;
        }
        return [];
      }
    },

    async getCollection(collectionId) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageCollection/GetCollectionById/${collectionId}`,
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
            throw new Error(`Collection not found with ID: ${collectionId}`);
          }
          throw new Error(error.message || "Failed to fetch collection");
        }

        const result = await response.json();
        const collection = new Collection(result);
        return collection;
      } catch (error) {
        console.error("getCollection error:", error);
        throw error;
      }
    },

    async addCollection(collectionData) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageCollection/AddCollection`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(collectionData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 400) {
            throw new Error(
              "Invalid collection data. Please check all fields."
            );
          } else if (error.statusCode === 422) {
            throw new Error(error.message || "Collection validation failed.");
          } else if (error.statusCode === 409) {
            throw new Error("A collection with this name already exists.");
          }
          throw new Error(error.message || "Failed to add collection");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("addCollection error:", error);
        throw error;
      }
    },

    async addCollectionImages(collectionId, collectionImageFiles) {
      const formData = new FormData();

      collectionImageFiles.forEach((collectionImageFile) => {
        formData.append("ImageFiles", collectionImageFile);
      });

      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageCollection/AddCollectionImages/${collectionId}`,
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
            throw new Error(`Collection not found with ID: ${collectionId}`);
          } else if (error.statusCode === 400) {
            throw new Error("Invalid image files.");
          } else if (error.statusCode === 500) {
            throw new Error("Image upload failed. Please try again.");
          }
          throw new Error(error.message || "Failed to add collection images");
        }

        return response;
      } catch (error) {
        console.error("addCollectionImages error:", error);
        throw error;
      }
    },

    async updateCollection(oldCollectionId, newCollectionData) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageCollection/UpdateCollection/${oldCollectionId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newCollectionData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`Collection not found with ID: ${oldCollectionId}`);
          } else if (error.statusCode === 400) {
            throw new Error(
              "Invalid collection data. Please check all fields."
            );
          } else if (error.statusCode === 422) {
            throw new Error(error.message || "Collection validation failed.");
          } else if (error.statusCode === 409) {
            throw new Error("A collection with this name already exists.");
          }
          throw new Error(error.message || "Failed to update collection");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("updateCollection error:", error);
        throw error;
      }
    },

    async updateCollectionImages(collectionId, collectionImageFiles) {
      const formData = new FormData();

      collectionImageFiles.forEach((collectionImageFile) => {
        formData.append("ImageFiles", collectionImageFile);
      });

      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageCollection/UpdateCollectionImages/${collectionId}`,
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
            throw new Error(`Collection not found with ID: ${collectionId}`);
          } else if (error.statusCode === 400) {
            throw new Error("Invalid image files.");
          } else if (error.statusCode === 500) {
            throw new Error("Image update failed. Please try again.");
          }
          throw new Error(
            error.message || "Failed to update collection images"
          );
        }

        return response;
      } catch (error) {
        console.error("updateCollectionImages error:", error);
        throw error;
      }
    },
  },

  ContentSlides: {
    async getAllContentSlides() {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageBanner/GetAllContentSlides`,
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
            `HTTP ${response.status}: Failed to fetch content slides`
          );
          return [];
        }

        const result = await response.json();
        console.log(result);

        const contentSlides = result.map(
          (contentSlide) => new ContentSlide(contentSlide)
        );
        return contentSlides;
      } catch (error) {
        console.error("getAllContentSlides error:", error);
        // Re-throw network errors
        if (error instanceof TypeError || error.message?.includes("fetch")) {
          throw error;
        }
        return [];
      }
    },

    async getContentSlide(contentSlideId) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageBanner/GetContentSlide/${contentSlideId}`,
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
            throw new Error(
              `Content slide not found with ID: ${contentSlideId}`
            );
          }
          throw new Error(error.message || "Failed to fetch content slide");
        }

        const result = await response.json();
        const contentSlide = new ContentSlide(result);
        return contentSlide;
      } catch (error) {
        console.error("getContentSlide error:", error);
        throw error;
      }
    },

    async addContentSlide(contentSlideImageFile, title) {
      const formData = new FormData();

      formData.append("slideFile", contentSlideImageFile);

      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageBanner/AddContentSlide?title=${encodeURIComponent(
            title
          )}`,
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

          if (error.statusCode === 400) {
            throw new Error("Invalid slide file.");
          } else if (error.statusCode === 500) {
            throw new Error("Slide upload failed. Please try again.");
          }
          throw new Error(error.message || "Failed to add content slide");
        }

        return response;
      } catch (error) {
        console.error("addContentSlide error:", error);
        throw error;
      }
    },

    async updateContentSlide(oldContentSlideId, contentSlideImageFile, title) {
      const formData = new FormData();

      formData.append("slideFile", contentSlideImageFile);

      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageBanner/UpdateContentSlide/${oldContentSlideId}?title=${encodeURIComponent(
            title
          )}`,
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
            throw new Error(
              `Content slide not found with ID: ${oldContentSlideId}`
            );
          } else if (error.statusCode === 400) {
            throw new Error("Invalid slide file.");
          } else if (error.statusCode === 500) {
            throw new Error("Slide update failed. Please try again.");
          }
          throw new Error(error.message || "Failed to update content slide");
        }

        return response;
      } catch (error) {
        console.error("updateContentSlide error:", error);
        throw error;
      }
    },
  },

  AdSlides: {
    async getAllAdSlides() {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageBanner/GetAllAdSlides`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error(`HTTP ${response.status}: Failed to fetch ad slides`);
          return [];
        }

        const result = await response.json();
        console.log(result);

        const adSlides = result.map((adSlide) => new AdSlide(adSlide));
        return adSlides;
      } catch (error) {
        console.error("getAllAdSlides error:", error);
        // Re-throw network errors
        if (error instanceof TypeError || error.message?.includes("fetch")) {
          throw error;
        }
        return [];
      }
    },

    async getAdSlide(adSlideId) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageBanner/GetAdSlide/${adSlideId}`,
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
            throw new Error(`Ad slide not found with ID: ${adSlideId}`);
          }
          throw new Error(error.message || "Failed to fetch ad slide");
        }

        const result = await response.json();
        const adSlide = new AdSlide(result);
        return adSlide;
      } catch (error) {
        console.error("getAdSlide error:", error);
        throw error;
      }
    },

    async addAdSlide(adSlideData) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageBanner/AddAdSlide`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(adSlideData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 400) {
            throw new Error("Invalid ad slide data. Please check all fields.");
          } else if (error.statusCode === 422) {
            throw new Error(error.message || "Ad slide validation failed.");
          }
          throw new Error(error.message || "Failed to add ad slide");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("addAdSlide error:", error);
        throw error;
      }
    },

    async addAdSlideMedia(adSlideId, slideFile, logoFile) {
      const formData = new FormData();

      formData.append("slideFile", slideFile);
      formData.append("logoFile", logoFile);

      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageBanner/AddAdSlideMedia/${adSlideId}`,
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
            throw new Error(`Ad slide not found with ID: ${adSlideId}`);
          } else if (error.statusCode === 400) {
            throw new Error("Invalid media files.");
          } else if (error.statusCode === 500) {
            throw new Error("Media upload failed. Please try again.");
          }
          throw new Error(error.message || "Failed to add ad slide media");
        }

        return response;
      } catch (error) {
        console.error("addAdSlideMedia error:", error);
        throw error;
      }
    },

    async updateAdSlide(oldAdSlideId, newAdSlideData) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageBanner/UpdateAdSlide/${oldAdSlideId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newAdSlideData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`Ad slide not found with ID: ${oldAdSlideId}`);
          } else if (error.statusCode === 400) {
            throw new Error("Invalid ad slide data. Please check all fields.");
          } else if (error.statusCode === 422) {
            throw new Error(error.message || "Ad slide validation failed.");
          }
          throw new Error(error.message || "Failed to update ad slide");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("updateAdSlide error:", error);
        throw error;
      }
    },

    async updateAdSlideMedia(adSlideId, slideFile, logoFile) {
      const formData = new FormData();

      if (slideFile) {
        formData.append("slideFile", slideFile);
      }
      if (logoFile) {
        formData.append("logoFile", logoFile);
      }

      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageBanner/UpdateAdSlideMedia/${adSlideId}`,
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
            throw new Error(`Ad slide not found with ID: ${adSlideId}`);
          } else if (error.statusCode === 400) {
            throw new Error("Invalid media files.");
          } else if (error.statusCode === 500) {
            throw new Error("Media update failed. Please try again.");
          }
          throw new Error(error.message || "Failed to update ad slide media");
        }

        return response;
      } catch (error) {
        console.error("updateAdSlideMedia error:", error);
        throw error;
      }
    },

    async deleteAdSlide(adSlideId) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageBanner/DeleteAdSlide/${adSlideId}`,
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
            throw new Error(`Ad slide not found with ID: ${adSlideId}`);
          }
          throw new Error(error.message || "Failed to delete ad slide");
        }

        return response;
      } catch (error) {
        console.error("deleteAdSlide error:", error);
        throw error;
      }
    },
  },

  Categories: {
    async getAllCategories() {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageCategory/GetAllCategories`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error(`HTTP ${response.status}: Failed to fetch categories`);
          return [];
        }

        const result = await response.json();
        console.log(result);

        const categories = result.map((category) => new Category(category));
        return categories;
      } catch (error) {
        console.error("getAllCategories error:", error);
        // Re-throw network errors
        if (error instanceof TypeError || error.message?.includes("fetch")) {
          throw error;
        }
        return [];
      }
    },

    async getCategoryItem(categoryItemId) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageCategory/GetCategoryItemById/${categoryItemId}`,
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
            throw new Error(
              `Category item not found with ID: ${categoryItemId}`
            );
          }
          throw new Error(error.message || "Failed to fetch category item");
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error("getCategoryItem error:", error);
        throw error;
      }
    },

    async addCategoryItem(categoryItemData) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageCategory/AddCategoryItem`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(categoryItemData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 400) {
            throw new Error(
              "Invalid category item data. Please check all fields."
            );
          } else if (error.statusCode === 422) {
            throw new Error(
              error.message || "Category item validation failed."
            );
          } else if (error.statusCode === 409) {
            throw new Error("A category item with this name already exists.");
          }
          throw new Error(error.message || "Failed to add category item");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("addCategoryItem error:", error);
        throw error;
      }
    },

    async addCategoryItemImages(categoryItemId, imageFiles) {
      const formData = new FormData();

      imageFiles.forEach((imageFile) => {
        formData.append("ImageFiles", imageFile);
      });

      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageCategory/AddCategoryItemImage/${categoryItemId}`,
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
            throw new Error(
              `Category item not found with ID: ${categoryItemId}`
            );
          } else if (error.statusCode === 400) {
            throw new Error("Invalid image files.");
          } else if (error.statusCode === 500) {
            throw new Error("Image upload failed. Please try again.");
          }
          throw new Error(
            error.message || "Failed to add category item images"
          );
        }

        return response;
      } catch (error) {
        console.error("addCategoryItemImages error:", error);
        throw error;
      }
    },

    async updateCategoryItem(categoryItemId, categoryItemData) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageCategory/UpdateCategoryItem/${categoryItemId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(categoryItemData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(
              `Category item not found with ID: ${categoryItemId}`
            );
          } else if (error.statusCode === 400) {
            throw new Error(
              "Invalid category item data. Please check all fields."
            );
          } else if (error.statusCode === 422) {
            throw new Error(
              error.message || "Category item validation failed."
            );
          } else if (error.statusCode === 409) {
            throw new Error("A category item with this name already exists.");
          }
          throw new Error(error.message || "Failed to update category item");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("updateCategoryItem error:", error);
        throw error;
      }
    },

    async updateCategoryItemImages(categoryItemId, imageFiles) {
      const formData = new FormData();

      imageFiles.forEach((imageFile) => {
        formData.append("ImageFiles", imageFile);
      });

      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageCategory/UpdateCategoryItemImages/${categoryItemId}`,
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
            throw new Error(
              `Category item not found with ID: ${categoryItemId}`
            );
          } else if (error.statusCode === 400) {
            throw new Error("Invalid image files.");
          } else if (error.statusCode === 500) {
            throw new Error("Image update failed. Please try again.");
          }
          throw new Error(
            error.message || "Failed to update category item images"
          );
        }

        return response;
      } catch (error) {
        console.error("updateCategoryItemImages error:", error);
        throw error;
      }
    },
  },

  Info: {
    async getAboutUs() {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageInfo/GetAboutUs`,
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
          throw new Error(error.message || "Failed to fetch About Us");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("getAboutUs error:", error);
        throw error;
      }
    },

    async updateAboutUs(newValue) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageInfo/UpdateAboutUs`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newValue),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 400) {
            throw new Error("Invalid About Us data.");
          } else if (error.statusCode === 422) {
            throw new Error(error.message || "About Us validation failed.");
          }
          throw new Error(error.message || "Failed to update About Us");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("updateAboutUs error:", error);
        throw error;
      }
    },

    async getContactUs() {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageInfo/GetContactUs`,
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
          throw new Error(error.message || "Failed to fetch Contact Us");
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error("getContactUs error:", error);
        throw error;
      }
    },

    async addContactUs(key, value) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageInfo/AddContactUs`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ key, value }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 400) {
            throw new Error(
              "Invalid Contact Us data. Key and value are required."
            );
          } else if (error.statusCode === 422) {
            throw new Error(error.message || "Contact Us validation failed.");
          } else if (error.statusCode === 409) {
            throw new Error("A contact entry with this key already exists.");
          }
          throw new Error(error.message || "Failed to add Contact Us");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("addContactUs error:", error);
        throw error;
      }
    },

    async updateContactUs(id, newValue) {
      try {
        const token = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/ManageInfo/UpdateContactUs/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: `"${newValue}"`,
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);

          if (error.statusCode === 404) {
            throw new Error(`Contact Us entry not found with ID: ${id}`);
          } else if (error.statusCode === 400) {
            throw new Error("Invalid Contact Us value.");
          } else if (error.statusCode === 422) {
            throw new Error(error.message || "Contact Us validation failed.");
          }
          throw new Error(error.message || "Failed to update Contact Us");
        }

        const result = await response.text();
        return result;
      } catch (error) {
        console.error("updateContactUs error:", error);
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

  async sendNotification(notificationData) {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/Notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        try {
          const error = await response.json();
          console.error(`Error ${error.statusCode}: ${error.message}`);
          throw new Error(error.message || "Failed to send notification");
        } catch {
          throw new Error(
            `HTTP ${response.status}: Failed to send notification`
          );
        }
      }

      return await response.json();
    } catch (error) {
      console.error("sendNotification error:", error);
      throw error;
    }
  },
};

const Utilis = {
  Events: {
    openClosePopUp(popUp) {
      togglePopUpOn(popUp);

      const closeButtons = popUp.querySelectorAll(".js-close-button");

      const cancelButtons = popUp.querySelectorAll(".js-cancel-button");

      closeButtons.forEach((button) => {
        button.addEventListener("click", () => {
          togglePopUpOff(popUp);
        });
      });

      cancelButtons.forEach((button) => {
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
        `input[name='filesInput${uploadType}']`
      );
      const imagesPreview = popUp.querySelector(
        `.js-images-preview${uploadType}`
      );

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
          imagesPreview.classList.remove("active");
          return;
        }

        if (image instanceof File || image instanceof Blob) {
          imagesPreview.classList.add("active");

          const reader = new FileReader();

          reader.onload = (e) => {
            const previewItem = document.createElement("div");

            previewItem.className = "preview-item";
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="${image.name}">
                <button class="remove-image js-remove-button"><i class="bi bi-x"></i></button>
                <div class="image-name">${image.name}</div>
              `;

            imagesPreview.appendChild(previewItem);

            previewItem
              .querySelector(".js-remove-button")
              .addEventListener("click", () => {
                image = null;
                updatePreview();
              });
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

    getImagesData(popUp, existingObject = null) {
      const uploadButton = popUp.querySelector(".js-upload-button");
      const filesInput = popUp.querySelector("input[name='filesInput']");
      const imagesCount = popUp.querySelector(".js-images-count");
      const imagesPreview = popUp.querySelector(".js-images-preview");

      let images = [];

      async function initializeForEdit() {
        if (existingObject) {
          images = await Promise.all(
            existingObject.coverUrls.map(API.getImageProxy)
          );

          updatePreview();
        }
      }

      function updatePreview() {
        imagesPreview.innerHTML = "";

        const totalImages = images.length;

        if (totalImages === 0) {
          imagesPreview.classList.remove("active");
          imagesCount.classList.remove("active");

          imagesCount.textContent = "";
          return;
        }

        imagesPreview.classList.add("active");
        imagesCount.classList.add("active");

        imagesCount.textContent = `${images.length} image${
          images.length > 1 ? "s" : ""
        } selected`;

        images.forEach((file, index) => {
          const reader = new FileReader();

          reader.onload = (e) => {
            const previewItem = document.createElement("div");

            previewItem.className = "preview-item";
            previewItem.innerHTML = `
              <img src="${e.target.result}" alt="${file.name}">
              <button class="remove-image js-remove-button"><i class="bi bi-x"></i></button>
              <div class="image-name">${file.name}</div>
            `;

            imagesPreview.appendChild(previewItem);

            previewItem
              .querySelector(".js-remove-button")
              .addEventListener("click", () => {
                images.splice(index, 1);
                updatePreview();
              });
          };

          reader.readAsDataURL(file);
        });
      }

      uploadButton.addEventListener("click", () => filesInput.click());

      filesInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);

        if (files.length > 0) {
          images = [...images, ...files];

          updatePreview();
        }
      });

      updatePreview();

      initializeForEdit();

      Utilis.Events.getImagesDataGetter = function () {
        return images;
      };
    },
  },
};

const BannerUI = {
  renderContentSlides(contentSlides) {
    const bannerSectionCard = document.querySelector(".js-banner-section-card");

    const sectionCardContent = bannerSectionCard.querySelector(
      ".js-section-card-content"
    );

    const count = bannerSectionCard.querySelector(".js-count");

    count.innerHTML = `${contentSlides.length} editable sections`;

    if (contentSlides.length === 0) {
      sectionCardContent.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #6c757d;">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.3; margin-bottom: 20px;">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="15"></line>
            <line x1="15" y1="9" x2="9" y2="15"></line>
          </svg>
          <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #495057;">No Data Found</h3>
          <p style="font-size: 14px; margin: 0; color: #6c757d;">Add content slides to get started</p>
        </div>
      `;
      return;
    }

    contentSlides.forEach((contentSlide) => {
      sectionCardContent.innerHTML += `
        <div class="sub-section-sub-card">
          <div class="sub-section-sub-card-header">
            <div class="sub-section-sub-card-info">
              <h4 class="sub-section-sub-card-title">${contentSlide.title}</h4>
            </div>
            <a class="icon-button js-view-content-slide-button" style="color: gray" 
            data-content-slide-id="${contentSlide.id}"><i class="bi bi-eye"></i></a>
            <a
              class="icon-button js-edit-content-slide-button" data-content-slide-id="${contentSlide.id}"
              style="color: var(--primary-color)"
              ><i class="bi bi-pencil"></i
            ></a>
            <a
              class="icon-button js-delete-content-slide-button" data-content-slide-id="${contentSlide.id}"
              style="color: #dd0000ff"
              ><i class="bi bi-trash"></i
            ></a>
          </div>
        </div>
      `;
    });
  },

  renderContentSlideViewPopUp(contentSlide, popUp) {
    const titleInput = popUp.querySelector("input[name='content-slide-title']");
    const imagesPreview = popUp.querySelector(".js-images-preview");

    titleInput.value = contentSlide.title || "";

    imagesPreview.innerHTML = "";

    imagesPreview.classList.add("active");

    const previewItem = document.createElement("div");
    previewItem.className = "preview-item";
    previewItem.innerHTML = `
          <img src="${contentSlide.imageUrl}">
        `;

    imagesPreview.appendChild(previewItem);
  },

  renderContentSlideEditPopUp(contentSlide, popUp) {
    const titleInput = popUp.querySelector("input[name='content-slide-title']");
    const imagesPreview = popUp.querySelector(".js-images-preview");

    titleInput.value = contentSlide.title || "";

    imagesPreview.innerHTML = "";
    imagesPreview.classList.add("active");

    const previewItem = document.createElement("div");
    previewItem.className = "preview-item";
    previewItem.innerHTML = `
          <img src="${contentSlide.imageUrl}">
        `;
    imagesPreview.appendChild(previewItem);
  },

  renderAdSlides(adSlides) {
    const adSlideSectionCard = document.querySelector(".js-ads-section-card");

    const sectionCardContent = adSlideSectionCard.querySelector(
      ".js-section-card-content"
    );

    const count = adSlideSectionCard.querySelector(".js-count");

    count.innerHTML = `${adSlides.length} editable sections`;

    if (adSlides.length === 0) {
      sectionCardContent.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #6c757d;">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.3; margin-bottom: 20px;">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="15"></line>
            <line x1="15" y1="9" x2="9" y2="15"></line>
          </svg>
          <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #495057;">No Data Found</h3>
          <p style="font-size: 14px; margin: 0; color: #6c757d;">Add ad slides to get started</p>
        </div>
      `;
      return;
    }

    adSlides.forEach((adSlide) => {
      sectionCardContent.innerHTML += `
        <div class="sub-section-sub-card">
          <div class="sub-section-sub-card-header">
            <div class="sub-section-sub-card-info">
              <h4 class="sub-section-sub-card-title">${adSlide.title}</h4>
            </div>
            <a class="icon-button js-view-ad-slide-button" style="color: gray" 
            data-ad-slide-id="${adSlide.id}"><i class="bi bi-eye"></i></a>
            <a
              class="icon-button js-edit-ad-slide-button" data-ad-slide-id="${adSlide.id}"
              style="color: var(--primary-color)"
              ><i class="bi bi-pencil"></i
            ></a>
            <a
              class="icon-button js-delete-ad-slide-button" data-ad-slide-id="${adSlide.id}"
              style="color: #dd0000ff"
              ><i class="bi bi-trash"></i
            ></a>
          </div>
        </div>
      `;
    });
  },

  renderAdSlideViewPopUp(adSlide, popUp) {
    // Populate text fields
    const titleInput = popUp.querySelector("input[name='ad-slide-title']");
    const descriptionInput = popUp.querySelector(
      "textarea[name='ad-slide-description']"
    );
    const promoCodeInput = popUp.querySelector(
      "input[name='ad-slide-promo-code']"
    );
    const linkUrlInput = popUp.querySelector("input[name='ad-slide-link-url']");

    titleInput.value = adSlide.title || "";
    descriptionInput.value = adSlide.description || "";
    promoCodeInput.value = adSlide.promoCode || "";
    linkUrlInput.value = adSlide.linkUrl || "";

    // Display slide image
    const slideImagesPreview = popUp.querySelector(".js-images-preview-slide");
    slideImagesPreview.innerHTML = "";
    slideImagesPreview.classList.add("active");

    const slidePreviewItem = document.createElement("div");
    slidePreviewItem.className = "preview-item";
    slidePreviewItem.innerHTML = `<img src="${adSlide.imageUrl}">`;
    slideImagesPreview.appendChild(slidePreviewItem);

    // Display logo image
    const logoImagesPreview = popUp.querySelector(".js-images-preview-logo");
    logoImagesPreview.innerHTML = "";
    logoImagesPreview.classList.add("active");

    const logoPreviewItem = document.createElement("div");
    logoPreviewItem.className = "preview-item";
    logoPreviewItem.innerHTML = `<img src="${adSlide.logoUrl}">`;
    logoImagesPreview.appendChild(logoPreviewItem);
  },

  renderAdSlideEditPopUp(adSlide, popUp) {
    // Populate text fields
    const titleInput = popUp.querySelector("input[name='ad-slide-title']");
    const descriptionInput = popUp.querySelector(
      "textarea[name='ad-slide-description']"
    );
    const promoCodeInput = popUp.querySelector(
      "input[name='ad-slide-promo-code']"
    );
    const linkUrlInput = popUp.querySelector("input[name='ad-slide-link-url']");

    titleInput.value = adSlide.title || "";
    descriptionInput.value = adSlide.description || "";
    promoCodeInput.value = adSlide.promoCode || "";
    linkUrlInput.value = adSlide.linkUrl || "";

    // Display slide image
    const slideImagesPreview = popUp.querySelector(".js-images-preview-slide");
    slideImagesPreview.innerHTML = "";
    slideImagesPreview.classList.add("active");

    const slidePreviewItem = document.createElement("div");
    slidePreviewItem.className = "preview-item";
    slidePreviewItem.innerHTML = `<img src="${adSlide.imageUrl}">`;
    slideImagesPreview.appendChild(slidePreviewItem);

    // Display logo image
    const logoImagesPreview = popUp.querySelector(".js-images-preview-logo");
    logoImagesPreview.innerHTML = "";
    logoImagesPreview.classList.add("active");

    const logoPreviewItem = document.createElement("div");
    logoPreviewItem.className = "preview-item";
    logoPreviewItem.innerHTML = `<img src="${adSlide.logoUrl}">`;
    logoImagesPreview.appendChild(logoPreviewItem);
  },

  Events: {
    async setupContentSlideUI() {
      var contentSlides = await API.ContentSlides.getAllContentSlides();
      BannerUI.renderContentSlides(contentSlides);

      const addContentSlideButton = document.querySelector(
        ".js-add-content-slide-button"
      );

      addContentSlideButton.addEventListener("click", () => {
        const addContentSlidePopUp = document.querySelector(
          ".js-add-content-slide-pop-up"
        );
        Utilis.Events.openClosePopUp(addContentSlidePopUp);
        const getContentSlideImage =
          Utilis.Events.getImageData(addContentSlidePopUp);
        BannerUI.Events.submitContentSlideData(
          addContentSlidePopUp,
          "add",
          null,
          getContentSlideImage
        );
      });

      const viewContentSlideButtons = document.querySelectorAll(
        ".js-view-content-slide-button"
      );

      viewContentSlideButtons.forEach(async (button) => {
        button.addEventListener("click", async () => {
          const viewContentSlidePopUp = document.querySelector(
            ".js-view-content-slide-pop-up"
          );

          Utilis.Events.openClosePopUp(viewContentSlidePopUp);

          const contentSlideId = button.dataset.contentSlideId;

          console.log(contentSlideId);

          const contentSlide = await API.ContentSlides.getContentSlide(
            contentSlideId
          );

          console.log(contentSlide);

          BannerUI.renderContentSlideViewPopUp(
            contentSlide,
            viewContentSlidePopUp
          );
        });
      });

      const editContentSlideButtons = document.querySelectorAll(
        ".js-edit-content-slide-button"
      );

      editContentSlideButtons.forEach(async (button) => {
        button.addEventListener("click", async () => {
          const editContentSlidePopUp = document.querySelector(
            ".js-edit-content-slide-pop-up"
          );

          Utilis.Events.openClosePopUp(editContentSlidePopUp);

          const contentSlideId = button.dataset.contentSlideId;
          const conentSlide = await API.ContentSlides.getContentSlide(
            contentSlideId
          );

          BannerUI.renderContentSlideEditPopUp(
            conentSlide,
            editContentSlidePopUp
          );

          const getContentSlideImage = Utilis.Events.getImageData(
            editContentSlidePopUp,
            conentSlide.imageUrl
          );

          BannerUI.Events.submitContentSlideData(
            editContentSlidePopUp,
            "edit",
            contentSlideId,
            getContentSlideImage
          );
        });
      });
    },

    submitContentSlideData(
      popUp,
      mode = "add",
      contentSlideId = null,
      getContentSlideImage = null
    ) {
      const submitButton = popUp.querySelector(".js-submit-button");

      submitButton.addEventListener("click", async () => {
        const titleInput = popUp.querySelector(
          "input[name='content-slide-title']"
        );

        const title = titleInput.value.trim();
        var contentSlideImage = getContentSlideImage
          ? getContentSlideImage()
          : null;

        // Validate title
        if (!title) {
          showToast("Please enter a slide title.", "warning");
          return;
        }

        // Validate image is uploaded for add mode
        if (mode === "add" && !contentSlideImage) {
          showToast("Please upload a content slide image.", "warning");
          return;
        }

        try {
          if (mode === "add") {
            const result = await API.ContentSlides.addContentSlide(
              contentSlideImage,
              title
            );

            console.log(result);
            showToast("Content slide added successfully!", "success");
          } else {
            await API.ContentSlides.updateContentSlide(
              contentSlideId,
              contentSlideImage,
              title
            );
            showToast("Content slide updated successfully!", "success");
          }

          togglePopUpOff(popUp);
          setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
          console.error("Failed to save content slide:", error);
          showToast(
            error.message || "Failed to save content slide. Please try again.",
            "error"
          );
        }
      });
    },

    async setupAdSlideUI() {
      var adSlides = await API.AdSlides.getAllAdSlides();
      BannerUI.renderAdSlides(adSlides);

      const addAdSlideButton = document.querySelector(
        ".js-add-ad-slide-button"
      );

      addAdSlideButton.addEventListener("click", () => {
        const addAdSlidePopUp = document.querySelector(
          ".js-add-ad-slide-pop-up"
        );

        Utilis.Events.openClosePopUp(addAdSlidePopUp);

        const getSlideImage = Utilis.Events.getImageData(
          addAdSlidePopUp,
          null,
          "-slide"
        );
        const getLogoImage = Utilis.Events.getImageData(
          addAdSlidePopUp,
          null,
          "-logo"
        );

        BannerUI.Events.submitAdSlideData(
          addAdSlidePopUp,
          "add",
          null,
          getSlideImage,
          getLogoImage
        );
      });

      const viewAdSlideButtons = document.querySelectorAll(
        ".js-view-ad-slide-button"
      );

      viewAdSlideButtons.forEach(async (button) => {
        button.addEventListener("click", async () => {
          const viewAdSlidePopUp = document.querySelector(
            ".js-view-ad-slide-pop-up"
          );

          Utilis.Events.openClosePopUp(viewAdSlidePopUp);

          const adSlideId = button.dataset.adSlideId;
          console.log(adSlideId);

          const adSlide = await API.AdSlides.getAdSlide(adSlideId);
          console.log(adSlide);

          BannerUI.renderAdSlideViewPopUp(adSlide, viewAdSlidePopUp);
        });
      });

      const editAdSlideButtons = document.querySelectorAll(
        ".js-edit-ad-slide-button"
      );

      editAdSlideButtons.forEach(async (button) => {
        button.addEventListener("click", async () => {
          const editAdSlidePopUp = document.querySelector(
            ".js-edit-ad-slide-pop-up"
          );

          Utilis.Events.openClosePopUp(editAdSlidePopUp);

          const adSlideId = button.dataset.adSlideId;
          const adSlide = await API.AdSlides.getAdSlide(adSlideId);

          BannerUI.renderAdSlideEditPopUp(adSlide, editAdSlidePopUp);

          const getSlideImage = Utilis.Events.getImageData(
            editAdSlidePopUp,
            adSlide.imageUrl,
            "-slide"
          );

          const getLogoImage = Utilis.Events.getImageData(
            editAdSlidePopUp,
            adSlide.logoUrl,
            "-logo"
          );

          BannerUI.Events.submitAdSlideData(
            editAdSlidePopUp,
            "edit",
            adSlideId,
            getSlideImage,
            getLogoImage
          );
        });
      });
    },

    submitAdSlideData(
      popUp,
      mode = "add",
      adSlideId = null,
      getSlideImage = null,
      getLogoImage = null
    ) {
      const submitButton = popUp.querySelector(".js-submit-button");

      submitButton.addEventListener("click", async () => {
        // Get form field values
        const titleInput = popUp.querySelector("input[name='ad-slide-title']");
        const descriptionInput = popUp.querySelector(
          "textarea[name='ad-slide-description']"
        );
        const promoCodeInput = popUp.querySelector(
          "input[name='ad-slide-promo-code']"
        );
        const linkUrlInput = popUp.querySelector(
          "input[name='ad-slide-link-url']"
        );

        // Validate required fields
        if (!titleInput.value.trim()) {
          showToast("Please fill in the ad title.", "warning");
          return;
        }

        if (!descriptionInput.value.trim()) {
          showToast("Please fill in the ad description.", "warning");
          return;
        }

        if (!promoCodeInput.value.trim()) {
          showToast("Please fill in the promo code.", "warning");
          return;
        }

        if (!linkUrlInput.value.trim()) {
          showToast("Please fill in the link URL.", "warning");
          return;
        }

        const adSlideData = {
          title: titleInput.value,
          description: descriptionInput.value,
          promoCode: promoCodeInput.value,
          linkUrl: linkUrlInput.value,
        };

        // Get uploaded images using the getter functions passed as parameters
        var slideImage = getSlideImage ? getSlideImage() : null;
        var logoImage = getLogoImage ? getLogoImage() : null;

        // Validate images are uploaded for add mode
        if (mode === "add" && (!slideImage || !logoImage)) {
          showToast(
            "Please upload both slide image and logo image.",
            "warning"
          );
          return;
        }

        try {
          if (mode === "add") {
            console.log("Add Mode - AdSlide Data:", adSlideData);
            console.log("Add Mode - Slide Image:", slideImage);
            console.log("Add Mode - Logo Image:", logoImage);

            // First, create the ad slide with data
            const adSlideId = await API.AdSlides.addAdSlide(adSlideData);

            // Then, upload the media files
            if (slideImage && logoImage) {
              const mediaResult = await API.AdSlides.addAdSlideMedia(
                adSlideId,
                slideImage,
                logoImage
              );
              console.log("Media upload result:", mediaResult);
            }
            showToast("Ad slide added successfully!", "success");
          } else {
            console.log("Edit Mode - AdSlide Data:", adSlideData);
            console.log("Edit Mode - Slide Image:", slideImage);
            console.log("Edit Mode - Logo Image:", logoImage);

            // Update the ad slide data
            await API.AdSlides.updateAdSlide(adSlideId, adSlideData);

            // Update media files if new ones were uploaded
            if (slideImage || logoImage) {
              const mediaResult = await API.AdSlides.updateAdSlideMedia(
                adSlideId,
                slideImage,
                logoImage
              );
              console.log("Media update result:", mediaResult);
            }
            showToast("Ad slide updated successfully!", "success");
          }

          togglePopUpOff(popUp);
          setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
          console.error("Failed to save ad slide:", error);
          showToast(
            error.message || "Failed to save ad slide. Please try again.",
            "error"
          );
        }
      });
    },
  },
};

const CollectionUI = {
  renderCollections(collections) {
    const collectionsSectionCard = document.querySelector(
      ".js-collections-section-card"
    );

    const sectionCardContent = collectionsSectionCard.querySelector(
      ".js-section-card-content"
    );

    const count = collectionsSectionCard.querySelector(".js-count");

    count.innerHTML = `${collections.length} editable sections`;

    if (collections.length === 0) {
      sectionCardContent.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #6c757d;">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.3; margin-bottom: 20px;">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="15"></line>
            <line x1="15" y1="9" x2="9" y2="15"></line>
          </svg>
          <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #495057;">No Data Found</h3>
          <p style="font-size: 14px; margin: 0; color: #6c757d;">Add collections to get started</p>
        </div>
      `;
      return;
    }

    collections.forEach((collection) => {
      sectionCardContent.innerHTML += `
        <div class="sub-section-sub-card">
          <div class="sub-section-sub-card-header">
            <div class="sub-section-sub-card-info">
              <h4 class="sub-section-sub-card-title">${collection.title}</h4>
            </div>
            <a class="icon-button js-view-collection-button" style="color: gray" 
            data-collection-id="${collection.id}"><i class="bi bi-eye"></i></a>
            <a
              class="icon-button js-edit-collection-button" data-collection-id="${collection.id}"
              style="color: var(--primary-color)"
              ><i class="bi bi-pencil"></i
            ></a>
            <a
              class="icon-button js-delete-collection-button" data-collection-id="${collection.id}"
              style="color: #dd0000ff"
              ><i class="bi bi-trash"></i
            ></a>
          </div>
        </div>
      `;
    });
  },

  renderCollectionViewPopUp(collection, popUp) {
    const titleInput = popUp.querySelector("input[name='collection-title']");
    const descriptionInput = popUp.querySelector(
      "textarea[name='collection-description']"
    );
    const imagesCount = popUp.querySelector(".js-images-count");
    const imagesPreview = popUp.querySelector(".js-images-preview");

    titleInput.value = collection.title;
    descriptionInput.value = collection.description;

    imagesPreview.innerHTML = "";
    imagesPreview.classList.add("active");
    imagesCount.classList.add("active");

    imagesCount.textContent = `Collection has ${
      collection.coverUrls.length
    } image${collection.coverUrls.length > 1 ? "s" : ""}`;

    collection.coverUrls.forEach((cover) => {
      const previewItem = document.createElement("div");
      previewItem.className = "preview-item";
      previewItem.innerHTML = `
          <img src="${cover}">
        `;
      imagesPreview.appendChild(previewItem);
    });
  },

  renderCollectionEditPopUp(collection, popUp) {
    const titleInput = popUp.querySelector("input[name='collection-title']");
    const descriptionInput = popUp.querySelector(
      "textarea[name='collection-description']"
    );
    const imagesCount = popUp.querySelector(".js-images-count");
    const imagesPreview = popUp.querySelector(".js-images-preview");

    titleInput.value = collection.title;
    descriptionInput.value = collection.description;

    imagesPreview.innerHTML = "";

    imagesPreview.classList.add("active");
    imagesCount.classList.add("active");

    imagesCount.textContent = `Collection has ${
      collection.coverUrls.length
    } image${collection.coverUrls.length > 1 ? "s" : ""}`;

    collection.coverUrls.forEach((cover) => {
      const previewItem = document.createElement("div");
      previewItem.className = "preview-item";
      previewItem.innerHTML = `
          <img src="${cover}">
        `;
      imagesPreview.appendChild(previewItem);
    });
  },

  Events: {
    async setupCollectionUI() {
      var collections = await API.Collections.getAllCollections();
      CollectionUI.renderCollections(collections);

      const addCollectionButton = document.querySelector(
        ".js-add-collection-button"
      );

      addCollectionButton.addEventListener("click", () => {
        const addCollectionPopUp = document.querySelector(
          ".js-add-collection-pop-up"
        );

        Utilis.Events.openClosePopUp(addCollectionPopUp);

        // CollectionUI.getAddCollectionImagesData(addCollectionPopUp);

        Utilis.Events.getImagesData(addCollectionPopUp);

        CollectionUI.Events.submitCollectionData(addCollectionPopUp);
      });

      const viewCollectionButtons = document.querySelectorAll(
        ".js-view-collection-button"
      );

      viewCollectionButtons.forEach(async (button) => {
        button.addEventListener("click", async () => {
          const viewCollectionPopUp = document.querySelector(
            ".js-view-collection-pop-up"
          );

          Utilis.Events.openClosePopUp(viewCollectionPopUp);

          const collectionId = button.dataset.collectionId;
          const collection = await API.Collections.getCollection(collectionId);

          CollectionUI.renderCollectionViewPopUp(
            collection,
            viewCollectionPopUp
          );
          // console.log(collectionId);
        });
      });

      const editCollectionButtons = document.querySelectorAll(
        ".js-edit-collection-button"
      );

      editCollectionButtons.forEach(async (button) => {
        button.addEventListener("click", async () => {
          const editCollectionPopUp = document.querySelector(
            ".js-edit-collection-pop-up"
          );

          Utilis.Events.openClosePopUp(editCollectionPopUp);

          const collectionId = button.dataset.collectionId;
          const collection = await API.Collections.getCollection(collectionId);

          CollectionUI.renderCollectionEditPopUp(
            collection,
            editCollectionPopUp
          );

          // CollectionUI.getEditCollectionImagesData(
          //   editCollectionPopUp,
          //   collection
          // );

          Utilis.Events.getImagesData(editCollectionPopUp, collection);

          CollectionUI.Events.submitCollectionData(
            editCollectionPopUp,
            "edit",
            collectionId
          );
        });
      });
    },

    submitCollectionData(popUp, mode = "add", collectionId = null) {
      const submitButton = popUp.querySelector(".js-submit-button");

      submitButton.addEventListener("click", async () => {
        const titleInput = popUp.querySelector(
          "input[name='collection-title']"
        );
        const descriptionInput = popUp.querySelector(
          "textarea[name='collection-description']"
        );

        // Validate required fields
        if (!titleInput.value.trim()) {
          showToast("Please fill in the collection title.", "warning");
          return;
        }

        if (!descriptionInput.value.trim()) {
          showToast("Please fill in the collection description.", "warning");
          return;
        }

        const collectionData = {
          title: titleInput.value,
          description: descriptionInput.value,
        };

        var collectionImages = Utilis.Events.getImagesDataGetter(popUp);

        // Validate images are uploaded for add mode
        if (
          mode === "add" &&
          (!collectionImages || collectionImages.length === 0)
        ) {
          showToast("Please upload at least one collection image.", "warning");
          return;
        }

        try {
          if (mode === "add") {
            console.log(collectionData);
            console.log(collectionImages);

            const collectionId = await API.Collections.addCollection(
              collectionData
            );
            const result = await API.Collections.addCollectionImages(
              collectionId,
              collectionImages
            );

            console.log(result);
            showToast("Collection added successfully!", "success");
          } else {
            console.log(collectionData);
            console.log(collectionImages);

            await API.Collections.updateCollection(
              collectionId,
              collectionData
            );
            const result = await API.Collections.updateCollectionImages(
              collectionId,
              collectionImages
            );

            console.log(result);
            showToast("Collection updated successfully!", "success");
          }

          togglePopUpOff(popUp);
          setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
          console.error("Failed to save collection:", error);
          showToast(
            error.message || "Failed to save collection. Please try again.",
            "error"
          );
        }
      });
    },
  },
};

const CategoryUI = {
  renderCategories(categories) {
    const categorySectionCard = document.querySelector(
      ".js-category-section-card"
    );

    const sectionCardContent = categorySectionCard.querySelector(
      ".js-section-card-content"
    );

    const count = categorySectionCard.querySelector(".js-count");

    count.innerHTML = `${categories.length} editable sections`;

    if (categories.length === 0) {
      sectionCardContent.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #6c757d;">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.3; margin-bottom: 20px;">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="15"></line>
            <line x1="15" y1="9" x2="9" y2="15"></line>
          </svg>
          <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #495057;">No Data Found</h3>
          <p style="font-size: 14px; margin: 0; color: #6c757d;">Add categories to get started</p>
        </div>
      `;
      return;
    }

    categories.forEach((category) => {
      sectionCardContent.innerHTML += `
        <div class="section-sub-card js-section-card js-category-sub-section-card">
          <div class="section-sub-card-header js-section-card-header">
            <i
              class="bi bi-chevron-right section-sub-card-toggle js-section-card-toggle"
            ></i>
            <div class="section-sub-card-icon">
              <i class="bi bi-tag"></i>
            </div>
            <div class="section-sub-card-info">
              <h4 class="section-sub-card-title">${category.name}</h4>
              <p class="section-sub-card-subtitle">${
                category.itemsCount
              } items</p>
            </div>
            <button class="secondary-button js-add-item-button" data-category-id="${
              category.id
            }">
              Add Item
            </button>
          </div>
          <div class="section-sub-card-content js-section-card-content">
            ${
              category.categoryItems.length === 0
                ? `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; color: #6c757d;">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.3; margin-bottom: 16px;">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                  </svg>
                  <h4 style="font-size: 16px; font-weight: 600; margin: 0 0 6px 0; color: #495057;">No Items Found</h4>
                  <p style="font-size: 13px; margin: 0; color: #6c757d;">Add items to this category</p>
                </div>
                `
                : category.categoryItems
                    .map(
                      (categoryItem) => `
                      <div class="sub-section-sub-card">
                        <div class="sub-section-sub-card-header">
                          <div class="sub-section-sub-card-info">
                            <h4 class="sub-section-sub-card-title">${categoryItem.title}</h4>
                          </div>
                          <a
                            class="icon-button js-view-category-item-button"
                            style="color: gray"
                            data-category-item-id="${categoryItem.id}"
                          >
                            <i class="bi bi-eye"></i>
                          </a>
                          <a
                            class="icon-button js-edit-category-item-button"
                            data-category-item-id="${categoryItem.id}"
                            style="color: var(--primary-color)"
                          >
                            <i class="bi bi-pencil"></i>
                          </a>
                          <a
                            class="icon-button js-delete-category-item-button"
                            data-category-item-id="${categoryItem.id}"
                            style="color: #dd0000ff"
                          >
                            <i class="bi bi-trash"></i>
                          </a>
                        </div>
                      </div>
                    `
                    )
                    .join("")
            }
          </div>
        </div>
      `;
    });
  },

  renderCategoryItemViewPopUp(categoryItem, popUp) {
    const titleInput = popUp.querySelector("input[name='category-item-title']");
    const descriptionInput = popUp.querySelector(
      "textarea[name='category-item-description']"
    );
    const imagesCount = popUp.querySelector(".js-images-count");
    const imagesPreview = popUp.querySelector(".js-images-preview");

    titleInput.value = categoryItem.title;
    descriptionInput.value = categoryItem.description;

    imagesPreview.innerHTML = "";
    imagesPreview.classList.add("active");
    imagesCount.classList.add("active");

    imagesCount.textContent = `Item has ${categoryItem.images.length} image${
      categoryItem.images.length > 1 ? "s" : ""
    }`;

    // images is now an array of URL strings
    categoryItem.images.forEach((imageUrl) => {
      const previewItem = document.createElement("div");
      previewItem.className = "preview-item";
      previewItem.innerHTML = `<img src="${imageUrl}">`;
      imagesPreview.appendChild(previewItem);
    });
  },

  renderCategoryItemEditPopUp(categoryItem, popUp) {
    const titleInput = popUp.querySelector("input[name='category-item-title']");
    const descriptionInput = popUp.querySelector(
      "textarea[name='category-item-description']"
    );
    const imagesCount = popUp.querySelector(".js-images-count");
    const imagesPreview = popUp.querySelector(".js-images-preview");

    titleInput.value = categoryItem.title;
    descriptionInput.value = categoryItem.description;

    imagesPreview.innerHTML = "";
    imagesPreview.classList.add("active");
    imagesCount.classList.add("active");

    imagesCount.textContent = `Item has ${categoryItem.images.length} image${
      categoryItem.images.length > 1 ? "s" : ""
    }`;

    // images is now an array of URL strings
    categoryItem.images.forEach((imageUrl) => {
      const previewItem = document.createElement("div");
      previewItem.className = "preview-item";
      previewItem.innerHTML = `<img src="${imageUrl}">`;
      imagesPreview.appendChild(previewItem);
    });
  },

  Events: {
    async setupCategoryUI() {
      var categories = await API.Categories.getAllCategories();
      CategoryUI.renderCategories(categories);

      const addCategoryItemButtons = document.querySelectorAll(
        ".js-add-item-button"
      );

      addCategoryItemButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const addCategoryItemPopUp = document.querySelector(
            ".js-add-category-item-pop-up"
          );

          Utilis.Events.openClosePopUp(addCategoryItemPopUp);

          Utilis.Events.getImagesData(addCategoryItemPopUp);

          const categoryId = button.dataset.categoryId;

          CategoryUI.Events.submitCategoryItemData(
            addCategoryItemPopUp,
            "add",
            null,
            categoryId
          );
        });
      });

      const viewCategoryItemButtons = document.querySelectorAll(
        ".js-view-category-item-button"
      );

      viewCategoryItemButtons.forEach(async (button) => {
        button.addEventListener("click", async () => {
          const viewCategoryItemPopUp = document.querySelector(
            ".js-view-category-item-pop-up"
          );

          Utilis.Events.openClosePopUp(viewCategoryItemPopUp);

          const categoryItemId = button.dataset.categoryItemId;
          console.log(categoryItemId);

          const categoryItem = await API.Categories.getCategoryItem(
            categoryItemId
          );
          console.log(categoryItem);

          CategoryUI.renderCategoryItemViewPopUp(
            categoryItem,
            viewCategoryItemPopUp
          );
        });
      });

      const editCategoryItemButtons = document.querySelectorAll(
        ".js-edit-category-item-button"
      );

      editCategoryItemButtons.forEach(async (button) => {
        button.addEventListener("click", async () => {
          const editCategoryItemPopUp = document.querySelector(
            ".js-edit-category-item-pop-up"
          );

          Utilis.Events.openClosePopUp(editCategoryItemPopUp);

          const categoryItemId = button.dataset.categoryItemId;
          const categoryItem = await API.Categories.getCategoryItem(
            categoryItemId
          );

          CategoryUI.renderCategoryItemEditPopUp(
            categoryItem,
            editCategoryItemPopUp
          );

          // Convert images array to coverUrls format for getImagesData
          const categoryItemWithUrls = {
            coverUrls: categoryItem.images, // images is already an array of URLs
          };

          Utilis.Events.getImagesData(
            editCategoryItemPopUp,
            categoryItemWithUrls
          );

          CategoryUI.Events.submitCategoryItemData(
            editCategoryItemPopUp,
            "edit",
            categoryItemId
          );
        });
      });
    },

    submitCategoryItemData(
      popUp,
      mode = "add",
      categoryItemId = null,
      categoryId = null
    ) {
      const submitButton = popUp.querySelector(".js-submit-button");

      submitButton.addEventListener("click", async () => {
        const titleInput = popUp.querySelector(
          "input[name='category-item-title']"
        );
        const descriptionInput = popUp.querySelector(
          "textarea[name='category-item-description']"
        );

        // Validate required fields
        if (!titleInput.value.trim()) {
          showToast("Please fill in the category item title.", "warning");
          return;
        }

        if (!descriptionInput.value.trim()) {
          showToast("Please fill in the category item description.", "warning");
          return;
        }

        var categoryItemImages = Utilis.Events.getImagesDataGetter(popUp);

        // Validate images are uploaded for add mode
        if (
          mode === "add" &&
          (!categoryItemImages || categoryItemImages.length === 0)
        ) {
          showToast(
            "Please upload at least one category item image.",
            "warning"
          );
          return;
        }

        try {
          if (mode === "add") {
            const categoryItemData = {
              title: titleInput.value,
              description: descriptionInput.value,
              productId: categoryId,
            };

            console.log("Add Mode - Category Item Data:", categoryItemData);
            console.log("Add Mode - Images:", categoryItemImages);

            const newCategoryItemId = await API.Categories.addCategoryItem(
              categoryItemData
            );

            if (categoryItemImages && categoryItemImages.length > 0) {
              const result = await API.Categories.addCategoryItemImages(
                newCategoryItemId,
                categoryItemImages
              );
              console.log("Images upload result:", result);
            }
            showToast("Category item added successfully!", "success");
          } else {
            const categoryItemData = {
              title: titleInput.value,
              description: descriptionInput.value,
            };

            console.log("Edit Mode - Category Item Data:", categoryItemData);
            console.log("Edit Mode - Images:", categoryItemImages);

            await API.Categories.updateCategoryItem(
              categoryItemId,
              categoryItemData
            );

            if (categoryItemImages && categoryItemImages.length > 0) {
              const result = await API.Categories.updateCategoryItemImages(
                categoryItemId,
                categoryItemImages
              );
              console.log("Images update result:", result);
            }
            showToast("Category item updated successfully!", "success");
          }

          togglePopUpOff(popUp);
          setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
          console.error("Failed to save category item:", error);
          showToast(
            error.message || "Failed to save category item. Please try again.",
            "error"
          );
        }
      });
    },
  },
};

const InfoUI = {
  renderAboutUsViewPopUp(aboutUs, popUp) {
    const aboutUsTextarea = popUp.querySelector(
      "textarea[name='about-us-text']"
    );
    aboutUsTextarea.value = aboutUs || "";
  },

  renderAboutUsEditPopUp(aboutUs, popUp) {
    const aboutUsTextarea = popUp.querySelector(
      "textarea[name='about-us-text']"
    );
    aboutUsTextarea.value = aboutUs || "";
  },

  renderContactUs(contactUsData) {
    const contactUsSectionCard = document.querySelector(
      ".js-contact-us-section-card"
    );

    const sectionCardContent = contactUsSectionCard.querySelector(
      ".js-section-card-content"
    );

    const count = contactUsSectionCard.querySelector(".js-count");

    count.innerHTML = `${contactUsData.length} contact entries`;

    if (contactUsData.length === 0) {
      sectionCardContent.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #6c757d;">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.3; margin-bottom: 20px;">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="15"></line>
            <line x1="15" y1="9" x2="9" y2="15"></line>
          </svg>
          <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #495057;">No Data Found</h3>
          <p style="font-size: 14px; margin: 0; color: #6c757d;">Add contact entries to get started</p>
        </div>
      `;
      return;
    }

    contactUsData.forEach((contactItem) => {
      sectionCardContent.innerHTML += `
        <div class="sub-section-sub-card">
          <div class="sub-section-sub-card-header">
            <div class="sub-section-sub-card-info">
              <h4 class="sub-section-sub-card-title">${contactItem.key}</h4>
            </div>
            <a class="icon-button js-view-contact-us-button" style="color: gray" 
            data-contact-id="${contactItem.id}"><i class="bi bi-eye"></i></a>
            <a
              class="icon-button js-edit-contact-us-button" data-contact-id="${contactItem.id}"
              style="color: var(--primary-color)"
              ><i class="bi bi-pencil"></i
            ></a>
            <a
              class="icon-button js-delete-contact-us-button" data-contact-id="${contactItem.id}"
              style="color: #dd0000ff"
              ><i class="bi bi-trash"></i
            ></a>
          </div>
        </div>
      `;
    });
  },

  renderContactUsViewPopUp(contactItem, popUp) {
    const keyInput = popUp.querySelector("input[name='contact-us-key']");
    const valueInput = popUp.querySelector("input[name='contact-us-value']");

    keyInput.value = contactItem.key || "";
    valueInput.value = contactItem.value || "";
  },

  renderContactUsEditPopUp(contactItem, popUp) {
    const keyInput = popUp.querySelector("input[name='contact-us-key']");
    const valueInput = popUp.querySelector("input[name='contact-us-value']");

    keyInput.value = contactItem.key || "";
    valueInput.value = contactItem.value || "";
  },

  Events: {
    async setupAboutUsUI() {
      const aboutUs = await API.Info.getAboutUs();

      const viewAboutUsButton = document.querySelector(
        ".js-view-about-us-button"
      );

      viewAboutUsButton.addEventListener("click", () => {
        const viewAboutUsPopUp = document.querySelector(
          ".js-view-about-us-pop-up"
        );

        Utilis.Events.openClosePopUp(viewAboutUsPopUp);

        InfoUI.renderAboutUsViewPopUp(aboutUs, viewAboutUsPopUp);
      });

      const editAboutUsButton = document.querySelector(
        ".js-edit-about-us-button"
      );

      editAboutUsButton.addEventListener("click", () => {
        const editAboutUsPopUp = document.querySelector(
          ".js-edit-about-us-pop-up"
        );

        Utilis.Events.openClosePopUp(editAboutUsPopUp);

        InfoUI.renderAboutUsEditPopUp(aboutUs, editAboutUsPopUp);

        InfoUI.Events.submitAboutUsData(editAboutUsPopUp);
      });
    },

    submitAboutUsData(popUp) {
      const submitButton = popUp.querySelector(".js-submit-button");

      submitButton.addEventListener("click", async () => {
        const aboutUsTextarea = popUp.querySelector(
          "textarea[name='about-us-text']"
        );

        const newValue = aboutUsTextarea.value;

        // Validate required field
        if (!newValue.trim()) {
          showToast("Please fill in the About Us content.", "warning");
          return;
        }

        console.log("Update About Us:", newValue);

        try {
          await API.Info.updateAboutUs(newValue);
          showToast("About Us updated successfully!", "success");
          togglePopUpOff(popUp);
          setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
          console.error("Failed to update About Us:", error);
          showToast(
            error.message || "Failed to update About Us. Please try again.",
            "error"
          );
        }
      });
    },

    async setupContactUsUI() {
      const contactUsData = await API.Info.getContactUs();
      InfoUI.renderContactUs(contactUsData);

      const addContactUsButton = document.querySelector(
        ".js-add-contact-us-button"
      );

      if (addContactUsButton) {
        addContactUsButton.addEventListener("click", () => {
          const addContactUsPopUp = document.querySelector(
            ".js-add-contact-us-pop-up"
          );

          Utilis.Events.openClosePopUp(addContactUsPopUp);

          InfoUI.Events.submitContactUsData(addContactUsPopUp, "add");
        });
      }

      const viewContactUsButtons = document.querySelectorAll(
        ".js-view-contact-us-button"
      );

      viewContactUsButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const viewContactUsPopUp = document.querySelector(
            ".js-view-contact-us-pop-up"
          );

          Utilis.Events.openClosePopUp(viewContactUsPopUp);

          const contactId = button.dataset.contactId;
          const contactItem = contactUsData.find(
            (item) => item.id == contactId
          );

          InfoUI.renderContactUsViewPopUp(contactItem, viewContactUsPopUp);
        });
      });

      const editContactUsButtons = document.querySelectorAll(
        ".js-edit-contact-us-button"
      );

      editContactUsButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const editContactUsPopUp = document.querySelector(
            ".js-edit-contact-us-pop-up"
          );

          Utilis.Events.openClosePopUp(editContactUsPopUp);

          const contactId = button.dataset.contactId;
          const contactItem = contactUsData.find(
            (item) => item.id == contactId
          );

          InfoUI.renderContactUsEditPopUp(contactItem, editContactUsPopUp);

          InfoUI.Events.submitContactUsData(
            editContactUsPopUp,
            "edit",
            contactId
          );
        });
      });
    },

    submitContactUsData(popUp, mode = "add", contactId = null) {
      const submitButton = popUp.querySelector(".js-submit-button");

      submitButton.addEventListener("click", async () => {
        const keyInput = popUp.querySelector("input[name='contact-us-key']");
        const valueInput = popUp.querySelector(
          "input[name='contact-us-value']"
        );

        const key = keyInput.value;
        const value = valueInput.value;

        // Validate required fields
        if (!key.trim()) {
          showToast("Please fill in the contact key.", "warning");
          return;
        }

        if (!value.trim()) {
          showToast("Please fill in the contact value.", "warning");
          return;
        }

        try {
          if (mode === "add") {
            console.log("Add Contact Us - Key:", key, "Value:", value);
            await API.Info.addContactUs(key, value);
            showToast("Contact info added successfully!", "success");
          } else {
            console.log(
              "Update Contact Us - ID:",
              contactId,
              "New Value:",
              value
            );
            await API.Info.updateContactUs(contactId, value);
            showToast("Contact info updated successfully!", "success");
          }

          togglePopUpOff(popUp);
          setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
          console.error("Failed to save contact info:", error);
          showToast(
            error.message || "Failed to save contact info. Please try again.",
            "error"
          );
        }
      });
    },
  },
};

function setupSectionCardHandlers() {
  const sectionCards = document.querySelectorAll(".js-section-card");
  sectionCards.forEach((sectionCard) => {
    const sectionCardHeader = sectionCard.querySelector(
      ".js-section-card-header"
    );

    if (!sectionCardHeader) return;

    // Remove existing listeners by cloning and replacing the element
    const newHeader = sectionCardHeader.cloneNode(true);
    sectionCardHeader.parentNode.replaceChild(newHeader, sectionCardHeader);

    // Prevent buttons in header from triggering card expansion
    const headerButtons = newHeader.querySelectorAll("button");
    headerButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });

    newHeader.addEventListener("click", () => {
      const sectionCardContent = sectionCard.querySelector(
        ".js-section-card-content"
      );
      const sectionCardToggle = sectionCard.querySelector(
        ".js-section-card-toggle"
      );

      const isExpanded = sectionCardContent.classList.contains("expanded");

      if (isExpanded) {
        sectionCardContent.classList.remove("expanded");
        sectionCardToggle.classList.remove("expanded");
      } else {
        sectionCardContent.classList.add("expanded");
        sectionCardToggle.classList.add("expanded");
      }
    });
  });
}

// Notification templates data
const notificationTemplates = {
  welcome: {
    type: "notification",
    title: "Reminder: Pay Your First Deposit to Proceed!",
    titleAr: "تذكير: ادفع وديعتك الأولى للمتابعة!",
    message:
      "Don't miss out! Complete your first deposit payment to move forward with your order. We're here to help if you need assistance.",
    messageAr:
      "لا تفوت الفرصة! أكمل دفع وديعتك الأولى للمضي قدمًا في طلبك. نحن هنا للمساعدة إذا كنت بحاجة إليها.",
    target: "All Users",
  },
  product: {
    type: "design",
    title: "Design Process: Order Entered Design Phase, Keep an Eye out!",
    titleAr: "عملية التصميم: دخل الطلب مرحلة التصميم، انتبه!",
    message:
      "Great news! Your order has entered the design phase. Our team is working on creating the perfect design for you. Stay tuned for updates!",
    messageAr:
      "أخبار رائعة! دخل طلبك مرحلة التصميم. فريقنا يعمل على إنشاء التصميم المثالي لك. ترقب التحديثات!",
    target: "All Users",
  },
  order: {
    type: "confirmation",
    title: "Reminder: Confirm your Order Sizes & Options Now!",
    titleAr: "تذكير: أكد أحجام طلبك وخياراته الآن!",
    message:
      "Action required! Please confirm your order sizes and options to proceed with production. Your prompt response helps us deliver on time.",
    messageAr:
      "مطلوب إجراء! يرجى تأكيد أحجام طلبك وخياراته للمضي قدمًا في الإنتاج. استجابتك السريعة تساعدنا على التسليم في الوقت المحدد.",
    target: "Specific School",
  },
  announcement: {
    type: "notification",
    title: "Reminder: Finalize your Payment to Complete the Order!",
    titleAr: "تذكير: أكمل دفعتك لإتمام الطلب!",
    message:
      "You're almost there! Complete your final payment to finalize your order and get it ready for delivery. Thank you for choosing us!",
    messageAr:
      "أنت على وشك الانتهاء! أكمل دفعتك النهائية لإنهاء طلبك وجعله جاهزًا للتسليم. شكرًا لاختيارك لنا!",
    target: "All Users",
  },
};

const NotificationUI = {
  Events: {
    async setupNotificationUI() {
      const sendNewButton = document.querySelector(
        ".js-send-new-notification-button"
      );
      const sendButtons = document.querySelectorAll(
        ".js-send-notification-button"
      );
      const deleteButtons = document.querySelectorAll(
        ".js-delete-notification-button"
      );

      const sendPopUp = document.querySelector(".js-send-notification-pop-up");

      // Setup radio button handlers for send popup
      const sendRadios = sendPopUp.querySelectorAll(
        ".js-send-target-audience-radio"
      );
      const sendSchoolSelector = sendPopUp.querySelector(
        ".js-send-school-selector"
      );
      const schoolDropdown = sendPopUp.querySelector(
        "#send-notification-school"
      );

      // Load schools into dropdown
      try {
        const schools = await API.getSchools();
        schoolDropdown.innerHTML =
          '<option value="" disabled selected>Select School Name</option>';
        schools.forEach((school) => {
          const option = document.createElement("option");
          option.value = school.id;
          option.textContent = school.name;
          schoolDropdown.appendChild(option);
        });
      } catch (error) {
        console.error("Failed to load schools:", error);
        showToast("Failed to load schools list", "error");
      }

      sendRadios.forEach((radio) => {
        radio.addEventListener("change", (e) => {
          if (e.target.value === "school") {
            sendSchoolSelector.style.display = "flex";
          } else {
            sendSchoolSelector.style.display = "none";
          }
        });
      });

      // Send New button
      if (sendNewButton) {
        sendNewButton.addEventListener("click", () => {
          // Clear form
          sendPopUp.querySelector("#send-notification-title").value = "";
          sendPopUp.querySelector("#send-notification-title-ar").value = "";
          sendPopUp.querySelector("#send-notification-message").value = "";
          sendPopUp.querySelector("#send-notification-message-ar").value = "";
          sendPopUp.querySelector(
            "input[name='send-target-audience'][value='all']"
          ).checked = true;
          sendSchoolSelector.style.display = "none";

          Utilis.Events.openClosePopUp(sendPopUp);
        });
      }

      // Send buttons (on each notification card)
      sendButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const notificationType = button.getAttribute(
            "data-notification-type"
          );
          const template = notificationTemplates[notificationType];

          if (template) {
            // Pre-fill form with template data
            sendPopUp.querySelector("#notification-type").value =
              template.type || "";
            sendPopUp.querySelector("#send-notification-title").value =
              template.title;
            sendPopUp.querySelector("#send-notification-title-ar").value =
              template.titleAr || "";
            sendPopUp.querySelector("#send-notification-message").value =
              template.message;
            sendPopUp.querySelector("#send-notification-message-ar").value =
              template.messageAr || "";

            if (template.target === "All Users") {
              sendPopUp.querySelector(
                "input[name='send-target-audience'][value='all']"
              ).checked = true;
              sendSchoolSelector.style.display = "none";
            } else {
              sendPopUp.querySelector(
                "input[name='send-target-audience'][value='school']"
              ).checked = true;
              sendSchoolSelector.style.display = "flex";
            }
          }

          Utilis.Events.openClosePopUp(sendPopUp);
        });
      });

      // Delete buttons
      deleteButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const notificationType = button.getAttribute(
            "data-notification-type"
          );
          const template = notificationTemplates[notificationType];

          if (
            template &&
            confirm(
              `Are you sure you want to delete the notification template: "${template.title}"?`
            )
          ) {
            showToast(
              `Notification template "${template.title}" has been deleted.`,
              "success"
            );
            // Here you would make an API call to delete the notification
          }
        });
      });

      // Submit notification button (send popup)
      const submitButton = sendPopUp.querySelector(
        ".js-submit-notification-button"
      );
      if (submitButton) {
        submitButton.addEventListener("click", async () => {
          const type = sendPopUp.querySelector("#notification-type").value;
          const title = sendPopUp
            .querySelector("#send-notification-title")
            .value.trim();
          const titleAr = sendPopUp
            .querySelector("#send-notification-title-ar")
            .value.trim();
          const message = sendPopUp
            .querySelector("#send-notification-message")
            .value.trim();
          const messageAr = sendPopUp
            .querySelector("#send-notification-message-ar")
            .value.trim();
          const target = sendPopUp.querySelector(
            "input[name='send-target-audience']:checked"
          ).value;

          // Validation
          if (!type) {
            showToast("Please select notification type", "error");
            return;
          }

          if (!title || !titleAr || !message || !messageAr) {
            showToast(
              "Please fill in all required fields (English and Arabic)",
              "error"
            );
            return;
          }

          let targetAudience = "All";
          if (target === "school") {
            const schoolId = sendPopUp.querySelector(
              "#send-notification-school"
            ).value;
            if (!schoolId) {
              showToast("Please select a school", "error");
              return;
            }
            targetAudience = schoolId;
          }

          // Prepare notification data
          const notificationData = {
            title: title,
            title_AR: titleAr,
            body: message,
            body_AR: messageAr,
            type: type.charAt(0).toUpperCase() + type.slice(1),
            targetAudience: targetAudience,
          };

          try {
            // Disable button during API call
            submitButton.disabled = true;
            submitButton.innerHTML =
              '<i class="bi bi-hourglass-split"></i> Sending...';

            await API.sendNotification(notificationData);

            if (target === "school") {
              showToast(
                "Notification sent successfully to selected school!",
                "success"
              );
            } else {
              showToast(
                "Notification sent successfully to all users!",
                "success"
              );
            }

            togglePopUpOff(sendPopUp);

            // Clear form
            sendPopUp.querySelector("#notification-type").value = "";
            sendPopUp.querySelector("#send-notification-title").value = "";
            sendPopUp.querySelector("#send-notification-title-ar").value = "";
            sendPopUp.querySelector("#send-notification-message").value = "";
            sendPopUp.querySelector("#send-notification-message-ar").value = "";
            sendPopUp.querySelector(
              "input[name='send-target-audience'][value='all']"
            ).checked = true;
            sendSchoolSelector.style.display = "none";
          } catch (error) {
            console.error("Failed to send notification:", error);
            showToast(
              error.message || "Failed to send notification. Please try again.",
              "error"
            );
          } finally {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.innerHTML =
              '<i class="bi bi-send"></i> Send Notification';
          }
        });
      }
    },
  },
};

async function main() {
  setupSectionCardHandlers();

  try {
    await BannerUI.Events.setupContentSlideUI();
    await BannerUI.Events.setupAdSlideUI();
    await CollectionUI.Events.setupCollectionUI();
    await CategoryUI.Events.setupCategoryUI();
    await InfoUI.Events.setupAboutUsUI();
    await InfoUI.Events.setupContactUsUI();
    NotificationUI.Events.setupNotificationUI();
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

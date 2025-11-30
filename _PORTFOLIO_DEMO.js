import { togglePopUpOff, togglePopUpOn } from "./utilis/pop-ups.js";
import { Collection } from "./data/collection.js";
import { ContentSlide } from "./data/contentSlide.js";

// let addCollectionImages = [];
// let editCollectionImages = [];

const API = {
  Collections: {
    async getAllCollections() {
      try {
        const response = await fetch(
          "https://localhost:44372/api/Collection/GetAllCollections"
        );

        const result = await response.json();

        console.log(result);

        const collections = result.map(
          (collection) => new Collection(collection)
        );

        return collections;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },

    async getCollection(collectionId) {
      try {
        const response = await fetch(
          `https://localhost:44372/api/Collection/GetCollectionById/${collectionId}`
        );

        const result = await response.json();

        const collection = new Collection(result);

        return collection;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },

    async addCollection(collectionData) {
      try {
        const response = await fetch(
          "https://localhost:44372/api/ManageCollection/AddCollection",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(collectionData),
          }
        );

        const result = response.text();
        return result;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },

    async addCollectionImages(collectionId, collectionImageFiles) {
      const formData = new FormData();

      collectionImageFiles.forEach((collectionImageFile) => {
        formData.append("ImageFiles", collectionImageFile);
      });

      try {
        const response = await fetch(
          `https://localhost:44372/api/ManageCollection/AddCollectionImages/${collectionId}`,
          {
            method: "POST",
            body: formData,
          }
        );

        return response;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },

    async updateCollection(oldCollectionId, newCollectionData) {
      try {
        const response = await fetch(
          `https://localhost:44372/api/ManageCollection/UpdateCollection/${oldCollectionId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newCollectionData),
          }
        );

        const result = await response.text();

        return result;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },

    async updateCollectionImages(collectionId, collectionImageFiles) {
      const formData = new FormData();

      collectionImageFiles.forEach((collectionImageFile) => {
        formData.append("ImageFiles", collectionImageFile);
      });

      try {
        const response = await fetch(
          `https://localhost:44372/api/ManageCollection/UpdateCollectionImages/${collectionId}`,
          {
            method: "PUT",
            body: formData,
          }
        );

        return response;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },

  ContentSlides: {
    async getAllContentSlides() {
      try {
        const response = await fetch(
          "https://localhost:44372/api/ManageBanner/GetAllContentSlides"
        );

        const result = await response.json();

        console.log(result);

        const contentSlides = result.map(
          (contentSlide) => new ContentSlide(contentSlide)
        );

        return contentSlides;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },

    async getContentSlide(contentSlideId) {
      try {
        const response = await fetch(
          `https://localhost:44372/api/ManageBanner/GetContentSlide/${contentSlideId}`
        );

        const result = await response.json();

        const contentSlide = new ContentSlide(result);

        return contentSlide;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },

    async addContentSlide(contentSlideImageFile) {
      const formData = new FormData();

      formData.append("slideFile", contentSlideImageFile);

      try {
        const response = await fetch(
          `https://localhost:44372/api/ManageBanner/AddContentSlide`,
          {
            method: "POST",
            body: formData,
          }
        );

        return response;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },

    async updateContentSlide(oldContentSlideId, contentSlideImageFile) {
      const formData = new FormData();

      formData.append("slideFile", contentSlideImageFile);

      try {
        const response = await fetch(
          `https://localhost:44372/api/ManageBanner/UpdateContentSlide/${oldContentSlideId}`,
          {
            method: "PUT",
            body: formData,
          }
        );

        return response;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },

  async getImageProxy(url) {
    try {
      const response = await fetch(
        `https://localhost:44372/api/Media/ProxyImage?url=${encodeURIComponent(
          url
        )}`
      );

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
      console.log(error);
      throw error;
    }
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

          window.location.reload();
        });
      });
    },

    getImageData(popUp, existingObject = null) {
      const uploadButton = popUp.querySelector(".js-upload-button");
      const filesInput = popUp.querySelector("input[name='filesInput']");
      const imagesPreview = popUp.querySelector(".js-images-preview");

      let image = null;

      async function initializeForEdit() {
        if (existingObject) {
          image = await API.getImageProxy(existingObject.imageUrl);

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

      Utilis.Events.getImageDataGetter = function () {
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

    contentSlides.forEach((contentSlide, index) => {
      sectionCardContent.innerHTML += `
        <div class="sub-section-sub-card">
          <div class="sub-section-sub-card-header">
            <div class="sub-section-sub-card-info">
              <h4 class="sub-section-sub-card-title">Slide ${index + 1}</h4>
            </div>
            <a class="icon-button js-view-content-slide-button" style="color: gray" 
            data-content-slide-id="${
              contentSlide.id
            }"><i class="bi bi-eye"></i></a>
            <a
              class="icon-button js-edit-content-slide-button" data-content-slide-id="${
                contentSlide.id
              }"
              style="color: var(--primary-color)"
              ><i class="bi bi-pencil"></i
            ></a>
            <a
              class="icon-button js-delete-content-slide-button" data-content-slide-id="${
                contentSlide.id
              }"
              style="color: #dd0000ff"
              ><i class="bi bi-trash"></i
            ></a>
          </div>
        </div>
      `;
    });
  },

  renderContentSlideViewPopUp(contentSlide, popUp) {
    const imagesPreview = popUp.querySelector(".js-images-preview");

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
    const imagesPreview = popUp.querySelector(".js-images-preview");

    imagesPreview.innerHTML = "";
    imagesPreview.classList.add("active");

    const previewItem = document.createElement("div");
    previewItem.className = "preview-item";
    previewItem.innerHTML = `
          <img src="${contentSlide.imageUrl}">
        `;
    imagesPreview.appendChild(previewItem);
  },

  Events: {
    async setupBannerUI() {
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

        Utilis.Events.getImageData(addContentSlidePopUp);

        BannerUI.Events.submitContentSlideData(addContentSlidePopUp);
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

          Utilis.Events.getImageData(editContentSlidePopUp, conentSlide);

          BannerUI.Events.submitContentSlideData(
            editContentSlidePopUp,
            "edit",
            contentSlideId
          );
        });
      });
    },

    submitContentSlideData(popUp, mode = "add", contentSlideId = null) {
      const submitButton = popUp.querySelector(".js-submit-button");

      submitButton.addEventListener("click", async () => {
        // const titleInput = popUp.querySelector(
        //   "input[name='collection-title']"
        // );
        // const descriptionInput = popUp.querySelector(
        //   "textarea[name='collection-description']"
        // );

        // const collectionData = {
        //   title: titleInput.value,
        //   description: descriptionInput.value,
        // };
        var contentSlideImage = Utilis.Events.getImageDataGetter(popUp);

        if (mode === "add") {
          // console.log(collectionData);
          // console.log(contentSlideImage);

          const result = await API.ContentSlides.addContentSlide(
            contentSlideImage
          );

          console.log(result);
        } else {
          // console.log(collectionData);
          // console.log(contentSlideId);
          // console.log(contentSlideImage);

          await API.ContentSlides.updateContentSlide(
            contentSlideId,
            contentSlideImage
          );
        }

        togglePopUpOff(popUp);
        window.location.reload();
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

  // getAddCollectionImagesData(popUp) {
  //   const uploadButton = popUp.querySelector(".js-upload-button");
  //   const filesInput = popUp.querySelector("input[name='filesInput']");
  //   const imagesCount = popUp.querySelector(".js-images-count");
  //   const imagesPreview = popUp.querySelector(".js-images-preview");

  //   addCollectionImages = [];

  //   function updatePreview() {
  //     imagesPreview.innerHTML = "";

  //     const totalImages = addCollectionImages.length;
  //     if (totalImages === 0) {
  //       imagesPreview.classList.remove("active");
  //       imagesCount.classList.remove("active");
  //       imagesCount.textContent = "";
  //       return;
  //     }

  //     imagesPreview.classList.add("active");
  //     imagesCount.classList.add("active");
  //     imagesCount.textContent = `${addCollectionImages.length} image${
  //       addCollectionImages.length > 1 ? "s" : ""
  //     } selected`;

  //     addCollectionImages.forEach((file, index) => {
  //       const reader = new FileReader();
  //       reader.onload = (e) => {
  //         const previewItem = document.createElement("div");
  //         previewItem.className = "preview-item";
  //         previewItem.innerHTML = `
  //           <img src="${e.target.result}" alt="${file.name}">
  //           <button class="remove-image js-remove-button"><i class="bi bi-x"></i></button>
  //           <div class="image-name">${file.name}</div>
  //         `;
  //         imagesPreview.appendChild(previewItem);
  //         previewItem
  //           .querySelector(".js-remove-button")
  //           .addEventListener("click", () => {
  //             addCollectionImages.splice(index, 1);
  //             updatePreview();
  //           });
  //       };
  //       reader.readAsDataURL(file);
  //     });
  //   }

  //   uploadButton.addEventListener("click", () => filesInput.click());
  //   filesInput.addEventListener("change", (e) => {
  //     const files = Array.from(e.target.files);
  //     if (files.length > 0) {
  //       addCollectionImages = [...addCollectionImages, ...files];
  //       updatePreview();
  //     }
  //   });

  //   updatePreview();
  // },

  // getEditCollectionImagesData(popUp, collection) {
  //   const uploadButton = popUp.querySelector(".js-upload-button");
  //   const filesInput = popUp.querySelector("input[name='filesInput']");
  //   const imagesCount = popUp.querySelector(".js-images-count");
  //   const imagesPreview = popUp.querySelector(".js-images-preview");

  //   editCollectionImages = [];

  //   async function initializeForEdit() {
  //     if (collection) {
  //       editCollectionImages = await Promise.all(
  //         collection.coverUrls.map(API.getImageProxy)
  //       );

  //       updatePreview();
  //     }
  //   }

  //   function updatePreview() {
  //     imagesPreview.innerHTML = "";

  //     const totalImages = editCollectionImages.length;

  //     if (totalImages === 0) {
  //       imagesPreview.classList.remove("active");
  //       imagesCount.classList.remove("active");
  //       imagesCount.textContent = "";
  //       return;
  //     }

  //     imagesPreview.classList.add("active");
  //     imagesCount.classList.add("active");

  //     imagesCount.textContent = `${editCollectionImages.length} image${
  //       editCollectionImages.length > 1 ? "s" : ""
  //     } selected`;

  //     editCollectionImages.forEach((file, index) => {
  //       const reader = new FileReader();

  //       reader.onload = (e) => {
  //         const previewItem = document.createElement("div");

  //         previewItem.className = "preview-item";
  //         previewItem.innerHTML = `
  //           <img src="${e.target.result}" alt="${file.name}">
  //           <button class="remove-image js-remove-button"><i class="bi bi-x"></i></button>
  //           <div class="image-name">${file.name}</div>
  //         `;

  //         imagesPreview.appendChild(previewItem);
  //         previewItem
  //           .querySelector(".js-remove-button")
  //           .addEventListener("click", () => {
  //             editCollectionImages.splice(index, 1);

  //             updatePreview();
  //           });
  //       };

  //       reader.readAsDataURL(file);
  //     });
  //   }

  //   uploadButton.addEventListener("click", () => filesInput.click());

  //   filesInput.addEventListener("change", (e) => {
  //     const files = Array.from(e.target.files);

  //     if (files.length > 0) {
  //       editCollectionImages = [...editCollectionImages, ...files];

  //       console.log(editCollectionImages);

  //       updatePreview();
  //     }
  //   });

  //   initializeForEdit();
  // },

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

        const collectionData = {
          title: titleInput.value,
          description: descriptionInput.value,
        };

        var collectionImages = Utilis.Events.getImagesDataGetter(popUp);

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
        } else {
          console.log(collectionData);
          console.log(collectionImages);

          await API.Collections.updateCollection(collectionId, collectionData);
          const result = await API.Collections.updateCollectionImages(
            collectionId,
            collectionImages
          );

          console.log(result);
        }

        togglePopUpOff(popUp);
        window.location.reload();
      });
    },
  },
};

async function main() {
  await CollectionUI.Events.setupCollectionUI();

  await BannerUI.Events.setupBannerUI();
}

await main();

const sectionCards = document.querySelectorAll(".js-section-card");
sectionCards.forEach((sectionCard) => {
  const sectionCardHeader = sectionCard.querySelector(
    ".js-section-card-header"
  );

  sectionCardHeader.addEventListener("click", () => {
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

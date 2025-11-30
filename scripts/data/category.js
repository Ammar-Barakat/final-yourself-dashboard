export class CategoryItem {
  constructor({ id, title, description, images }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.images = images;
  }
}

export class Category {
  constructor({ id, name, itemsCount, categoryItems }) {
    this.id = id;
    this.name = name;
    this.itemsCount = itemsCount;
    this.categoryItems = categoryItems
      ? categoryItems.map((item) => new CategoryItem(item))
      : [];
  }
}

export class ContentSlide {
  constructor({ id, title, imageUrl }) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
  }
}

export class AdSlide {
  constructor({
    id,
    title,
    imageUrl,
    logoUrl,
    description,
    promoCode,
    linkUrl,
  }) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.logoUrl = logoUrl;
    this.description = description;
    this.promoCode = promoCode;
    this.linkUrl = linkUrl;
  }
}

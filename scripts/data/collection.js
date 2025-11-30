export class Collection {
  constructor({ id, title, description, coverUrls }) {
    (this.id = id),
      (this.title = title),
      (this.description = description),
      (this.coverUrls = coverUrls);
  }
}

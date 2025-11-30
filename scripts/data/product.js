export class Product {
  constructor({ id, name, name_AR, price, sizes, options, isCustomizable }) {
    this.id = id;
    this.name = name;
    this.name_AR = name_AR;
    this.price = price;
    this.sizes = sizes || [];
    this.options = options || [];
    this.isCustomizable = Boolean(isCustomizable);
  }
}

export class ProductDetails {
  constructor({
    id,
    name,
    price,
    iconUrl,
    mockupUrl,
    sizes,
    options,
    customs,
  }) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.iconUrl = iconUrl;
    this.mockupUrl = mockupUrl;
    this.sizes = Array.isArray(sizes)
      ? sizes.map((s) => new ProductSize(s))
      : [];
    this.options = Array.isArray(options)
      ? options.map((o) => new ProductOption(o))
      : [];
    this.customs = Array.isArray(customs)
      ? customs.map((c) => new ProductCustom(c))
      : [];
  }
}

class ProductSize {
  constructor({ id, label, width, height }) {
    this.id = id;
    this.label = label;
    this.width = width;
    this.height = height;
  }
}

class ProductOption {
  constructor({ id, name, values }) {
    this.id = id;
    this.name = name;
    this.values = values || [];
  }
}

class ProductCustom {
  constructor({ id, name, type }) {
    this.id = id;
    this.name = name;
    this.type = type;
  }
}

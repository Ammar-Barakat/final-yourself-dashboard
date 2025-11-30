export class School {
  constructor({
    id,
    code,
    name,
    abbreviation,
    location,
    phoneNumber,
    totalStudents,
    totalPacks,
    totalExtraProducts,
    status,
  }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.abbreviation = abbreviation;
    this.location = location;
    this.phoneNumber = phoneNumber;
    this.totalStudents = totalStudents;
    this.totalPacks = totalPacks;
    this.totalExtraProducts = totalExtraProducts;
    this.status = status;
  }
}

export class SchoolDetails {
  constructor({
    id,
    code,
    name,
    abbreviation,
    addDate,
    deliveryDate,
    depositAmount,
    location,
    totalStudents,
    status,
    contactName,
    contactPhoneNumber,
    packs = [],
    extraProducts = [],
  }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.abbreviation = abbreviation;
    this.addDate = addDate;
    this.deliveryDate = deliveryDate;
    this.depositAmount = depositAmount;
    this.location = location;
    this.totalStudents = totalStudents;
    this.status = status;
    this.contactName = contactName;
    this.contactPhoneNumber = contactPhoneNumber;
    this.packs = packs.map((p) => new SchoolPack(p));
    this.extraProducts = extraProducts.map((e) => new SchoolExtraProduct(e));
  }
}

export class SchoolPack {
  constructor({ id, name, name_AR, price, totalStudent, products = [] }) {
    this.id = id;
    this.name = name;
    this.name_AR = name_AR || "";
    this.price = price;
    this.totalStudent = totalStudent;
    this.products = products.map((p) => new SchoolPackProduct(p));
  }
}

export class SchoolPackProduct {
  constructor({
    id,
    productId,
    productName,
    productName_AR,
    productOptions = {},
    productCustoms = {},
    productAllowedCustoms = "",
    designImages = [],
  }) {
    this.id = id;
    this.productId = productId;
    this.productName = productName;
    this.productName_AR = productName_AR || "";
    this.productOptions = Object.entries(productOptions).map(([id, name]) => ({
      id,
      name,
    }));
    this.productCustoms = Object.entries(productCustoms).map(([id, name]) => ({
      id,
      name,
    }));
    this.productAllowedCustoms = productAllowedCustoms;
    this.designImages = designImages;
  }
}

class SchoolExtraProduct {
  constructor({
    id,
    productId,
    productName,
    productName_AR,
    productPrice,
    productOptions = {},
    productCustoms = {},
    productAllowedCustoms = "",
  }) {
    this.id = id;
    this.productId = productId;
    this.productName = productName;
    this.productName_AR = productName_AR || "";
    this.productPrice = productPrice;
    this.productOptions = Object.entries(productOptions).map(([id, name]) => ({
      id,
      name,
    }));
    this.productCustoms = Object.entries(productCustoms).map(([id, name]) => ({
      id,
      name,
    }));
    this.productAllowedCustoms = productAllowedCustoms;
  }
}

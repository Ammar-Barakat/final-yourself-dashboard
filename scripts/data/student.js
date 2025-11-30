export class StudentPack {
  constructor({
    id,
    studentName,
    studentPhoneNumber,
    studentFirstPaymentStatus,
    studentLastPaymentStatus,
    pack,
    hasExtras,
  }) {
    this.id = id;
    this.studentName = studentName;
    this.studentPhoneNumber = studentPhoneNumber;
    this.studentFirstPaymentStatus = studentFirstPaymentStatus;
    this.studentLastPaymentStatus = studentLastPaymentStatus;
    this.pack = new Pack(pack);
    this.hasExtras = hasExtras;
  }
}

class Pack {
  constructor({ packProducts = [] }) {
    this.packProducts = packProducts.map((pp) => new PackProduct(pp));
  }
}

class PackProduct {
  constructor({ selectedSize, selectedOptions = [], selectedCustoms = [] }) {
    this.selectedSize = selectedSize;
    this.selectedOptions = selectedOptions;
    this.selectedCustoms = selectedCustoms;
  }
}

// ==================== NEW STRUCTURE FOR STUDENT PACK DETAILS ====================

export class StudentPackDetails {
  constructor({
    id,
    studentName,
    studentPhoneNumber,
    studentFirstPaymentStatus,
    studentLastPaymentStatus,
    studentCoupons = [],
    pack,
    extras = [],
  }) {
    this.id = id;
    this.studentName = studentName;
    this.studentPhoneNumber = studentPhoneNumber;
    this.studentFirstPaymentStatus = studentFirstPaymentStatus;
    this.studentLastPaymentStatus = studentLastPaymentStatus;
    this.studentCoupons = studentCoupons.map(
      (coupon) => new StudentCoupon(coupon)
    );
    this.pack = new PackDetails(pack);
    this.extras = extras.map((extra) => new ExtraProductDetails(extra));
  }
}

class StudentCoupon {
  constructor({ id, code, discountPercentage, expiryDate, isUsed }) {
    this.id = id;
    this.code = code;
    this.discountPercentage = discountPercentage;
    this.expiryDate = expiryDate;
    this.isUsed = isUsed;
  }
}

class PackDetails {
  constructor({ id, name, price, packProducts = [] }) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.packProducts = packProducts.map((pp) => new PackProductDetails(pp));
  }
}

class ProductDetails {
  constructor({ id, name, sizes = [], options = [], customs = [] }) {
    this.id = id;
    this.name = name;
    this.sizes = sizes.map((size) => new SizeDetails(size));
    this.options = options.map((option) => new OptionDetails(option));
    this.customs = customs.map((custom) => new CustomDetails(custom));
  }
}

class PackProductDetails {
  constructor({ id, name, sizes = [], options = [], customs = [] }) {
    this.id = id;
    this.name = name;
    this.sizes = sizes.map((size) => new SizeDetails(size));
    this.options = options.map((option) => new OptionDetails(option));
    this.customs = customs.map((custom) => new CustomDetails(custom));
  }
}

class ExtraProductDetails {
  constructor({ id, name, price, sizes = [], options = [], customs = [] }) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.sizes = sizes.map((size) => new SizeDetails(size));
    this.options = options.map((option) => new OptionDetails(option));
    this.customs = customs.map((custom) => new CustomDetails(custom));
  }
}

class SizeDetails {
  constructor({ id, size, isSelected }) {
    this.id = id;
    this.size = size;
    this.isSelected = isSelected;
  }
}

class OptionDetails {
  constructor({ id, name, values = [] }) {
    this.id = id;
    this.name = name;
    this.values = values.map((value) => new OptionValueDetails(value));
  }
}

class OptionValueDetails {
  constructor({ value, isSelected }) {
    this.value = value;
    this.isSelected = isSelected;
  }
}

class CustomDetails {
  constructor({ id, name, type, value }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.value = value;
  }
}

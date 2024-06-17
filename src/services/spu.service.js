"use strict";
const SkuService = require("./sku.service");
const { AuthFailureError, BadRequestError } = require("../core/error.response");
const {
  grantAccess,
  checkPermission,
} = require("../middlewares/rbac.middleware");
const spuModel = require("../models/spu.model");
const {
  addPrefixToKeys,
  removePrefixFromKeys,
  getErrorMessageMongose,
  omitInfoData,
} = require("../utils");
const { getRoleNameByUserId } = require("../repositories/user.repo"); // Hàm mới
const { brandCheckExistById } = require("../repositories/brand.repo");
const skuService = require("./sku.service");
const { cateCheckEistById } = require("../repositories/category.repo");

class SpuService {
  constructor() {
    this.SkuService = SkuService;
    this.spus = spuModel;
  }

  /**
   * Creates a new SPU (Single Product Unit).
   *
   * @returns {Promise<Object>} The created SPU object.
   * @throws {AuthFailureError} If the user doesn't have permission to perform this action.
   * @throws {Error} If the shop is not found (only applicable for admin users).
   */
  async createSpu(userId, payload) {
    this.userId = userId;
    payload.thumb = payload.thumb ? payload.thumb : payload.images[0];
    this.payload = payload;
    // Kiểm tra quyền (admin hoặc shop) và gán biến permission
    const permission =
      (await checkPermission(this.userId, "createAny", "product")) ||
      (await checkPermission(this.userId, "createOwn", "product"));
    if (!permission) {
      throw new AuthFailureError(
        "You don't have permission to perform this action"
      );
    }
    const filter = permission.filter(this.payload);
    // Nếu là shop, gán thêm shopId vào payload
    if (permission.action === "createOwn") {
      filter.shopId = this.userId;
    }

    // Kiểm tra shop tồn tại (nếu là admin)
    if (permission.action === "createAny") {
      if (!filter.shopId) {
        filter.shopId = this.userId;
      } else {
        const foundShop = await getRoleNameByUserId(this.payload.shopId);
        if (!foundShop || foundShop.usr_role.rol_name !== "shop") {
          throw new Error("Shop not found");
        }
      }
    }
    // check categoryId is exist in category collection
    const category = await cateCheckEistById(this.payload.category);
    if (!category) {
      throw new BadRequestError("Category not found");
    }
    //check brandId is exist in brand collection if brandId is not null
    if (this.payload.brand) {
      if (!(await brandCheckExistById(this.payload.brand))) {
        throw new BadRequestError("Brand not found");
      }
    }
    if (this.payload.list_sku.length < 1) {
      throw new BadRequestError("The list_sku is not blank");
    }
    // Thêm tiền tố, tạo spu, chuyển đổi _id và trả về
    this.spu = addPrefixToKeys(filter, "spu_");
    const newSpu = await this.spus.create(this.spu).catch((err) => {
      throw new BadRequestError(
        getErrorMessageMongose(
          err,
          this.spus,
          "The name field value already exists"
        )
      );
    });
    // check sku default
    const sku_default = filter.variations.length === 0;
    // create sku of spu
    const sku = await new skuService().newSku({
      spu_id: newSpu.spu_id,
      sku_list: filter.list_sku,
      sku_default,
      permission,
    });
    // sync data via elassticsearch (serach.service)

    // repond result object

    return {
      ...omitInfoData({
        fields: ["_id", "__v"],
        object: removePrefixFromKeys(newSpu.toObject(), "spu_"),
      }),
      list_sku: sku,
    };
    // return newSpu;
  }
}

exports.spuService = SpuService; // Đổi tên biến để rõ nghĩa hơn

import { ObjectId } from "mongodb";

import { getDb } from "../config/database";

type ProductType = {
  id?: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  userId?: string;
};
// type ProductCreate = Omit<ProductType, 'id'>

class Product {
  _id?: ObjectId;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  userId?: ObjectId;

  constructor(productData: ProductType) {
    if (productData.id) this._id = new ObjectId(productData.id);
    this.title = productData.title;
    this.price = productData.price;
    this.description = productData.description;
    this.imageUrl = productData.imageUrl;
    this.userId = new ObjectId(productData.userId);
  }

  async save() {
    const db = getDb();

    try {
      let productDocumentInfo;
      if (this._id) {
        productDocumentInfo = await db
          .collection("products")
          .updateOne({ _id: this._id }, { $set: this });
      } else {
        productDocumentInfo = await db.collection("products").insertOne(this);
        this._id = productDocumentInfo.insertedId;
      }

      return this;
    } catch (err) {
      throw new Error(`Fail to create product: ${err}`);
    }
  }

  static fetchAll = async () => {
    const db = getDb();

    try {
      const products = await db
        .collection("products")
        .find()
        .limit(10)
        .toArray();
      products.map((prod) => (prod.id = prod._id));
      console.log(products);

      return products.map((prod) => {
        prod.id = prod._id.toString();
        return prod;
      });
    } catch (err) {
      throw new Error(`Fail to fetch products: ${err}`);
    }
  };

  static fetchOne = async (productId: string) => {
    const db = getDb();
    try {
      const product = await db
        .collection("products")
        .findOne<Product>({ _id: new ObjectId(productId) });

      if (!product) {
        return null;
      }

      return { id: product._id, ...product };
    } catch (err) {
      throw new Error(`Fail to fetch the product: ${err}`);
    }
  };

  static deleteOne = async (productId: string) => {
    const db = getDb();
    try {
      const result = await db
        .collection("products")
        .deleteOne({ _id: new ObjectId(productId) });
      console.log(result);
    } catch (err) {
      throw new Error(`Fail to delete the product: ${err}`);
    }
  };
}

export default Product;

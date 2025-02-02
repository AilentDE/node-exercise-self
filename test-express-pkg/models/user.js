const { v7: uuidv7 } = require("uuid");
const { readData, writeData } = require("../utils/editData");

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.age = data.age;
    this.city = data.city;
  }

  static async findAll() {
    const items = await readData();
    return items.map((item) => new User(item));
  }

  static async findById(id) {
    const items = await readData();
    const item = items.find((item) => item.id === id);
    if (item) {
      return new User(item);
    }
    return null;
  }

  async save() {
    const items = await readData();
    this.id = uuidv7();
    items.push(this);
    await writeData(items);
    return this;
  }

  async update(data) {
    const items = await readData();
    const index = items.findIndex((item) => item.id === this.id);
    if (index !== -1) {
      items[index] = { ...items[index], ...data };
      await writeData(items);
      return items[index];
    }
    return null;
  }

  async delete() {
    const items = await readData();
    const index = items.findIndex((item) => item.id === this.id);
    if (index !== -1) {
      const deletedItem = items.splice(index, 1);
      await writeData(items);
      return deletedItem;
    }
    return null;
  }
}

class Admin extends User {
  constructor(data) {
    super(data);
    this.role = "admin";
  }
}

module.exports = { User, Admin };

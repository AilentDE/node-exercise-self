const { Admin } = require("../models/user");

const getAdminList = async (_, res) => {
  try {
    const data = await Admin.findAll();
    res.json({ message: "Get Admin List", data });
  } catch (error) {
    res.status(500).json({ message: "Error reading data" });
  }
};

const createAdmin = async (req, res) => {
  try {
    const newItem = new Admin(req.body);
    const savedItem = await newItem.save();
    res.json({ message: "Admin Created", data: savedItem });
  } catch (error) {
    res.status(500).json({ message: "Error writing data" });
  }
};

const modifyAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Admin.findById(id);
    if (item) {
      item.update(req.body);
      res.json({ message: "Admin Updated", data: item });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating data" });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Admin.findById(id);
    if (item) {
      const deletedItem = await item.delete();
      res.json({ message: "Admin Deleted", data: deletedItem });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting data" });
  }
};

module.exports = {
  getAdminList,
  createAdmin,
  modifyAdmin,
  deleteAdmin,
};

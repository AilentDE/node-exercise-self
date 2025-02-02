const fs = require("fs").promises;
const { dataPath } = require("../utils/path");

const readData = async () => {
  try {
    const data = await fs.readFile(dataPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      // 如果檔案不存在，創建一個空的 data.json 檔案
      await writeData([]);
      return [];
    } else {
      throw error;
    }
  }
};

const writeData = async (data) => {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf8");
};

module.exports = {
  readData,
  writeData,
};

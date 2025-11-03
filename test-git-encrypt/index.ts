import "dotenv/config";

const message = process.env.MESSAGE;

console.log(message);
console.log("Version:", process.env.VERSION || "No version found");

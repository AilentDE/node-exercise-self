import axios from "axios";

const helloWorld = async () => {
  const response = await axios.get("http://localhost:3000");
  return response.data;
};

export default helloWorld;

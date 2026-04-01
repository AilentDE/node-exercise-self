import { Starship } from "../entries/star-wars";

const fetchSwapi = async () => {
  const response = await fetch("https://swapi.dev/api/starships/");
  const data = await response.json();
  return data.results as Starship[];
};

export default {
  fetchSwapi,
};

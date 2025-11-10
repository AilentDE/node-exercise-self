import { ApiRouteConfig, Handlers } from "motia";
import { TSStore } from "../../store/ts-store";

export const config: ApiRouteConfig = {
  name: "GetPets",
  type: "api",
  path: "/pets",
  method: "GET",
  emits: [],
  flows: ["PetManagement"],
};

export const handler: Handlers["GetPets"] = async (req, { logger }) => {
  // In a real application, this would be a database call
  // e.g., const pets = await db.pets.findMany()
  const pets = await TSStore.list();

  logger.info("Retrieved all pets", { count: pets.length });
  return { status: 200, body: pets };
};

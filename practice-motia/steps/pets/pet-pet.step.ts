import { ApiRouteConfig, Handlers } from "motia";
import { TSStore } from "../../store/ts-store";

export const config: ApiRouteConfig = {
  name: "GetPet",
  type: "api",
  path: "/pets/:id",
  method: "GET",
  emits: [],
  flows: ["PetManagement"],
};

export const handler: Handlers["GetPet"] = async (req, { logger }) => {
  // In a real application, this would be a database call
  // e.g., const pet = await db.pets.findById(req.pathParams.id)
  const pet = await TSStore.get(req.pathParams.id);

  if (!pet) {
    logger.warn("Pet not found", { id: req.pathParams.id });
    return { status: 404, body: { message: "Pet not found" } };
  }

  return { status: 200, body: pet };
};

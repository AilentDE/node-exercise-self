import { ApiRouteConfig, Handlers } from "motia";
import { TSStore } from "../../store/ts-store";

export const config: ApiRouteConfig = {
  name: "DeletePet",
  type: "api",
  path: "/pets/:id",
  method: "DELETE",
  emits: [],
  flows: ["PetManagement"],
};

export const handler: Handlers["DeletePet"] = async (req, { logger }) => {
  // In a real application, this would be a database call
  // e.g., const deleted = await db.pets.delete(req.pathParams.id)
  const deleted = await TSStore.remove(req.pathParams.id);

  if (!deleted) {
    return { status: 404, body: { message: "Pet not found" } };
  }

  logger.info("Pet deleted", { petId: req.pathParams.id });
  return { status: 204 };
};

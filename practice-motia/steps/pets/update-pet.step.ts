import { ApiRouteConfig, Handlers } from "motia";
import { z } from "zod";
import { TSStore } from "../../store/ts-store";

const updatePetSchema = z.object({
  name: z.string().min(1).optional(),
  status: z
    .enum([
      "new",
      "in_quarantine",
      "healthy",
      "available",
      "pending",
      "adopted",
      "ill",
      "under_treatment",
      "recovered",
      "deleted",
    ])
    .optional(),
  ageMonths: z.number().int().min(0).optional(),
});

export const config: ApiRouteConfig = {
  name: "UpdatePet",
  type: "api",
  path: "/pets/:id",
  method: "PUT",
  emits: [],
  bodySchema: updatePetSchema,
  flows: ["PetManagement"],
};

export const handler: Handlers["UpdatePet"] = async (req, { logger }) => {
  const updates = updatePetSchema.parse(req.body);

  // In a real application, this would be a database call
  // e.g., const pet = await db.pets.update(req.pathParams.id, updates)
  const pet = await TSStore.update(req.pathParams.id, updates);

  if (!pet) {
    return { status: 404, body: { message: "Pet not found" } };
  }

  logger.info("Pet updated", { petId: pet.id });
  return { status: 200, body: pet };
};

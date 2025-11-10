import { ApiRouteConfig, Handlers } from "motia";
import { z } from "zod";
import { PetCreated, TSStore } from "../../store/ts-store";

const updatePetSchema = z.object({
  name: z.string().min(1, "Name is required").trim().optional(),
  species: z.enum(["dog", "cat", "bird", "other"]).optional(),
  ageMonths: z
    .number()
    .int()
    .min(0, "Age must be a positive number")
    .optional(),
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
  notes: z.string().optional(),
  nextFeedingAt: z.number().optional(),
});

export const config: ApiRouteConfig = {
  name: "UpdatePet",
  type: "api",
  path: "/pets/:id",
  method: "PUT",
  emits: ["lc.pet.status.update.requested"],
  bodySchema: updatePetSchema,
  flows: ["PetManagement"],
};

export const handler: Handlers["UpdatePet"] = async (req, { emit, logger }) => {
  const updates = updatePetSchema.parse(req.body);

  // In a real application, this would be a database call
  // e.g., const pet = await db.pets.update(req.pathParams.id, updates)
  // const pet = await TSStore.update(req.pathParams.id, updates);

  // Update status with lifecycle orchestrator
  let pet: PetCreated | null = null;

  if (updates.status) {
    const { status, ...updateWihtoutStatus } = updates;
    pet = await TSStore.update(req.pathParams.id, updateWihtoutStatus);
    if (!pet) {
      return { status: 404, body: { message: "Pet not found" } };
    }
    await emit({
      topic: "lc.pet.status.update.requested",
      data: {
        petId: pet.id,
        event: "status.update.requested",
        requestedStatus: updates.status,
        automatic: true,
      },
    });
  } else {
    pet = await TSStore.get(req.pathParams.id);
    if (!pet) {
      return { status: 404, body: { message: "Pet not found" } };
    }
  }

  return { status: 202, body: pet };
};

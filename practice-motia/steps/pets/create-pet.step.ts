import { ApiRouteConfig, Handlers } from "motia";
import { z } from "zod";
import { TSStore } from "../../store/ts-store";

const createPetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.enum(["dog", "cat", "bird", "other"]),
  ageMonths: z.number().int().min(0),
});

export const config: ApiRouteConfig = {
  name: "CreatePet",
  type: "api",
  path: "/pets",
  method: "POST",
  // Declare what events this endpoint can emit
  emits: ["feeding-reminder.enqueued"],
  bodySchema: createPetSchema,
  flows: ["PetManagement"],
};

export const handler: Handlers["CreatePet"] = async (req, { emit, logger }) => {
  const data = createPetSchema.parse(req.body);

  // In a real application, this would be a database call
  // e.g., await db.pets.create(data)
  const pet = await TSStore.create(data);

  logger.info("Pet created", { petId: pet.id });

  // Emit event to trigger background job
  if (emit) {
    await emit({
      topic: "feeding-reminder.enqueued",
      data: {
        petId: pet.id,
        enqueuedAt: Date.now(),
      },
    });
  }

  return { status: 201, body: pet };
};

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
  emits: [],
  bodySchema: createPetSchema,
  flows: ["PetManagement"],
};

export const handler: Handlers["CreatePet"] = async (req, { logger }) => {
  const data = createPetSchema.parse(req.body);

  // In a real application, this would be a database call
  // e.g., await db.pets.create(data)
  const pet = await TSStore.create(data);

  logger.info("Pet created", { petId: pet.id });

  return { status: 201, body: pet };
};

import { EventConfig, Handlers } from "motia";
import { TSStore } from "../../store/ts-store";
import { z } from "zod";

export const config: EventConfig = {
  type: "event",
  name: "SetNextFeedingReminder",
  description:
    "Background job that sets next feeding reminder and adds welcome notes",
  // Subscribe to the event emitted by CreatePet
  subscribes: ["feeding-reminder.enqueued"],
  emits: [],
  flows: ["PetManagement"],
  input: z.object({
    petId: z.string(),
    enqueuedAt: z.number(),
  }),
};

export const handler: Handlers["SetNextFeedingReminder"] = async (
  input,
  { logger }
) => {
  const { petId, enqueuedAt } = input;

  if (logger) {
    logger.info("🔄 Setting next feeding reminder", {
      petId,
      enqueuedAt: new Date(enqueuedAt).toISOString(),
    });
  }

  try {
    // Calculate next feeding time (24 hours from now)
    const nextFeedingAt = Date.now() + 24 * 60 * 60 * 1000;

    // Fill in non-critical details
    const updates = {
      notes: "Welcome to our pet store! We'll take great care of this pet.",
      nextFeedingAt: nextFeedingAt,
    };

    const updatedPet = await TSStore.update(petId, updates);

    if (!updatedPet) {
      if (logger) {
        logger.error("❌ Failed to set feeding reminder - pet not found", {
          petId,
        });
      }
      return;
    }

    if (logger) {
      logger.info("✅ Next feeding reminder set", {
        petId,
        notes: updatedPet.notes?.substring(0, 50) + "...",
        nextFeedingAt: new Date(nextFeedingAt).toISOString(),
      });
    }

    // Feeding reminder scheduled successfully
  } catch (error: any) {
    if (logger) {
      logger.error("❌ Feeding reminder job error", {
        petId,
        error: error.message,
      });
    }
  }
};

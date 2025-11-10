import { CronConfig, Handlers } from "motia";
import { TSStore } from "../../store/ts-store";

export const config: CronConfig = {
  type: "cron",
  name: "DeletionReaper",
  description: "Daily job that permanently removes pets scheduled for deletion",
  cron: "*/5 * * * *", // Every 5 minutes
  emits: [],
  flows: ["PetManagement"],
};

export const handler: Handlers["DeletionReaper"] = async ({ logger }) => {
  if (logger) {
    logger.info("🔄 Deletion Reaper started - scanning for pets to purge");
  }

  try {
    const petsToRemove = await TSStore.findDeletedPetsToRemove();

    if (petsToRemove.length === 0) {
      if (logger) {
        logger.info("✅ Deletion Reaper completed - no pets to purge");
      }

      // No emit - no subscribers for ts.reaper.completed
      return;
    }

    let deletedCount = 0;

    for (const pet of petsToRemove) {
      const success = await TSStore.remove(pet.id);

      if (success) {
        deletedCount++;

        if (logger) {
          logger.info("✅ Pet permanently purged", {
            petId: pet.id,
            name: pet.name,
            deletedAt: Date.now(),
          });
        }

        // No emit - no subscribers for ts.pet.purged
      } else {
        if (logger) {
          logger.warn("⚠️ Failed to purge pet", {
            petId: pet.id,
            name: pet.name,
          });
        }
      }
    }

    if (logger) {
      logger.info("✅ Deletion Reaper completed", {
        totalScanned: petsToRemove.length,
        deletedCount,
        failedCount: petsToRemove.length - deletedCount,
      });
    }

    // No emit - no subscribers for ts.reaper.completed
  } catch (error: any) {
    if (logger) {
      logger.error("❌ Deletion Reaper error", { error: error.message });
    }
  }
};

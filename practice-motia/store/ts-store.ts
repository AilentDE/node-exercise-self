import fs from "fs/promises";

const STORE_PATH = "./store/db-pets.json";

interface Pet {
  name: string;
  species: string;
  ageMonths: number;
}

interface PetUpdate {
  name?: string;
  status?: string;
  ageMonths?: number;
  notes?: string;
  nextFeedingAt?: number;
}

export type PetCreated = {
  id: string;
  name: string;
  species: string;
  status: string;
  ageMonths: number;
  createdAt: number;
  notes?: string;
  nextFeedingAt?: number;
};

export class TSStore {
  private static async readStore(): Promise<PetCreated[]> {
    const dbExists = await fs.access(STORE_PATH, fs.constants.F_OK).then(
      () => true,
      () => false
    );
    if (!dbExists) {
      await fs.writeFile(STORE_PATH, JSON.stringify([], null, 2));
      return [];
    }

    const store = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(store) as PetCreated[];
  }

  static async create(data: Pet): Promise<PetCreated> {
    const store = await this.readStore();
    const preparePet: PetCreated = {
      ...data,
      id: crypto.randomUUID().toString(),
      status: "new",
      createdAt: Date.now(),
    };
    store.push(preparePet);
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
    return preparePet;
  }

  static async list(): Promise<PetCreated[]> {
    const store = await this.readStore();
    return store;
  }

  static async get(id: string): Promise<PetCreated | null> {
    const store = await this.readStore();
    return store.find((pet) => pet.id === id) || null;
  }

  static async update(id: string, data: PetUpdate): Promise<PetCreated | null> {
    const store = await this.readStore();
    const pet = store.find((pet) => pet.id === id);
    if (!pet) {
      return null;
    }
    const updatedPet = { ...pet, ...data };
    store.splice(store.indexOf(pet), 1, updatedPet);
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
    return updatedPet;
  }

  static async remove(id: string): Promise<boolean> {
    const store = await this.readStore();
    const pet = store.find((pet) => pet.id === id);
    if (!pet) {
      return false;
    }
    store.splice(store.indexOf(pet), 1);
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
    return true;
  }

  static async findDeletedPetsToRemove(): Promise<PetCreated[]> {
    const store = await this.readStore();
    return store.filter((pet) => pet.status === "deleted");
  }
}

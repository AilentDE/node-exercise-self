import { app, ServiceError } from "@getcronit/pylon";
import { serve } from "@hono/node-server";

import StarWarsController from "./controllers/star-wars-controller";
import StarWarsStore from "./stores/star-wars-store";

export const graphql = {
  Query: {
    hello: () => {
      return "Hello, world!";
    },
    starships: StarWarsController.fetchSwapi,
    character: StarWarsStore.getCharacter,
    characters: StarWarsStore.getCharacters,
    throwError: () => {
      throw new ServiceError("This is a custom error message", {
        statusCode: 400,
        code: "CUSTOM_ERROR",
        details: {
          message: "This is a custom error message",
        },
      });
    },
  },
  Mutation: {
    sum: (a: number, b: number) => a + b,
    divide: (a: number, b: number) => a / b,
    addCharacter: StarWarsStore.addCharacter,
    deleteCharacter: StarWarsStore.deleteCharacter,
  },
};

serve(app, (info) => {
  console.log(`Server running at ${info.port}`);
});

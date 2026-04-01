class StarWarsStore {
  private characters = [
    { id: 1, name: "Luke Skywalker", height: 172 },
    { id: 2, name: "Darth Vader", height: 202 },
  ];

  //   arrow function can avoid binding
  //   constructor() {
  //     this.getCharacter = this.getCharacter.bind(this);
  //     this.getCharacters = this.getCharacters.bind(this);
  //     this.addCharacter = this.addCharacter.bind(this);
  //     this.deleteCharacter = this.deleteCharacter.bind(this);
  //   }

  getCharacter = (id: number) => {
    return this.characters.find((character) => character.id === id);
  };

  getCharacters = () => {
    return this.characters;
  };

  addCharacter = (name: string, height: number) => {
    const id = Math.max(...this.characters.map((c) => c.id)) + 1;
    const newCharacter = { id, name, height };
    this.characters.push(newCharacter);
    return newCharacter;
  };

  deleteCharacter = (id: number) => {
    const character = this.getCharacter(id);
    if (!character) return null;

    this.characters = this.characters.filter((c) => c.id !== id);
    return character;
  };
}

export default new StarWarsStore();

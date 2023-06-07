export function generateGreeting(): string {
  const greetings = [
    "Hi there",
    "Hello",
    "Hey there",
    "Greetings",
    "Salutations",
    "Aloha",
    "Bonjour",
    "Ahoy",
    "Allo",
    "Hola",
    "Howdy",
    "Hallo",
    "Hallå",
  ];

  const randomIndex = Math.floor(Math.random() * greetings.length);
  return greetings[randomIndex];
}

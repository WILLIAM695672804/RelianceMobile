/**
 * Garantit l'exhaustivité d'un `switch` sur une union discriminée.
 * @throws {Error} si une valeur non prévue est atteinte à l'exécution.
 */
export function assertNever(value: never): never {
  throw new Error(`Valeur non prise en charge : ${JSON.stringify(value)}`);
}

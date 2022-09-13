export function get(obj: any, key: string, def: any = undefined) {
  return (obj || {})[key] || def;
}

export function toFahrenheit(celsius: number): number {
  return (1.8 * celsius) + 32;
}

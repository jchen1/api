export function get(obj: any, key: string, def: any = undefined) {
  return (obj || {})[key] || def;
}

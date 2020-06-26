export function getReportName(type: string, index: number, localize: (x: string) => string) {
  const typeLocalized = localize(type.toLowerCase());
  if (typeLocalized) {
    return localize(type.toLowerCase()).split(' ')[0] + (index + 1);
  }
  return type;
}

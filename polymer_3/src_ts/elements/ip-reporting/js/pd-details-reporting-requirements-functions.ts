export function getReportName(type: string, index: number, localize: Function) {
  const typeLocalized = localize(type.toLowerCase());
  if (typeLocalized) {
    return localize(type.toLowerCase()).split(' ')[0] + (index + 1);
  }
  return type;
}

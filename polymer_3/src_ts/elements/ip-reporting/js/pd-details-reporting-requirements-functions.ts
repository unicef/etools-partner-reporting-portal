export function getReportName(type: string, index: number, localize: Function) {
  return localize(type.toLowerCase()).split(' ')[0] + (index + 1);
}

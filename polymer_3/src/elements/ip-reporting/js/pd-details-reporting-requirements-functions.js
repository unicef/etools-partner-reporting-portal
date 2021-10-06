export function getReportName(type, index, localize) {
    const typeLocalized = localize(type.toLowerCase());
    if (typeLocalized) {
        return localize(type.toLowerCase()).split(' ')[0] + (index + 1);
    }
    return type;
}

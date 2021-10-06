/**
 * @polymer
 * @mixinFunction
 */
function DisaggregationFieldMixin(baseClass) {
    class DisaggregationFieldClass extends baseClass {
        _toNumericValues(obj) {
            return Object.keys(obj).reduce((prev, curr) => {
                prev[curr] = Number(obj[curr]);
                return prev;
            }, {});
        }
    }
    return DisaggregationFieldClass;
}
export default DisaggregationFieldMixin;

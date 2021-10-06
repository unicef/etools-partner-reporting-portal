var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { property } from '@polymer/decorators';
/**
 * @polymer
 * @mixinFunction
 */
function FilterDependenciesMixin(baseClass) {
    class FilterDependenciesClass extends baseClass {
        constructor() {
            super(...arguments);
            this.dependencies = '';
            this.defaultParams = {};
        }
        static get observers() {
            return [
                '_computeParams(dependencies, queryParams)',
            ];
        }
        _computeParams(dependencies, queryParams) {
            if (!queryParams) {
                return;
            }
            const newParams = dependencies
                .split(',')
                .filter(Boolean)
                .reduce(function (acc, key) {
                if (typeof queryParams[key] !== 'undefined') {
                    acc[key] = queryParams[key];
                }
                return acc;
            }, Object.assign({}, this.defaultParams));
            const serialized = this._serializeParams(newParams);
            if (serialized !== this.get('lastParams')) {
                this.set('lastParams', serialized);
                this.set('params', newParams);
            }
        }
        _serializeParams(params) {
            return JSON.stringify(params);
        }
    }
    __decorate([
        property({ type: String })
    ], FilterDependenciesClass.prototype, "lastParams", void 0);
    __decorate([
        property({ type: Object })
    ], FilterDependenciesClass.prototype, "params", void 0);
    __decorate([
        property({ type: String })
    ], FilterDependenciesClass.prototype, "dependencies", void 0);
    __decorate([
        property({ type: Object })
    ], FilterDependenciesClass.prototype, "defaultParams", void 0);
    return FilterDependenciesClass;
}
export default FilterDependenciesMixin;

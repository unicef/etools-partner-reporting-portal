var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { property } from '@polymer/decorators';
import { fireEvent } from '../utils/fire-custom-event';
/**
 * @polymer
 * @mixinFunction
 */
function FilterMixin(baseClass) {
    class FilterClass extends baseClass {
        _computeLastValue(value) {
            return value;
        }
        _filterReady() {
            setTimeout(() => {
                fireEvent(this, 'filter-ready', this.name);
            });
        }
        connectedCallback() {
            super.connectedCallback();
            fireEvent(this, 'register-filter', this.name);
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            fireEvent(this, 'deregister-filter', this.name);
        }
    }
    FilterClass._debounceDelay = 400;
    __decorate([
        property({ type: String })
    ], FilterClass.prototype, "label", void 0);
    __decorate([
        property({ type: String })
    ], FilterClass.prototype, "name", void 0);
    __decorate([
        property({ type: String, computed: '_computeLastValue(value)' })
    ], FilterClass.prototype, "lastValue", void 0);
    return FilterClass;
}
export default FilterMixin;

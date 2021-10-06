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
function ChipMixin(baseClass) {
    class ChipClass extends baseClass {
        constructor() {
            super(...arguments);
            this._adding = false;
        }
        _open(e) {
            e.preventDefault();
            this.set('_adding', true);
        }
        _close() {
            this.set('_adding', false);
        }
    }
    __decorate([
        property({ type: Boolean, observer: '_setDefaults' })
    ], ChipClass.prototype, "_adding", void 0);
    return ChipClass;
}
export default ChipMixin;

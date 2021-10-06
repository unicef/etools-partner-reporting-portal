var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { property } from '@polymer/decorators';
import Settings from '../settings';
/**
 * @polymer
 * @mixinFunction
 */
function ResponsiveMixin(baseClass) {
    class ResponsiveClass extends baseClass {
        constructor() {
            super(...arguments);
            this.desktopLayoutQuery = Settings.layout.threshold;
            this.isDesktop = {
                type: Boolean
            };
        }
        static get observers() {
            return [
                '_isDesktopChanged(isDesktop)'
            ];
        }
        _isDesktopChanged() {
            this.updateStyles();
        }
    }
    __decorate([
        property({ type: String, readOnly: true })
    ], ResponsiveClass.prototype, "desktopLayoutQuery", void 0);
    __decorate([
        property({ type: Object })
    ], ResponsiveClass.prototype, "isDesktop", void 0);
    return ResponsiveClass;
}
export default ResponsiveMixin;

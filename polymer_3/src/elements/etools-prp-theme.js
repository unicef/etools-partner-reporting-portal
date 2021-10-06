var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement } from '@polymer/polymer';
import Constants from '../etools-prp-common/constants';
import { property } from '@polymer/decorators/lib/decorators';
/**
 * @polymer
 * @customElement
 */
class EtoolsPrpTheme extends PolymerElement {
    constructor() {
        super(...arguments);
        this.primaryColor = Constants.THEME_PRIMARY_COLOR_IP;
    }
}
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.app.current)' })
], EtoolsPrpTheme.prototype, "_app", void 0);
__decorate([
    property({ type: String, notify: true })
], EtoolsPrpTheme.prototype, "primaryColor", void 0);
export default EtoolsPrpTheme;

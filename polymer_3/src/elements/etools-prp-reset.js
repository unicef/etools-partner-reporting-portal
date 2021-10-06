var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement } from '@polymer/polymer';
import UtilsMixin from '../mixins/utils-mixin';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { property } from '@polymer/decorators/lib/decorators';
import { timeOut } from '@polymer/polymer/lib/utils/async';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class EtoolsPrpReset extends UtilsMixin(PolymerElement) {
    constructor() {
        super(...arguments);
        this.skipInitial = false;
        this.isInitial = true;
        this._debouncer = null;
    }
    _trigerred() {
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(10), () => {
            if (this.get('skipInitial') && this.get('isInitial')) {
                this.set('isInitial', false);
                return;
            }
            this.set('reset', undefined);
        });
    }
}
__decorate([
    property({ type: Object, notify: true })
], EtoolsPrpReset.prototype, "reset", void 0);
__decorate([
    property({ type: Boolean })
], EtoolsPrpReset.prototype, "skipInitial", void 0);
__decorate([
    property({ type: Boolean })
], EtoolsPrpReset.prototype, "isInitial", void 0);
__decorate([
    property({ type: String, observer: '_trigerred' })
], EtoolsPrpReset.prototype, "trigger", void 0);
window.customElements.define('etools-prp-reset', EtoolsPrpReset);

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import Settings from '../../../settings';
import '../dropdown-filter/dropdown-filter';
import LocalizeMixin from '../../../mixins/localize-mixin';
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class LocationTypeFilter extends LocalizeMixin(ReduxConnectedElement) {
    constructor() {
        super(...arguments);
        this.maxLocType = Settings.cluster.maxLocType;
    }
    static get template() {
        return html `
    <style>
      :host {
        display: block;
      }
    </style>

    <dropdown-filter
      label="[[localize('location_type')]]"
      name="loc_type"
      value="[[value]]"
      data="[[data]]">
    </dropdown-filter>
  `;
    }
    _computeData(maxLocType) {
        return Array.apply(null, Array(maxLocType + 1))
            .map((_, index) => {
            return {
                id: String(index),
                title: 'Admin' + index
            };
        });
    }
}
__decorate([
    property({ type: Number })
], LocationTypeFilter.prototype, "maxLocType", void 0);
__decorate([
    property({ type: Array, computed: '_computeData(maxLocType)' })
], LocationTypeFilter.prototype, "data", void 0);
__decorate([
    property({ type: String })
], LocationTypeFilter.prototype, "value", void 0);
window.customElements.define('location-type-filter', LocationTypeFilter);

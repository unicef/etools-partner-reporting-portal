var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import Settings from '../../../settings';
import '../dropdown-filter/dropdown-filter';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import FilterDependenciesMixin from '../../../mixins/filter-dependencies-mixin';
import LocalizeMixin from '../../../mixins/localize-mixin';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin FilterDependenciesMixin
 */
class NarrowLocationTypeFilter extends LocalizeMixin(FilterDependenciesMixin(ReduxConnectedElement)) {
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

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <dropdown-filter
        label="[[localize('narrow_location_type')]]"
        name="narrow_loc_type"
        value="[[fieldValue]]"
        data="[[data]]"
        disabled="[[disabled]]">
    </dropdown-filter>
  `;
    }
    _computeData(params, maxLocType) {
        if (!params) {
            return;
        }
        const validData = Array.apply(null, Array(maxLocType + 1))
            .map((_, index) => {
            return {
                id: String(index),
                title: 'Admin' + index
            };
        })
            .slice(Number(params.loc_type) + 1);
        return [
            {
                id: '',
                title: 'None'
            }
        ].concat(validData);
    }
    _computeDisabled(data) {
        return data && data.length === 1;
    }
    _computeFieldValue(value, data, locType, maxLocType) {
        if (data === undefined || locType === undefined) {
            return;
        }
        switch (true) {
            case !value:
            case data.length === 1:
                return data[0].id;
            default:
                return Math.min(Math.max(Number(value), Number(locType) + 1), maxLocType);
        }
    }
}
__decorate([
    property({ type: Object })
], NarrowLocationTypeFilter.prototype, "params", void 0);
__decorate([
    property({ type: Number })
], NarrowLocationTypeFilter.prototype, "maxLocType", void 0);
__decorate([
    property({ type: Array, computed: '_computeData(params, maxLocType)' })
], NarrowLocationTypeFilter.prototype, "data", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeDisabled(data)' })
], NarrowLocationTypeFilter.prototype, "disabled", void 0);
__decorate([
    property({ type: String, computed: '_computeFieldValue(value, data, params.loc_type, maxLocType)' })
], NarrowLocationTypeFilter.prototype, "fieldValue", void 0);
__decorate([
    property({ type: String })
], NarrowLocationTypeFilter.prototype, "value", void 0);
window.customElements.define('narrow-location-type-filter', NarrowLocationTypeFilter);

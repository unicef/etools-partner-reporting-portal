var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../mixins/utils-mixin';
import '../../filters/cluster-filter/cluster-filter';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class FilterListByCluster extends UtilsMixin(PolymerElement) {
    static get template() {
        return html `
    <style>
    : host {
      display: block;
    }
    </style>

    <iron-location
      query="{{query}}">
    </iron-location>

    <iron-query-params
      params-string="{{query}}"
      params-object="{{queryParams}}" >
    </iron-query-params>

    <cluster-filter
      name="cluster_id"
      value="[[_withDefault(queryParams.cluster_id, '')]]">
    </cluster-filter>
  `;
    }
    _onFilterChanged(e) {
        const change = {
            page: 1,
        };
        const data = e.detail;
        change[data.name] = data.value;
        e.stopPropagation();
        this.set('queryParams', Object.assign({}, this.queryParams, change));
    }
    _addEventListeners() {
        this._onFilterChanged = this._onFilterChanged.bind(this);
        this.addEventListener('filter-changed', this._onFilterChanged);
    }
    _removeEventListeners() {
        this.removeEventListener('filter-changed', this._onFilterChanged);
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    disconnectedCallback() {
        super.connectedCallback();
        this._removeEventListeners();
    }
}
__decorate([
    property({ type: String })
], FilterListByCluster.prototype, "query", void 0);
__decorate([
    property({ type: Object })
], FilterListByCluster.prototype, "queryParams", void 0);
window.customElements.define('filter-list-by-cluster', FilterListByCluster);

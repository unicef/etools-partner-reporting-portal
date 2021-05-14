import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../mixins/utils-mixin';
import '../../filters/cluster-filter/cluster-filter';
import {GenericObject} from '../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class FilterListByCluster extends UtilsMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        : host {
          display: block;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <cluster-filter name="cluster_id" value="[[_withDefault(queryParams.cluster_id, '')]]"> </cluster-filter>
    `;
  }

  @property({type: String})
  query!: string;

  @property({type: Object})
  queryParams!: GenericObject;

  _onFilterChanged(e: CustomEvent) {
    const change: GenericObject = {
      page: 1
    };
    const data = e.detail;
    change[data.name] = data.value;

    e.stopPropagation();

    this.set('queryParams', Object.assign({}, this.queryParams, change));
  }

  _addEventListeners() {
    this._onFilterChanged = this._onFilterChanged.bind(this);
    this.addEventListener('filter-changed', this._onFilterChanged as any);
  }

  _removeEventListeners() {
    this.removeEventListener('filter-changed', this._onFilterChanged as any);
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

window.customElements.define('filter-list-by-cluster', FilterListByCluster);

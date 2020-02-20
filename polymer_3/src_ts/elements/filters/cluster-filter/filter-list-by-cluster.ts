import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../../../polyfills/es6-shim';
//<link rel="import" href = "../../../polyfills/es6-shim.html" >
import UtilsMixin from '../../../mixins/utils-mixin';
import '../../filters/cluster-filter/cluster-filter';
//<link rel="import" href = "../../filters/cluster-filter/cluster-filter.html" >

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class FilterListByCluster extends UtilsMixin(PolymerElement) {
  static get template() {
    return html`
    : host {
      display: block;
    }
    </style>

    < iron - location
      query = "{{query}}" >
    </iron-location>

    < iron - query - params
      params - string="{{query}}"
      params - object="{{queryParams}}" >
    </iron-query-params>

    < cluster - filter
      name = "cluster_id"
      value = "[[_withDefault(queryParams.cluster_id, '')]]" >
    </cluster-filter>
  `;
  }

  @property({type: Object})
  queryParams!: Object;

  _onFilterChanged(e: CustomEvent) {
    var change = {
      page: 1,
    };
    const data = e.detail;
    change[data.name] = data.value;

    e.stopPropagation();

    this.set('queryParams', Object.assign({}, this.queryParams, change));
  };

  _addEventListeners() {
    this._onFilterChanged = this._onFilterChanged.bind(this);
    this.addEventListener('filter-changed', this._onFilterChanged);
  };

  _removeEventListeners() {
    this.removeEventListener('filter-changed', this._onFilterChanged);
  };

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  };

  disconnectedCallback() {
    super.connectedCallback();
    this._removeEventListeners();
  };
}

window.customElements.define('filter-list-by-cluster', FilterListByCluster);

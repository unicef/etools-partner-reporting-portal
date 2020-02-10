import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location.js';
import '@polymer/iron-location/iron-query-params.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/etools-loading/etools-loading.js'
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/polymer/lib/elements/dom-if';
import LocalizeMixin from '../mixins/localize-mixin';
import {GenericObject} from '../typings/globals.types';

// (dci)
// <link rel="import" href="../redux/store.html">
// <link rel="import" href="../redux/actions/localize.html">
// behaviors: [
//   App.Behaviors.ReduxBehavior,
//   App.Behaviors.LocalizeBehavior,
//   Polymer.AppLocalizeBehavior,
// ],

/**
 * @polymer
 * @customElement
 */
class FilterList extends LocalizeMixin(PolymerElement) {

  static get template() {
    return html`
    <style include="iron-flex">
      :host {
        background-color: #f9f9f9;
        display: block;
        position: relative;
      }

      div#action {
        @apply --layout-horizontal;
        @apply --layout-end-justified;
      }

      paper-button {
        margin: 0 10px;
        text-transform: uppercase;
      }

    </style>

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <content></content>

    <template
        is="dom-if"
        if="[[!hideClear]]"
        restamp="true">
      <div id="action">
        <paper-button on-tap="_clearFilters">[[localize('clear')]]</paper-button>
      </div>
    </template>

    <etools-loading active="[[loading]]"></etools-loading>
  `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Array})
  filters!: any[];

  @property({type: Object})
  filtersReady!: GenericObject;

  @property({type: String})
  ignore: string = '';

  @property({type: Array, computed: '_computeIgnoredFilters(ignore)'})
  ignoredFilters!: any[];

  @property({type: Boolean})
  loading: boolean = false;

  @property({type: Boolean})
  hideClear: boolean = false;

  public static get observers() {
    return [
      '_updateLoading(filters.splices, filtersReady.*)',
    ]
  }

  _onFilterChanged(e: CustomEvent) {
    e.stopPropagation();
    const change = e.detail;
    /**
     * If we ever decide to debounce accross filters,
     * here's the place to put the logic for it.
     */

    setTimeout(() => {
      const newParams = Object.assign({}, this.queryParams);

      if (change.value && change.value.length) {
        newParams[change.name] = change.value;
      } else {
        delete newParams[change.name];
      }

      this.set('queryParams', newParams);

      this._resetPageNumber();
    });
  }

  _registerFilter(e: CustomEvent) {
    e.stopPropagation();
    const name = e.detail;
    if (this.ignoredFilters.indexOf(name) !== -1) {
      return;
    }

    this.push('filters', name);
  }

  _deregisterFilter(e: CustomEvent) {
    e.stopPropagation();
    const name = e.detail;
    const index = this.filters.indexOf(name);

    if (index === -1) {
      return;
    }

    this.splice('filters', index, 1);
  }

  _filterReady(e: CustomEvent) {
    e.stopPropagation();
    const name = e.detail;
    if (this.ignoredFilters.indexOf(name) !== -1) {
      return;
    }

    this.set(['filtersReady', name], true);
  }

  _clearFilters() {
    const self = this;

    this.set('queryParams', Object.keys(this.queryParams)
      .reduce(function(prev, curr) {
        if (self.filters.indexOf(curr) === -1) {
          prev[curr] = self.queryParams[curr];
        } else {
          prev[curr] = ''; // Can't set to undefined (does not trigger observers)
        }

        return prev;
      }, {}));

    this._resetPageNumber();
  }

  _resetPageNumber() {
    this.set('queryParams', Object.assign({}, this.queryParams, {
      page: 1,
    }));
  }

  _computeIgnoredFilters(ignore: string) {
    return ignore.split(',')
      .filter(Boolean);
  }

  _updateLoading() {
    setTimeout(() => {
      const filtersCount = this.filters.length - this.ignoredFilters.length;
      const readyCount = Object.keys(this.filtersReady).length;

      this.set('loading', readyCount < filtersCount);
    });
  }

  _addEventListeners() {
    this._onFilterChanged = this._onFilterChanged.bind(this);
    this.addEventListener('filter-changed', this._onFilterChanged as any);
    this._registerFilter = this._registerFilter.bind(this);
    this.addEventListener('register-filter', this._registerFilter as any);
    this._filterReady = this._filterReady.bind(this);
    this.addEventListener('filter-ready', this._filterReady as any);
    this._deregisterFilter = this._deregisterFilter.bind(this);
    this.addEventListener('deregister-filter', this._deregisterFilter as any);
  }

  connectedCallback() {
    super.connectedCallback();

    this.set('filters', []);
    this.set('filtersReady', {});
    this._addEventListeners();
  }

  _removeEventListeners() {
    this.removeEventListener('filter-changed', this._onFilterChanged as any);
    this.removeEventListener('register-filter', this._registerFilter as any);
    this.removeEventListener('filter-ready', this._filterReady as any);
    this.removeEventListener('deregister-filter', this._deregisterFilter as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._removeEventListeners();
  }

}
window.customElements.define('filter-list', FilterList);

export {FilterList as FilterListEl};

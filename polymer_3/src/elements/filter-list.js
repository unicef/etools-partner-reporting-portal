var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/polymer/lib/elements/dom-if';
import LocalizeMixin from '../mixins/localize-mixin';
import { ReduxConnectedElement } from '../ReduxConnectedElement';
/**
 * @polymer
 * @customElement
 */
class FilterList extends LocalizeMixin(ReduxConnectedElement) {
    constructor() {
        super(...arguments);
        this.ignore = '';
        this.loading = false;
        this.hideClear = false;
    }
    static get template() {
        return html `
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

    <slot></slot>

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
    static get observers() {
        return [
            '_updateLoading(filters.splices, filtersReady.*)',
        ];
    }
    _onFilterChanged(e) {
        e.stopPropagation();
        const change = e.detail;
        /**
         * If we ever decide to debounce accross filters,
         * here's the place to put the logic for it.
         */
        //setTimeout(() => {
        const newParams = Object.assign({}, this.queryParams);
        if (change.value && change.value.length) {
            newParams[change.name] = change.value;
        }
        else {
            delete newParams[change.name];
        }
        this.set('queryParams', newParams);
        this._resetPageNumber();
        //});
    }
    _registerFilter(e) {
        e.stopPropagation();
        const name = e.detail;
        if (!name) {
            return;
        }
        if (this.ignoredFilters.indexOf(name) !== -1) {
            return;
        }
        this.push('filters', name);
    }
    _deregisterFilter(e) {
        e.stopPropagation();
        const name = e.detail;
        const index = this.filters.indexOf(name);
        if (index === -1) {
            return;
        }
        this.splice('filters', index, 1);
    }
    _filterReady(e) {
        e.stopPropagation();
        const name = e.detail;
        if (!name) {
            return;
        }
        if (this.ignoredFilters.indexOf(name) !== -1) {
            return;
        }
        this.set(['filtersReady', name], true);
    }
    _clearFilters() {
        const self = this;
        const clearParams = Object.keys(this.queryParams)
            .reduce(function (prev, curr) {
            if (self.filters.indexOf(curr) === -1) {
                prev[curr] = self.queryParams[curr];
            }
            else {
                prev[curr] = ''; // Can't set to undefined (does not trigger observers)
            }
            return prev;
        }, {});
        this.set('queryParams', clearParams);
        this._resetPageNumber();
    }
    _resetPageNumber() {
        this.set('queryParams', Object.assign({}, this.queryParams, {
            page: 1,
        }));
    }
    _computeIgnoredFilters(ignore) {
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
        this.addEventListener('filter-changed', this._onFilterChanged);
        this._registerFilter = this._registerFilter.bind(this);
        this.addEventListener('register-filter', this._registerFilter);
        this._filterReady = this._filterReady.bind(this);
        this.addEventListener('filter-ready', this._filterReady);
        this._deregisterFilter = this._deregisterFilter.bind(this);
        this.addEventListener('deregister-filter', this._deregisterFilter);
    }
    connectedCallback() {
        super.connectedCallback();
        this.set('filters', []);
        this.set('filtersReady', {});
        this._addEventListeners();
    }
    _removeEventListeners() {
        this.removeEventListener('filter-changed', this._onFilterChanged);
        this.removeEventListener('register-filter', this._registerFilter);
        this.removeEventListener('filter-ready', this._filterReady);
        this.removeEventListener('deregister-filter', this._deregisterFilter);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
    }
}
__decorate([
    property({ type: Object })
], FilterList.prototype, "queryParams", void 0);
__decorate([
    property({ type: Array })
], FilterList.prototype, "filters", void 0);
__decorate([
    property({ type: Object })
], FilterList.prototype, "filtersReady", void 0);
__decorate([
    property({ type: String })
], FilterList.prototype, "ignore", void 0);
__decorate([
    property({ type: Array, computed: '_computeIgnoredFilters(ignore)' })
], FilterList.prototype, "ignoredFilters", void 0);
__decorate([
    property({ type: Boolean })
], FilterList.prototype, "loading", void 0);
__decorate([
    property({ type: Boolean })
], FilterList.prototype, "hideClear", void 0);
window.customElements.define('filter-list', FilterList);
export { FilterList as FilterListEl };

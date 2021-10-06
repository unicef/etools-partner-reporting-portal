var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/paper-tooltip/paper-tooltip';
import '@unicef-polymer/etools-data-table/etools-data-table';
import './analysis-widget';
import LocalizeMixin from '../../../mixins/localize-mixin';
import UtilsMixin from '../../../mixins/utils-mixin';
import { tableStyles } from '../../../styles/table-styles';
import '../../list-placeholder';
import '../../etools-prp-number';
/**
* @polymer
* @customElement
* @mixinFunction
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
*/
class OperationalPresenceTable extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
    ${tableStyles}
    <style include="data-table-styles">
      :host {
        display: block;
      }

      .table-column {
        text-transform: capitalize;
      }

      .number-of-partners {
        font-size: 2.5em;
        line-height: 2;
      }

      .tooltip-content {
        max-width: 200px;
        font-size: 11px;
        line-height: 1.5;
      }

      .table-container {
        max-height: 700px;
        overflow: auto;
      }
    </style>

    <analysis-widget
        widget-title="[[localize('operational_presence_table')]]"
        loading="[[loading]]">

      <div class="table-container">
        <etools-data-table-header
            no-title
            no-collapse>
          <etools-data-table-column field="">
            <div class="table-column">[[localize('location')]]</div>
          </etools-data-table-column>

          <template
              is="dom-repeat"
              items="[[columnNames]]"
              as="column">
            <etools-data-table-column field="">
              <div class="table-column">[[column]]</div>
            </etools-data-table-column>
          </template>
        </etools-data-table-header>

        <template
            is="dom-repeat"
            items="[[data.features]]"
            as="feature">
          <etools-data-table-row no-collapse>
            <div slot="row-data">
              <div class="table-cell table-cell--text">
                [[feature.properties.title]]
              </div>

              <template
                  is="dom-repeat"
                  items="[[columnNames]]"
                  as="column">
                <div class="table-cell">
                  <span>
                    <strong>[[_computeNumberOfPartners(column, feature)]]</strong>:
                    [[_computeExcerpt(column, feature, excerptLength)]]
                    <paper-tooltip offset="5">
                      <div class="tooltip-content">
                        <div>[[column]]</div>
                        <div class="number-of-partners">
                          <etools-prp-number
                              value="[[_computeNumberOfPartners(column, feature)]]">
                          </etools-prp-number>
                        </div>
                        <div>[[_getFormattedPartners(column, feature)]]</div>
                      </div>
                    </paper-tooltip>
                  </span>
                </div>
              </template>
            </div>
          </etools-data-table-row>
        </template>

        <list-placeholder
            data="[[data.features]]"
            loading="[[loading]]">
        </list-placeholder>
      </div>
    </analysis-widget>
    `;
    }
    _computeColumnNames(data) {
        return data.features.length ?
            Object.keys(data.features[0].properties.partners) :
            [];
    }
    _getPartners(column, feature) {
        return feature.properties.partners[column];
    }
    _computeExcerpt(column, feature, excerptLength) {
        return this._truncate(this._getFormattedPartners(column, feature), excerptLength);
    }
    _computeNumberOfPartners(column, feature) {
        return this._getPartners(column, feature).length;
    }
    _getFormattedPartners(column, feature) {
        return this._getPartners(column, feature).join(', ');
    }
}
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.analysis.operationalPresence.map)' })
], OperationalPresenceTable.prototype, "data", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.analysis.operationalPresence.mapLoading)' })
], OperationalPresenceTable.prototype, "loading", void 0);
__decorate([
    property({ type: Array, computed: '_computeColumnNames(data)' })
], OperationalPresenceTable.prototype, "columnNames", void 0);
__decorate([
    property({ type: Number })
], OperationalPresenceTable.prototype, "excerptLength", void 0);
window.customElements.define('operational-presence-table', OperationalPresenceTable);

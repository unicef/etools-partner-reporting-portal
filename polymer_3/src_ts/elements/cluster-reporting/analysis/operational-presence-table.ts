import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-tooltip/paper-tooltip';
import '@unicef-polymer/etools-data-table/etools-data-table';
import './analysis-widget';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import UtilsMixin from '../../../etools-prp-common/mixins/utils-mixin';
import {tableStyles} from '../../../styles/table-styles';
import '../../../etools-prp-common/elements/list-placeholder';
import '../../../etools-prp-common/elements/etools-prp-number';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class OperationalPresenceTable extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
  static get template() {
    return html`
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

      <analysis-widget widget-title="[[localize('operational_presence_table')]]" loading="[[loading]]">
        <div class="table-container" slot="map">
          <etools-data-table-header no-title no-collapse>
            <etools-data-table-column field="">
              <div class="table-column">[[localize('location')]]</div>
            </etools-data-table-column>

            <template is="dom-repeat" items="[[columnNames]]" as="column">
              <etools-data-table-column field="">
                <div class="table-column">[[column]]</div>
              </etools-data-table-column>
            </template>
          </etools-data-table-header>

          <template is="dom-repeat" items="[[data.features]]" as="feature">
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <div class="table-cell table-cell--text">[[feature.properties.title]]</div>

                <template is="dom-repeat" items="[[columnNames]]" as="column">
                  <div class="table-cell">
                    <span>
                      <strong>[[_computeNumberOfPartners(column, feature)]]</strong>: [[_computeExcerpt(column, feature,
                      excerptLength)]]
                      <paper-tooltip offset="5">
                        <div class="tooltip-content">
                          <div>[[column]]</div>
                          <div class="number-of-partners">
                            <etools-prp-number value="[[_computeNumberOfPartners(column, feature)]]">
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

          <list-placeholder data="[[data.features]]" loading="[[loading]]"> </list-placeholder>
        </div>
      </analysis-widget>
    `;
  }

  @property({type: Object, computed: 'getReduxStateObject(rootState.analysis.operationalPresence.map)'})
  data!: GenericObject;

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.analysis.operationalPresence.mapLoading)'})
  loading!: boolean;

  @property({type: Array, computed: '_computeColumnNames(data)'})
  columnNames!: any;

  @property({type: Number})
  excerptLength!: number;

  _computeColumnNames(data: GenericObject) {
    return data.features.length ? Object.keys(data.features[0].properties.partners) : [];
  }

  _getPartners(column: string, feature: GenericObject) {
    return feature.properties.partners[column];
  }

  _computeExcerpt(column: string, feature: GenericObject, excerptLength: number) {
    return this._truncate(this._getFormattedPartners(column, feature), excerptLength);
  }

  _computeNumberOfPartners(column: string, feature: GenericObject) {
    return this._getPartners(column, feature).length;
  }

  _getFormattedPartners(column: string, feature: GenericObject) {
    return this._getPartners(column, feature).join(', ');
  }
}

window.customElements.define('operational-presence-table', OperationalPresenceTable);

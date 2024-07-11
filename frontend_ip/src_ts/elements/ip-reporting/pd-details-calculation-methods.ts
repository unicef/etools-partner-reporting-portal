import {LitElement, css, html} from 'lit';
import {store} from '../../redux/store';
import {connect} from 'pwa-helpers';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/paper-radio-group/paper-radio-group';
import '@polymer/paper-radio-button/paper-radio-button';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import Constants from '../../etools-prp-common/constants';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import {pdIndicatorsAll, pdIndicatorsLoading} from '../../redux/selectors/programmeDocumentIndicators';
import DataTableMixin from '../../etools-prp-common/mixins/data-table-mixin';
import {pdIndicatorsFetch, pdIndicatorsUpdate} from '../../redux/actions/pdIndicators';
import '../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-common/elements/etools-prp-ajax';
import '../../etools-prp-common/elements/page-body';
import '../../etools-prp-common/elements/etools-prp-permissions';
import '../../etools-prp-common/elements/confirm-box';
import '../../etools-prp-common/elements/calculation-methods-info-bar';
import {ConfirmBoxEl} from '../../etools-prp-common/elements/confirm-box';
import {tableStyles} from '../../etools-prp-common/styles/table-styles';
import {buttonsStyles} from '../../etools-prp-common/styles/buttons-styles';
import {
  computeIndicatorsUrl,
  computeFormattedData,
  computeSelected,
  computeDisabled,
  onValueChanged,
  canEdit,
  canSave
} from './js/pd-details-calculation-methods-functions';
import {RootState} from '../../typings/redux.types';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin DataTableMixin
 */
@customElement('pd-details-calculation-methods')
export class PdDetailsCalculationMethods extends LocalizeMixin(DataTableMixin(UtilsMixin(connect(store)(LitElement)))) {
  static styles = [
    css`
      :host {
        display: block;
      }

      .wrapper {
        min-height: 80px;
        position: relative;
      }

      .pd-output {
        --list-bg-color: var(--paper-grey-200);
        font-weight: bold;
      }

      paper-radio-button {
        padding: 0 !important;
      }

      paper-radio-button:not(:first-child) {
        margin-left: 12px;
      }

      .buttons {
        margin: 1em 0;
      }

      .missing-indicator {
        margin-left: 40px;
        font-weight: normal;
      }

      [hidden] {
        display: none !important;
      }

      paper-radio-button[name='latest'] {
        text-transform: uppercase;
      }
    `
  ];

  render() {
    return html`
      ${buttonsStyles} ${tableStyles} 
      <style> ${dataTableStylesLit} </style>

      <etools-prp-permissions
        .permissions="${this.permissions}"
        @permissions-changed="${(e) => (this.permissions = e.detail.value)}"
      >
      </etools-prp-permissions>
      <etools-prp-ajax id="indicators" .url="${this.indicatorsUrl}"> </etools-prp-ajax>
      <etools-prp-ajax
        id="update"
        method="post"
        .url="${this.indicatorsUrl}"
        .body="${this.localData}"
        content-type="application/json"
      >
      </etools-prp-ajax>
      <page-body>
        <calculation-methods-info-bar></calculation-methods-info-bar>
        <etools-data-table-header no-collapse>
          <etools-data-table-column>
            <div class="table-column">${this.localize('indicators_for_pd')}</div>
          </etools-data-table-column>
          <etools-data-table-column>
            <div class="table-column">${this.localize('calculation_method_across_locations')}</div>
          </etools-data-table-column>
          <etools-data-table-column>
            <div class="table-column">${this.localize('calculation_method_across_reporting')}</div>
          </etools-data-table-column>
        </etools-data-table-header>
        <div class="wrapper">
          ${(this.formattedData || []).map(
            (item) => html`
              ${item.type === 'label'
                ? html`
                    <etools-data-table-row class="pd-output" no-collapse>
                      <div slot="row-data">
                        <div class="table-cell table-cell--text">${item.text}</div>
                      </div>
                    </etools-data-table-row>
                  `
                : item.type === 'missingIndicators'
                ? html`
                    <etools-data-table-row class="pd-output" no-collapse>
                      <div slot="row-data">
                        <div class="table-cell table-cell--text missing-indicator">${this.localize(item.text)}</div>
                      </div>
                    </etools-data-table-row>
                  `
                : item.type === 'data'
                ? html`
                    <etools-data-table-row no-collapse>
                      <div slot="row-data">
                        <div class="table-cell">${item.data?.title}</div>
                        <div class="table-cell">
                          ${this._canEdit(item, this.permissions)
                            ? html`
                                <paper-radio-group
                                  data-id="${item.data?.id}"
                                  data-llo-id="${item.llo_id}"
                                  data-scope="calculation_formula_across_locations"
                                  @paper-radio-group-changed="${this._onValueChanged}"
                                  .selected="${computeSelected(item.data, 'calculation_formula_across_locations')}"
                                >
                                  <paper-radio-button
                                    name="sum"
                                    ?disabled="${computeDisabled(item.data?.display_type)}"
                                  >
                                    ${this.localize('sum')}
                                  </paper-radio-button>
                                  <paper-radio-button
                                    name="max"
                                    ?disabled="${computeDisabled(item.data?.display_type)}"
                                  >
                                    ${this.localize('max')}
                                  </paper-radio-button>
                                  <paper-radio-button
                                    name="avg"
                                    ?disabled="${computeDisabled(item.data?.display_type)}"
                                  >
                                    ${this.localize('avg')}
                                  </paper-radio-button>
                                </paper-radio-group>
                              `
                            : html` ${item.data.calculation_formula_across_locations} `}
                        </div>
                        <div class="table-cell">
                          ${this._canEdit(item, this.permissions)
                            ? html`
                                <paper-radio-group
                                  data-id="${item.data?.id}"
                                  data-llo-id="${item.llo_id}"
                                  data-scope="calculation_formula_across_periods"
                                  @paper-radio-group-changed="${this._onValueChanged}"
                                  .selected="${computeSelected(item.data, 'calculation_formula_across_periods')}"
                                  ?disabled="${computeDisabled(item.data)}"
                                >
                                  <paper-radio-button name="sum" ?disabled="${computeDisabled(item.data.display_type)}">
                                    ${this.localize('sum')}
                                  </paper-radio-button>
                                  <paper-radio-button name="max" ?disabled="${computeDisabled(item.data.display_type)}">
                                    ${this.localize('max')}
                                  </paper-radio-button>
                                  <paper-radio-button name="avg" ?disabled="${computeDisabled(item.data.display_type)}">
                                    ${this.localize('avg')}
                                  </paper-radio-button>
                                  <paper-radio-button
                                    name="latest"
                                    ?hidden="${!this._hasTypeRatioOrPercentage(item.data)}"
                                    ?disabled="${computeDisabled(item.data.display_type)}"
                                  >
                                    ${this.localize('latest')}
                                  </paper-radio-button>
                                </paper-radio-group>
                              `
                            : html` ${item.data.calculation_formula_across_periods} `}
                        </div>
                      </div>
                    </etools-data-table-row>
                  `
                : html``}
            `
          )}
          <etools-loading ?active="${this.loading}"></etools-loading>
        </div>
        ${this._canSave(this.permissions)
          ? html`<div class="buttons layout horizontal-reverse">
              <paper-button @click="${this._save}" class="btn-primary" ?disabled="${this.loading}" raised>
                ${this.localize('save')}
              </paper-button>
            </div>`
          : html``}
      </page-body>
      <confirm-box id="confirm"></confirm-box>
    `;
  }

  @property({type: Object})
  localData!: any;

  @property({type: String})
  locationId!: string;

  @property({type: String})
  pdId!: string;

  @property({type: Boolean})
  loading!: boolean;

  @property({type: Array})
  data!: any;

  @property({type: Array})
  formattedData!: any;

  @property({type: String})
  indicatorsUrl!: string;

  connectedCallback() {
    super.connectedCallback();

    this._fetchData = debounce(this._fetchData.bind(this), 300) as any;
  }


  stateChanged(state: RootState) {
    if (state.location?.id && this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }
    if (state.programmeDocuments?.current && this.pdId !== state.programmeDocuments.current) {
      this.pdId = state.programmeDocuments.current;
    }

    if (this.loading != pdIndicatorsLoading(state)) {
      this.loading = pdIndicatorsLoading(state);
    }
    if (this.data !== pdIndicatorsAll(state)) {
      this.data = pdIndicatorsAll(state);
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    if (changedProperties.has('locationId') || changedProperties.has('pdId')) {
      this.indicatorsUrl = computeIndicatorsUrl(this.locationId, this.pdId);
    }

    if (changedProperties.has('indicatorsUrl')) {
      this._fetchData(this.indicatorsUrl); // Example: Fetch data when indicatorsUrl changes
    }

    if (changedProperties.has('data')) {
      this.formattedData = computeFormattedData(this.data);
      this.localData = this._clone(this.data);
    }
  }

  _hasTypeRatioOrPercentage(data: any) {
    return ['ratio', 'percentage'].includes(data.display_type);
  }

  _fetchData(url: string) {
    if (!url || !this.pdId) {
      return;
    }

    const indicatorsEl = this.shadowRoot!.querySelector('#indicators') as any as EtoolsPrpAjaxEl;
    indicatorsEl.abort();

    store
      .dispatch(pdIndicatorsFetch(indicatorsEl.thunk(), this.pdId))
      // @ts-ignore
      .catch(function (err) {
        console.log(err);
      });
  }

  _onValueChanged(e: CustomEvent) {
    const newValue = (e.target as any).selected;
    const data = (e.target as any).dataset;
    const indices = onValueChanged(data, this.localData);

    this.localData.ll_outputs_and_indicators[indices.lloIndex].indicators[indices.indicatorIndex][data.scope] =
      newValue;
    // this.set(
    //   ['localData.ll_outputs_and_indicators', indices.lloIndex, 'indicators', indices.indicatorIndex, data.scope],
    //   newValue
    // );
  }

  _save() {
    this._confirmIntent()
      .then(() => {
        const updateThunk = (this.shadowRoot!.querySelector('#update') as any as EtoolsPrpAjaxEl).thunk();
        return store.dispatch(pdIndicatorsUpdate(updateThunk, this.pdId));
      })
      .then(() =>
        fireEvent(this, 'toast', {
          text: this.localize('changes_saved'),
          showCloseBtn: true
        })
      )
      .catch((_err: any) => {
        console.log(_err);
      });
  }

  _confirmIntent() {
    const deferred = this._deferred();
    (this.shadowRoot!.querySelector('#confirm') as ConfirmBoxEl).run({
      body:
        'Please make sure the calculation methods for your indicators are ' +
        'properly configured. Changing calculation methods would recalculate ' +
        'progress reports for your indicators!',
      result: deferred,
      maxWidth: '500px',
      mode: Constants.CONFIRM_MODAL
    });

    return deferred.promise;
  }

  _canEdit(item: any, permissions: any) {
    return canEdit(item, permissions);
  }

  _canSave(permissions: any) {
    return canSave(permissions);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.shadowRoot?.querySelector('#indicators') as any as EtoolsPrpAjaxEl).abort();
  }
}

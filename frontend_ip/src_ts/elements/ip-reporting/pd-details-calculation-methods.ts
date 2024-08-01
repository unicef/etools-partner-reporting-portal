import {LitElement, css, html} from 'lit';
import {store} from '../../redux/store';
import {connect} from 'pwa-helpers';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-radio/etools-radio-group';
import '@shoelace-style/shoelace/dist/components/radio/radio.js';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {translate, get as getTranslation} from 'lit-translate';
import {pdIndicatorsAll, pdIndicatorsLoading} from '../../redux/selectors/programmeDocumentIndicators';
import {pdIndicatorsFetch, pdIndicatorsUpdate} from '../../redux/actions/pdIndicators';
import '../../etools-prp-common/elements/page-body';
import '../../etools-prp-common/elements/etools-prp-permissions';
import '../../etools-prp-common/elements/calculation-methods-info-bar';
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
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';

/**
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
@customElement('pd-details-calculation-methods')
export class PdDetailsCalculationMethods extends UtilsMixin(connect(store)(LitElement)) {
  static styles = [
    layoutStyles,
    css`
      :host {
        display: block;
      }

      .wrapper {
        min-height: 80px;
        position: relative;
      }

      .pd-output {
        --list-bg-color: var(--sl-color-neutral-200);
        font-weight: bold;
      }

      sl-radio {
        padding: 0 !important;
      }

      sl-radio:not(:first-child) {
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

      sl-radio[name='latest'] {
        text-transform: uppercase;
      }
    `
  ];

  render() {
    return html`
      <style>
        ${dataTableStylesLit}
      </style>

      <etools-prp-permissions
        .permissions="${this.permissions}"
        @permissions-changed="${(e) => (this.permissions = e.detail.value)}"
      >
      </etools-prp-permissions>

      <page-body>
        <calculation-methods-info-bar></calculation-methods-info-bar>
        <etools-data-table-header no-collapse>
          <etools-data-table-column class="col-4">
            <div class="table-column">${translate('INDICATORS_FOR_PD')}</div>
          </etools-data-table-column>
          <etools-data-table-column class="col-4">
            <div class="table-column">${translate('CALCULATION_METHOD_ACROSS_LOCATIONS')}</div>
          </etools-data-table-column>
          <etools-data-table-column class="col-4">
            <div class="table-column">${translate('CALCULATION_METHOD_ACROSS_REPORTING')}</div>
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
                        <div class="table-cell table-cell--text missing-indicator">${translate(item.text)}</div>
                      </div>
                    </etools-data-table-row>
                  `
                : item.type === 'data'
                ? html`
                    <etools-data-table-row no-collapse>
                      <div slot="row-data">
                        <div class="col-data col-4 table-cell">${item.data?.title}</div>
                        <div class="col-data col-4 table-cell">
                          ${this._canEdit(item, this.permissions)
                            ? html`
                                <etools-radio-group
                                  data-id="${item.data?.id}"
                                  data-llo-id="${item.llo_id}"
                                  data-scope="calculation_formula_across_locations"
                                  @sl-change="${this._onValueChanged}"
                                  .value="${computeSelected(item.data, 'calculation_formula_across_locations')}"
                                >
                                  <sl-radio value="sum" ?disabled="${computeDisabled(item.data?.display_type)}">
                                    ${translate('SUM')}
                                  </sl-radio>
                                  <sl-radio value="max" ?disabled="${computeDisabled(item.data?.display_type)}">
                                    ${translate('MAX')}
                                  </sl-radio>
                                  <sl-radio value="avg" ?disabled="${computeDisabled(item.data?.display_type)}">
                                    ${translate('AVG')}
                                  </sl-radio>
                                </etools-radio-group>
                              `
                            : html` ${item.data.calculation_formula_across_locations} `}
                        </div>
                        <div class="col-data col-4 table-cell">
                          ${this._canEdit(item, this.permissions)
                            ? html`
                                <etools-radio-group
                                  data-id="${item.data?.id}"
                                  data-llo-id="${item.llo_id}"
                                  data-scope="calculation_formula_across_periods"
                                  @sl-change="${this._onValueChanged}"
                                  .value="${computeSelected(item.data, 'calculation_formula_across_periods')}"
                                  ?disabled="${computeDisabled(item.data)}"
                                >
                                  <sl-radio value="sum" ?disabled="${computeDisabled(item.data.display_type)}">
                                    ${translate('SUM')}
                                  </sl-radio>
                                  <sl-radio value="max" ?disabled="${computeDisabled(item.data.display_type)}">
                                    ${translate('MAX')}
                                  </sl-radio>
                                  <sl-radio value="avg" ?disabled="${computeDisabled(item.data.display_type)}">
                                    ${translate('AVG')}
                                  </sl-radio>
                                  <sl-radio
                                    value="latest"
                                    ?hidden="${!this._hasTypeRatioOrPercentage(item.data)}"
                                    ?disabled="${computeDisabled(item.data.display_type)}"
                                  >
                                    ${translate('LATEST')}
                                  </sl-radio>
                                </etools-radio-group>
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
          ? html`<div class="buttons layout-horizontal">
              <etools-button @click="${this._save}" variant="primary" ?disabled="${this.loading}">
                ${translate('SAVE')}
              </etools-button>
            </div>`
          : html``}
      </page-body>
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
      this._fetchData(); // Example: Fetch data when indicatorsUrl changes
    }

    if (changedProperties.has('data')) {
      this.formattedData = computeFormattedData(this.data);
      this.localData = this._clone(this.data);
    }
  }

  _hasTypeRatioOrPercentage(data: any) {
    return ['ratio', 'percentage'].includes(data.display_type);
  }

  _fetchData() {
    if (!this.indicatorsUrl || !this.pdId) {
      return;
    }

    store
      .dispatch(
        pdIndicatorsFetch(
          sendRequest({
            method: 'GET',
            endpoint: {url: this.indicatorsUrl}
          }),
          this.pdId
        )
      )
      // @ts-ignore
      .catch(function (err) {
        console.log(err);
      });
  }

  _onValueChanged(e: CustomEvent) {
    const newValue = (e.target as any).value;
    const data = (e.target as any).dataset;
    const indices = onValueChanged(data, this.localData);

    this.localData.ll_outputs_and_indicators[indices.lloIndex].indicators[indices.indicatorIndex][data.scope] =
      newValue;
  }

  _save() {
    this._confirmIntent()
      .then(() => {
        return store.dispatch(
          pdIndicatorsUpdate(
            sendRequest({
              method: 'POST',
              endpoint: {url: this.indicatorsUrl},
              body: this.localData
            }),
            this.pdId
          )
        );
      })
      .then(() =>
        fireEvent(this, 'toast', {
          text: getTranslation('CHANGES_SAVED'),
          showCloseBtn: true
        })
      )
      .catch((_err: any) => {
        console.log(_err);
      });
  }

  _confirmIntent() {
    return new Promise((resolve, reject) => {
      openDialog({
        dialog: 'are-you-sure',
        dialogData: {
          content:
            'Please make sure the calculation methods for your indicators are ' +
            'properly configured. Changing calculation methods would recalculate ' +
            'progress reports for your indicators!',
          confirmBtnText: translate('CONTINUE'),
          cancelBtnText: translate('CANCEL')
        }
      }).then(({confirmed}) => {
        if (confirmed) {
          return resolve(true);
        } else {
          return reject();
        }
      });
    });
  }

  _canEdit(item: any, permissions: any) {
    return canEdit(item, permissions);
  }

  _canSave(permissions: any) {
    return canSave(permissions);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

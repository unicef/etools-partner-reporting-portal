import {ReduxConnectedElement} from '../../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import '../../../../../elements/labelled-item';
import '../../../../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../../../etools-prp-common/elements/etools-prp-ajax';
import '../../../../../etools-prp-common/elements/etools-prp-permissions';
import '../../../../../elements/ip-reporting/report-attachments';
import '../pd-sent-back';

import UtilsMixin from '../../../../../etools-prp-common/mixins/utils-mixin';
import NotificationsMixin from '../../../../../etools-prp-common/mixins/notifications-mixin';
import LocalizeMixin from '../../../../../etools-prp-common/mixins/localize-mixin';
import {GenericObject} from '../../../../../etools-prp-common/typings/globals.types';
import Endpoints from '../../../../../etools-prp-common/endpoints';

import {reportInfoCurrent} from '../../../../../redux/selectors/reportInfo';
import {currentProgrammeDocument} from '../../../../../etools-prp-common/redux/selectors/programmeDocuments';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {pdReportsUpdate} from '../../../../../etools-prp-common/redux/actions/pdReports';
import {RootState} from '../../../../../etools-prp-common/typings/redux.types';
import {PaperInputElement} from '@polymer/paper-input/paper-input';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 * @appliesMixin LocalizeMixin
 */
class PagePdReportSrReporting extends LocalizeMixin(NotificationsMixin(UtilsMixin(ReduxConnectedElement))) {
  public static get template() {
    return html`
      <style include="app-grid-style">
        :host {
          display: block;
          margin-bottom: 25px;

          --app-grid-columns: 8;
          --app-grid-gutter: 25px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 7;
        }

        .row {
          @apply --app-grid-expandible-item;
        }

        .value {
          font-size: 16px;
          word-wrap: break-word;
        }

        .toggle-button-container {
          max-width: calc((100% - 0.1px) / 8 * 7 - 25px);

          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        #toggle-button {
          background-color: #0099ff;
          color: #fff;
          font-size: 14px;
        }
      </style>

      <pd-sent-back></pd-sent-back>

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <etools-prp-ajax
        id="update"
        url="[[updateUrl]]"
        body="[[localData]]"
        content-type="application/json"
        method="put"
      >
      </etools-prp-ajax>

      <etools-content-panel no-header>
        <div class="app-grid">
          <div class="row">
            <labelled-item label="[[localize('description')]]">
              <span class="value">[[srDescription]]</span>
            </labelled-item>
          </div>

          <div class="row">
            <labelled-item label="[[localize('narrative')]]">
              <template is="dom-if" if="[[_equals(computedMode, 'view')]]" restamp="true">
                <span class="value">[[_withDefault(data.narrative)]]</span>
              </template>

              <template is="dom-if" if="[[!_equals(computedMode, 'view')]]" restamp="true">
                <paper-input id="narrative" value="[[data.narrative]]" no-label-float char-counter maxlength="2000">
                </paper-input>
              </template>
            </labelled-item>
          </div>

          <div class="toggle-button-container row">
            <template is="dom-if" if="[[!_equals(computedMode, 'view')]]">
              <paper-button class="btn-primary" id="toggle-button" on-tap="_handleInput" raised>
                [[localize('save')]]
              </paper-button>
            </template>
          </div>

          <div class="row">
            <report-attachments readonly="[[_equals(computedMode, 'view')]]"> </report-attachments>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  localData!: GenericObject;

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: Object, computed: '_reportInfoCurrent(rootState)'})
  data!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocuments.current)'})
  pdId!: string;

  @property({type: Array, computed: 'getReduxStateArray(rootState.programmeDocuments.all)'})
  programmeDocuments!: any[];

  @property({type: Object, computed: 'getReduxStateObject(rootState.programmeDocumentReports.byPD)'})
  allPdReports!: GenericObject;

  @property({type: String, computed: '_computeSrDescription(pdId, programmeDocuments, allPdReports, reportId)'})
  srDescription!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)'})
  reportId!: string;

  @property({type: String, computed: '_computeUpdateUrl(locationId, reportId)'})
  updateUrl!: string;

  @property({type: String})
  overrideMode = '';

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.mode)'})
  mode!: string;

  @property({type: String, computed: '_computeMode(mode, overrideMode, currentReport, permissions)'})
  computedMode!: string;

  @property({type: Object, computed: '_currentProgrammeDocument(rootState)'})
  currentReport!: GenericObject;

  updateDataDebouncer!: Debouncer | null;

  static get observers() {
    return ['_updateData(localData.*)'];
  }

  _reportInfoCurrent(rootState: RootState) {
    return reportInfoCurrent(rootState);
  }

  _currentProgrammeDocument(rootState: RootState) {
    return currentProgrammeDocument(rootState);
  }

  _handleInput() {
    const textInput = this.shadowRoot!.querySelector('#narrative') as PaperInputElement;
    if (textInput && textInput.value && textInput.value.trim()) {
      this.set(['localData', textInput.id], textInput.value.trim());
    }
  }

  _updateData(change: GenericObject) {
    if (change.path.split('.').length < 2) {
      // Skip the initial assignment
      return;
    }

    this.updateDataDebouncer = Debouncer.debounce(this.updateDataDebouncer, timeOut.after(250), () => {
      if (!this.localData.narrative) {
        return;
      }
      const updateThunk = (this.$.update as EtoolsPrpAjaxEl).thunk();
      (this.$.update as EtoolsPrpAjaxEl).abort();
      this.reduxStore
        .dispatch(pdReportsUpdate(updateThunk, this.pdId, this.reportId))
        // @ts-ignore
        .then(() => {
          this._notifyChangesSaved();
        })
        // @ts-ignore
        .catch(function (err) {
          console.log(err);
        });
    });
  }

  _computeUpdateUrl(locationId: string, reportId: string) {
    if (!locationId || !reportId) {
      return;
    }
    return Endpoints.programmeDocumentReportUpdate(locationId, reportId);
  }

  _computeSrDescription(pdId: string, programmeDocuments: any[], allPdReports: GenericObject, reportId: string) {
    // for some reason method was getting run on detach, so catch that
    if (!allPdReports || !allPdReports[pdId]) {
      return;
    }

    // get the current progress report's due date
    const progressReport = allPdReports[pdId].find((report: GenericObject) => {
      return report.id === parseInt(reportId);
    });

    const progressReportDueDate = progressReport && progressReport.due_date ? progressReport.due_date : null;

    // get the current programme document
    const currentPdReport = (programmeDocuments || []).find((report) => {
      return report.id === pdId;
    });

    if (!progressReportDueDate || !currentPdReport) {
      return '...';
    }

    // get the current SR reporting_period object from the current programme document's reporting_periods array
    const currentSrReport = (currentPdReport.reporting_periods || []).find((reporting_period: GenericObject) => {
      return (
        reporting_period.report_type === 'SR' && new Date(reporting_period.due_date) <= new Date(progressReportDueDate)
      );
    });

    if (currentSrReport !== undefined && currentSrReport.description !== undefined) {
      return currentSrReport.description;
    } else {
      return '...';
    }
  }

  // @ts-ignore
  _computeMode(mode: string, overrideMode: string, report: GenericObject, permissions: GenericObject) {
    return permissions && permissions.savePdReport ? overrideMode || mode : 'view';
  }

  connectedCallback() {
    super.connectedCallback();

    this.set('localData', {});
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.updateDataDebouncer && this.updateDataDebouncer.isActive) {
      this.updateDataDebouncer.cancel();
    }
  }
}

window.customElements.define('page-pd-report-sr-reporting', PagePdReportSrReporting);

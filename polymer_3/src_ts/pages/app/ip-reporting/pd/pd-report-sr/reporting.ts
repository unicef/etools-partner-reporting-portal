import {ReduxConnectedElement} from '../../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-input/paper-input-container';
import '@polymer/paper-input/paper-input-char-counter';
import '@polymer/app-layout/app-grid/app-grid-style';
import '../../../../../elements/labelled-item';
import '../../../../../elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../../../elements/etools-prp-ajax';
import '../../../../../elements/etools-prp-permissions';
import '../../../../../elements/ip-reporting/report-attachments';
import '../pd-sent-back';

import UtilsMixin from '../../../../../mixins/utils-mixin';
import NotificationsMixin from '../../../../../mixins/notifications-mixin';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import {GenericObject} from '../../../../../typings/globals.types';
import Endpoints from '../../../../../endpoints';

import {reportInfoCurrent} from '../../../../../redux/selectors/reportInfo';
import {currentProgrammeDocument} from '../../../../../redux/selectors/programmeDocuments';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {pdReportsUpdate} from '../../../../../redux/actions/pdReports';
import {RootState} from '../../../../../typings/redux.types';

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

      paper-input-char-counter {
        margin-top: 20px;
        margin-bottom: -40px;
        font-size: 12px;
      }
    </style>

    <pd-sent-back></pd-sent-back>

    <etools-prp-permissions
        permissions="{{permissions}}">
    </etools-prp-permissions>

    <etools-prp-ajax
        id="update"
        url="[[updateUrl]]"
        body="[[localData]]"
        content-type="application/json"
        method="put">
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
            <template
                is="dom-if"
                if="[[_equals(computedMode, 'view')]]"
                restamp="true">
              <span class="value">[[_withDefault(data.narrative)]]</span>
            </template>

            <template
                is="dom-if"
                if="[[!_equals(computedMode, 'view')]]"
                restamp="true">
              <paper-input-container no-label-float>
                <input
                    slot="input"
                    id="narrative"
                    on-input="_handleInput"
                    value="[[data.narrative]]"
                    maxlength="2000">
                <paper-input-char-counter slot="suffix"></paper-input-char-counter>
              </paper-input-container>
            </template>
          </labelled-item>
        </div>

        <div class="row">
          <report-attachments
              readonly="[[_equals(computedMode, 'view')]]">
          </report-attachments>
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
    return [
      '_updateData(localData.*)'
    ];
  }

  _reportInfoCurrent(rootState: RootState) {
    return reportInfoCurrent(rootState);
  }

  _currentProgrammeDocument(rootState: RootState) {
    return currentProgrammeDocument(rootState);
  }

  _handleInput(event: CustomEvent) {
    const field = event.composedPath()[0] as GenericObject;
    const id = field.id;

    this.set(['localData', id], field.value.trim());
  }

  _updateData(change: GenericObject) {
    const self = this;
    if (change.path.split('.').length < 2) {
      // Skip the initial assignment
      return;
    }

    this.updateDataDebouncer = Debouncer.debounce(this.updateDataDebouncer,
      timeOut.after(2000),
      () => {
        const updateThunk = (self.$.update as EtoolsPrpAjaxEl).thunk();

        (self.$.update as EtoolsPrpAjaxEl).abort();

        self.reduxStore.dispatch(pdReportsUpdate(updateThunk,
          this.pdId,
          this.reportId)
        );
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
    const progressReport = allPdReports[pdId]
      .find((report: GenericObject) => {
        return report.id === parseInt(reportId);
      });

    const progressReportDueDate = progressReport && progressReport.due_date ? progressReport.due_date : null;

    // get the current programme document
    const currentPdReport = programmeDocuments.find((report) => {
      return report.id === pdId;
    });

    // get the current SR reporting_period object from the current programme document's reporting_periods array
    const currentSrReport = progressReportDueDate ? currentPdReport.reporting_periods.find((reporting_period: GenericObject) => {
      return reporting_period.report_type === 'SR' &&
        new Date(reporting_period.due_date) <= new Date(progressReportDueDate);
    }) : undefined;

    if (currentSrReport !== undefined && currentSrReport.description !== undefined) {
      return currentSrReport.description;
    } else {
      return '...';
    }
  }

  // @ts-ignore
  _computeMode(mode: string, overrideMode: string, report: GenericObject, permissions: GenericObject) {
    return (permissions && permissions.savePdReport) ? (overrideMode || mode) : 'view';
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

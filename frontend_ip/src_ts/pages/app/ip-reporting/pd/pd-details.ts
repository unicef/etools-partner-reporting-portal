import {LitElement, html, css, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {sharedStyles} from '../../../../etools-prp-common/styles/shared-styles.js';
import {currentProgrammeDocument} from '../../../../etools-prp-common/redux/selectors/programmeDocuments.js';
import '@unicef-polymer/etools-modules-common/dist/layout/etools-tabs';
import '../../../../etools-prp-common/elements/page-body.js';
import '../../../../etools-prp-common/elements/page-header.js';
import '../../../../etools-prp-common/elements/message-box.js';
import '../../../../elements/ip-reporting/pd-details-overview.js';
import '../../../../elements/ip-reporting/pd-details-reports.js';
import '../../../../elements/ip-reporting/pd-details-calculation-methods.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import {RootState} from '../../../../typings/redux.types.js';
import {connect} from 'pwa-helpers';
import {store} from '../../../../redux/store.js';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util.js';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router.js';
import {translate} from 'lit-translate';

const DETAILS = 'details';
const REPORTS = 'reports';
const CALCULATION_METHODS = 'calculation_methods';

const NAVIGATION_TABS: PageTab[] = [
  {
    tab: DETAILS,
    tabLabel: translate('DETAILS') as any as string,
    hidden: false
  },
  {
    tab: REPORTS,
    tabLabel: translate('REPORTS') as any as string,
    hidden: false
  },
  {
    tab: CALCULATION_METHODS,
    tabLabel: translate('CALCULATION_METHODS') as any as string,
    hidden: false
  }
];

@customElement('page-ip-reporting-pd-details')
export class PageIpReportingPdDetails extends UtilsMixin(connect(store)(LitElement)) {
  static styles = css`
    :host {
      display: block;
    }
    .header-content {
      margin: 0.5em 0;
    }
  `;

  @property({type: String}) pagePath = '';
  @property({type: Object}) pd: any = {};
  @property() activeTab: string = DETAILS;
  @property() pageTabs: PageTab[] = NAVIGATION_TABS;

  render() {
    return html`
      ${sharedStyles}

      <page-header title="${this.pd.title}" back="pd?&status=Sig%2CAct%2CSus">
        ${this.pd?.status === 'Suspended'
          ? html` <message-box slot="header-content" type="warning">
              PD is suspended, please contact UNICEF programme focal person to confirm reporting requirement.
            </message-box>`
          : html``}

        <etools-tabs-lit
          id="tabs"
          slot="tabs"
          .tabs="${this.pageTabs}"
          @sl-tab-show="${({detail}: any) => this.onTabSelect(detail.name)}"
          .activeTab="${this.activeTab}"
        ></etools-tabs-lit>
      </page-header>

      ${this.getTabElement()}
    `;
  }

  stateChanged(state: RootState) {
    if (this.state !== currentProgrammeDocument(state)) {
      this.pd = currentProgrammeDocument(state);
    }
    if (state.app.routeDetails.params) {
      if (!isJsonStrMatch(this.activeTab, state.app.routeDetails.params.activeTab)) {
        this.activeTab = String(state.app.routeDetails.params.activeTab);
      }
      if (!isJsonStrMatch(this.pagePath, state.app.routeDetails.path)) {
        this.pagePath = state.app.routeDetails.path;
      }
    }
  }

  onTabSelect(newTabName: string): void {
    if (this.activeTab === newTabName) {
      return;
    }
    EtoolsRouter.updateAppLocation(this.pagePath.replace(this.activeTab, newTabName));
  }

  getTabElement(): TemplateResult {
    switch (this.activeTab) {
      case DETAILS:
        return html` <pd-details-overview name="details"></pd-details-overview> `;
      case REPORTS:
        return html` <pd-details-reports name="reports"></pd-details-reports> `;
      case CALCULATION_METHODS:
        return html` <pd-details-calculation-methods name="calculation-methods"></pd-details-calculation-methods> `;
      default:
        return html` Tab Not Found `;
    }
  }
}

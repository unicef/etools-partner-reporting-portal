import {LitElement, html, css, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {sharedStyles} from '../../../../etools-prp-common/styles/shared-styles.js';
import {currentProgrammeDocument} from '../../../../etools-prp-common/redux/selectors/programmeDocuments.js';
import '@unicef-polymer/etools-modules-common/dist/layout/etools-tabs';
import '../../../../etools-prp-common/elements/page-body.js';
import '../../../../etools-prp-common/elements/page-header.js';
import '../../../../etools-prp-common/elements/message-box.js';
import '../../../../elements/ip-reporting/gpd-details-overview.js';
import '../../../../elements/ip-reporting/gpd-details-reports.js';
import {RootState} from '../../../../typings/redux.types.js';
import {connect} from 'pwa-helpers';
import {store} from '../../../../redux/store.js';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util.js';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router.js';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {appendQuery} from '@unicef-polymer/etools-utils/dist/navigation.util.js';

const DETAILS = 'details';
const REPORTS = 'reports';

const NAVIGATION_TABS: any[] = [
  {
    tab: DETAILS,
    tabLabel: translate('DETAILS') as any as string,
    hidden: false
  },
  {
    tab: REPORTS,
    tabLabel: translate('REPORTS') as any as string,
    hidden: false
  }
];

@customElement('page-ip-reporting-gpd-details')
export class PageIpReportingGpdDetails extends connect(store)(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
    .header-content {
      margin: 0.5em 0;
    }
  `;

  @property({type: String})
  pagePath = '';

  @property({type: Object})
  pd: any = {};

  @property()
  activeTab: string = DETAILS;

  @property()
  pageTabs: any[] = NAVIGATION_TABS;

  @property({type: Object})
  pdQuery = {status: String(['approved', 'active', 'suspended'])};

  render() {
    return html`
      ${sharedStyles}

      <page-header title="${this.pd.title}" back="${appendQuery('gpd', this.pdQuery)}">
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
    if (this.pd !== currentProgrammeDocument(state)) {
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
        return html` <gpd-details-overview name="details"></gpd-details-overview> `;
      case REPORTS:
        return html` <gpd-details-reports name="reports"></gpd-details-reports> `;
      default:
        return html` Tab Not Found `;
    }
  }
}

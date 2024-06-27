import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {sharedStyles} from '../../../../etools-prp-common/styles/shared-styles.js';
import {currentProgrammeDocument} from '../../../../etools-prp-common/redux/selectors/programmeDocuments.js';
import {IronPagesElement} from '@polymer/iron-pages/iron-pages.js';
import '@polymer/paper-tabs/paper-tab.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/iron-pages/iron-pages.js';
import '../../../../etools-prp-common/elements/page-body.js';
import '../../../../etools-prp-common/elements/page-header.js';
import '../../../../etools-prp-common/elements/message-box.js';
import '../../../../elements/ip-reporting/pd-details-overview.js';
import '../../../../elements/ip-reporting/pd-details-reports.js';
import '../../../../elements/ip-reporting/pd-details-calculation-methods.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import LocalizeMixin from '../../../../etools-prp-common/mixins/localize-mixin.js';
import {RootState} from '../../../../typings/redux.types.js';
import {connect} from 'pwa-helpers';
import {store} from '../../../../redux/store.js';

@customElement('page-ip-reporting-pd-details')
export class PageIpReportingPdDetails extends LocalizeMixin(UtilsMixin(connect(store)(LitElement))) {
  static styles = css`
    :host {
      display: block;
    }
    .header-content {
      margin: 0.5em 0;
    }
  `;

  @property({type: String})
  pdTab = '';

  @property({type: Object})
  routeData: any = {};

  @property({type: Object})
  pd: any = {};

  render() {
    return html`
      ${sharedStyles}
      <app-route .route="${this.route}" pattern="/:dashTab" .data="${this.routeData}"></app-route>

      <page-header title="${this.pd.title}" back="pd?&status=Sig%2CAct%2CSus">
        ${this.pd?.status === 'Suspended'
          ? html` <message-box slot="header-content" type="warning">
              PD is suspended, please contact UNICEF programme focal person to confirm reporting requirement.
            </message-box>`
          : html``}

        <div slot="tabs">
          <paper-tabs .selected="${this.routeData?.dashTab}" attr-for-selected="name" scrollable hide-scroll-buttons>
            <paper-tab name="details">${this.localize('details')}</paper-tab>
            <paper-tab name="reports">${this.localize('reports')}</paper-tab>
            <paper-tab name="calculation-methods">${this.localize('calculation_methods')}</paper-tab>
          </paper-tabs>
        </div>
      </page-header>

      <iron-pages
        id="tabContent"
        attr-for-selected="name"
        fallback-selection="details"
        @iron-items-changed="${this._updateTabSelection}"
      >
        ${this.pdTab === 'details' ? html`<pd-details-overview name="details"></pd-details-overview>` : html``}
        ${this.pdTab === 'reports' ? html`<pd-details-reports name="reports"></pd-details-reports>` : html``}
        ${this.pdTab === 'calculation-methods'
          ? html`<pd-details-calculation-methods name="calculation-methods"></pd-details-calculation-methods>`
          : html``}
      </iron-pages>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('routeData')) {
      this.pdTab = this.routeData.dashTab;
    }
  }

  stateChanged(state: RootState) {
    if (this.state !== currentProgrammeDocument(state)) {
      this.pd = currentProgrammeDocument(state);
    }
  }

  _updateTabSelection() {
    (this.shadowRoot!.getElementById('tabContent') as IronPagesElement).select(this.pdTab);
  }
}

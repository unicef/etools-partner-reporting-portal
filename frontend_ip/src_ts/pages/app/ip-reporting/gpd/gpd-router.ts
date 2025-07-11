import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './gpd-view.js';
import './gpd-report.js';
import {RootState} from '../../../../typings/redux.types.js';
import {connect} from 'pwa-helpers';
import {store} from '../../../../redux/store.js';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util.js';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces.js';

@customElement('page-ip-reporting-gpd-router')
class PageIpReportingGpdRouter extends connect(store)(LitElement) {
  @property({type: String})
  page?: any = '';

  @property({type: String})
  pdId = '';

  @property({type: Object})
  routeDetails!: EtoolsRouteDetails;

  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      ${this.page === 'view'
        ? html` <page-ip-reporting-gpd-details name="gpd-view"> </page-ip-reporting-gpd-details>`
        : html``}
      ${this.page === 'report'
        ? html` <page-ip-reporting-gpd-report name="gpd-report"> </page-ip-reporting-gpd-report>`
        : html``}
    `;
  }

  stateChanged(state: RootState) {
    if (state.app.routeDetails && !isJsonStrMatch(this.routeDetails, state.app.routeDetails)) {
      this.routeDetails = state.app.routeDetails;
      this.page = state.app.routeDetails.params?.pdRoute;
    }
  }
}

export {PageIpReportingGpdRouter};

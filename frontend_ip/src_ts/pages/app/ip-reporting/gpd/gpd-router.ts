import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import './gpd-details.js';
import './gpd-report.js';
import {RootState} from '../../../../typings/redux.types.js';
import {connect} from 'pwa-helpers';
import {store} from '../../../../redux/store.js';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util.js';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces.js';

@customElement('page-ip-reporting-gpd-router')
class PageIpReportingGpdRouter extends UtilsMixin(connect(store)(LitElement)) {
  @property({type: String})
  page = '';

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

      ${this._equals(this.page, 'gpd-details')
        ? html` <page-ip-reporting-gpd-details name="gpd-details"> </page-ip-reporting-gpd-details>`
        : html``}
      ${this._equals(this.page, 'gpd-report')
        ? html` <page-ip-reporting-gpd-report name="gpd-report"> </page-ip-reporting-gpd-report>`
        : html``}
    `;
  }

  stateChanged(state: RootState) {
    if (state.app.routeDetails && !isJsonStrMatch(this.routeDetails, state.app.routeDetails)) {
      this.routeDetails = state.app.routeDetails;
      this._routeTreeChanged(state.app.routeDetails.params?.pdRoute);
    }
  }

  _routeTreeChanged(tree) {
    switch (tree) {
      case 'view':
        this.page = 'gpd-details';
        break;

      case 'report':
        this.page = 'gpd-report';
        break;

      default:
        this.page = 'gpd-details';
        break;
    }
  }
}

export {PageIpReportingGpdRouter};

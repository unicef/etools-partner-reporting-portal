import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import './pd-view.js';
import './pd-report.js';
import {RootState} from '../../../../typings/redux.types.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../../../redux/store.js';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util.js';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces.js';

@customElement('page-ip-reporting-pd-router')
class PageIpReportingPdRouter extends UtilsMixin(connect(store)(LitElement)) {
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

      ${this._equals(this.page, 'view')
        ? html` <page-ip-reporting-pd-details name="pd-view"> </page-ip-reporting-pd-details>`
        : html``}
      ${this._equals(this.page, 'report')
        ? html` <page-ip-reporting-pd-report name="pd-report"> </page-ip-reporting-pd-report>`
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

export {PageIpReportingPdRouter};

import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin.js';
import './gdd-details.js';
import './gdd-report.js';
import {RootState} from '../../../../typings/redux.types.js';
import {connect} from 'pwa-helpers';
import {store} from '../../../../redux/store.js';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util.js';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces.js';

@customElement('page-ip-reporting-gdd-router')
class PageIpReportingGddRouter extends UtilsMixin(connect(store)(LitElement)) {
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

      ${this._equals(this.page, 'gdd-details')
        ? html` <page-ip-reporting-gdd-details name="gdd-details"> </page-ip-reporting-gdd-details>`
        : html``}
      ${this._equals(this.page, 'gdd-report')
        ? html` <page-ip-reporting-gdd-report name="gdd-report"> </page-ip-reporting-gdd-report>`
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
        this.page = 'gdd-details';
        break;

      case 'report':
        this.page = 'gdd-report';
        break;

      default:
        this.page = 'gdd-details';
        break;
    }
  }
}

export {PageIpReportingGddRouter};

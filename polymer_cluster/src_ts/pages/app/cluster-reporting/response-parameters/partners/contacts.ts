import {ReduxConnectedElement} from '../../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import '../../../../../elements/cluster-reporting/response-parameters/partners/contacts/filters';
import '../../../../../elements/cluster-reporting/contacts-table';
import {sharedStyles} from '../../../../../styles/shared-styles';
import {GenericObject} from '../../../../../typings/globals.types';
import '../../../../../elements/etools-prp-ajax';
// import {EtoolsPrpAjaxEl} from '../../../../../elements/etools-prp-ajax';
// import Endpoints from '../../../../../endpoints';
// import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
// import {timeOut} from '@polymer/polymer/lib/utils/async';
// import {fetchPartnerActivitiesList} from '../../../../../redux/actions/partnerActivities';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 */
class Contacts extends RoutingMixin(UtilsMixin(ReduxConnectedElement)) {
  static get template() {
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
        }
      </style>

      <iron-location query="{{query}}"></iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <!--     <etools-prp-ajax
        id="partnerContacts"
        url="[[url]]"
        params="[[queryParams]]">
    </etools-prp-ajax> -->

      <page-body>
        <partner-contacts-filters></partner-contacts-filters>

        <contacts-table></contacts-table>
      </page-body>
    `;
  }

  // Whole file commented
  @property({type: String})
  query!: string;

  @property({type: Object})
  queryParams!: GenericObject;

  // @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  // responsePlanID!: string;

  // @property({type: String, computed: '_computeUrl(responsePlanID)'})
  // url!: string;

  // @property({type: Object, computed: 'getReduxStateObject(rootState.responsePlans.current)'})
  // responsePlanCurrent!: GenericObject;

  // static get observers() {
  //   return [
  //     '_projectsAjax(queryParams, url)'
  //   ]
  // }

  // private _projectsAjaxDebouncer!: Debouncer;

  // _computeUrl(responsePlanID: string) {
  //   return Endpoints.plannedActions(responsePlanID);
  // }

  // _projectsAjax(queryParams: string) {
  //   this._projectsAjaxDebouncer = Debouncer.debounce(this._projectsAjaxDebouncer,
  //     timeOut.after(300),
  //     () => {
  //       const thunk = (this.$.plannedActionsProjects as EtoolsPrpAjaxEl).thunk();
  //       if (!Object.keys(queryParams).length) {
  //         return;
  //       }
  //       (this.$.plannedActionsProjects as EtoolsPrpAjaxEl).abort();

  //       this.reduxStore.dispatch(fetchPartnerActivitiesList(thunk));
  //       // eslint-disable-next-line
  //       // .catch(function(err) {
  //       //   // TODO: error handling.
  //       // });
  //     });
  // }

  // disconnectedCallback() {
  //   super.disconnectedCallback();
  //   if (this._projectsAjaxDebouncer && this._projectsAjaxDebouncer.isActive()) {
  //     this._projectsAjaxDebouncer.cancel();
  //   }
  // }
}

window.customElements.define('rp-partners-contacts', Contacts);

export {Contacts as RpPartnersContactsDetailEl};

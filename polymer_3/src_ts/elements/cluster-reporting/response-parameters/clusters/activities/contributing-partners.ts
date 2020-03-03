import {html, PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import {EtoolsPrpAjaxEl} from '../../../../etools-prp-ajax';
import '../../../../page-body';
import Endpoints from '../../../../../endpoints';
import './contributing-partners-filters';
import './contributing-partners-list';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import { GenericObject } from '../../../../../typings/globals.types';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import {clusterActivitiesPartnersFetch} from '../../../../../redux/actions/clusterActivities';


/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class ContributingPartners extends UtilsMixin(ReduxConnectedElement) {
  public static get template() {
    // language=HTML
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
        id="partners"
        url="[[partnersUrl]]"
        params="[[queryParams]]">
    </etools-prp-ajax>

    <page-body>
      <cluster-activities-contributing-partners-filters>
      </cluster-activities-contributing-partners-filters>

      <contributing-partners-list
        activity-id=[[activityId]]>
      </contributing-partners-list>
    </page-body>
    `;
  }

  @property({type: String})
  activityId!: string;

  @property({type: Object, observer: '_fetchPartners'})
  allPartners!: GenericObject;

  @property({type: String, computed: '_computePartnersUrl(activityId)'})
  partnersUrl!: string;

  private _fetchPartnersDebouncer! : Debouncer;

  _computePartnersUrl(activityId: string) {
    return Endpoints.partnersByClusterActivityId(activityId);
  }

  _fetchPartners() {
    this._fetchPartnersDebouncer = Debouncer.debounce(this._fetchPartnersDebouncer,
      timeOut.after(300),
      () => {

        const thunk = (this.$.partners as EtoolsPrpAjaxEl).thunk();
        (this.$.partners as EtoolsPrpAjaxEl).abort();

        this.reduxStore.dispatch(clusterActivitiesPartnersFetch(thunk, this.activityId))
            .catch(function (err) { // jshint ignore:line
                // TODO: error handling.
            });
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.partners as EtoolsPrpAjaxEl).abort();

    if (this._fetchPartnersDebouncer && this._fetchPartnersDebouncer.isActive()) {
      this._fetchPartnersDebouncer.cancel();
    }
  }

}

window.customElements.define('rp-clusters-activity-contributing-partners', ContributingPartners);

export {ContributingPartners as ContributingPartnersEl};

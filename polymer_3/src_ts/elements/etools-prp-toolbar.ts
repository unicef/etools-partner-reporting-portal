import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-location/iron-location';
import UtilsMixin from '../mixins/utils-mixin';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/iron-location/iron-query-params';
import {buttonsStyles} from '../styles/buttons-styles';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class EtoolsPrpToolbar extends UtilsMixin(PolymerElement) {

  public static get template() {
    return html`
      ${buttonsStyles}
      <style include="iron-flex iron-flex-reverse">
        :host {
          display: block;
          margin: 25px 0;
        }
      </style>

      <iron-location
          query="{{query}}">
      </iron-location>

      <iron-query-params
          params-string="{{query}}"
          params-object="{{params}}">
      </iron-query-params>

      <div class="layout horizontal-reverse">
        <slot></slot>
      </div>

    `;
  }

  @property({type: String, notify: true})
  properties!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  _responsePlanId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  _locationId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocuments.current)'})
  _pdId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)'})
  _reportId!: string;

  @property({type: String, computed: '_identity(_responsePlanId)', notify: true})
  responsePlanId!: string;

  @property({type: String, computed: '_identity(_locationId)', notify: true})
  locationId!: string;

  @property({type: String, computed: '_identity(_pdId)', notify: true})
  pdId!: string;

  @property({type: String, computed: '_identity(_reportId)', notify: true})
  reportId!: string;

}

window.customElements.define('etools-prp-toolbar', EtoolsPrpToolbar);

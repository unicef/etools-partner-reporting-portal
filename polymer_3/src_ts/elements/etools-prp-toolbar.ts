import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/iron-location';
import UtilsMixin from '../mixins/utils-mixin';
import {property} from '@polymer/decorators/lib/decorators';

// <link rel="import" href="../../bower_components/iron-location/iron-query-params.html">
// <link rel="import" href="../styles/buttons.html">


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class EtoolsPrpToolbar extends (UtilsMixin(PolymerElement)){
  public static get template(){
    return html`
    
      <style include="iron-flex iron-flex-reverse button-styles">
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

  @property({type: String})
  _responsePlanId!: string;
  // statePath: 'responsePlans.currentID'

  @property({type: String})
  _locationId!: string;
  // statePath: 'location.id'

  @property({type: String})
  _pdId!: string;
  // statePath: 'programmeDocuments.current'

  @property({type: String})
  _reportId!: string;
  // statePath: 'programmeDocumentReports.current.id'

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

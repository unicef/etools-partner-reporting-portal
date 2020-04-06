import {PolymerElement, html} from '@polymer/polymer';
import './etools-prp-progress-bar';
import {property} from '@polymer/decorators/lib/decorators';


/**
 * @polymer
 * @customElement
 */
class EtoolsPrpProgressBarCluster extends PolymerElement{
  public static get template(){
    return html`
    
      <style>
        :host {
          display: block;
          width: 100%;
  
          --paper-progress-active-color: #88c245;
        }
  
        etools-prp-progress-bar {
          @apply --etools-prp-progress-bar;
        }
      </style>
  
      <etools-prp-progress-bar display-type="[[displayType]]" number="[[number]]"></etools-prp-progress-bar>
    
    `;
  }

  @property({type: String})
  displayType!: string;

  @property({type: Number})
  number!: number;

}

window.customElements.define('etools-prp-progress-bar-cluster', EtoolsPrpProgressBarCluster);








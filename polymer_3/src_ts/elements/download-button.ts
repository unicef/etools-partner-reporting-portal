import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-button/paper-button.js';
import {property} from '@polymer/decorators/lib/decorators';


/**
 * @polymer
 * @customElement
 */
class DownloadButton extends PolymerElement{
  public static get template(){
    return html`
      <style>
        a {
          text-decoration: none;
          color: var(--theme-primary-color);
        }
      </style>
      
      <a
          href="[[url]]"
          tabindex="-1"
          target="_blank">
        <paper-button class="btn-primary">
          <iron-icon icon="icons:file-download"></iron-icon>
<!--          <content></content>-->
        </paper-button>
      </a>
    
    `;
  }

  @property({type: String})
  url!: string;

}

window.customElements.define('download-button', DownloadButton);

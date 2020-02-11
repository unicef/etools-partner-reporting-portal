import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';

/**
 * @polymer
 * @customElement
 */
class PageBadge extends PolymerElement {
  public static get template() {
    return html`
      <style>
        :host {
            display: inline-block;
            border-radius: 1px;
            padding: 1px 6px;
            font-size: 10px;
            text-transform: uppercase;
            background-color: var(--paper-grey-500);
            color: white;
        }
      </style>

      [[name]]`
      ;
  }

  @property({type: String})
  name!: string;
}

window.customElements.define('page-badge', PageBadge);

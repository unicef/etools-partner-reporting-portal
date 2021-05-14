import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import {GenericObject} from '../typings/globals.types';

/**
 * @polymer
 * @customElement
 */
class ErrorBoxErrors extends PolymerElement {
  public static get template() {
    return html`
      <style>
        :host {
          display: block;
        }

        ul {
          padding-left: 2em;
          margin: 0;
          font-size: 12px;
        }
      </style>

      <ul>
        <template is="dom-repeat" items="[[errors]]" as="error">
          <li>
            <template is="dom-if" if="[[error.field]]" restamp="true">
              <span>[[error.field]]:</span>
            </template>

            <template is="dom-if" if="[[error.value]]" restamp="true">
              <span>[[error.value]]</span>
            </template>

            <template is="dom-if" if="[[error.details]]" restamp="true">
              <error-box-errors errors="[[error.details]]"> </error-box-errors>
            </template>
          </li>
        </template>
      </ul>
    `;
  }

  @property({type: Object})
  errors!: GenericObject;
}

window.customElements.define('error-box-errors', ErrorBoxErrors);

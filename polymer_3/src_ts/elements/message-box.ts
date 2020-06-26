import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';

/**
 * @polymer
 * @customElement
 */
class MessageBox extends PolymerElement {
  public static get template() {
    return html` <style include="iron-flex iron-flex-alignment">
        :host {
          display: block;
        }

        .message-box {
          padding: 5px 15px;
          font-size: 12px;
          line-height: 1.3;
          color: rgba(0, 0, 0, 0.5);
        }

        .message-box--success {
          background-color: #009951;
        }

        .message-box--error {
          background-color: #d0021b;
        }

        .message-box--warning {
          background-color: #ffcc00;
        }

        .icon-wrapper {
          margin-right: 15px;
        }

        iron-icon {
          width: 20px;
          height: 20px;
        }
      </style>
      <div class$="message-box message-box--[[type]] layout horizontal">
        <div class="icon-wrapper self-center">
          <iron-icon icon="icons:info"></iron-icon>
        </div>
        <div class="self-center">
          <slot></slot>
        </div>
      </div>`;
  }

  @property({type: String})
  type!: string;
}

window.customElements.define('message-box', MessageBox);

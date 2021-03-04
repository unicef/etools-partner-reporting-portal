import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/image-icons';

/**
 * @polymer
 * @customElement
 */
class StatusBadge extends PolymerElement {
  public static get template() {
    return html` <style>
        :host {
          display: inline-block;
          vertical-align: top;

          --iron-icon-height: var(--status-badge-size, 16px);
          --iron-icon-width: var(--status-badge-size, 16px);

          margin-right: 4px;
        }
        :host iron-icon {
          line-height: 1;
        }
      </style>

      <iron-icon icon="[[icon]]" style="color: [[color]];"> </iron-icon>`;
  }

  @property({type: String})
  type!: string;

  @property({type: Boolean})
  hideIcon!: boolean;

  @property({type: String, computed: '_computeIcon(type)'})
  icon!: string;

  @property({type: String, computed: '_computeColor(type)'})
  color!: string;

  _computeIcon(type: string) {
    if (!this.hideIcon) {
      switch (type) {
        case 'success':
          return 'icons:check-circle';
        case 'error':
        case 'warning':
          return 'icons:error';
      }
    }
    return 'image:lens';
  }

  _computeColor(type: string) {
    switch (type) {
      case 'default':
        return '#0099ff';
      case 'success':
        return '#009951';
      case 'error':
        return '#d0021b';
      case 'neutral':
        return '#d8d8d8';
      case 'warning':
        return '#ffcc00';
      case 'no-status':
        return '#273d48';
    }
    return '#273d48';
  }
}

window.customElements.define('status-badge', StatusBadge);

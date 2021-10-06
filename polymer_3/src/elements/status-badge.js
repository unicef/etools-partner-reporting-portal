var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/image-icons';
/**
 * @polymer
 * @customElement
 */
class StatusBadge extends PolymerElement {
    static get template() {
        return html `
      <style>
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

      <iron-icon
        icon="[[icon]]"
        style="color: [[color]];">
      </iron-icon>`;
    }
    _computeIcon(type) {
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
    _computeColor(type) {
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
__decorate([
    property({ type: String })
], StatusBadge.prototype, "type", void 0);
__decorate([
    property({ type: Boolean })
], StatusBadge.prototype, "hideIcon", void 0);
__decorate([
    property({ type: String, computed: '_computeIcon(type)' })
], StatusBadge.prototype, "icon", void 0);
__decorate([
    property({ type: String, computed: '_computeColor(type)' })
], StatusBadge.prototype, "color", void 0);
window.customElements.define('status-badge', StatusBadge);

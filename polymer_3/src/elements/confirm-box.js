var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';
import '@polymer/polymer/lib/elements/dom-if';
import Constants from '../constants';
import { buttonsStyles } from '../styles/buttons-styles';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class ConfirmBox extends PolymerElement {
    constructor() {
        super(...arguments);
        this.active = false;
        this.config = {
            okLabel: 'Continue',
            cancelLabel: 'Cancel',
            maxWidth: '100%',
            mode: Constants.CONFIRM_INLINE,
            result: {}
        };
    }
    static get template() {
        return html `
        ${buttonsStyles}
      <style include="iron-flex iron-flex-reverse iron-flex-alignment">
        :host {
          display: block;
        }

        .overlay {
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          z-index: 10;
          background: rgba(0, 0, 0, .3);
        }

        .prompt {
          box-sizing: border-box;
          width: calc(100% - 48px);
          padding: 24px;
          background: white;
          box-shadow: 0 1px 2px 1px rgba(0, 0, 0, .1);
          font-weight: 600;
        }

        .info-wrapper {
          display: flex;
          align-items: center;
        }

        .info-icon {
          color: #e2d96b;
          display: block;
          flex: 1 0 45px;
          height: 45px;
          margin-right: 20px;
        }
      </style>

      <template
        is="dom-if"
        if="[[active]]">
        <div
          class="overlay layout horizontal center-center"
          style="position: [[position]];">
          <div
            class="prompt"
            style="max-width: [[config.maxWidth]];">
            <div class="info-wrapper">
              <iron-icon class="info-icon" icon="info-outline"></iron-icon>
              <p>
                [[config.body]]
              </p>
            </div>
            <div class="layout horizontal-reverse">
              <paper-button
                class="btn-primary"
                on-tap="_ok">
                [[config.okLabel]]
              </paper-button>

              <paper-button
                on-tap="_cancel">
                [[config.cancelLabel]]
              </paper-button>
            </div>
          </div>
        </div>
      </template>


    `;
    }
    _computePosition(config) {
        switch (config.mode) {
            case Constants.CONFIRM_INLINE:
                return 'absolute';
            case Constants.CONFIRM_MODAL:
            default:
                return 'fixed';
        }
    }
    _ok() {
        try {
            if (this.config.result && this.config.result.promise) {
                this.config.result.resolve();
            }
        }
        catch (err) {
            console.log(err);
        }
        this._close();
    }
    _cancel() {
        try {
            if (this.config.result && this.config.result.promise) {
                this.config.result.reject();
            }
        }
        catch (err) {
            console.log(err);
        }
        this._close();
    }
    _open() {
        this.set('active', true);
    }
    _close() {
        this.set('active', false);
    }
    run(config) {
        this.set('config', Object.assign({}, this.config, config));
        this._open();
    }
}
__decorate([
    property({ type: Boolean })
], ConfirmBox.prototype, "active", void 0);
__decorate([
    property({ type: String, computed: '_computePosition(config)' })
], ConfirmBox.prototype, "position", void 0);
__decorate([
    property({ type: Object })
], ConfirmBox.prototype, "config", void 0);
window.customElements.define('confirm-box', ConfirmBox);
export { ConfirmBox as ConfirmBoxEl };

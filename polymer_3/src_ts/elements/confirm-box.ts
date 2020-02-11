import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/iron-icons/iron-icons';

import Constants from '../constants';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../typings/globals.types';
import {ConfirmBoxElem} from '../typings/entities.types';
// <link rel="import" href="../styles/buttons.html">


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class ConfirmBox extends PolymerElement{
  public static get template() {
    return html`
      <style include="iron-flex iron-flex-reverse iron-flex-alignment button-styles">
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

  @property({type: Boolean})
  active: boolean = false;

  @property({type: String, computed: '_computePosition(config)'})
  position!: string;

  @property({type: Object})
  config: ConfirmBoxElem = { okLabel: 'Continue',
                            cancelLabel: 'Cancel',
                            maxWidth: '100%',
                            mode: Constants.CONFIRM_INLINE};

  _computePosition(config: GenericObject) {
    switch (config.mode) {
      case Constants.CONFIRM_INLINE:
        return 'absolute';

      case Constants.CONFIRM_MODAL:
        return 'fixed';
    }
  }

  _ok() {
    try {
      this.config.result.resolve();
    } catch (err) {
    }

    this._close();
  }

  _cancel() {
    try {
      this.config.result.reject();
    } catch (err) {
    }

    this._close();
  }

  _open() {
    this.set('active', true);
  }

  _close() {
    this.set('active', false);
  }

  run(config: GenericObject) {
    this.set('config', Object.assign({}, this.config, config));
    this._open();
  }

}

window.customElements.define('confirm-box', ConfirmBox);

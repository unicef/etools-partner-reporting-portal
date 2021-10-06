var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-icon/iron-icon';
import UtilsMixin from '../mixins/utils-mixin';
import { property } from '@polymer/decorators/lib/decorators';
import './error-box-errors';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class ErrorBox extends UtilsMixin(PolymerElement) {
    constructor() {
        super(...arguments);
        this.errors = {};
        this.mappedErrors = [];
        this._hidden = true;
    }
    static get template() {
        return html `
      <style include="iron-flex iron-flex-alignment iron-flex-reverse">
        #box {
          background: var(--paper-grey-300);
          padding: 10px;
          color: var(--error-color);
        }

        .header {
          margin-bottom: 1em;
        }

        iron-icon {
          margin-right: 5px;
        }
      </style>

      <div
          id="box"
          hidden$="[[_hidden]]">
        <div class="header layout horizontal center">
          <iron-icon icon="icons:error"></iron-icon>
          <span>Error(s) occurred. Please check the list to save the form.</span>
        </div>

        <error-box-errors
            errors="[[mappedErrors]]">
        </error-box-errors>
      </div>

    `;
    }
    _computeMappedErrors(errors) {
        return this.errorMapper(errors);
    }
    _scrollToBox() {
        setTimeout(() => {
            this.shadowRoot.querySelector('#box').scrollIntoView();
        });
    }
    _computeHidden(mappedErrors) {
        return !mappedErrors.length;
    }
    errorMapper(error) {
        if (!error) {
            return [];
        }
        const self = this;
        switch (typeof error) {
            case 'string':
                return [
                    {
                        value: error
                    }
                ];
            default:
                return Object.keys(error)
                    .filter((key) => {
                    return key !== 'error_codes';
                })
                    .map((key) => {
                    return {
                        field: key,
                        details: error[key].reduce((acc, err) => {
                            return acc.concat(self.errorMapper(err));
                        }, [])
                    };
                });
        }
    }
}
__decorate([
    property({ type: Object, observer: '_scrollToBox' })
], ErrorBox.prototype, "errors", void 0);
__decorate([
    property({ type: Array, computed: '_computeMappedErrors(errors)' })
], ErrorBox.prototype, "mappedErrors", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeHidden(mappedErrors)' })
], ErrorBox.prototype, "_hidden", void 0);
window.customElements.define('error-box', ErrorBox);

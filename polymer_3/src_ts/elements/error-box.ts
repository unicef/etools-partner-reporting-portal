import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-icon/iron-icon';
import UtilsMixin from '../mixins/utils-mixin';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../typings/globals.types';
import './error-box-errors';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class ErrorBox extends UtilsMixin(PolymerElement){
  public static get template() {
    return html`
      <style include="iron-flex iron-flex-alignment iron-flex-reverse">
        :host {
          color: var(--paper-input-container-invalid-color, --error-color);
        }
  
        #box {
          background: var(--paper-grey-300);
          padding: 10px;
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

  @property({type: Object, observer: '_scrollToBox'})
  errors: GenericObject = {};

  @property({type: Array, computed: '_computeMappedErrors(errors)'})
  mappedErrors: GenericObject[] = [];

  @property({type: Boolean, computed: '_computeHidden(mappedErrors)'})
  _hidden: boolean = true;


  _computeMappedErrors(errors: GenericObject[]) {
    return this.errorMapper(errors);
  }

  _scrollToBox() {
    setTimeout(function () {
      this.shadowRoot!.querySelector('#box').scrollIntoView();
    });
  }

  _computeHidden(mappedErrors: GenericObject[]) {
    return !mappedErrors.length;
  }

  errorMapper(error: any) {
    switch (typeof error) {
      case 'string':
        return [
          {
            value: error,
          },
        ];

      case 'undefined':
        return [];

      default:
        return Object.keys(error)
          .filter(function (key) {
            return key !== 'error_codes';
          })
          .map(function (key) {
            return {
              field: key,
              details: error[key].reduce(function (acc, err) {
                return acc.concat(errorMapper(err));
              }, []),
            };
          });
    }
  }



}

window.customElements.define('error-box', ErrorBox);

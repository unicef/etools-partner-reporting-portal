import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/paper-styles/typography';
import './etools-prp-number';
import {buttonsStyles} from '../styles/buttons-styles';
import {modalStyles} from '../styles/modal-styles';

/**
 * @polymer
 * @customElement
 */
class CalculationMethodsDemoLocations extends PolymerElement {

  static get template() {
    return html`
        ${buttonsStyles} ${modalStyles} 
        <style include="iron-flex-alignment iron-flex-reverse">
          :host {
            display: block;

            --app-grid-columns: 3;
            --app-grid-gutter: 25px;
            --app-grid-item-height: auto;

            --paper-dialog: {
              width: 750px;

              &>* {
                margin: 0;
              }
            }
            ;
          }

          .flex-2 {
            @apply --layout-flex-2;
          }

          .app-grid {
            padding: 0;
            margin: 0;
            /* ugly - until I found out how to remove right margin from app grid */
            margin-right: -25px;
            list-style: none;
          }

          li:last-of-type {
            margin-right: 0;
          }

          .content-box {
            padding: 25px;
            background: var(--paper-grey-200);
          }

          .bold-text {
            font-weight: bold;
            font-size: 1.17em;
          }
        </style>

        <ul class="app-grid">
          <template is="dom-repeat" items="[[totals]]">
            <li>
              <div class="content-box">
                <div class="bold-text">Location [[item.id]]</div>
                <div class="layout horizontal justified">
                  <div>Reporting period</div>
                  <etools-prp-number class="bold-text" value="{{item.value}}"></etools-prp-number>
                </div>
              </div>
            </li>
          </template>
        </ul>
  `;
  }

  @property({type: Array})
  totals!: any[];

}

window.customElements.define('calculation-methods-demo-locations', CalculationMethodsDemoLocations);

export {CalculationMethodsDemoLocations as CalculationMethodsDemoLocationsEl};

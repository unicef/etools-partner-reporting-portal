import {PolymerElement, html} from '@polymer/polymer';
import {property} from "@polymer/decorators/lib/decorators";
import UtilsMixin from '../mixins/utils-mixin';
import LocalizeMixin from '../mixins/localize-mixin';

//<link rel="import" href="../behaviors/utils.html">
//<link rel="import" href="../redux/store.html">
//<link rel="import" href="../behaviors/localize.html">
//<link rel="import" href="../redux/actions/localize.html">

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
    //TODO: need to be checked the code made by @lajos 
    // behaviors: [
    //     App.Behaviors.UtilsBehavior,
    //     App.Behaviors.ReduxBehavior,
    //     App.Behaviors.LocalizeBehavior,
    //     Polymer.AppLocalizeBehavior,
    //   ],
class ReportingPeriod extends LocalizeMixin(UtilsMixin(PolymerElement)){
    public static get template() {
        return html`
        <style>
        :host {
            display: inline-block;
            padding: 1px 3px;
            border: 1px solid var(--paper-grey-500);
            font-size: 10px;
            text-transform: uppercase;
            white-space: nowrap;
            color: var(--paper-grey-500);
        }

        .range {
            color: var(--theme-primary-text-color-dark);
        }
        </style>

        [[localize('reporting_period')]]: <span class="range">[[_withDefault(range)]]</span>
      `;
    }

    @property({type: String})
    range = null;
}

window.customElements.define('reporting-period', ReportingPeriod);
import {PolymerElement, html} from '@polymer/polymer';
import {property} from "@polymer/decorators/lib/decorators";
//<link rel="import" href="../styles/shared-styles.html">

/**
 * @polymer
 * @customElement
 */
class LabelledItem extends PolymerElement{
    public static get template() {
        return html`
        <style include="shared-styles">
        :host {
            display: block;
            position: relative;
        }

        .labelled-item {
            margin: 0;
        }

        .labelled-item__label {
            font-size: 12px;
            color: #737373;

            @apply --labelled-item-label;
            @apply --truncate;
        }

        .labelled-item__content {
            margin: 0;
        }

        .error {
            color: var(--paper-deep-orange-a700);
        }

        :host ::content .field-value {
            font-size: 16px;
        }
        </style>

        <dl class="labelled-item">
            <dt class$="labelled-item__label [[labelClassName]]">[[label]]</dt>
            <dd class="labelled-item__content">
                <content></content>
            </dd>
        </dl>
      `;
    }
    
    @property({type: String})
    label!: string;

    @property({type: Boolean})
    invalid: boolean = false;

    @property({type: String, computed: '_computeLabelClassName(invalid)'})
    labelClassName!: string;

    _computeLabelClassName(invalid: Boolean) {
        return invalid ? 'error' : '';
      }
}

window.customElements.define('labelled-item', LabelledItem);

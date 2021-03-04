import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import LocalizeMixin from '../mixins/localize-mixin';
import {GenericObject} from '../typings/globals.types';

class ListPlaceholder extends LocalizeMixin(ReduxConnectedElement) {
  public static get template() {
    return html`
      <style>
        .msg {
          text-align: center;
          padding: 1em 0;
        }
      </style>

      <div class="msg">[[getMessageToDisplay(localize)]]</div>
    `;
  }

  @property({type: Array})
  data = [];

  @property({type: Boolean})
  loading = false;

  @property({type: String})
  message!: string;

  @property({type: Boolean, reflectToAttribute: true, computed: '_computeHidden(data, loading)'})
  hidden!: boolean;

  @property({type: Boolean, reflectToAttribute: true, computed: '_computeAriaHidden(hidden)'})
  ariaHidden!: boolean;

  _computeHidden(data: GenericObject[], loading: boolean) {
    return loading || (data && !!data.length);
  }

  _computeAriaHidden(hidden: boolean) {
    return hidden ? 'true' : 'false';
  }

  getMessageToDisplay(localize: any) {
    return this.message ? this.message : localize('no_results_found');
  }
}

window.customElements.define('list-placeholder', ListPlaceholder);

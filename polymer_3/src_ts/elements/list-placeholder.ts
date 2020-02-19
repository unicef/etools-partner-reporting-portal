import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import LocalizeMixin from '../mixins/localize-mixin';
import {GenericObject} from '../typings/globals.types';

class ListPlaceholder extends LocalizeMixin(PolymerElement) {
  public static get template() {
    return html`
      <style>
        .msg {
          text-align: center;
          padding: 1em 0;
        }
      </style>

      <div class="msg">[[localize(message)]]</div>`
      ;
  }
  // behaviors: [
  //     App.Behaviors.ReduxBehavior,
  //     App.Behaviors.LocalizeBehavior,
  //     Polymer.AppLocalizeBehavior,
  //   ],

  //@lajos
  //needs to be checked if defined correctly bellow
  @property({type: Array})
  data!: GenericObject[];

  @property({type: Boolean})
  loading: boolean = false;

  @property({type: String})
  message = 'no_results_found';

  @property({type: Boolean, computed: '_computeHidden(data, loading)'})
  hidden!: boolean;

  @property({type: Boolean, computed: '_computeAriaHidden(hidden)'})
  ariaHidden!: boolean;

  _computeHidden(data: GenericObject[], loading: boolean) {
    return loading || !!data.length;
  };

  _computeAriaHidden(hidden: boolean) {
    return hidden ? 'true' : 'false';
  };
}

window.customElements.define('list-placeholder', ListPlaceholder);

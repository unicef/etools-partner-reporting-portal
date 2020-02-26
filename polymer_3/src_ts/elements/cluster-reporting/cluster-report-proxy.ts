import {PolymerElement,html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../typings/globals.types';
// <link rel='import' href='cluster-report.html'>


/**
 * @polymer
 * @customElement
 */
class ClusterReportProxy extends PolymerElement{
  public static get template(){
    return html`
      <style>
        :host {
          display: block;
          margin: 0 -24px;
        }
      </style>
      
      <template
          is="dom-if"
          if="[[active]]"
          restamp="true">
        <cluster-report
            data="[[data]]"
            mode="[[mode]]">
        </cluster-report>
      </template>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: String})
  mode!: string;

  @property({type: Number})
  currentId!: number;

  @property({type: Boolean})
  active: boolean = false;


  static get observers(){
    return ['_render(data.id)'];
  }

  _computeCurrentId(data: GenericObject) {
    return data.id;
  }

  _render(id: number) {
    if (typeof id === 'undefined') {
      return;
    }

    if (this.currentId === id) {
      return;
    }

    setTimeout( () => {
      this.set('currentId', id);
    });

    // Force re-render:
    this.set('active', false);

    setTimeout( () => {
      this.set('active', true);
    });
  }
}

window.customElements.define('cluster-report-proxy', ClusterReportProxy);

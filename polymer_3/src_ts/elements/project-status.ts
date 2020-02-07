import {PolymerElement, html} from '@polymer/polymer';
import {property} from "@polymer/decorators/lib/decorators";
import from "./status-badge";
import UtilsMixin from '../mixins/utils-mixin';
import LocalizeMixin from '../mixins/localize-mixin';

// <link rel="import" href="../../bower_components/polymer/polymer.html">
// <link rel="import" href="status-badge.html">
// <link rel="import" href="../behaviors/utils.html">
// <link rel="import" href="../behaviors/localize.html">

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ProjectStatus extends LocalizeMixin(UtilsMixin(PolymerElement)){
    public static get template() {
        return html`
        <style>
        :host {
            display: inline-block;
        }

        status-badge {
            position: relative;
            top: -2px;
        }
        </style>
        <status-badge type="[[type]]" hide-icon></status-badge> [[_localizeLowerCased(label, localize)]]
      `;
    }

    @property({type: String})
    status!: string;

    @property({type: String, computed: '_computeType(status)'})
    type!: string;

    @property({type: String, computed: '_computeLabel(status)'})
    label!: string;
   
    _computeType(status: String) {
        switch (status) {
          case 'Ong':
            return 'default';
          case 'Pla':
            return 'warning';
          case 'Com':
            return 'success';
        }
        return;
      }

      _computeLabel(status: String) {
        switch (status) {
          case 'Ong':
            return 'Ongoing';
          case 'Pla':
            return 'Planned';
          case 'Com':
            return 'Completed';
        }
        return;
      }
}

window.customElements.define('project-status', ProjectStatus);

/**
 *
 @license
 Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 Code distributed by Google as part of the polymer project is also
 subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 *
 */

import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-a11y-keys-behavior/iron-a11y-keys-behavior';
import {IronMenuBehavior} from '@polymer/iron-menu-behavior/iron-menu-behavior';
import '@polymer/paper-radio-button/paper-radio-button';
import {property} from '@polymer/decorators/lib/decorators';
import {fireEvent} from '../../utils/fire-custom-event';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class';

/**
 *
 Material design: [Radio button](https://www.google.com/design/spec/components/selection-controls.html#selection-controls-radio-button)

 `paper-radio-group` allows user to select at most one radio button from a set.
 Checking one radio button that belongs to a radio group unchecks any
 previously checked radio button within the same group. Use
 `selected` to get or set the selected radio button.

 The <paper-radio-buttons> inside the group must have the `name` attribute
 set.

 Example:

 <paper-radio-group selected="small">
 <paper-radio-button name="small">Small</paper-radio-button>
 <paper-radio-button name="medium">Medium</paper-radio-button>
 <paper-radio-button name="large">Large</paper-radio-button>
 </paper-radio-group>

 Radio-button-groups can be made optional, and allow zero buttons to be selected:

 <paper-radio-group selected="small" allow-empty-selection>
 <paper-radio-button name="small">Small</paper-radio-button>
 <paper-radio-button name="medium">Medium</paper-radio-button>
 <paper-radio-button name="large">Large</paper-radio-button>
 </paper-radio-group>

 See <a href="paper-radio-button">paper-radio-button</a> for more
 information about `paper-radio-button`.


 Custom property | Description | Default
 ----------------|-------------|----------
 `--paper-radio-group-item-padding` | The padding of the item | `12px`

 @group Paper Elements
 @element paper-radio-group
 @hero hero.svg
 @demo demo/index.html
 *
 */


/**
 * @polymer
 * @customElement
 * @appliesMixin mixinBehaviors
 */
class PaperRadioGroupCustom extends mixinBehaviors(IronMenuBehavior, PolymerElement) {
  public static get template() {
    return html`
      <style>
        :host {
          display: inline-block;
        }

        :host ::slotted(*) {
          padding: var(--paper-radio-group-item-padding, 12px);
        }
      </style>
      <slot></slot>
    `;
  }

  /**
   * Fired when the radio group selection changes.
   *
   * @event paper-radio-group-changed
   */

  /**
   * Overriden from Polymer.IronSelectableBehavior
   */
  @property({type: String})
  attrForSelected: string = 'name';

  /**
   * Overriden from Polymer.IronSelectableBehavior
   */
  @property({type: String})
  selectedAttribute: string = 'checked';

  /**
   * Overriden from Polymer.IronSelectableBehavior
   */
  @property({type: String})
  selectable: string = 'paper-radio-button';

  /**
   * If true, radio-buttons can be deselected
   */
  @property({type: Boolean})
  allowEmptySelection: boolean = false;


  /**
   * Selects the given value.
   */
  select(value) {
    let newItem = this._valueToItem(value);
    if (newItem && newItem.hasAttribute('disabled')) {
      return;
    }

    if (this.selected) {
      let oldItem = this._valueToItem(this.selected);

      if (this.selected === value) {
        // If deselecting is allowed we'll have to apply an empty selection.
        // Otherwise, we should force the selection to stay and make this
        // action a no-op.
        if (this.allowEmptySelection) {
          value = '';
        } else {
          if (oldItem) {
            oldItem.checked = true;
          }
          return;
        }
      }

      if (oldItem) {
        oldItem.checked = false;
      }
    }

    this.IronSelectableBehavior.select.apply(this, [value]);
    fireEvent(this, 'paper-radio-group-changed');
  }

  _activateFocusedItem() {
    this._itemActivate(this._valueForItem(this.focusedItem), this.focusedItem);
  }

  _onUpKey() {
    // this._focusPrevious();
    // event.preventDefault();
    // this._activateFocusedItem();
  }

  _onDownKey() {
    // this._focusNext();
    // event.preventDefault();
    // this._activateFocusedItem();
  }

  _onLeftKey() {
    // Polymer.IronMenubarBehaviorImpl._onLeftKey.apply(this, arguments);
    // this._activateFocusedItem();
  }

  _onRightKey() {
    // Polymer.IronMenubarBehaviorImpl._onRightKey.apply(this, arguments);
    // this._activateFocusedItem();
  }

  _onKeydown() {
    return;
  }

}

window.customElements.define('paper-radio-group-custom', PaperRadioGroupCustom);

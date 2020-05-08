import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';

/**
 * @polymer
 * @customElement
 */
class PageTitle extends PolymerElement {
  @property({type: String})
  baseTitle = 'PRP';

  @property({type: String})
  divider = '|';

  @property({type: String})
  title!: string;

  static get observers() {
    return [
      '_setDocumentTitle(title, divider, baseTitle)'
    ];
  }

  _setDocumentTitle() {
    document.title = [].slice.call(arguments).join(' ');
  }

}

window.customElements.define('page-title', PageTitle);

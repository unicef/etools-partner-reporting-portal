import {LitElement, query} from 'lit-element';
import {EtoolsContentPanel} from '@unicef-polymer/etools-content-panel/etools-content-panel';
import {Constructor} from '@unicef-polymer/etools-types';

function ContentPanelMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class ContentPanelMixin extends baseClass {
    @query('etools-content-panel')
    contentPanel?: EtoolsContentPanel;

    openContentPanel(): void {
      if (this.contentPanel) {
        this.contentPanel.set('open', true);
      }
    }
  }
  return ContentPanelMixin;
}

export default ContentPanelMixin;

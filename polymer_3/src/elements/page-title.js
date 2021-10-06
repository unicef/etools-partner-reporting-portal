var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
/**
 * @polymer
 * @customElement
 */
class PageTitle extends PolymerElement {
    constructor() {
        super(...arguments);
        this.baseTitle = 'PRP';
        this.divider = '|';
    }
    static get observers() {
        return [
            '_setDocumentTitle(title, divider, baseTitle)'
        ];
    }
    _setDocumentTitle() {
        document.title = [].slice.call(arguments).join(' ');
    }
}
__decorate([
    property({ type: String })
], PageTitle.prototype, "baseTitle", void 0);
__decorate([
    property({ type: String })
], PageTitle.prototype, "divider", void 0);
__decorate([
    property({ type: String })
], PageTitle.prototype, "title", void 0);
window.customElements.define('page-title', PageTitle);

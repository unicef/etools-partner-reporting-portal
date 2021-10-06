var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement } from '@polymer/polymer';
import { store } from './redux/store';
import { connect } from 'pwa-helpers/connect-mixin';
import { property } from '@polymer/decorators';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
export class ReduxConnectedElement extends connect(store)(PolymerElement) {
    constructor() {
        super();
        this.reduxStore = store;
    }
    stateChanged(state) {
        //console.log('ARE STATES EQUAL?', this.rootState == state);
        this.sDebouncer = Debouncer.debounce(this.sDebouncer, timeOut.after(50), () => {
            //if (JSON.stringify(this.rootState) != JSON.stringify(state)) {
            this.rootState = state; // Assign by reference to reduce memory, clone before actual use
            //}
        });
    }
    getReduxStateValue(pathValue) {
        // console.log(pathValue);
        return pathValue;
    }
    getReduxStateArray(pathValue) {
        if (pathValue === undefined) {
            return undefined;
        }
        //console.log(pathValue);
        return [...pathValue];
    }
    getReduxStateObject(pathValue) {
        if (pathValue === undefined) {
            return undefined;
        }
        // console.log(pathValue);
        return Object.assign({}, pathValue);
    }
}
__decorate([
    property({ type: Object })
], ReduxConnectedElement.prototype, "rootState", void 0);
__decorate([
    property({ type: Object })
], ReduxConnectedElement.prototype, "reduxStore", void 0);

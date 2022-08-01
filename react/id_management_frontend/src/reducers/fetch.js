import { FETCH_REQUEST, FETCH_FINISHED, FETCH_INVALIDATE } from "../fetch";
import * as R from "ramda";
export default function fetch(state = { promises: {}, pending: {} }, action) {
    let data, _promises, _pending, actionPromises, actionPending;
    switch (action.type) {
        case FETCH_REQUEST:
            if (action.id) {
                actionPromises = state.promises[action.option] || {};
                _promises = Object.assign({}, actionPromises, {
                    [action.id]: action.promise
                });
                actionPending = state.pending[action.option] || {};
                _pending = Object.assign({}, actionPending, {
                    [action.id]: true
                });
            }
            else {
                _promises = action.promise;
                _pending = true;
            }
            data = {
                promises: Object.assign({}, state.promises, {
                    [action.option]: _promises
                }),
                pending: Object.assign({}, state.pending, {
                    [action.option]: _pending
                })
            };
            return Object.assign({}, state, data);
        case FETCH_FINISHED:
            if (action.id) {
                actionPending = state.pending[action.option] || {};
                _pending = Object.assign({}, actionPending, {
                    [action.id]: false
                });
            }
            else {
                _pending = false;
            }
            const pending = Object.assign({}, state.pending, {
                [action.option]: _pending
            });
            return Object.assign({}, state, {
                pending
            });
        case FETCH_INVALIDATE:
            if (action.id) {
                console.log(state, action);
                actionPromises = state.promises[action.option] || {};
                _promises = Object.assign({}, state.promises, { [action.option]: R.dissoc(actionPromises, action.id) });
                actionPending = state.pending[action.option] || {};
                _pending = Object.assign({}, state.pending, { [action.option]: R.dissoc(actionPending, action.id) });
            }
            else {
                _promises = R.dissoc(action.option, state.promises);
                _pending = R.dissoc(action.option, state.pending);
            }
            data = {
                promises: _promises,
                pending: _pending
            };
            return Object.assign({}, state, data);
        default:
            return state;
    }
}

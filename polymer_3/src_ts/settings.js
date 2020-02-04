"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Settings = {
    layout: {
        threshold: '(min-width: 600px)',
    },
    dateFormat: 'DD-MMM-YYYY',
    ip: {
        readOnlyStatuses: [
            'Sub',
            'Acc',
            'Rej',
        ],
    },
    cluster: {
        maxLocType: 5,
    }
};
exports.default = Settings;

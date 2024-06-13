import {GenericObject} from '@unicef-polymer/etools-types';
import {get as getTranslation} from 'lit-translate';

export const ACCEPT = 'accept';
export const REVIEW = 'review';
export const CANCEL = 'cancel';
const EXPORT_COMMENTS = 'download_comments';
const EXPORT = 'export';

export const ACTIONS_WITHOUT_CONFIRM = [ACCEPT, REVIEW, CANCEL];
export const EXPORT_ACTIONS = [EXPORT, EXPORT_COMMENTS];

export const namesMap: GenericObject<string> = {
  [ACCEPT]: getTranslation('ACCEPT'),
  [REVIEW]: getTranslation('REVIEW'),
  [CANCEL]: getTranslation('CANCEL'),
  [EXPORT_COMMENTS]: getTranslation('EXPORT_COMMENTS'),
  [EXPORT]: getTranslation('EXPORT')
};

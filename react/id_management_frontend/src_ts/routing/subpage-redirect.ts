// define here main routes that need redirect to list subRoute
import {ROOT_PATH} from '../config/config';
import {Router} from './router';

export const redirectToListSubpageList = ['ip-reporting'];
export const getRedirectToListPath = (path: string): undefined | string => {
  path = path.replace(ROOT_PATH, '');
  const route: string = Router.clearSlashes(path);
  const redirectTo: string | undefined = redirectToListSubpageList.find((r: string) => r === route);
  return redirectTo ? `${ROOT_PATH}${redirectTo}/list` : undefined;
};

import {RootState} from '../../typings/redux.types';
import {createSelector} from 'reselect';
import {GenericObject} from '../../typings/globals.types';

function getAllPD(state: RootState) {
  return state.programmeDocuments.all;
}

function getCurrentPDId(state: RootState) {
  return state.programmeDocuments.current;
}

function getCurrentPD(pds: any[], currentPdId: string) {
  return (
    pds.filter(function (pd: GenericObject) {
      return pd.id === currentPdId;
    })[0] || {}
  );
}

export const loadedProgrammeDocuments = createSelector(getAllPD, (docs: any[]) => !!docs.length);

export const currentProgrammeDocument = createSelector(getAllPD, getCurrentPDId, getCurrentPD);

export const programmeDocuments_CurrentAuthorizedPartners = createSelector(getAllPD, getCurrentPDId, function (
  allPDs: any[],
  pdId: string
) {
  return (getCurrentPD(allPDs, pdId).partner_focal_point || [])
    .filter(function (officer: any) {
      return officer.is_authorized_officer;
    })
    .map(function (focalPoint: any) {
      return {
        value: focalPoint.email,
        title: focalPoint.name + ' ' + focalPoint.title
      };
    });
});

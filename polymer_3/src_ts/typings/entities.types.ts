export interface Workspace {
  id: string;
  code: string;
  name: string;
  latitude: string;
  longitude: string;
}

export interface ConfirmBoxElem {
  okLabel: string,
  cancelLabel: string,
  maxWidth: string,
  mode: string;
}

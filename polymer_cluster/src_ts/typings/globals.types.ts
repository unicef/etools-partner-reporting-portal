import {PolymerElement} from '@polymer/polymer';

/*
 * The type Constructor<T> is an alias for the construct signature
 * that describes a type which can construct objects of the generic type T
 * and whose constructor function accepts an arbitrary number of parameters of any type
 * On the type level, a class can be represented as a newable function
 */
export type Constructor<T> = new (...args: any[]) => T;

export type MixinFunction = <T extends Constructor<PolymerElement>>(
  baseClass: T
) => T & {
  new (...args: any[]): any;
};

export interface GenericObject {
  [key: string]: any;
}

export interface Route {
  prefix: string;
  path: string;
  __queryParams: GenericObject;
}

/*
 * The type Constructor<T> is an alias for the construct signature
 * that describes a type which can construct objects of the generic type T
 * and whose constructor function accepts an arbitrary number of parameters of any type
 * On the type level, a class can be represented as a newable function
 */
export type Constructor<T> = new (...args: any[]) => T;

export interface UnicefUser {
  first_name: string;
  last_name: string;
  middle_name: string;
  name: string;
  email: string;
}

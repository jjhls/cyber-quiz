import type { ParamsDictionary } from 'express-serve-static-core';

/** Safely extract a string param from Express req.params */
export function param(params: ParamsDictionary, key: string): string {
  const val = params[key];
  return Array.isArray(val) ? val[0] : val;
}

import { helper as buildHelper } from '@ember/component/helper';
import { getOwner } from '@ember/application';

export function _default([context, helper, ...args]) {
  let h = getOwner(context).lookup(`helper:${helper}`);
  return h.compute(...args);
}

export const helper = buildHelper(_default);
export default helper;

import Helper from '@ember/component/helper';
import { getOwner } from '@ember/application';


export const helper = Helper.extend({
  compute([context, helper, ...args], hash) {
    if (!this.h) {
      this.h = getOwner(context).lookup(`helper:${helper}`);
      if (this.h.create) {
        const H = this.h;
        this.h = H.create();
        this.h.recompute = this.recompute.bind(this);
      }
    }
    return this.h.compute(args, hash);
  }
});

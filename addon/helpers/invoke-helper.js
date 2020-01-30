import Helper from '@ember/component/helper';
import { getOwner, setOwner } from '@ember/application';


export const helper = Helper.extend({
  compute([context, helper, ...args], hash) {
    if (!this.h) {
      this.h = getOwner(context).lookup(`helper:${helper}`);
      if (this.h && this.h.create) {
        const H = this.h;
        const props = {};
        setOwner(props, getOwner(context));
        this.h = H.create(props);
        this.h.recompute = this.recompute.bind(this);
      }
      if (!this.h || !this.h.compute) {
        throw new Error('could not find helper: ' + helper);
      }
    }
    return this.h.compute(args, hash);
  }
});

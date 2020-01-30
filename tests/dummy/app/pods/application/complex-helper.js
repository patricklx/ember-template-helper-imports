import Helper from '@ember/component/helper';
import { later } from '@ember/runloop';

export const helper = Helper.extend({
  text: 'abc',
  init(...args) {
    super.init(...args);
    const o = Ember.getOwner(this);
    if (!o) throw new Error('no owner');
  },
  compute() {
    if (this.text === 'abc') {
      setTimeout(() => {
        later(() => {
          this.text += 'd';
          this.recompute();
        }, 5);
      }, 1000);
    }
    return this.text;
  }
});

import Helper from '@ember/component/helper';
import { later } from '@ember/runloop';

export const helper = Helper.extend({
  text: 'abc',
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

import { Component, Host, Prop, h } from '@stencil/core';
import { Step } from './progress-indicator-interface.js';

@Component({
  tag: 'cpsl-progress-indicator',
  styleUrl: 'cpsl-progress-indicator.scss',
  shadow: true,
})
export class CpslProgressIndicator {
  /**
   * Total number of steps.
   */
  @Prop() totalSteps: number;

  /**
   * Current zero based step.
   */
  @Prop() step: number;

  render() {
    const steps: Step[] = new Array(this.totalSteps).fill(0).map((_, i) => {
      let resp: Step = { active: false, previous: false };
      if (i === this.step) {
        resp.active = true;
      } else if (i < this.step) {
        resp.previous = true;
      }
      return resp;
    });

    return (
      <Host>
        {steps.map(step => (
          <div class={{ step: true, active: step.active, previous: step.previous }} />
        ))}
      </Host>
    );
  }
}

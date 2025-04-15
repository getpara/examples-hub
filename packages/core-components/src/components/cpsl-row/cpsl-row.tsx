import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'cpsl-row',
  styleUrl: 'cpsl-row.scss',
  shadow: true,
})
export class CpslRow {
  @Prop() col = false;

  @Prop() align?: React.CSSProperties['alignItems'] = 'center';

  @Prop() justify?: React.CSSProperties['justifyContent'] = 'center';

  @Prop() gap?: React.CSSProperties['gap'] = '8px';

  render() {
    return (
      <Host style={{ ['--align']: this.align, ['--justify']: this.justify, ['--gap']: this.gap.toString(), ['--direction']: this.col ? 'column' : 'row' }}>
        <slot></slot>
      </Host>
    );
  }
}

// commenting out as lottie-web increases bundle size by a lot
// not deleting for now in case we want to use it in the future and replace lottie-web
// with a smaller library

// import { Component, Host, h, Element, Method, Prop } from '@stencil/core';
// import lottie, { AnimationItem } from 'lottie-web';

// @Component({
//   tag: 'cpsl-animation',
//   styleUrl: 'cpsl-animation.scss',
//   shadow: true,
// })
// export class CpslAnimation {
//   private animation: AnimationItem;

//   @Element() el!: HTMLCpslAnimationElement;

//   /**
//    * Source of the Lottie animation file.
//    */
//   @Prop() src: string;

//   /**
//    * Will replay the animation
//    */
//   @Method()
//   async replayAnimation() {
//     this.animation.play();
//   }

//   componentDidLoad() {
//     this.animation = lottie.loadAnimation({
//       loop: false,
//       container: this.animationContainerEl,
//       renderer: 'svg',
//       path: this.src,
//     });

//     this.animation.play();
//   }

//   private get animationContainerEl() {
//     return this.el.shadowRoot.getElementById('animation-container');
//   }

//   render() {
//     return (
//       <Host>
//         <div part="animation-container" id="animation-container" class="animation-container" />
//       </Host>
//     );
//   }
// }

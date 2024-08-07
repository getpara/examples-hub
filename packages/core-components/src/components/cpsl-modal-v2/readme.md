# cpsl-modal-v2



<!-- Auto Generated Below -->


## Properties

| Property                  | Attribute                   | Description                                                | Type      | Default     |
| ------------------------- | --------------------------- | ---------------------------------------------------------- | --------- | ----------- |
| `elevated`                | `elevated`                  | Whether or not to show the modal with a box shadow.        | `boolean` | `undefined` |
| `enterTransitionDuration` | `enter-transition-duration` | Duration in seconds of the modal entering. Default is .15. | `number`  | `0.15`      |
| `exitTransitionDuration`  | `exit-transition-duration`  | Duration in seconds of the modal exiting. Default is .15.  | `number`  | `0.15`      |
| `noOverlay`               | `no-overlay`                | Whether or not to show the overlay.                        | `boolean` | `undefined` |
| `open`                    | `open`                      | Whether or not to show the modal.                          | `boolean` | `undefined` |
| `zIndexOverride`          | `z-index-override`          | Override z-index.                                          | `number`  | `undefined` |


## Events

| Event               | Description                            | Type                |
| ------------------- | -------------------------------------- | ------------------- |
| `cpslModalEntered`  | Emitted when enter animation finishes. | `CustomEvent<null>` |
| `cpslModalEntering` | Emitted when enter animation starts.   | `CustomEvent<null>` |
| `cpslModalExited`   | Emitted when exit animation finishes.  | `CustomEvent<null>` |
| `cpslModalExiting`  | Emitted when exit animation starts.    | `CustomEvent<null>` |


## Dependencies

### Depends on

- [cpsl-overlay](../cpsl-overlay)
- [cpsl-card](../cpsl-card)

### Graph
```mermaid
graph TD;
  cpsl-modal-v2 --> cpsl-overlay
  cpsl-modal-v2 --> cpsl-card
  style cpsl-modal-v2 fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*

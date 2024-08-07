# cpsl-overlay



<!-- Auto Generated Below -->


## Properties

| Property                  | Attribute                   | Description                                                   | Type      | Default     |
| ------------------------- | --------------------------- | ------------------------------------------------------------- | --------- | ----------- |
| `enterTransitionDuration` | `enter-transition-duration` | Duration in seconds of the fade out animation. Default is .5. | `number`  | `0.5`       |
| `exitTransitionDuration`  | `exit-transition-duration`  | Duration in seconds of the fade out animation. Default is .5. | `number`  | `0.5`       |
| `open`                    | `open`                      | Whether or not to show the overlay.                           | `boolean` | `undefined` |
| `zIndexOverride`          | `z-index-override`          | Override z-index.                                             | `number`  | `undefined` |


## Dependencies

### Used by

 - [cpsl-drawer](../cpsl-drawer)
 - [cpsl-modal](../cpsl-modal)
 - [cpsl-modal-v2](../cpsl-modal-v2)

### Graph
```mermaid
graph TD;
  cpsl-drawer --> cpsl-overlay
  cpsl-modal --> cpsl-overlay
  cpsl-modal-v2 --> cpsl-overlay
  style cpsl-overlay fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*

# cpsl-button

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description                                                                                                    | Type                                                   | Default     |
| ----------- | ------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------- |
| `as`        | `as`         | The tag for the button. Options are: `"button"`, `"a". Default is: `"button"`.                                 | `"a" \| "button"`                                      | `'button'`  |
| `disabled`  | `disabled`   | If the button is disabled. Default is: false.                                                                  | `boolean`                                              | `false`     |
| `fullWidth` | `full-width` | Whether the button takes the full width of it's container. Default is: false.                                  | `boolean`                                              | `false`     |
| `href`      | `href`       | href to use when using a link.                                                                                 | `string`                                               | `undefined` |
| `size`      | `size`       | The size of the button. Options are: `"small"`, `"medium". Default is: `"medium"`.                             | `"medium" \| "small"`                                  | `'medium'`  |
| `target`    | `target`     | target to use when using a link.                                                                               | `string`                                               | `undefined` |
| `variant`   | `variant`    | The variant of the button. Options are: `"primary"`, `"secondary", `"icon", `"text"`. Default is: `"primary"`. | `"destructive" \| "ghost" \| "primary" \| "secondary"` | `'primary'` |


## Shadow Parts

| Part              | Description |
| ----------------- | ----------- |
| `"button-native"` |             |


## Dependencies

### Used by

 - [cpsl-pagination](../cpsl-pagination)

### Graph
```mermaid
graph TD;
  cpsl-pagination --> cpsl-button
  style cpsl-button fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*

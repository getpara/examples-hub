# Para Component Library

Built using [shadcn/ui](https://ui.shadcn.com/docs)

## Adding Components

Given our monorepo setup, adding new base components from shadcn if they require additional dependency installations can't be done with the CLI tool.

To install components that **DO NOT** require additional dependency installation do the following:

1. run `npx shadcn@canary add [COMPONENT]`

To install components that require additional dependency installation do the following:

1. Find the component you're looking to add [here](https://github.com/shadcn-ui/ui/tree/12d4cf2ab0caefec5d6232e6c32220a8e62d73c4/apps/v4/registry/new-york-v4/ui)

- **NOTE** Don't use the current shadcn docs until they are upgraded to the canary branch. We are using this release to take advantage of v4 of Tailwind.

2. Copy the entire component file into the `src/components/base` directory. It's recommended to use the same naming convention that shadcn uses here.
3. Append all existing classname strings with `APPLY_PARA_PREFIX ` & run `node ./scripts/applyParaPrefix.mjs` to append `para:` to all classnames.

- **NOTE** In addition to this prefix application, look out for Tailwind theme vars that will need `para` appended. The most prevalent example of this is the `--spacing` var, this would need to be updated to `--para-spacing`. If things aren't looking right in Storybook for new components this is something that should be checked.

4. Install any dependencies the component requires. The correct versions can be found [here](https://github.com/shadcn-ui/ui/blob/12d4cf2ab0caefec5d6232e6c32220a8e62d73c4/apps/v4/package.json)
5. Export the component from `src/components/base/index.ts`

## Extending base Tailwind styles in other internal projects

Our base tailwind css is exported from the component library as `theme.css`. In order for these styles to be available in other internal projects the following should be added to the root css file (see the example in `index.css` in the `developer-portal` site):

```
@import '@getpara/react-component-library/styles.css';
@import '@getpara/react-component-library/theme.css';
@import 'tailwindcss' prefix(para);
```

This will both import the styles in css and add the source for Tailwind v4 as the internal styles from the component library in order for intellisense to work properly.

**NOTE** All our Tailwind styles from the component library are prefixed with `para:` to avoid any style collisions with existing Tailwind implementations.

### Using Tailwind Intellisense

Since we are using a monorepo, we need to manually adjust some things for Tailwind Intellisense for Tailwind v4 to work properly. The following should be added to your `.vscode/settings.json` file in order to ensure Tailwind Intellisense works properly.

```
  "tailwindCSS.experimental.configFile": {
    "packages/component-lib/src/global.css": "packages/component-lib/src/**",
    "sites/developer-portal/src/index.css": "sites/developer-portal/src/**"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
```

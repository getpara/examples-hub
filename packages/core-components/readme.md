# component-library

Cross-framework common component library

## Install

```bash
yarn install
```

## Running

The component examples can either be run in React or bare HTML.

### React

```bash
yarn build
yarn start-react
```

### HTML

```bash
yarn start-html
```

## Building

This will build the component libraries for both web components and React.

```bash
yarn build
```

## Generating New Components

This should be used when adding new components to the library. It will initialize the component, test and styles.

Once run, follow the prompts to name your component.

> **Note** Components **MUST** begin the the `cpsl-` string in order for them to pass linting.

> **Note** The styles should be changed to Sass once the component is generated. Rename the generated `css` file to `scss` and update the import in the component.

```bash
yarn generate
```

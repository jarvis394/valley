# Turborepo starter

This is an official starter Turborepo.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

    .
    ├── apps
    │   ├── api                       # NestJS app (https://nestjs.com).
    │   └── web                       # Next.js app (https://nextjs.org).
    └── packages
        ├── @valley/api                 # Shared `NestJS` resources.
        ├── @valley/eslint-config       # `eslint` configurations (includes `prettier`)
        ├── @valley/jest-config         # `jest` configurations
        ├── @valley/typescript-config   # `tsconfig.json`s used throughout the monorepo
        └── @valley/ui                  # Shareable stub React component library.

Each package and application are 100% [TypeScript](https://www.typescriptlang.org/) safe.

### Utilities

This `Turborepo` has some additional tools already set for you:

- [TypeScript](https://www.typescriptlang.org/) for static type-safety
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Jest](https://prettier.io) & [Playwright](https://playwright.dev/) for testing

### Commands

#### Build

```bash
# Will build all the app & packages with the supported `build` script.
pnpm build

# ℹ️ If you plan to only build apps individually,
# Please make sure you've built the packages first.
```

#### Develop

```bash
# Will run the development server for all the app & packages with the supported `dev` script.
pnpm dev
```

#### Lint

```bash
# Will lint all the app & packages with the supported `lint` script.
# See `@valley/eslint-config` to customize the behavior.
pnpm lint
```

#### Format

```bash
# Will format all the supported `.ts,.js,json,.tsx,.jsx` files.
# See `@valley/eslint-config/prettier-base.js` to customize the behavior.
pnpm format
```

## Installation and running issues

Ensure your machine has this packages installed: `libvips`, `libvips-tools`, `libvips-dev`

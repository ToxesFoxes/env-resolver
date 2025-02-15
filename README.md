![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)  

# @toxesfoxes/env-resolver

A flexible environment file resolver for NestJS applications that supports environment-specific configurations.

## Features

- Dynamic .env file resolution based on NODE_ENV
- Fallback to default .env file
- Customizable file naming patterns
- Built-in logging with NestJS Logger

## Installation

```bash
npm install @toxesfoxes/env-resolver
```

## Usage

Basic usage with default pattern:

```typescript
import { resolveEnvPath } from '@toxesfoxes/env-resolver';

const envPath = resolveEnvPath(__dirname);
```

This will look for files in the following order:
- `.env.{NODE_ENV}` (e.g., `.env.development`)
- `.env`

Custom pattern usage:

```typescript
const customPattern = [
  { value: '.env', type: 'filename' },
  { value: '.$1', type: 'node_env', optional: true },
  { value: '.local', type: 'filename', optional: true }
];

const envPath = resolveEnvPath(__dirname, false, customPattern);
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

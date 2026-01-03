# Kong API Gateway

Centralized API Gateway for the Personal Financial Management System (PFMS). Built on Kong in DB-less (declarative) mode.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Yarn
- [decK CLI](https://docs.konghq.com/deck/latest/install/) (for syncing to Kong)

### Commands

| Command         | Description                                             |
| :-------------- | :------------------------------------------------------ |
| `yarn build`    | Builds the default (dev) configuration to `dist/`       |
| `yarn validate` | Validates the configuration for development             |
| `yarn sync`     | Syncs the configuration to the running Kong instance    |
| `yarn diff`     | Shows differences between local config and running Kong |

### Environment-Specific Commands

Replace `{env}` with `dev`, `staging`, or `prod`:

- `yarn build:{env}`
- `yarn validate:{env}`
- `yarn sync:{env}`
- `yarn diff:{env}`

## 📁 Project Structure

```
apps/api-gateway/
├── config/              # Modular configuration files
│   ├── services/       # Backend service definitions
│   ├── routes/         # API route definitions
│   ├── plugins/        # Global plugin configurations
│   └── environments/   # Environment-specific overrides
├── dist/               # Generated configuration (gitignored)
├── docs/               # Detailed documentation
├── scripts/            # Build and validation scripts
└── package.json
```

## 📚 Documentation

- [**Architecture Overview**](./docs/ARCHITECTURE.md) - Core principles and design
- [**Routing Patterns**](./docs/ROUTING.md) - Standard route paths and URL structures
- [**Onboarding Guide**](./docs/ONBOARDING.md) - How to add a new service

## 🛠️ Development Workflow

1. **Modify Configuration**: Edit files in `config/` (do not edit `dist/` directly).
2. **Build & Validate**: Run `yarn validate:dev` to check for errors.
3. **Preview Changes**: Run `yarn diff:dev` to see what will change in Kong.
4. **Deploy**: Run `yarn sync:dev` to push changes to Kong.

## 🔐 Security Note

Do not commit secrets to this repository. Use environment variables defined in `.env` files, which are referenced in the configuration using `${VAR_NAME}` syntax.

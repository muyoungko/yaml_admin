## YAML ADMIN

Build an admin web app from a single YAML file. With `admin.yml` as the source of truth:
- The **API library (`yaml-admin-api`)** wires login/auth and CRUD endpoints into your Express app and connects to MongoDB.
- The **Front library (`yaml-admin-front`)** assembles a React Admin UI automatically.

Powered by MongoDB and `react-admin`, this project minimizes boilerplate for operations/admin dashboards.

### Monorepo Layout
- `packages/api` → `yaml-admin-api`: Parses YAML, auto-registers Express routes, connects MongoDB, provides JWT login
- `packages/front` → `yaml-admin-front`: Parses YAML and renders `react-admin` Resources/Menu/UI via React components
- `example/` → runnable examples (`api1` for API, `front1` for frontend)

---

## Quick Start

Prerequisites
- Node.js 18+
- Your mongodb instance


Install and run examples

```bash
npm run install
```

```bash
export JWT_SECRET='your jwt secret string'
export MONGODB_URL='mongodb+srv://...'
```

```bash
npm run dev
```




- API example: defaults to port `6911`
- Front example: defaults to port `6900`

Open the frontend in your browser. Entities defined in YAML appear as menu items/resources automatically.

---

## YAML Schema Overview

Example: `example/admin.yml`

```yaml crud
entity:
  crud:
    search:
      - name: server_id
      - name: email
        exact: false
      - name: name
        exact: false
    list: 
      - name: member_no
      - name: email
      - name: user_type
    create: true
    edit: true
    show: true
    delete: true
  fields:
    - name: member_no
      label: "Member No"
      type: string
      required: true
      key: true
      autogenerate: true
    - name: email
      label: "E-Mail"
      type: string
      required: true
    - name: name
      label: "Name"
      type: string
      required: true
    - name: pass
      label: "Password"
      type: password
      required: true
    - name: user_type
      type: select
      label: "Role"
      select_values:
        - name: "manager"
          label: "Manager"
        - name: "normal"
          label: "Normal"
      required: true
    - name: phone
      type: string
      label: "Phone"
```

- **login.jwt-secret**: JWT signing key. Resolved from `JWT_SECRET` at runtime.
- **database.mongodb.uri**: MongoDB connection string. Resolved from `MONGODB_URL` at runtime.
- **entity**: Resource definitions. Rendered as `react-admin` `Resource`s and used to scaffold API CRUD routes.
- **api-host/web-host**: Base hosts for frontend/backend access. Frontend can also use `VITE_HOST_API`.

---

## API Library: yaml-admin-api

Install
```bash
npm i yaml-admin-api
```

Express integration
```js
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { registerRoutes } = require('yaml-admin-api');

(async () => {
  const app = express();
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }));
  app.use(bodyParser.json({ limit: '30mb' }));

  await registerRoutes(app, { yamlPath: './admin.yml' });
  app.listen(6911, () => console.log('API listening on 6911'));
})();
```

Environment variable interpolation
- `${JWT_SECRET}` and `${MONGODB_URL}` inside `admin.yml` are replaced at runtime from environment variables.

Built-in endpoints (examples)
- `POST /member/login`, `GET /member/login` → login and receive JWT
- `GET /member/islogin` → token verification
- `GET /<entity>` → list (auth required). Supports `_sort`, `_order`, `_start`, `_end`, `id` query params. Adds `X-Total-Count` header

Authentication
- Send JWT in the `x-access-token` request header.

Serverless
- See `example/api1/serverless.yml`. Can be wrapped with `serverless-http`.

---

## Front Library: yaml-admin-front

Install
```bash
npm i yaml-admin-front react-admin react react-dom
```

Usage (Vite)
```jsx
import { YMLAdmin } from 'yaml-admin-front';
import adminYamlText from './admin.yml?raw';

export default function App() {
  return <YMLAdmin adminYaml={adminYamlText} />;
}
```

Notes
- `YMLAdmin` parses `adminYaml` and configures `react-admin` `Admin`/`Resource` automatically.
- Set the API host via YAML `api-host.uri` or environment `VITE_HOST_API`.


## License
MIT


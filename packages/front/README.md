## yaml-admin-front

A frontend library that auto-builds a `react-admin` UI from a single `admin.yml`. With only entity definitions in YAML, it renders list/show/create/edit screens, menus, icons, and upload fields out of the box.

### Features
- **YAML-driven automation**: Reads `entity` definitions and dynamically creates `Resource`s and CRUD screens
- **Built-in auth**: Works with `/member/login` and `/member/islogin` endpoints and JWT tokens
- **File uploads**: Switch between Local or S3 strategies via YAML (`upload.local`/`upload.s3`)
- **Icons**: Use `@iconify/react` icon names directly in YAML for menu/resource icons

---

### Installation
```bash
npm i yaml-admin-front
# peers if not already present
npm i react-admin react react-dom @iconify/react
```

Recommended environment
- **Node.js**: 18+
- **React**: 19.x
- **react-admin**: ^5.10

---

### Quick Start (Vite example)
```jsx
// App.jsx
import { YMLAdmin } from 'yaml-admin-front';
import adminYamlText from './admin.yml?raw';

export default function App() {
  return <YMLAdmin adminYaml={adminYamlText} />;
}
```

API host resolution order used by the frontend:
1) YAML `api-host.uri` → 2) env `VITE_HOST_API` → 3) default `http://localhost:6911`

---

### `admin.yml` Key Sections
Minimal example (see full example in the repo at `example/admin.yml`):

```yaml
api-host:
  uri: localhost:6911

entity:
  member:
    label: 'User'
    icon: 'solar:user-hands-outline'
    fields:
      - { name: name, type: string, required: true }

upload:
  # choose one
  # local: { enable: true }
  # s3:    { enable: true }
```

- **api-host.uri**: Backend API base (if missing scheme, `http://` is prepended)
- **entity.‹name›**: Label/icon/fields; drives `Resource` creation and CRUD screens
- **upload.local / upload.s3**: Select upload strategy. If omitted, plain data provider is used (no uploads)

When a field includes `private: true`, secure upload flows are used automatically.

---

### Component API
```tsx
type YMLAdminProps = {
  adminYaml: string;               // YAML as a string (e.g., Vite ?raw import)
  i18nProvider?: any;              // react-admin i18nProvider
  custom?: Record<string, any>;    // inject custom components/fields if needed
};
```

Notes
- `YMLAdmin` parses `adminYaml` and composes the `react-admin` `Admin`/`Resource` tree.
- If an entity has `custom: true`, only the `Resource` is added; no auto-scaffolded CRUD.

---

### Authentication
- Login: `POST /member/login` → on `{ token }`, saved to `localStorage.token` and sent via `x-access-token` header
- Session check: `GET /member/islogin` → `{ r: true }` means authenticated
- Token header: all requests include `x-access-token` automatically

If you use `yaml-admin-api` on the backend, you can configure login/checks from the same YAML.

---

### File Uploads
Depending on YAML, the data provider is wrapped with an upload adapter.
- **Local uploads**: `PUT /api/local/media/upload(… )`
- **S3 uploads**: Uses presigned URLs for multipart uploads and calls complete/abort APIs

Secure uploads use dedicated `/secure` endpoints. Multipart flows support progress callbacks.

---

### Environment Variables
- **VITE_HOST_API**: Default API base (URL or `host:port`). Overridden by YAML `api-host.uri` when present.

---

### Examples
- Frontend example: `example/front1`
- API example: `example/api1`
- Sample YAML: `example/admin.yml`

From the repo root you can run both examples together with:
```bash
npm run dev
```

---

### License
MIT



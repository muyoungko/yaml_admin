## yaml-admin-api

Build an admin API from a single YAML file. The library reads `admin.yml`, connects to MongoDB, and automatically registers login/auth and CRUD routes to your Express app. It also supports file upload (S3/local) and Excel import/export.

---

### Install
```bash
npm i yaml-admin-api
```

Required environment variables
- `MONGODB_URL`: MongoDB connection string
- `JWT_SECRET`: JWT signing key

Placeholders `${MONGODB_URL}` and `${JWT_SECRET}` inside YAML are resolved at runtime from the environment.

---

### Quick Start (Express)
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

  // Provide admin.yml path or a YAML string
  await registerRoutes(app, { yamlPath: './admin.yml' });

  app.listen(6911, () => console.log('API listening on 6911'));
})();
```

Options
```js
await registerRoutes(app, {
  yamlPath: './admin.yml',         // or yamlString: '<yml text>'
  password: {
    // Override password hashing for fields with type: password (default: sha512)
    encrypt: (plain) => require('crypto').createHash('sha512').update(plain).digest('hex')
  }
});
```

---

### admin.yml example
```yaml
login:
  jwt-secret: ${JWT_SECRET}
  id-password:
    entity: admin
    id-field: email
    password-field: pass
    password-encoding: bcrypt
    bcrypt-salt: 10

api-host:
  uri: http://localhost:6911
web-host:
  uri: http://localhost:6900

database:
  mongodb:
    uri: ${MONGODB_URL}

upload:
  # For S3
  # s3:
  #   access_key_id: ${S3_ACCESS_KEY_ID}
  #   secret_access_key: ${S3_SECRET_ACCESS_KEY}
  #   region: ${S3_REGION}
  #   bucket: ${S3_BUCKET}
  #   bucket_private: ${S3_BUCKET_PRIVATE}
  #   base_url: http://localhost:6911/upload
  #   base_url_private: http://localhost:6911/upload_private
  # For local
  local:
    path: ./upload
    path_private: ./upload_private
    base_url: http://localhost:6911

entity:
  member:
    category: 'User'
    label: 'User'
    fields:
      - { name: email, type: string, required: true }
      - { name: pass,  type: password, required: true }
      - { name: name,  type: string, required: true }
```

Key field rules
- Default key is `'_id'` (objectId).
- To use a custom key, mark the field with `key: true`.
  - `type: integer` + `autogenerate: true` → auto-incrementing ID
  - `type: string` + `autogenerate: true` → UUID

Search rules
- Only fields declared under `entity.<name>.crud.list.search` are searchable in the list API.
- When `exact: false`, a partial match (regex) is used; integers always compare exactly.

---

### Auth and tokens
- A JWT is issued on successful login.
- All protected requests must include header `x-access-token: <JWT>` (query `?token=` and cookie are also accepted).

Login endpoints
```http
GET  /member/login?email={email}&pass={pass}
POST /member/login    { email, pass }
GET  /member/islogin  // token verification
GET  /member/logout
```
Sample response
```json
{ "r": true, "token": "<JWT>", "member": { "id": "...", "email": "...", "name": "..." } }
```

---

### Entity CRUD endpoints
All endpoints require authentication.

- List: `GET /<entity>`
  - Paging: `_start`, `_end`
  - Sort: `_sort`, `_order` (`ASC`|`DESC`)
  - Field search: `?field=value` (see `crud.list.search` in the schema)
  - Total count header: `X-Total-Count`

- Show: `GET /<entity>/:id`
- Create: `POST /<entity>`
  - ID generation follows field definition (`key`, `type`, `autogenerate`).
  - Response includes `id` (react-admin compatibility).
- Update: `PUT /<entity>/:id`
  - Key field is not updated.
- Delete: `DELETE /<entity>/:id`
  - Hard delete by default; customizable hook points exist.

Sensitive fields and media
- Fields with `type: password` are removed from responses and hashed on save.
- Fields with `type: image|mp4|file` include preview URLs in the response.
  - Private files return secure, short-lived URLs.

---

### File upload
Depending on configuration, S3 or local upload APIs are enabled. All upload APIs require authentication.

Local upload
```http
PUT /api/local/media/upload?ext=jpg           // public storage path
PUT /api/local/media/upload/secure?ext=jpg    // private storage path
```
Response: `{ r: true, key }`

Secure download
- The server issues temporary URLs like `/local-secure-download?key=...&token=...`.
- The token is a short-lived (5 min) JWT; clients can use the link directly.

S3 upload (pre-signed)
```http
GET  /api/media/url/put/:ext                // public bucket
GET  /api/media/url/secure/put/:ext         // private bucket
POST /api/media/url/secure/init/:ext        // multipart init (private)
POST /api/media/url/secure/part             // request part URL
POST /api/media/url/secure/complete         // complete multipart
POST /api/media/url/secure/abort            // abort multipart
```
Response includes `upload_url`, storage `key`, etc.

Note: S3 usage requires `upload.s3.*` configuration.

---

### Excel export / import
Declare in the schema to enable endpoints:
```yaml
entity:
  member:
    crud:
      list:
        export:
          fields:
            - { name: email }
            - { name: name }
        import:
          fields:
            - { name: email }
            - { name: name }
          upsert: true
```

Endpoints
```http
POST /excel/<entity>/export   // with body { filter }
POST /excel/<entity>/import   // with body { base64 } (Excel file as Base64)
```
Export response
```json
{ "r": true, "url": "<secure-download-url>" }
```
Import response
```json
{ "r": true, "msg": "Import success - <n> rows effected" }
```

---

### Serverless (Lambda) example
Wrap with `serverless-http` to deploy easily. See `example/api1`.
```js
'use strict';
const serverless = require('serverless-http');

exports.handler = async (event, context) => {
  const app = await require('./app');
  const handler = serverless(app);
  return await handler(event, context);
};
```

The sample `serverless.yml` uses region `ap-northeast-2` and runtime `nodejs20.x`.

---

### FAQ
- Auth fails: Ensure you send `x-access-token` header. Obtain it from `/member/login`.
- Need CORS headers: Add an application-level CORS middleware as shown in the example app.
- Media field has no URL: Response adds preview URLs (`..._preview`). Private files return signed URLs.

---

### License
MIT


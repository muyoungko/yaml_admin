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

## YAML Syntax Reference

### Top-level Structure

```yaml
debug: true                  # Enable verbose debug logging (optional)

imports:                     # Split config into multiple files (optional)
  - ./entities.yml
  - ./dashboard.yml

login:                       # Authentication config (required)
  ...

api-host:                    # API server base URL (required)
  uri: http://localhost:6911

web-host:                    # Web server base URL (required)
  uri: http://localhost:6900

database:                    # Database config (required)
  ...

upload:                      # File upload config (optional)
  ...

entity:                      # Data model definitions (required)
  ...

front:                       # Frontend config (optional)
  ...
```

---

### imports - File Splitting

Split a large `admin.yml` into multiple files.

```yaml
imports:
  - ./admin_entities.yml
  - ./admin_dashboard.yml
```

**Merge rules:**

| Type | Behavior |
|------|----------|
| `entity:` (object) | Entity keys from all files are merged |
| `dashboard:` (array) | Arrays are concatenated in order |
| Other scalars | Later file overwrites earlier |

Imported files can themselves contain `imports:` (recursive support).

---

### login - Authentication

```yaml
login:
  jwt-secret: ${JWT_SECRET}          # JWT signing key (required)
  expires: 600                       # Session expiry in seconds. 0 = no expiry (optional)
  password-encoding: sha512          # Hash algorithm: bcrypt | sha512 | sha256 (required)
  id-password:                       # Login method config (required)
    entity: admin                    # MongoDB collection used for login
    id-field: email                  # Field used as the login ID
    password-field: password         # Field used as the password
  master-email: master               # Master account email for development (optional)
  master-password: '1234'            # Master account password for development (optional)
```

---

### database - Database

```yaml
database:
  mongodb:
    uri: ${MONGODB_URL}
```

---

### upload - File Upload

Choose either S3 or local storage.

```yaml
# S3
upload:
  s3:
    access_key_id: ${S3_ACCESS_KEY_ID}
    secret_access_key: ${S3_SECRET_ACCESS_KEY}
    region: ${S3_REGION}
    prefix: ${S3_PREFIX}
    bucket: ${S3_BUCKET}
    bucket_private: ${S3_BUCKET_PRIVATE}   # Bucket for private files
    base_url: ${S3_BASE_URL}

# Local
upload:
  local:
    path: ./upload
    path_private: ./upload_private
    base_url: http://localhost:6911
```

---

### entity - Data Models

The `entity_name` becomes both the MongoDB collection name and the API path (`/<entity_name>`).

#### Entity Options

```yaml
entity:
  product:
    label: 'Product'                 # Menu display name (required)
    icon: 'solar:box-outline'        # Iconify icon name (optional)
    hidden: true                     # Hide from sidebar menu (optional)
    category: 'Product Management'  # Menu group name. Links to front.category (optional)
    debug: true                      # Enable debug logging for this entity only (optional)
    entity: product_v2               # Override MongoDB collection name (optional)
    unique:                          # Fields that must be unique (optional)
      - name: email
    filter:                          # Fixed filter applied to all queries (optional)
      - name: status
        value: 'active'
```

---

#### fields - Field Definitions

```yaml
fields:
  - name: id                         # Field name (required). Use dot notation for nested: "push.os"
    label: 'ID'                      # Display label
    type: integer                    # Field type (see types below)
    required: true                   # Mark as required input
    key: true                        # Primary key. Only one per entity
    autogenerate: true               # Auto-generate PK value
    private: true                    # Treat as private file (for image/file types)
    showtime: true                   # Show date and time (for date type)
```

#### Field Types

| type | Description |
|------|-------------|
| `string` | Text string |
| `integer` | Integer number |
| `boolean` | True / false |
| `date` | Date. Add `showtime: true` to include time |
| `password` | Password. Auto-encrypted on save, hidden in list view |
| `select` | Dropdown. Requires `select_values` |
| `reference` | Foreign key reference to another entity |
| `image` | Image file upload |
| `file` | General file upload |
| `mp4` | Video file upload |
| `array` | Array of sub-documents. Define sub-fields with `fields` |

**select example:**
```yaml
- name: status
  type: select
  label: 'Status'
  select_values:
    - name: active
      label: 'Active'
    - name: inactive
      label: 'Inactive'
```

**reference example:**
```yaml
- name: category_id
  type: reference
  label: 'Category'
  reference_entity: category          # Entity to reference
  reference_match: id                 # Matching field on the referenced entity
  reference_name: name                # Field to display from the referenced entity
  reference_format: '${name}(${id})' # Display format template (optional)
  required: true
```

**array example:**
```yaml
- name: items
  type: array
  label: 'Items'
  fields:
    - name: name
      label: 'Name'
    - name: qty
      type: integer
      label: 'Quantity'
```

---

#### crud - CRUD Configuration

```yaml
crud:
  search:                            # Searchable fields
    - name: name
      exact: false                   # false = partial match (contains). Default: true (exact)
    - name: status
  list: true                         # true = show all fields. Array = show specified fields only
  create: true                       # Enable create form
  edit: true                         # Enable edit form
  show: true                         # Enable detail view
  delete: true                       # Enable delete button
  export:                            # Excel export (optional)
    fields:
      - name: id
      - name: name
  import:                            # Excel import (optional)
    fields:
      - name: id
      - name: name
    upsert: true                     # true = update existing records on match
```

**Specifying fields as an array for list/create/edit:**
```yaml
crud:
  list:
    - name: id
    - name: name
    - name: status
  create:
    - name: category_id
      filter:                        # Filter options shown for this reference field
        - name: type
          value: 'main'
    - name: name
    - name: price
      default: $default_price        # Default value. $ prefix reads from localStorage
```

**Adding a button column to list:**
```yaml
crud:
  list:
    - name: id
    - name: name
    - name: go_btn
      type: button
      label: 'Go'
      action:
        - type: navigate
          url: /detail/${id}
        - type: navigate
          if: status==active         # Conditional action
          url: /active/${id}
```

---

#### layout - Layout

Add a tree component to the left panel.

```yaml
layout:
  left:
    - component: tree
      entity: category               # Entity to render as a tree
      key: id                        # Node ID field
      parent_key: parent_id          # Parent ID field
      label: name                    # Field to display as the node label
      sort:
        - name: seq
          desc: false
      parent_click:                  # Action fired when a node is clicked
        action:
          - type: body
            crud: list
            entity: category
            filter:
              - name: parent_id
                value: ${id}         # References the clicked node's id value
```

---

#### api_generate - Auto-joined Fields

Automatically joins data from other collections via MongoDB `$lookup`. Joined data is included in list and detail responses.

```yaml
api_generate:
  order_count:                       # Name of the field added to the response
    match_from: member_no            # Local field to join from
    entity: order                    # Collection to join
    match: user_no                   # Field on the joined collection to match against
    single: true                     # true = single object, false = array
    field: id                        # Extract a single field value when single=true (optional)
    fields:                          # Fields to include from the joined collection
      - name: id
      - name: total_price
    filter:                          # Additional filter on the joined collection (optional)
      - name: status
        value: 'complete'
```

**Nested lookup (reference within a joined field):**
```yaml
api_generate:
  lock_list:
    match_from: id
    entity: lock
    match: ils_id
    fields:
      - name: member_no
      - name: reg_date
      - name: member              # This field is itself a reference to another entity
        type: reference
        reference_entity: member
        reference_from: member_no
        reference_match: member_no
        single: true
        fields:
          - name: name
          - name: phone
```

---

### front - Frontend Configuration

#### appearance

```yaml
front:
  appearance:
    pagination:
      rowsPerPage: 30
      rowsPerPageOptions: [30, 50, 100]
    login:
      background: 'https://...'     # Login page background image URL (optional)
```

#### category - Menu Groups

Assign a `category` to entities to group them in the sidebar menu.

```yaml
front:
  category:
    - name: 'Product Management'
      icon: 'solar:box-outline'
    - name: 'User Management'
      icon: 'solar:users-group-rounded-outline'

entity:
  product:
    category: 'Product Management'
    label: 'Product'
  member:
    category: 'User Management'
    label: 'Member'
```

#### dashboard - Dashboard

`front.dashboard` supports two layouts.

**Form 1 — flat list (default):** components rendered directly in a 12-column grid.

```yaml
front:
  dashboard:
    - component: chart
      id: daily_sales
      size: 8
      ...
    - component: table
      id: recent_orders
      size: 4
      ...
```

**Form 2 — sections:** screen divided into columns, each column containing its own components.

```yaml
front:
  dashboard:
    sections:
      - size: 4                      # Column width 1–12 (12 = full width)
        components:
          - component: chart
            id: chart_left
            size: 12                 # Component width within the section
            ...
      - size: 8
        components:
          - component: table
            id: table_right
            size: 12
            ...
          - component: chart
            id: chart_bottom
            size: 6
            ...
```

Sections use the same 12-column grid as components. Columns with `size` values that sum to 12 fill the full width.

---

**Component types:**

| `component` | Description | Default size |
|-------------|-------------|--------------|
| `welcome` | Hero banner at the top of the dashboard | 12 |
| `count` | Stat card showing the total count of an entity | 3 |
| `chart` | Chart rendered from a chart API | 4 |
| `table` | Data table from a list API | 4 |

**Common component properties:**

| Property | Description |
|----------|-------------|
| `component` | Component type: `welcome` \| `count` \| `chart` \| `table` |
| `id` | Unique identifier (required for `chart`) |
| `label` | Card title (shown in card header for `chart`/`table`) |
| `icon` | Iconify icon name |
| `size` | Grid width 1–12 (12 = full width) |
| `filter` | Data filter conditions (see [Filter Expressions](#filter-expressions)) |

**chart component:**

```yaml
- component: chart
  id: daily_sales
  label: 'Daily Sales'
  icon: 'solar:chart-square-outline'
  type: bar                          # bar | line
  size: 12
  height: 300                        # Height in px. Default: 300
  api: '/api/mychart/custom'         # Custom API URL (optional). Defaults to /api/chart/<id>
  filter:
    - name: server_id
      value: $server_id              # Read from localStorage
      type: integer                  # Type cast: integer | string
  x:
    type: date                       # date = time-series | field = group by field value
    entity: order
    field: created_at                # Field used as the x-axis basis
    format: 'MM/DD'                  # Date format string (for date type)
    gap: day                         # Aggregation unit: day | week | month
    limit: 14                        # Number of x-axis data points
    timezone: Asia/Seoul
    desc: false                      # false = ascending (oldest to newest)
  y:
    type: integer
    max: 100                         # Max y-axis value (optional)
    value_text:                      # Replace y-axis numbers with text labels (optional)
      - text: 'Locked'
        if: value==1
      - text: 'Unlocked'
        if: value==0
    series:
      - label: 'Lock'
        color: '#8B0000'
        if: lock==true               # Data filter condition for this series
      - label: 'Unlock'
        color: '#228B22'
        if: lock!=true
```

**x.type: field - group by field value:**
```yaml
x:
  type: field
  entity: member
  field: user_type
  values:                            # Map raw values to display labels (optional)
    - name: admin
      label: 'Admin'
    - name: user
      label: 'Regular User'
y:
  entity: member
  series:
    - label: 'Member Count'
      color: '#1a66cc'
```

**table component:**

```yaml
- component: table
  id: recent_orders
  label: 'Recent Orders'
  icon: 'solar:list-check-outline'
  size: 8
  entity: order
  limit: 10                          # Max rows to display
  sort:
    - name: created_at
      desc: true
  filter:
    - name: status
      value: complete
  fields:
    - name: id
    - name: member_no
    - name: total_price
```

**welcome component:**

Full-width hero banner displayed at the top of the dashboard. No card wrapper — renders directly.

```yaml
- component: welcome
  text1: 'Welcome to Admin'               # Main heading (large, bold)
  text2: 'Support: 1566-0000'             # Sub-text (smaller, semi-transparent)
  text3: 'Email: contact@example.com'     # Third line (smallest, more transparent)
  icon: 'solar:home-outline'              # Iconify icon (optional)
  height: 180                             # Banner height in px. Default: 180
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%)'
  text1_color: '#ffffff'                  # Default: #ffffff
  text2_color: 'rgba(255,255,255,0.55)'  # Default: rgba(255,255,255,0.55)
  text3_color: 'rgba(255,255,255,0.40)'  # Default: rgba(255,255,255,0.40)
  icon_background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
```

**count component:**

Stat card that displays the total number of records in an entity. Reads the count from the `X-Total-Count` response header of the list API.

```yaml
- component: count
  size: 3
  icon: 'solar:lock-outline'             # Iconify icon (optional)
  label: 'Total Devices'                 # Stat label shown above the number
  desc: 'Total registered devices'       # Caption shown below the number (optional)
  unit: '대'                             # Unit label shown after the number (optional)
  entity: device                         # Entity (API collection) to count
  filter:                                # Filter applied to the count query (optional)
    - name: server_id
      value: $server_id                  # Read from localStorage
      type: integer
    - name: status
      value: active
```

---

### Environment Variables

Use `${VAR_NAME}` anywhere in the YAML to reference environment variables.

```yaml
login:
  jwt-secret: ${JWT_SECRET}
database:
  mongodb:
    uri: ${MONGODB_URL}
```

---

### Filter Expressions

Value expressions used in `filter` fields across entity definitions, `api_generate`, and dashboard components (`chart`, `table`, `count`).

| Expression | Meaning |
|------------|---------|
| `null` | Match null |
| `not null` | Match non-null |
| `$field_name` | Read `field_name` from **localStorage** at runtime |
| `$lte 100` | Less than or equal to 100 |
| `$gte 10` | Greater than or equal to 10 |
| `$lt 5` | Less than 5 |
| `$gt 0` | Greater than 0 |

**Filter field properties:**

| Property | Description |
|----------|-------------|
| `name` | Query parameter / field name |
| `value` | Value expression (see table above) |
| `type` | Type cast applied after value resolution. `integer` = `parseInt`. Used in dashboard components (`count`, `chart`) |

**Example — mixed filter in a count component:**

```yaml
filter:
  - name: server_id
    value: $server_id          # Read from localStorage, then cast to integer
    type: integer
  - name: status
    value: active              # Static string value
  - name: score
    value: '$gte 80'           # Comparison: score >= 80
```

**if expressions (button actions, chart series conditions):**

```yaml
if: status==active       # Equal
if: status!=inactive     # Not equal
if: score>=80            # Greater than or equal
if: lock==true           # Boolean check
if: deleted==null        # Null check
```

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

# Development Setting

## Front Instant Change

packages/front/package.json
-  "type": "module",
-  "description": "React components for yaml-admin front (library)",
-  "main": "./dist/index.cjs.js",
-  "module": "./dist/index.es.js",
+  "type": "commonjs",
+  "main": "src/index.js",


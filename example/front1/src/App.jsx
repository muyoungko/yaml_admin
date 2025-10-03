import polyglotI18nProvider from 'ra-i18n-polyglot';
import { YMLAdmin, EntityTreeView } from 'yaml-admin-front';
import adminYamlText from '../../admin.yml?raw';
import koreanMessages from './i18n/ko';
import YAML from 'yaml';


export default function App() {
  return (
    <YMLAdmin
      //adminYaml={adminYamlText}
      adminJson={YAML.parse(adminYamlText)}
      i18nProvider={polyglotI18nProvider(() => koreanMessages, 'ko')}
      custom={{
        entity: {
          floor: {
            show: (record) => {
              return <div>{record.id} - custom</div>
            }
          }
        },
        customRoutes: [
          {
            path: '/custom',
            element: <CustomTreeView />
          }
        ],
        globalFilterDelegate
      }}
    />
  );
}

const globalFilterDelegate = (entity) => {
  if (entity != 'server') {
    let s = localStorage.getItem('server_id')
    if (s)
      return { server_id: parseInt(s) }
  }
  return {}
}

const CustomTreeView = () => {
  return <EntityTreeView component={{
    "component": "tree",
    "entity": "region",
    "key": "id",
    "parent_key": "parent_id",
    "argment": [
      {
        "name": "id"
      }
    ],
    "sort": [
      {
        "name": "seq",
        "desc": false
      }
    ],
    "label": "name",
  }} custom={{
    itemClick: (node) => {
      console.log('node', node)
    },
    globalFilterDelegate,
  }} />
}

import polyglotI18nProvider from 'ra-i18n-polyglot';
import { YMLAdmin, EntityTreeView } from 'yaml-admin-front';
import adminYamlText from '../../admin.yml?raw';
import koreanMessages from './i18n/ko';
import theme1 from './theme/theme1';
const globalFilterDelegate = (entity) => {
  if (entity != 'server') {
    let s = localStorage.getItem('server_id')
    if (s)
      return { server_id: parseInt(s) }
  }
  return {}
}

export default function App() {
  return (
    <YMLAdmin
      adminYaml={adminYamlText}
      theme={theme1}
      i18nProvider={polyglotI18nProvider(() => koreanMessages, 'ko')}
      custom={{
        entity: {
          floor: {
            show: (record) => {
              return <div> <CustomTreeView/></div>
            }
          }
        },
        customRoutes:[],
        globalFilterDelegate
      }}
    />
  );
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
    //"label": "name",
    "label_format": "${name} ${floor_id?'':'(도면 없음)'}"
  }} custom={{
    itemClick: (node) => {
      console.log('node', node)
    },
    globalFilterDelegate,
  }} />
}

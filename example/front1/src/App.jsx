import { defaultTheme } from 'react-admin';
import { deepmerge } from '@mui/utils';
import {indigo, pink, red} from '@mui/material/colors';

import polyglotI18nProvider from 'ra-i18n-polyglot';
import { YMLAdmin, EntityTreeView } from 'yaml-admin-front';
import adminYamlText from '../../admin.yml?raw';
import koreanMessages from './i18n/ko';

const globalFilterDelegate = (entity) => {
  if (entity != 'server') {
    let s = localStorage.getItem('server_id')
    if (s)
      return { server_id: parseInt(s) }
  }
  return {}
}

const myTheme = deepmerge(defaultTheme, {
  palette: {
      primary: indigo,
      secondary: pink,
      error: red,
      contrastThreshold: 3,
      tonalOffset: 0.2,
  },
  typography: {
      fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Arial', 'sans-serif'].join(','),
  },
});

export default function App() {
  return (
    <YMLAdmin
      adminYaml={adminYamlText}
      theme={myTheme}
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
    "label": "name",
    "label_format": "${name} ${floor_id?'':'(도면 없음)'}"
  }} custom={{
    itemClick: (node) => {
      console.log('node', node)
    },
    globalFilterDelegate,
  }} />
}

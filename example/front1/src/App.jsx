import polyglotI18nProvider from 'ra-i18n-polyglot';
import { YMLAdmin } from 'yaml-admin-front';
import adminYamlText from '../../admin.yml?raw';
import koreanMessages from './i18n/ko';
import BlankLayout from './custom/BlankLayout';

export default function App() {
  return (
    <YMLAdmin
      adminYaml={adminYamlText}
      i18nProvider={polyglotI18nProvider(() => koreanMessages, 'ko')}
      // layout={BlankLayout}
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
            element: <div>custom</div>
          }
        ]
      }}
    />
  );
}
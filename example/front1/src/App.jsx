import { YMLAdmin } from 'yaml-admin-front';
import adminYamlText from '../../admin.yml?raw';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import koreanMessages from './i18n/ko';

export default function App() {
  return (
    <YMLAdmin
      adminYaml={adminYamlText}
      i18nProvider={polyglotI18nProvider(() => koreanMessages, 'ko')}
    />
  );
}
import { Admin, Resource, ListGuesser, CreateBase, fetchUtils } from "react-admin";
import jsonServerProvider from "ra-data-json-server";
import YAML from 'yaml';
import MyLayout from './layout/MyLayout'
import DynamicList from './section/DynamicList';
import DynamicCreate from './section/DynamicCreate';
import DynamicEdit from './section/DynamicEdit';
import DynamicShow from './section/DynamicShow';
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { AdminProvider } from './AdminContext';
import authProvider from './login/authProvider';
import { setApiHost } from './common/axios';

const httpClient = (url, options = {}) => {
  if (!options.headers) {
      options.headers = new Headers({ Accept: 'application/json' });
  }
  const token = localStorage.getItem('token');
  options.headers.set('x-access-token', token);
  return fetchUtils.fetchJson(url, options);
}

const YMLAdmin = ({ adminYaml, i18nProvider }) => {
  const [yml, setYml] = useState(null);
  const [dataProvider, setDataProvider] = useState(null);

  useEffect(() => {
    const loadYamlFile = async () => {
      try {
        const json = YAML.parse(adminYaml);
        setYml(json);
        const api_host = json['api-host'].uri;
        setDataProvider(jsonServerProvider(api_host, httpClient));
        setApiHost(api_host);
      } catch (error) {
        console.error('YAML 파일을 읽는 중 오류가 발생했습니다:', error);
      }
    };

    loadYamlFile();
  }, []);

  return (
    <>
      {dataProvider && <AdminProvider initialYml={yml} width="1250px">
        <Admin
          layout={MyLayout}
          authProvider={authProvider}
          i18nProvider={i18nProvider}
          dataProvider={dataProvider}>
          {yml?.entity && Object.keys(yml.entity).map(name => {
            const entity = yml.entity[name];
            const IconComponent = entity?.icon
              ? () => <Icon icon={entity.icon} width="1.25rem" height="1.25rem" />
              : undefined;
            return (
              <Resource key={name} name={name}
                options={{ label: entity.label }}
                icon={IconComponent}
                list={(!entity.crud || entity.crud?.list) ? DynamicList : undefined}
                create={(!entity.crud || entity.crud?.create) ? DynamicCreate : undefined} 
                edit={(!entity.crud || entity.crud?.edit) ? DynamicEdit : undefined}
                show={(!entity.crud || entity.crud?.show) ? DynamicShow : undefined}
              />
            )
          })}

        </Admin>
      </AdminProvider>
      }
    </>
  )
};

export default YMLAdmin;
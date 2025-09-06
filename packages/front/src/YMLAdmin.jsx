import { Admin, Resource, ListGuesser, CreateBase, fetchUtils, CustomRoutes } from "react-admin";
import jsonServerProvider from "ra-data-json-server";
import { Route } from "react-router-dom";
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

const YMLAdmin = ({ adminYaml, i18nProvider, customEntity }) => {
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
        console.error('YAML file load error', error);
      }
    };

    loadYamlFile();
  }, []);

  return (
    <>
      {dataProvider && <AdminProvider initialYml={yml} width="1250px">
        <Admin
          dashboard={undefined}
          layout={MyLayout}
          authProvider={authProvider}
          i18nProvider={i18nProvider}
          dataProvider={dataProvider}>
          {yml?.entity && Object.keys(yml.entity).map(name => {
            const entity = yml.entity[name];
            const IconComponent = entity?.icon
              ? () => <Icon icon={entity.icon} width="1.25rem" height="1.25rem" />
              : undefined;

            if (entity.custom)
              return <Resource key={name} name={name} icon={IconComponent}/>  
            else 
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

          <CustomRoutes>
            {yml?.entity && Object.keys(yml.entity).map(name => {
              const entity = yml.entity[name];
              if (entity.custom)
                return (
                  <Route path={`/${name}`} element={customEntity(name)} />
                )
            })}
          </CustomRoutes>
        </Admin>
      </AdminProvider>
      }
    </>
  )
};

export default YMLAdmin;
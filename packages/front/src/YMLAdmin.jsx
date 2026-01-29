import { Admin, Resource, fetchUtils, CustomRoutes, defaultTheme, Login } from "react-admin";
import jsonServerProvider from "ra-data-json-server";
import { Route } from "react-router-dom";
import YAML from 'yaml';
import MyLayout from './layout/MyLayout'
import DynamicList from './section/DynamicList';
import DynamicCreate from './section/DynamicCreate';
import DynamicEdit from './section/DynamicEdit';
import DynamicShow from './section/DynamicShow';
import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { AdminProvider, useAdminContext } from './AdminContext';
import authProvider from './login/authProvider';
import { setApiHost } from './common/axios';
import fileUploader from './common/fileUploader';
import DashboardLayout from './section/DashboardLayout';

const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  const token = localStorage.getItem('token');
  options.headers.set('x-access-token', token);
  return fetchUtils.fetchJson(url, options);
}

const CustomLoginPage = () => {
  const { yml } = useAdminContext();
  return <Login backgroundImage={yml?.front?.appearance?.login?.background} />;
};

const YMLAdmin = ({ adminYaml, adminJson, i18nProvider, custom, theme, layout }) => {
  const [yml, setYml] = useState(null);
  const [dataProvider, setDataProvider] = useState(null);

  const myAuthProvider = useMemo(() => {
    return {
      ...authProvider,
      login: (params) => {
        return authProvider.login(params).then((res) => {
          if (custom?.loginSuccess) {
            custom.loginSuccess(res.member);
          }
          return res;
        })
      }
    }
  }, [custom]);

  useEffect(() => {
    const loadYamlFile = async () => {
      try {
        const json = (adminYaml && YAML.parse(adminYaml)) || adminJson;
        setYml(json);
        const api_host = json['api-host'].uri;
        const privateEntityMap = {}
        Object.entries(json.entity).map(([key, val])=>{
            val.fields.map((field)=>{
                if(field.private) {
                    privateEntityMap[key] = {
                      ...privateEntityMap[key],
                        [field.name]: field.private
                    }
                }
            })
        });
        console.log('api_host', api_host)
        if(json.upload?.local) {
          console.log('upload.local', json.upload.local.base_url)
          setDataProvider(fileUploader(jsonServerProvider(api_host, httpClient), true, privateEntityMap));
        } else if(json.upload?.s3) {
          console.log('upload.s3', json.upload.s3.base_url)
          setDataProvider(fileUploader(jsonServerProvider(api_host, httpClient), false, privateEntityMap));
        } else {
          console.log('upload.none')
          setDataProvider(jsonServerProvider(api_host, httpClient));
        }
        
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
          loginPage={CustomLoginPage}
          theme={{...defaultTheme, ...theme}}
          dashboard={yml?.front?.dashboard ? DashboardLayout : undefined}
          layout={layout || MyLayout}
          authProvider={myAuthProvider}
          i18nProvider={i18nProvider}
          dataProvider={dataProvider}>
          {yml?.entity && Object.keys(yml.entity).map(name => {
            const entity = yml.entity[name];
            const IconComponent = entity?.icon
              ? () => <Icon icon={entity.icon} width="1.25rem" height="1.25rem" />
              : undefined;

            if (entity.custom)
              return <Resource key={name} name={name} options={{ label: entity.label }} icon={IconComponent}/>  
            else 
              return (
                <Resource key={name} name={name}
                  options={{ label: entity.label }}
                  icon={IconComponent}
                  list={(props => <DynamicList {...props} custom={custom} />)}
                  create={(props => <DynamicCreate {...props} custom={custom} />)}
                  edit={(props => <DynamicEdit {...props} custom={custom} />)}
                  show={(props => <DynamicShow {...props} custom={custom} />)}
                />
              )

          })}

          <CustomRoutes>
            {custom?.customRoutes?.map(m => {
              console.log('customRoutes', m.path)
              return (
                <Route key={m.path} path={m.path} element={m.element} />
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
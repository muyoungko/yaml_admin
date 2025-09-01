import { Admin, Resource, ListGuesser } from "react-admin";
import jsonServerProvider from "ra-data-json-server";
import YAML from 'yaml';
import MyLayout from './layout/MyLayout'
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { AdminProvider } from './AdminContext';
const API_HOST = import.meta.env.VITE_HOST_API || 'http://localhost:6911'
const dataProvider = jsonServerProvider(API_HOST);

const YMLAdmin = ({ adminYaml }) => {
  const [yml, setYml] = useState(null);
  useEffect(() => {
    const loadYamlFile = async () => {
      try {
        const json = YAML.parse(adminYaml);
        setYml(json);
      } catch (error) {
        console.error('YAML 파일을 읽는 중 오류가 발생했습니다:', error);
      }
    };

    loadYamlFile();
  }, []);

  return (
    <AdminProvider initialYml={yml}>
      <Admin
        layout={MyLayout}
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
              list={ListGuesser} />
          )
        })}

      </Admin>
    </AdminProvider>
  )
};

export default YMLAdmin;
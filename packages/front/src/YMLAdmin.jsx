import { Admin, Resource, ListGuesser } from "react-admin";
import jsonServerProvider from "ra-data-json-server";

const API_HOST = import.meta.env.VITE_ASSETS_API || 'http://localhost:6911'
// sample1.yml 파일을 JSON 구조로 읽어오는 함수
import yaml from "js-yaml";

async function readSample1YamlAsJson() {
  const response = await fetch("/sample1.yml");
  const yamlText = await response.text();
  const jsonData = yaml.load(yamlText);
  return jsonData;
}

const dataProvider = jsonServerProvider(API_HOST);

const YMLAdmin = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="posts" list={ListGuesser} />
  </Admin>
);

export default YMLAdmin;
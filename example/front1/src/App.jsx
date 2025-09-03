import { YMLAdmin } from 'yaml-admin-front';
import adminYamlText from '../../admin.yml?raw';

export default function App() {
  return (
    <YMLAdmin adminYaml={adminYamlText}/>
  );
}
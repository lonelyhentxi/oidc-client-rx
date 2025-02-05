import { useOidcClient } from 'oidc-client-rx/adapters/react';
import './App.css';

const App = () => {
  const { oidcSecurityService } = useOidcClient();

  return (
    <div className="content">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
    </div>
  );
};

export default App;

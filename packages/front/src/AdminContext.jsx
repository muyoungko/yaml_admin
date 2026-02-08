import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Context to share parsed admin YAML JSON and auth(admin) state across the app
export const AdminContext = createContext({
  yml: null,
  setYml: () => {},
  admin: { token: null },
  setAdmin: () => {},
});

// External setter hook-up so non-React modules (e.g., auth provider) can update admin
let externalSetAdmin = null;
export const setAdminInContext = (nextAdmin) => {
  if (typeof externalSetAdmin === 'function') {
    if (typeof nextAdmin === 'function') {
      externalSetAdmin(nextAdmin);
    } else {
      externalSetAdmin((prev) => ({ ...prev, ...nextAdmin }));
    }
  }
};

export const AdminProvider = ({ initialYml = null, custom = null, children }) => {
  const [yml, setYml] = useState(initialYml);
  const [admin, setAdmin] = useState(() => ({
    token: typeof window !== 'undefined' ? (localStorage.getItem('token') || null) : null,
  }));

  useEffect(() => {
    externalSetAdmin = setAdmin;
    return () => {
      externalSetAdmin = null;
    };
  }, []);

  // Expose YAML fields at the top level for backward compatibility,
  // and also provide `yml` and `admin` namespaces.
  const value = useMemo(
    () => ({ ...(yml || {}), yml, setYml, admin, setAdmin, custom }),
    [yml, admin, custom]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdminContext = () => {
  return useContext(AdminContext);
};


import React, { createContext, useContext } from 'react';

// Context to share parsed admin YAML JSON across the app
export const AdminContext = createContext({ yml: null, setYml: () => {} });

export const AdminProvider = ({ initialYml = null, children }) => {
  return <AdminContext.Provider value={initialYml}>{children}</AdminContext.Provider>;
};

export const useAdminContext = () => {
  return useContext(AdminContext);
};



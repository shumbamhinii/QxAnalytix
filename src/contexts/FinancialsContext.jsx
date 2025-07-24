import React, { createContext, useState, useContext } from 'react';

// Create the context with a default null value
const FinancialsContext = createContext(null);

/**
 * Provides financial data context to its children.
 * @param {object} { children } - React children to be rendered within the provider.
 */
export const FinancialsProvider = ({ children }) => {
  // State to hold the latest processed transactions
  const [latestProcessedTransactions, setLatestProcessedTransactions] = useState([]);

  // The value provided to consumers of this context
  const contextValue = {
    latestProcessedTransactions,
    setLatestProcessedTransactions,
  };

  return (
    <FinancialsContext.Provider value={contextValue}>
      {children}
    </FinancialsContext.Provider>
  );
};

/**
 * Custom hook to consume the FinancialsContext.
 * Throws an error if used outside of a FinancialsProvider.
 * @returns {object} The context value containing latestProcessedTransactions and setLatestProcessedTransactions.
 */
export const useFinancials = () => {
  const context = useContext(FinancialsContext);
  if (!context) {
    throw new Error('useFinancials must be used within a FinancialsProvider');
  }
  return context;
};

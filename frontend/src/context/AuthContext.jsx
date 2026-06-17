import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedInNgo, setLoggedInNgoState] = useState(null);
  const [loading, setLoading] = useState(true);

  // On initial app load, check for saved user data and token
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('ngoData');

    // THE SHIELD: Ensure savedUser exists AND isn't the literal string "undefined"
    if (token && savedUser && savedUser !== 'undefined') {
      try {
        setLoggedInNgoState(JSON.parse(savedUser));
      } catch (error) {
        // If the data is corrupted and fails to parse, safely clear it out
        console.error("Corrupted auth data detected. Purging system...");
        localStorage.removeItem('token');
        localStorage.removeItem('ngoData');
        setLoggedInNgoState(null);
      }
    } else {
      // Clear anything corrupted from previous bugs or legacy code
      localStorage.removeItem('token');
      localStorage.removeItem('ngoData');
      localStorage.removeItem('loggedInNgoId'); 
      localStorage.removeItem('ngoInfo'); 
    }
    setLoading(false);
  }, []);

  // Custom setter that automatically syncs to localStorage so refreshes work flawlessly!
  const setLoggedInNgo = (userData) => {
    if (userData) {
      localStorage.setItem('ngoData', JSON.stringify(userData));
      setLoggedInNgoState(userData);
    } else {
      // Secure logout sequence
      localStorage.removeItem('token');
      localStorage.removeItem('ngoData');
      setLoggedInNgoState(null);
    }
  };

  // The logout function your legacy components might still try to call
  const logout = () => {
    setLoggedInNgo(null);
  };

  return (
    <AuthContext.Provider value={{ loggedInNgo, setLoggedInNgo, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
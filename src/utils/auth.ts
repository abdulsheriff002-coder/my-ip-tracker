export const login = () => {
  localStorage.setItem("loggedIn", "true");
};

export const logout = () => {
  localStorage.removeItem("loggedIn");
};

export const isLoggedIn = () => {
  return localStorage.getItem("loggedIn") === "true";
};



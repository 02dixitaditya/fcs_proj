import React, { useState } from "react";
import Container from "./Container";

const Context = React.createContext();

export default function App() {
  const [user, setUser] = useState({});
  return (
    <>
      <Context.Provider value={[user, setUser]}>
        <Container />
      </Context.Provider>
    </>
  );
}

export const UserContext = Context;

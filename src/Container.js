import React from "react";
import RegisterForm from "./Register";
import Navbar from "./Navbar";
import LoginForm from "./Login";
import Profile from "./Profile";
import Dashboard from "./Dashboard";
import Payment from "./Payment";

export default function Container() {
  const [page, setPage] = React.useState(0);
  return (
    <>
      <Navbar setPage={setPage} />
      {page === 0 && <RegisterForm />}
      {page === 1 && <LoginForm />}
      {page === 2 && <Profile setPage={setPage} />}
      {page === 3 && <Dashboard setPage={setPage} />}
      {page === 4 && <Payment setPage={setPage} />}
    </>
  );
}

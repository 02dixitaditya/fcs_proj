import axios from "axios";
import React, { useContext } from "react";
import "./Login.css";
import { UserContext } from "./App";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginForm() {
  const [, setUser] = useContext(UserContext);
  const [state, setState] = React.useState({
    type: "user",
    email: "",
    password: "",
    kind: "patient",
  });

  const onChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post("/login", {
      email: state.email,
      password: state.password,
    });

    if (res && res.data && res.data.user) {
      delete res.data.user.salt;
      delete res.data.user.hash;
    }

    setUser({
      token: res.data.token,
      ...res.data.user,
    });

    toast.success("Login Successful!!", {position:"top-center"});
  };

  return (
    <>
      <h2>Login</h2>
      <form id="logForm" method="POST" onSubmit={onSubmit}>
        <label htmlFor="type">Type</label>
        <select id="type" name="type" onChange={onChange} value={state.value}>
          <option value="user">User</option>
          <option value="organisation">Organisation</option>
        </select>
        {state.type && state.type === "user" ? (
          <>
            <label htmlFor="kind">Kind:</label>
            <select
              id="kind"
              name="kind"
              onChange={onChange}
              value={state.value}
            >
              <option value="patient">Patient</option>
              <option value="healthCareProfessional">
                Health Care Professional
              </option>
              <option value="admin">Admin</option>
            </select>
          </>
        ) : (
          <>
            <label htmlFor="kind">Kind:</label>
            <select
              id="kind"
              name="kind"
              onChange={onChange}
              value={state.value}
            >
              <option value="hospital">Hospital</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="insuranceFirm">Insurance Firm</option>
            </select>
          </>
        )}
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          value={state.email}
          onChange={onChange}
          required
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          onChange={onChange}
          value={state.password}
          required
        />
        <input type="submit" value="Submit" />
        <ToastContainer />
      </form>
    </>
  );
}

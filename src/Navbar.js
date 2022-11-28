import React from "react";

export default function Navbar({ setPage }) {
  return (
    <div>
      <button onClick={() => setPage(0)}>Register</button>
      <button onClick={() => setPage(1)}>Login</button>
      <button onClick={() => setPage(2)}>Profile</button>
      <button onClick={() => setPage(3)}>Dashboard</button>
      <button onClick={() => setPage(4)}>Payment</button>
    </div>
  );
}

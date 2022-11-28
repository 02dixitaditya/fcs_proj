import axios from "axios";
import React, { useContext, useState } from "react";
import { UserContext } from "./App";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Payment({ setPage }) {
  const [user, setUser] = useContext(UserContext);
  const [state, setState] = React.useState({
    wallet: "",
    addMoney: "",
  });

  if (!user || !user.token) {
    setPage(1);
    return <></>;
  } else {
    

    const onChange = (e) => {
        setState({ ...state, [e.target.name]: e.target.value });
      };

    const onSubmit = async (e) => {
        e.preventDefault();
        e.target.reset();
        if(parseInt(state.wallet) > parseInt(user.wallet)){
          toast.warning("Insufficient balance!! Add balance in wallet to continue", {position:"top-center"});
        }else{
          let newBal = parseInt(user.wallet)-parseInt(state.wallet);
          const res = await axios.post("/walletpay", {wallet: newBal.toString()}, {
            headers: {
              Authorization: user.token.token,
            },
          });
          toast.success("Payment Successful!!", {position:"top-center"});
          setUser({ ...user, wallet: res.data });
          
        }
      };
    
      const onAddMoney = async (e) => {
        e.preventDefault();
        let newBal = parseInt(user.wallet)+parseInt(state.addMoney);
        const res = await axios.post("/walletadd", {wallet: newBal.toString()}, {
          headers: {
            Authorization: user.token.token,
          },
        });
        toast.success("Amount added Successfully!!", {position:"top-center"});
        setUser({ ...user, wallet: res.data });
      };
      
    return (
      <>
        <div>
          <h1>Wallet Amount:</h1>
          {user.wallet}
        </div>
        <div>
          <h4>Add money to wallet:</h4>
        </div>
        <form id="addMoneyForm" method="POST" onSubmit={onAddMoney}>
            <label htmlFor="addmoney">Add amount to wallet:</label>
            <input
            type="text"
            name="addMoney"
            id="addMoney"
            onChange={onChange}
            value={state.addMoney}
            />
          <input type="submit" value="submit" />
        </form>
        
        <hr />
        <div>
          <h4>Make payment for medicine:</h4>
        </div>
        <form id="paymentForm" method="POST" onSubmit={onSubmit}>
            <label htmlFor="wallet">Enter amount to pay:</label>
            <input
            type="text"
            name="wallet"
            id="wallet"
            onChange={onChange}
            value={state.wallet}
            />
          <input type="submit" value="submit" />
          <ToastContainer />
        </form>
      </>
    );
  }
}

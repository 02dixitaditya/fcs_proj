import React from "react";
import { UserContext } from "./App";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Dashboard({ setPage }) {
  const [user, setUser] = React.useContext(UserContext),
    [tab, setTab] = React.useState(0),
    [userStatus, setUserStatus] = React.useState(null);
    
  
  if (!user || !user.token) {
    setPage(1);
    return <>Not logged in</>;
  }

  if (user.kind !== "admin" && !user.verified) {
    setPage(2);
    return <>Not verified by admin</>;
  }

  const sentFiles = () => {
    return (
      <>
        {user.sendTo &&
          user.sendTo.map((obj) => {
            return (
              <>
                <p>File Id: {obj.id}</p>
                <p>Email of person: {obj.sendTo}</p>
              </>
            );
          })}
      </>
    );
  };

  const receivedFiles = () => {
    return (
      <>
        {user.receivedFrom &&
          user.receivedFrom.map((obj) => {
            return (
              <>
                <p>File Id: {obj.payload.id}</p>
                <p>Email of owner: {obj.email}</p>
                <button
                  onClick={async () => {
                    const res = await axios.post("/verify_file", obj, {
                      headers: {
                        Authorization: user.token.token,
                      },
                    });
                    console.log(res);
                    toast.success("Document verification Successful!!", {position:"top-center"});
                  }}
                >
                  Verify
                </button>
              </>
            );
          })}
      </>
    );
  };

  const userStatusList = () => {
    return (
      <>
        {userStatus &&
          userStatus.map((obj) => {
            return (
              <>
                <p>User email : {obj.email}</p>
                <p>Verification status : {obj.verified === true ? "Verified": "Not verified"}</p>
                <button
                  onClick={() => {
                    {obj.verified === true ? removeUser(obj._id): approveUser(obj._id)}
                  }}
                >
                  {obj.verified === true ? "Remove": "Approve"}
              </button>
                <hr/>
              </>
            );
          })}
      </>
    );
  };

  const approveUser = async (_id) => {
    const result = await axios.post("/setStatus", {_id}, {
      headers: {
        Authorization: user.token.token,
      },
    });

    const res = await axios.get("/fetchuserstatus", {
      headers: {
        Authorization: user.token.token,
      },
    });
    setUserStatus(res.data);
    toast.success("User approved Successful!!", {position:"top-center"});
  };

  const removeUser = async (_id) => {
    const result = await axios.post("/resetStatus", {_id}, {
      headers: {
        Authorization: user.token.token,
      },
    });

    const res = await axios.get("/fetchuserstatus", {
      headers: {
        Authorization: user.token.token,
      },
    });
    setUserStatus(res.data);
    toast.success("User de-approved!!", {position:"top-center"});
  };

  return (
    <>
      <div>
        <button
          onClick={async () => {
            setTab(0);
            const { data } = await axios.get("/fetch_shared_files", {
              headers: {
                Authorization: user.token.token,
              },
            });

            setUser({ ...user, sendTo: data });
          }}
        >
          Sent Files
        </button>
        <button
          onClick={async () => {
            setTab(1);

            const { data } = await axios.get("/fetch_received_files", {
              headers: {
                Authorization: user.token.token,
              },
            });

            setUser({ ...user, receivedFrom: data });
          }}
        >
          Recieved Files
        </button>
        {user.kind === "admin" && (
          <button
            onClick={async () => {
              setTab(2);
              const res = await axios.get("/fetchuserstatus", {
                headers: {
                  Authorization: user.token.token,
                },
              });
              setUserStatus(res.data);

            }}

          >
            Approve/Remove
          </button>
        )}
        <ToastContainer />
      </div>
      {tab === 0 && <>{sentFiles()}</>}
      {tab === 1 && <>{receivedFiles()}</>}
      {tab === 2 && user.kind === "admin" && <>{userStatusList()}</>}
      <></>
    </>
  );
}

import React, { useState, useRef } from "react";
import axios from "axios";
import "./Register.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReCAPTCHA from "react-google-recaptcha";

const SITE_KEY = '6LdT1jcjAAAAANzFxBx1UJGW-6fOjdhP2OfsQfos'; 
const RegisterForm = () => {
  const [state, setState] = useState({
    type: "user",
    email: "",
    password: "",
    kind: "patient",
    wallet: "1000",
  });

  const [otp, setOtp] = useState({});
  const [recaptchaValue,  setRecaptchaValue] = useState('');
  const captchaRef = useRef();

  const onChange = (e) => {
    if (e.target.name === "type")
      setState({
        ...state,
        [e.target.name]: e.target.value,
        kind: e.target.value === "user" ? "patient" : "hospital",
      });
    else if (e.target.name !== "file")
      setState({ ...state, [e.target.name]: e.target.value });
    else setState({ ...state, [e.target.name]: e.target.files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!recaptchaValue){
      toast.error("Verify captcha to continue!!", {position:"top-center"});
      captchaRef.current.reset();
      return;
    }else{
      captchaRef.current.reset();
      try {
        const formData = new FormData();
        if (state.file)
          for (let i = 0; i < state.file.length; i++) {
            formData.append("file", state.file[i]);
          }

        const res = await axios.post("/register", {
          ...state,recaptchaValue,
        });

        if (state.file)
          await axios.post("/upload_files", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: res.data.token,
            },
          });

        toast.info("Enter OTP received on email to continue Registration!!", {position:"top-center"});
      } catch (e) {
        console.log(e);
      }
    }
    
  };

  const onCaptchaChange = value => {
    setRecaptchaValue(value);
  }

  return (
    <>
      <h2>Register</h2>
      <form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        method="POST"
        action="upload_files"
        encType="multipart/form-data"
        id="regForm"
      >
        <label htmlFor="type">Type:</label>
        <select id="type" name="type" onChange={onChange} value={state.type}>
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
              value={state.kind}
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
              value={state.kind}
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
          id="email"
          name="email"
          onChange={onChange}
          value={state.email}
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

        {state && state.type === "organisation" ? (
          <>
            <label htmlFor="file">Files:</label>
            <input
              type="file"
              id="file"
              name="file"
              multiple
              onChange={onChange}
            />
          </>
        ) : null}
        
        <ReCAPTCHA 
          sitekey={SITE_KEY}
          onChange={onCaptchaChange}
          ref={captchaRef}
          required
        />
        <input type="submit" value="Submit" id="submitBtn"/>
        <ToastContainer />
      </form>

      <h2>OTP Validation</h2>
      <div id="regForm">
        {/* <p>Enter email and otp below:</p> */}
        <label htmlFor="verifyEmail">Email:</label>
        <input
          type="text"
          id="verifyEmail"
          onChange={(e) => {
            setOtp({ ...otp, email: e.target.value });
          }}
          value={otp.email}
        />

        <label htmlFor="otp">OTP:</label>
        <input
          type="number"
          id="otp"
          onChange={(e) => {
            setOtp({ ...otp, otp: e.target.value });
          }}
          value={otp.otp}
        />
        <input
          type="submit"
          onClick={async (e) => {
            e.preventDefault();
            const res = await axios.post("/verify_otp", otp);
            if(res.data==="success"){
              toast.success("Registration Successful. Login to continue!! ", {position:"top-center"});
            }else{
              toast.error("Wrong OTP!!", {position:"top-center"});
            }
          }}
        />
      </div>
    </>
  );
};

export default RegisterForm;

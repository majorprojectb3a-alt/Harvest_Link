import { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./App.css";

export default function FarmerAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: ""
  });

  const [errors, setErrors] = useState({});

  /* ---------- VALIDATIONS ---------- */
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPhone = (phone) =>
    /^[0-9]{10}$/.test(phone);

  const isStrongPassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);

  /* ---------- HANDLERS ---------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({});
  };

  /* ---------- VALIDATE LOGIN ---------- */
  const validateSendOtp = () => {
    let e = {};
    if (!isValidPhone(form.phone))
      e.phone = "Enter valid 10-digit phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateVerifyOtp = () => {
    let e = {};
    if (!form.otp || form.otp.length !== 6)
      e.otp = "Enter valid 6-digit OTP";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------- SEND OTP ---------- */
  const sendOtp = async () => {
    if (!validateSendOtp()) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/send-otp",
        { phone: form.phone }
      );

      alert(res.data.msg);
      setOtpSent(true);
      setForm({ ...form, otp: "" }); // ✅ clear old OTP
    } catch (err) {
      setErrors({
        phone: err.response?.data?.msg || "Failed to send OTP"
      });
    }
  };

  /* ---------- VERIFY OTP ---------- */
  const verifyOtp = async () => {
    if (!validateVerifyOtp()) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        {
          phone: form.phone,
          otp: form.otp.toString() // ✅ VERY IMPORTANT
        }
      );

      alert(res.data.msg);
      // navigate("/farmer-dashboard");
    } catch (err) {
      setErrors({
        otp: err.response?.data?.msg || "Invalid OTP"
      });
    }
  };

  /* ---------- SIGNUP ---------- */
  const validateSignup = () => {
    let e = {};
    if (form.name.trim().length < 3)
      e.name = "Minimum 3 characters required";
    if (!isValidEmail(form.email))
      e.email = "Invalid email";
    if (!isValidPhone(form.phone))
      e.phone = "Phone must be 10 digits";
    if (!isStrongPassword(form.password))
      e.password = "Password must be 8+ chars with letters & numbers";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validateSignup()) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          role: "farmer",
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        }
      );

      alert(res.data.msg);
      setIsSignUp(false);
      setOtpSent(false);
    } catch (err) {
      setErrors({
        phone: err.response?.data?.msg || "Signup failed"
      });
    }
  };

  return (
    <>
      <Navbar oppositeUser="customer" />

      <div className="page-container">
        <div className={`cont ${isSignUp ? "s--signup" : ""}`}>

          {/* ---------- LOGIN ---------- */}
          <div className="form sign-in">
            <h2>Farmer Login</h2>

            <div className="form-group">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={otpSent}
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>

            {otpSent && (
              <div className="form-group">
                <label>OTP</label>
                <input
                  type="text"      // ✅ NOT number
                  name="otp"
                  value={form.otp}
                  onChange={handleChange}
                />
                {errors.otp && <span className="error">{errors.otp}</span>}
              </div>
            )}

            {!otpSent ? (
              <button className="submit" onClick={sendOtp}>
                Send OTP
              </button>
            ) : (
              <button className="submit" onClick={verifyOtp}>
                Verify OTP
              </button>
            )}
          </div>

          {/* ---------- SLIDER ---------- */}
          <div className="sub-cont">
            <div className="img">
              <div className="img__text m--up">
                <h3>New Farmer?</h3>
              </div>
              <div className="img__text m--in">
                <h3>Already have an account?</h3>
              </div>

              <div
                className="img__btn"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setOtpSent(false);
                  setErrors({});
                  setForm({ ...form, otp: "" });
                }}
              >
                <span className="m--up">Sign Up</span>
                <span className="m--in">Sign In</span>
              </div>
            </div>

            {/* ---------- SIGNUP ---------- */}
            <div className="form sign-up">
              <h2>Farmer Signup</h2>

              <div className="form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} />
                {errors.name && <span className="error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input name="email" value={form.email} onChange={handleChange} />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <span className="error">{errors.password}</span>
                )}
              </div>

              <button className="submit" onClick={handleSignup}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./App.css";

export default function FarmerAuth() {
  const [isSignUp, setIsSignUp] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
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
  };

  const validateLogin = () => {
    let e = {};
    if (!isValidEmail(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSignup = () => {
    let e = {};
    if (form.name.length < 3) e.name = "Min 3 characters";
    if (!isValidEmail(form.email)) e.email = "Invalid email";
    if (!isValidPhone(form.phone)) e.phone = "10 digit phone required";
    if (!isStrongPassword(form.password))
      e.password = "8+ chars, letters & numbers";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------- API CALLS ---------- */
  const handleLogin = async () => {
    if (!validateLogin()) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          role: "farmer",
          email: form.email,
          password: form.password
        }
      );
      alert(res.data.msg);
    } catch (err) {
      alert(err.response.data.msg);
    }
  };

  const handleSignup = async () => {
    if (!validateSignup()) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          role: "farmer",
          ...form
        }
      );
      alert(res.data.msg);
    } catch (err) {
      alert(err.response.data.msg);
    }
  };

  return (
    <>
      <Navbar oppositeUser="customer" />

      <div className="page-container">
        <div className={`cont ${isSignUp ? "s--signup" : ""}`}>

          {/* LOGIN */}
          <div className="form sign-in">
            <h2>Farmer Login</h2>

            <div className="form-group">
              <label>Email</label>
              <input name="email" value={form.email} onChange={handleChange} />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <button className="submit" onClick={handleLogin}>Sign In</button>
          </div>

          {/* SLIDER */}
          <div className="sub-cont">
            <div className="img">
              <div className="img__text m--up"><h3>New Farmer?</h3></div>
              <div className="img__text m--in"><h3>Already have an account?</h3></div>

              <div className="img__btn" onClick={() => { setIsSignUp(!isSignUp); setErrors({}); }}>
                <span className="m--up">Sign Up</span>
                <span className="m--in">Sign In</span>
              </div>
            </div>

            {/* SIGNUP */}
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
                <input type="password" name="password" value={form.password} onChange={handleChange} />
                {errors.password && <span className="error">{errors.password}</span>}
              </div>

              <button className="submit" onClick={handleSignup}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

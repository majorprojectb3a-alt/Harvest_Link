import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {toast} from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Navbar from "./AuthNavbar";
import "../../App.css";
import "./Auth.css"; 

export default function FarmerAuth() {
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: ""
  });

  const [otpSent, setOtpSent] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const [resetForm, setResetForm] = useState({
    phone: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});

  /* ---------- VALIDATIONS ---------- */
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);
  const isStrongPassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({});
  };

  const validateLogin = () => {
    let e = {};
    if (!isValidPhone(form.phone)) e.phone = "Invalid phone number";
    if (!form.password) e.password = "Password required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const sendOtp = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/auth/send-otp",
        { phone: resetForm.phone, role: "farmer" }
      );
      toast.info(res.data.msg);
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.msg);
      // setErrors({ phone: err.response?.data?.msg || "Failed to send OTP" });
    }
  };

  const closeForgotModal = () => {
  setShowForgotModal(false);
  setOtpSent(false);

  setResetForm({
    phone: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
};

  const resetPassword = async () => {
  
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      toast.info("Passwords do not match");
      return;
    }
  
    try {
  
      await axios.post("http://localhost:5000/auth/verify-otp", {
  
        phone: resetForm.phone,
        otp: resetForm.otp,
        role: "farmer"
      });
  
      const res = await axios.post(
        "http://localhost:5000/auth/reset-password",
        { 
          role: "farmer",
          phone: resetForm.phone,
          newPassword: resetForm.newPassword
        }
      );
  
      toast.info(res.data.msg);
  
      setShowForgotModal(false);
      setOtpSent(false);
      navigate("/farmer");
  
    } catch (err) {
      toast.error(err.response?.data?.msg);
    }
  };

  // LOGIN 
  const handleLogin = async () => {
    if (!validateLogin()) return;

    try {
      console.log('inside handle login for farmer');
      const res = await axios.post(
        "http://localhost:5000/auth/farmerLogin",
        {
          role: "farmer",
          phone: form.phone,
          password: form.password
        },
        { withCredentials: true }
      );

      // console.log(res.data);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("role", res.data.user.role);
      console.log(res.data);
      toast.success(res.data.msg);
      navigate("/FarmerHome");
    } catch (err) {
      toast.error(err.response.data.msg);
    }
  };

  /* ---------- SIGNUP ---------- */
  const validateSignup = () => {
    let e = {};
    if (form.name.trim().length < 3) e.name = "Minimum 3 characters required";
    if (!isValidEmail(form.email)) e.email = "Invalid email";
    if (!isValidPhone(form.phone)) e.phone = "Phone must be 10 digits";
    if (!isStrongPassword(form.password)) e.password = "Password must be 8+ chars with letters & numbers";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validateSignup()) return;

    if(!navigator.geolocation){
      toast.info("geolocation not supported by browser");
      return ;
    }

    navigator.geolocation.getCurrentPosition(
      async(position) =>{
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
      
      try{
        const res = await axios.post(
          "http://localhost:5000/auth/signup",
          {
            role: "farmer",
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
            lat,
            lng
          }
        );
        toast.success(res.data.msg);
        setIsSignUp(false);
        setOtpSent(false);
        setForm({ name: "", email: "", phone: "", password: "", otp: "" });
      } catch (err) {
        setErrors({ phone: err.response?.data?.msg || "Signup failed" });
      }
    }
  );
};


  

  return (
    <>
      <Navbar oppositeUser="Buyer" />
      <div className="page-container">
        <div className={`cont ${isSignUp ? "s--signup" : ""}`}>

          {/* ---------- LOGIN ---------- */}
          <div className="form sign-in">
            <h2 className="h2">Farmer Login</h2>

            <div className="form-group">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
              {/* <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={otpSent}
              />
              {errors.phone && <span className="error">{errors.phone}</span>} */}
            </div>
              
              <div className="form-group password-group">
              <label>Password</label>
              <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
              />
              <span
                className="toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
              </div>
              {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <button className="submit btn" onClick={handleLogin}>
              Sign In
            </button>
            <p className="forgot-link" onClick={() => setShowForgotModal(true)}>  Forgot Password?</p>

           {showForgotModal && (
  <div className="modal-overlay">

    <div className="modal-box">

      <h2>Reset Password</h2>

      <input
        placeholder="Phone Number"
        value={resetForm.phone}
        onChange={(e) =>
          setResetForm({ ...resetForm, phone: e.target.value })
        }
      />

      {!otpSent ? (
        <button onClick={sendOtp}>Send OTP</button>
      ) : (
        <>
          <input
            placeholder="OTP"
            value={resetForm.otp}
            onChange={(e) =>
              setResetForm({ ...resetForm, otp: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="New Password"
            value={resetForm.newPassword}
            onChange={(e) =>
              setResetForm({
                ...resetForm,
                newPassword: e.target.value
              })
            }
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={resetForm.confirmPassword}
            onChange={(e) =>
              setResetForm({
                ...resetForm,
                confirmPassword: e.target.value
              })
            }
          />

          <button onClick={resetPassword}>
            Update Password
          </button>
        </>
      )}

      <button
  className="close-btn"
  onClick={closeForgotModal}
>
  Close
</button>

    </div>

  </div>
)}
          </div>

          {/* ---------- SIGNUP ---------- */}
          <div className="sub-cont">
            <div className="img">
              <div className="img__text m--up"><h3>New Farmer?</h3></div>
              <div className="img__text m--in"><h3>Already have an account?</h3></div>
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

            <div className="form sign-up">
              <h2 className="h2">Farmer Signup</h2>

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

              <div className="form-group password-group">
                <label>Password</label>
                <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />

                <span
                  className="toggle-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
                </div>
                {errors.password && <span className="error">{errors.password}</span>}
              </div>

              <button className="submit btn" onClick={handleSignup}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

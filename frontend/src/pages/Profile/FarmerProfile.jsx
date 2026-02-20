import { useEffect, useState } from "react";
import axios from "axios";
import "./FarmerProfile.css";

import HistoryTable from "../../components/History/HistoryTable";
import Navbar from "../../components/Navbar/Navbar";

export default function FarmerProfile(){

  const [profile, setProfile] = useState(null);

  const [freshHistory, setFreshHistory] = useState([]);

  const [wasteHistory, setWasteHistory] = useState([]);

  const [freshPage, setFreshPage] = useState(1);

  const [wastePage, setWastePage] = useState(1);

  const [freshTotalPages, setFreshTotalPages] = useState(1);

  const [wasteTotalPages, setWasteTotalPages] = useState(1);

  const [limit, setLimit] = useState(5);

  const [statusFilter, setStatusFilter] = useState("all");

  const [showEdit, setShowEdit] = useState(false);

  const [editForm, setEditForm] = useState({
    name:"",
    phone:"",
    profileImage:""
  });

  const fetchProfile = async ()=>{

    const res =
      await axios.get(
        "http://localhost:5000/auth/profile",
        { withCredentials:true }
      );

    setProfile(res.data.user);

    setEditForm(res.data.user);

  };


  const fetchFreshHistory = async ()=>{

    const res =
      await axios.get(
        `http://localhost:5000/fresh/seller/history?page=${freshPage}&limit=${limit}&status=${statusFilter}`,
        { withCredentials:true }
      );

    setFreshHistory(res.data.items);

    setFreshTotalPages(res.data.totalPages);

  };


  const fetchWasteHistory = async ()=>{

    const res =
      await axios.get(
        `http://localhost:5000/waste/seller/history?page=${wastePage}&limit=${limit}&status=${statusFilter}`,
        { withCredentials:true }
      );

    setWasteHistory(res.data.items);

    setWasteTotalPages(res.data.totalPages);

  };


  useEffect(()=>{
    fetchProfile();
  },[]);


  useEffect(()=>{
    fetchFreshHistory();
  },[freshPage,limit,statusFilter]);


  useEffect(()=>{
    fetchWasteHistory();
  },[wastePage,limit,statusFilter]);





  const updateProfile = async ()=>{

    await axios.put(
      "http://localhost:5000/auth/update-profile",
      editForm,
      { withCredentials:true }
    );

    setShowEdit(false);

    fetchProfile();

  };

  const handleImageUpload = (e)=>{

  const file = e.target.files[0];

  if(!file) return;

  const reader = new FileReader();

  reader.onloadend = ()=>{

    setEditForm({
      ...editForm,
      profileImage: reader.result   // base64 image
    });

  };

  reader.readAsDataURL(file);

};



  if(!profile)
    return <div>Loading...</div>;


  return(

    <div className="profile-container">

      <Navbar/>

      {/* PROFILE CARD */}

      <div className="profile-card">

        <div className="profile-left">

          <img
            src={
              profile.profileImage ||
              "/default_profile_image.png"
            }
            className="profile-image"
          />

          <div>

            <h2>{profile.name}</h2>

            <p>{profile.email}</p>

            <p>{profile.phone}</p>

          </div>

        </div>

        <button
          className="edit-btn"
          onClick={()=>setShowEdit(true)}
        >
          Edit Profile
        </button>

      </div>


      {/* FILTER ROW */}

      <div className="filter-row">

        <select
          value={statusFilter}
          onChange={(e)=>{
            setStatusFilter(e.target.value);
            setFreshPage(1);
            setWastePage(1);
          }}
        >

          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>

        </select>


        <select
          value={limit}
          onChange={(e)=>{
            setLimit(Number(e.target.value));
            setFreshPage(1);
            setWastePage(1);
          }}
        >

          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>

        </select>

      </div>


      {/* HISTORY TABLES */}

      <HistoryTable
        title="Sell Fresh History"
        data={freshHistory}
        page={freshPage}
        totalPages={freshTotalPages}
        setPage={setFreshPage}
      />


      <HistoryTable
        title="Sell Waste History"
        data={wasteHistory}
        page={wastePage}
        totalPages={wasteTotalPages}
        setPage={setWastePage}
      />


      {/* EDIT MODAL */}

      {showEdit && (

  <div className="modal">

    <div className="modal-content">

      <h3>Edit Profile</h3>

      {/* PROFILE IMAGE PREVIEW */}
      <div className="image-upload-container">

        <img
          src={
            editForm.profileImage ||
            "/default_profile_image.png"
          }
          className="edit-profile-image"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />

      </div>


      {/* NAME */}
      <input
        placeholder="Name"
        value={editForm.name}
        onChange={(e)=>
          setEditForm({
            ...editForm,
            name:e.target.value
          })
        }
      />


      {/* PHONE */}
      <input
        placeholder="Phone"
        value={editForm.phone}
        onChange={(e)=>
          setEditForm({
            ...editForm,
            phone:e.target.value
          })
        }
      />


      <button onClick={updateProfile}>
        Save
      </button>

      <button onClick={()=>setShowEdit(false)}>
        Cancel
      </button>

    </div>

  </div>

)}


    </div>

  );

}

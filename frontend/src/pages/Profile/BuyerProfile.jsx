import { useEffect, useState } from "react";
import axios from "axios";
import "./BuyerProfile.css";
import Navbar from "../../components/Navbar/Navbar";

import HistoryTable from "../../components/History/HistoryTable";

export default function BuyerProfile(){

  const [profile, setProfile] = useState(null);

  const [buyHistory, setBuyHistory] = useState([]);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [limit, setLimit] = useState(5);

  const [statusFilter, setStatusFilter] = useState("all");

  const [showEdit, setShowEdit] = useState(false);

  const [editForm, setEditForm] = useState({
    name:"",
    phone:"",
    profileImage:""
  });


  /* FETCH PROFILE */
  const fetchProfile = async ()=>{

    const res = await axios.get(
      "http://localhost:5000/auth/profile",
      { withCredentials:true }
    );

    setProfile(res.data.user);

    setEditForm({
      name:res.data.user.name,
      phone:res.data.user.phone,
      profileImage:res.data.user.profileImage
    });

  };


  /* FETCH BUY HISTORY */
  const fetchBuyHistory = async ()=>{

    const res = await axios.get(
      `http://localhost:5000/waste/buyer/history?page=${page}&limit=${limit}&status=${statusFilter}`,
      { withCredentials:true }
    );

    setBuyHistory(res.data.items);

    setTotalPages(res.data.totalPages);

  };


  useEffect(()=>{
    fetchProfile();
  },[]);


  useEffect(()=>{
    fetchBuyHistory();
  },[page,limit,statusFilter]);


  /* UPDATE PROFILE */
  const updateProfile = async ()=>{

    await axios.put(
      "http://localhost:5000/auth/update-profile",
      editForm,
      { withCredentials:true }
    );

    setShowEdit(false);

    fetchProfile();

  };


  /* IMAGE UPLOAD */
  const handleImageUpload = (e)=>{

    const file = e.target.files[0];

    if(!file) return;

    if(file.size > 2 * 1024 * 1024){
      alert("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = ()=>{
      setEditForm({
        ...editForm,
        profileImage:reader.result
      });
    };

    reader.readAsDataURL(file);

  };


  if(!profile)
    return <div>Loading...</div>;


  return(

    <div className="buyer-profile-container">

        <Navbar/>


      {/* PROFILE CARD */}
      <div className="buyer-profile-card">

        <div className="buyer-profile-left">

          <img
            src={
              profile.profileImage ||
              "/default_profile_image.png"
            }
            className="buyer-profile-image"
          />

          <div>

            <h2>{profile.name}</h2>

            <p>{profile.email}</p>

            <p>{profile.phone}</p>

          </div>

        </div>


        <button
          className="buyer-edit-btn"
          onClick={()=>setShowEdit(true)}
        >
          Edit Profile
        </button>

      </div>



      {/* FILTER ROW */}
      <div className="buyer-filter-row">

        <select
          value={statusFilter}
          onChange={(e)=>{
            setStatusFilter(e.target.value);
            setPage(1);
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
            setPage(1);
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>

      </div>



      {/* BUY HISTORY */}
      <HistoryTable
        title="Buying History"
        data={buyHistory}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />



      {/* EDIT MODAL */}
      {showEdit && (

        <div className="buyer-modal">

          <div className="buyer-modal-content">

            <h3>Edit Profile</h3>


            <div className="buyer-image-upload">

              <img
                src={
                  editForm.profileImage ||
                  "/default_profile_image.png"
                }
                className="buyer-edit-image"
              />

              <input
                type="file"
                onChange={handleImageUpload}
              />

            </div>


            <input
              value={editForm.name}
              onChange={(e)=>
                setEditForm({
                  ...editForm,
                  name:e.target.value
                })
              }
            />


            <input
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

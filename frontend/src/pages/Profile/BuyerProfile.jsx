import { useEffect, useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";
import "./BuyerProfile.css";
import Navbar from "../../components/Navbar/Navbar";
import HistoryTable from "../../components/History/HistoryTable";

export default function BuyerProfile(){

  const [profile, setProfile] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const [freshHistory,setFreshHistory] = useState([]);
  const [wasteHistory,setWasteHistory] = useState([]);

  const [freshPage,setFreshPage] = useState(1);
  const [wastePage,setWastePage] = useState(1);

  const [freshTotalPages,setFreshTotalPages] = useState(1);
  const [wasteTotalPages,setWasteTotalPages] = useState(1);

  const [limit, setLimit] = useState(5);

  const [statusFilter, setStatusFilter] = useState("all");

  const [editForm, setEditForm] = useState({
    name:"",
    phone:"",
    profileImage:"",

    dno:"",
    addressText:"",
    street:"",
    village:"",
    district:"",
    state: "",
    country: "",
    pincode:"",

    lat:null,
    lng:null
  });

  const searchAddress = async(text) =>{
    setEditForm({...editForm, addressText: text});

    if(text.length < 3){
      setSuggestions([]);
      return ;
    }

    const res = await fetch(`https://photon.komoot.io/api/?q=${text}&limit=5`);

    const data = await res.json();

    setSuggestions(data.features);

  };

  const selectAddress = (place) =>{
    const props = place.properties;
    const coords = place.geometry.coordinates;

    setEditForm({
      ...editForm,

      addressText: 
      props.name + (props.city ? ", "+props.city : "") +
      (props.state ? ", "+props.state : ""),

      street:props.street || "",
      village:props.city || props.name || "",
      district:props.district || "",
      state: props.state || "",
      country: props.country || "",
      pincode:props.postcode || "",

      lat:coords[1],
      lng:coords[0]
    });

    setSuggestions([]);
  }

  const getLocation = () =>{
    if(!navigator.geolocation){
      alert("Geolocation not supported");
      return ;
    }

    navigator.geolocation.getCurrentPosition((pos) =>{
      setEditForm({
        ...editForm,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });

      alert("Location captured");
    });
  };

  /* FETCH PROFILE */
  const fetchProfile = async ()=>{

    const res = await axios.get(
      "http://localhost:5000/auth/profile",
      { withCredentials:true }
    );

    const u = res.data.user;
    setProfile(res.data.user);

    setEditForm({
      name:u.name,
      phone:u.phone,
      profileImage:u.profileImage,

      dno:u.address?.dno || "",
      addressText:"",

      street:u.address?.street || "",
      village:u.address?.village || "",
      district:u.address?.district || "",
      state: u.address?.state || "",
      country: u.address?.country || "",
      pincode:u.address?.pincode || "",

      lat:u.location?.coordinates?.[1] || null,
      lng:u.location?.coordinates?.[0] || null
    });

  };


  /* FETCH BUY HISTORY */
  const fetchFreshHistory = async ()=>{

const res = await axios.get(
`http://localhost:5000/fresh/buyer/history?page=${freshPage}&limit=${limit}&status=${statusFilter}`,
{withCredentials:true}
);

setFreshHistory(res.data.items);
setFreshTotalPages(res.data.totalPages);

};

const fetchWasteHistory = async()=>{
  console.log('making a call to waste/buyer/history');
  const res = await axios.get(
    `http://localhost:5000/waste/buyer/history?page=${wastePage}&limit=${limit}&status=${statusFilter}`,
  {withCredentials:true}
  );

  setWasteHistory(res.data.items);
  setWasteTotalPages(res.data.totalPages);

};

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

  useEffect(()=>{
  fetchProfile();
  },[]);

  useEffect(()=>{
  fetchFreshHistory();
  },[freshPage,limit,statusFilter]);

  useEffect(()=>{
  fetchWasteHistory();
  },[wastePage,limit,statusFilter]);

  if(!profile)
    return <div>Loading...</div>;


  return(

    <div className="buyer-profile-container">

        <Navbar/>


      {/* PROFILE CARD */}
      <div className="buyer-profile-card">

  <div className="buyer-profile-left">

    <img
      src={profile.profileImage || "/default_profile_image.png"}
      className="buyer-profile-image"
    />

    <div className="buyer-profile-details">

      <h2 className="buyer-profile-name">{profile.name}</h2>

      <div className="buyer-profile-info">

        <div className="buyer-info-row">
          <FaUser className="buyer-info-icon"/>
          <div>
            <span>Role</span>
            <p>{profile.role}</p>
          </div>
        </div>

        <div className="buyer-info-row">
          <FaEnvelope className="buyer-info-icon"/>
          <div>
            <span>Email</span>
            <p>{profile.email}</p>
          </div>
        </div>

        <div className="buyer-info-row">
          <FaPhone className="buyer-info-icon"/>
          <div>
            <span>Phone</span>
            <p>{profile.phone}</p>
          </div>
        </div>

      </div>

      {profile.address && (
        <div className="buyer-address-section">
          <h4><FaMapMarkerAlt/> Address</h4>

          <p className="buyer-address-line">
            {profile.address?.dno}, {profile.address?.street}
          </p>

          <p className="buyer-address-line">
            {profile.address?.village}, {profile.address?.district}
          </p>

          <p className="buyer-address-line">
            {profile.address?.state}, {profile.address?.country} - {profile.address?.pincode}
          </p>
        </div>
      )}

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



      {/* BUY HISTORY */}
      <HistoryTable
        title="Fresh Products Buying History"
        data={freshHistory}
        page={freshPage}
        totalPages={freshTotalPages}
        setPage={setFreshPage}
      />


      <HistoryTable
      title="Waste Products Buying History"
      data={wasteHistory}
      page={wastePage}
      totalPages={wasteTotalPages}
      setPage={setWastePage}
      />
      
      {/* EDIT MODAL */}
      {showEdit && (

        <div className="buyer-modal">

          <div className="buyer-modal-content">

            {(!editForm.lat || !editForm.street) && (
              <div className="profile-warning">
                ⚠ Please complete your address and location to get better matches nearby.
              </div>
            )}

            <h3>Edit Profile</h3>

            <div className="buyer-image-upload">

              <img
                src={editForm.profileImage || "/default_profile_image.png"}
                className="buyer-edit-image"
              />

              <input type="file" accept="image/*" onChange={handleImageUpload}/>

            </div>


            <input
              placeholder="Name" value={editForm.name}
              onChange={(e)=>
                setEditForm({
                  ...editForm,
                  name:e.target.value
                })
              }
            />


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

            {/* ADDRESS SEARCH */}

          <div className="address-box">

          <input
          type="text"
          placeholder="Search Address"
          value={editForm.addressText}
          onChange={(e)=>searchAddress(e.target.value)}
          />

          {suggestions.length>0 &&(

          <div className="suggestions">

          {suggestions.map((s,i)=>{

          const p = s.properties;

          return(

          <div
          key={i}
          className="suggestion-item"
          onClick={()=>selectAddress(s)}
          >

          {p.name}
          {p.city && `, ${p.city}`}
          {p.state && `, ${p.state}`}
          {p.country && `, ${p.country}`}

          </div>

          );

          })}

          </div>

          )}

          </div>


          <div className="address-grid">

          <input
          placeholder="Door No"
          value={editForm.dno}
          onChange={(e)=>setEditForm({...editForm,dno:e.target.value})}
          />

          <input
          className={!editForm.street ? "input-error" : ""}
          placeholder="Street"
          value={editForm.street}
          onChange={(e)=>setEditForm({...editForm,street:e.target.value})}
          />

          <input
          className={!editForm.street ? "input-error" : ""}
          placeholder="Village"
          value={editForm.village}
          onChange={(e)=>setEditForm({...editForm,village:e.target.value})}
          />

          <input
          className={!editForm.street ? "input-error" : ""}
          placeholder="District"
          value={editForm.district}
          onChange={(e)=>setEditForm({...editForm,district:e.target.value})}
          />

          <input
          className={!editForm.street ? "input-error" : ""}
          placeholder="Pincode"
          value={editForm.pincode}
          onChange={(e)=>setEditForm({...editForm,pincode:e.target.value})}
          />

          </div>


          <button
          className="location-btn"
          onClick={getLocation}
          >
          Use Current Location
          </button>

          <p className="coords">
          Coordinates: {editForm.lat || "-"} , {editForm.lng || "-"}
          </p>

            <button className = "save-btn" onClick={updateProfile}>
              Save
            </button>


            <button className = "close-btn" onClick={()=>setShowEdit(false)}>
              Cancel
            </button>


          </div>

        </div>

      )}

    </div>

  );

}

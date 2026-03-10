import { useEffect, useState } from "react";
import axios from "axios";

export default function BookingRequests(){

  const [requests,setRequests] = useState([]);

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const fetchRequests = async ()=>{

    try{

      let url="";

      if(role==="farmer"){
        url = `http://localhost:5000/api/bookings/farmer/${userId}`;
      }
      else{
        url = `http://localhost:5000/api/bookings/buyer/${userId}`;
      }

      const res = await axios.get(url);

      console.log(res.data);


      setRequests(res.data);

    }
    catch(err){
      console.log(err);
    }

  };

  useEffect(()=>{
    fetchRequests();
  },[]);


  const acceptBooking = async(id)=>{
    await axios.post(`http://localhost:5000/api/bookings/accept/${id}`);
    fetchRequests();
  };

  const rejectBooking = async(id)=>{
    await axios.post(`http://localhost:5000/api/bookings/reject/${id}`);
    fetchRequests();
  };


  return(

    <div style={{padding:"20px"}}>



      <h2>Booking Requests</h2>

      {requests.length===0 && <p>No requests found</p>}

      {requests.map(r=>(

        <div key={r._id} style={{border:"1px solid #ccc",padding:"10px",marginBottom:"10px"}}>

          <p><b>Product:</b> {r.productId.crop}</p>

          <p><b>Quantity:</b> {r.quantity} kg</p>

          {role==="farmer" && (
            <>
              <p><b>Buyer:</b> {r.buyerId.name}</p>

              <button onClick={()=>acceptBooking(r._id)}>
                Accept
              </button>

              <button onClick={()=>rejectBooking(r._id)} style={{marginLeft:"10px"}}>
                Reject
              </button>
            </>
          )}

          {role==="buyer" && (
            <>
              <p><b>Farmer:</b> {r.farmerId.name}</p>

              <p><b>Status:</b> {r.status}</p>
            </>
          )}

        </div>

      ))}

    </div>

  );

}
import { useEffect, useState } from "react";
import axios from "axios";
import "./BookingRequests.css";
import Navbar from "../../components/Navbar/Navbar";

export default function BookingRequests(){

  const [requests,setRequests] = useState([]);
  const [freshPage,setFreshPage] = useState(1);
  const [wastePage,setWastePage] = useState(1);

  const perPage = 5;

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const fetchRequests = async () => {

    try{

      let url="";

      if(role==="farmer"){
        url = `http://localhost:5000/api/bookings/farmer/${userId}`;
      }
      else{
        url = `http://localhost:5000/api/bookings/buyer/${userId}`;
      }

      const res = await axios.get(url);
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
    alert("Booking accepted successfully ✅");
    fetchRequests();
  };

  const rejectBooking = async(id)=>{
    await axios.post(`http://localhost:5000/api/bookings/reject/${id}`);
     alert("Booking rejected ❌");
    fetchRequests();
  };


  /* Separate fresh and waste */

  const freshBookings = requests.filter(r => r.productModel === "Product");
  const wasteBookings = requests.filter(r => r.productModel === "Waste");


  /* Pagination */

  const freshStart = (freshPage-1)*perPage;
  const wasteStart = (wastePage-1)*perPage;

  const freshData = freshBookings.slice(freshStart,freshStart+perPage);
  const wasteData = wasteBookings.slice(wasteStart,wasteStart+perPage);

  const freshTotalPages = Math.ceil(freshBookings.length/perPage);
  const wasteTotalPages = Math.ceil(wasteBookings.length/perPage);


  return(

    <div className="booking-dashboard">

      <Navbar/>


      {/* Fresh Booking Requests */}

      <div className="booking-card">

        <h2 className="booking-title">Fresh Booking Requests</h2>

        <table className="booking-table">

          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Buyer</th>
              <th>Status</th>
              <th>Date</th>
              {role==="farmer" && <th>Action</th>}
            </tr>
          </thead>

          <tbody>

            {freshData.map(r => (

              <tr key={r._id}>

                <td>{r.productId?.crop}</td>

                <td>{r.quantity} kg</td>

                <td>{r.buyerId?.name}</td>

                <td>
                  <span className="status-badge">
                    {r.status}
                  </span>
                </td>

                <td>
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>

                {role==="farmer" && (
                  <td>

                    <button
                      className="accept-btn"
                      onClick={()=>acceptBooking(r._id)}
                    >
                      Accept
                    </button>

                    <button
                      className="reject-btn"
                      onClick={()=>rejectBooking(r._id)}
                    >
                      Reject
                    </button>

                  </td>
                )}

              </tr>

            ))}

          </tbody>

        </table>


        {/* Pagination */}

        <div className="pagination">

          <button
            disabled={freshPage===1}
            onClick={()=>setFreshPage(freshPage-1)}
            className="page-btn prev"
          >
            Prev
          </button>

          <span>
            Page {freshPage} of {freshTotalPages || 1}
          </span>

          <button
            disabled={freshPage===freshTotalPages}
            onClick={()=>setFreshPage(freshPage+1)}
            className="page-btn next"
          >
            Next
          </button>

        </div>

      </div>



      {/* Waste Booking Requests */}

      <div className="booking-card">

        <h2 className="booking-title">Waste Booking Requests</h2>

        <table className="booking-table">

          <thead>
            <tr>
              <th>Type</th>
              <th>Quantity</th>
              <th>Buyer</th>
              <th>Status</th>
              <th>Date</th>
              {role==="farmer" && <th>Action</th>}
            </tr>
          </thead>

          <tbody>

            {wasteData.map(r => (

              <tr key={r._id}>

                <td>{r.productId?.type}</td>

                <td>{r.quantity} kg</td>

                <td>{r.buyerId?.name}</td>

                <td>
                  <span className="status-badge">
                    {r.status}
                  </span>
                </td>

                <td>
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>

                {role==="farmer" && (
                  <td>

                    <button
                      className="accept-btn"
                      onClick={()=>acceptBooking(r._id)}
                    >
                      Accept
                    </button>

                    <button
                      className="reject-btn"
                      onClick={()=>rejectBooking(r._id)}
                    >
                      Reject
                    </button>

                  </td>
                )}

              </tr>

            ))}

          </tbody>

        </table>


        {/* Pagination */}

        <div className="pagination">

          <button
            disabled={wastePage===1}
            onClick={()=>setWastePage(wastePage-1)}
            className="page-btn prev"
          >
            Prev
          </button>

          <span>
            Page {wastePage} of {wasteTotalPages || 1}
          </span>

          <button
            disabled={wastePage===wasteTotalPages}
            onClick={()=>setWastePage(wastePage+1)}
            className="page-btn next"
          >
            Next
          </button>

        </div>

      </div>


    </div>
  );

}
import { useEffect, useState } from "react";
import {
  getFreshItems,
  getFreshDetails,
  buyFreshItem
} from "../../api/freshApi";

import FreshCard from "../Card/FreshCard";
import Filters from "../Filters/Filters";

import "./FreshOptions.css";

export default function FreshOptions() {

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [selectedType, setSelectedType] = useState("All");

  const [location, setLocation] = useState({
    lat: null,
    lng: null
  });

  // modal state
  const [selectedFresh, setSelectedFresh] = useState(null);

  const [showDetails, setShowDetails] = useState(false);


  // fetch fresh items
  const fetchFresh = async (lat, lng, type) => {

    try {

      const data = await getFreshItems(
        lat,
        lng,
        type
      );

      setItems(data);

      setLoading(false);

    }
    catch(err){

      console.log(err);

      setError("Failed to load fresh items");

      setLoading(false);

    }

  };


  // refetch when filter changes
  useEffect(()=>{

    if(location.lat && location.lng){

      setLoading(true);

      fetchFresh(
        location.lat,
        location.lng,
        selectedType
      );

    }

  },[selectedType]);


  // initial location fetch
  useEffect(()=>{

    if(!navigator.geolocation){

      setError("Geolocation not supported");

      setLoading(false);

      return;

    }


    navigator.geolocation.getCurrentPosition(

      (pos)=>{

        const lat = pos.coords.latitude;

        const lng = pos.coords.longitude;

        setLocation({lat,lng});

        fetchFresh(lat,lng,selectedType);

      },

      (err)=>{

        console.log(err);

        setError("Allow location access");

        setLoading(false);

      }

    );

  },[]);


  // open modal
  const openDetails = async(id)=>{

    try{

      const data = await getFreshDetails(id);

      setSelectedFresh(data);

      setShowDetails(true);

    }
    catch{

      alert("Failed to load details");

    }

  };


  // loading state
  if(loading)
    return <p className="fresh-loading">
      Loading fresh items...
    </p>;


  // error state
  if(error)
    return <p className="fresh-error">
      {error}
    </p>;


  return(

    <>

      {/* FILTER BAR */}

      <Filters
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />


      {/* LIST */}

      {items.length === 0 ? (

        <p className="fresh-empty">
          No fresh items available
        </p>

      )
      :
      (

        <div className="fresh-items-grid">

          {items.map(item=>(

            <FreshCard
              key={item._id}
              item={item}
              onSelect={openDetails}
            />

          ))}

        </div>

      )}


      {/* MODAL */}

      {showDetails && selectedFresh && (

        <div
          className="fresh-modal-overlay"
          onClick={()=>setShowDetails(false)}
        >

          <div
            className="fresh-modal-content"
            onClick={(e)=>e.stopPropagation()}
          >

            <h2>{selectedFresh.type}</h2>

            <p>
              Quantity: {selectedFresh.weight} kg
            </p>

            <p>
              Price: ₹{selectedFresh.price}/kg
            </p>

            <p>
              Total Price: ₹{selectedFresh.totalPrice}/kg
            </p>


            <hr/>


            <h3>Seller Details</h3>

            <p>
              Name:
              {selectedFresh.userId.name}
            </p>

            <p>
              Email:
              {selectedFresh.userId.email}
            </p>

            <p>
              Phone:
              {selectedFresh.userId.phone}
            </p>




            <div className="fresh-btns">

              <button
                className="fresh-buy-btn"
                onClick={async()=>{

                  try{

                    await buyFreshItem(
                      selectedFresh._id
                    );

                    alert("Purchased successfully");

                    setShowDetails(false);

                    fetchFresh(
                      location.lat,
                      location.lng,
                      selectedType
                    );

                  }
                  catch{

                    alert("Purchase failed");

                  }

                }}
              >

                🛒 Buy Fresh

              </button>


              <button
                className="fresh-close-btn"
                onClick={()=>setShowDetails(false)}
              >

                Close

              </button>

            </div>

          </div>

        </div>

      )}

    </>

  );

}

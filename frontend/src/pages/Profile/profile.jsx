import { useEffect, useState } from "react";
import axios from "axios";

import FarmerProfile from "./FarmerProfile";
import BuyerProfile from "./BuyerProfile";

export default function Profile() {

  const [role, setRole] = useState(null);

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    axios.get(
      "http://localhost:5000/auth/profile",
      { withCredentials: true }
    )
    .then(res => {

      setRole(res.data.user.role);

      setLoading(false);

    })
    .catch(() => {

      setLoading(false);

    });

  }, []);


  if (loading)
    return <div>Loading profile...</div>;


  if (!role)
    return <div>Unauthorized</div>;


  if (role === "farmer")
    return <FarmerProfile />;


  if (role === "buyer")
    return <BuyerProfile />;


  return <div>Invalid role</div>;

}

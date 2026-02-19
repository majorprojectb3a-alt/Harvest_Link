import axios from "axios";

const BASE_URL = "http://localhost:5000/fresh";


export const getFreshItems = async(lat,lng)=>{

  const res = await axios.get(BASE_URL,{
    params:{buyerLat:lat,buyerLng:lng},
    withCredentials:true
  });

  return res.data;

};


export const getFreshDetails = async(id)=>{

  const res = await axios.get(
    `${BASE_URL}/details/${id}`,
    {withCredentials:true}
  );

  return res.data;

};


export const buyFreshItem = async(id)=>{

  const res = await axios.post(
    `${BASE_URL}/buy/${id}`,
    {},
    {withCredentials:true}
  );

  return res.data;

};

import axios from "axios";


export const countShortlisted = async () => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        "http://localhost:8080/api/applications/shortlisted/count",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

  return response.data;
};

export const getShortlisted= async ()=>{
    const token =localStorage.getItem("token");
    const response=await axios.get(
        "http://localhost:8080/api/applications/recuriter/shortlisted",
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
}


export const searchShortlisted = async (keyword) => {

    const token = localStorage.getItem("token");

    const response = await axios.get(
        `http://localhost:8080/api/applications/recruiter/shortlisted/search?keyword=${encodeURIComponent(keyword)}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};
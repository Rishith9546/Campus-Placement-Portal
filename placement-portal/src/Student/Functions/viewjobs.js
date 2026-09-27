import axios from "axios";
export const getJobs = async () => {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
            "http://localhost:8080/api/jobs/allJobs",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;

    } catch (error) {
        console.log(error);
        return [];
    }
};

export  const getUser=async ()=>{


    try{

        const token=localStorage.getItem("token");

        const response=await  axios.get(
            "http://localhost:8080/api/student/profile",{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }
        );
        return response.data;




    }
    catch (error){
        console.log(error);
        return [];
    }
}


export const searchJobs = async (keyWord) => {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
            `http://localhost:8080/api/jobs/student/search?keyword=${keyWord}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;

    } catch (error) {
        console.log(error);
        return [];
    }
};
import { Headers } from "./Headers.jsx";
import './ViewJobs.css';
import {Await, useNavigate} from "react-router-dom";
import axios from "axios";
import {useEffect, useState} from "react";

function ViewJobs() {

    const navigate = useNavigate();
    const [jobs,setJobs]=useState([]);
    const [users,setUsers]=useState([]);

    useEffect(()=>{
        const getJobs=async ()=>{


        try{

            const token=localStorage.getItem("token");

            const response=await  axios.get(
                "http://localhost:8080/api/jobs/allJobs",{
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }
            );
            setJobs(response.data);



        }
        catch (error){
            console.log(error);
        }
        }
        getJobs();
    },[]);



    useEffect(()=>{
        const getUser=async ()=>{


            try{

                const token=localStorage.getItem("token");

                const response=await  axios.get(
                    "http://localhost:8080/api/student/profile",{
                        headers:{
                            Authorization:`Bearer ${token}`
                        }
                    }
                );
                setUsers(response.data);
                console.log(response.data)



            }
            catch (error){
                console.log(error);
            }
        }
        getUser();
    },[]);
    return (
        <>
            <Headers />


            <button onClick={() => {
                navigate('/dashboard');
            }} className="Back">
                ← Back to Profile
            </button>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search jobs by title, skills, or company..."
                />
            </div>

            <div className="jobs-container">
                {jobs.map((job)=>{
                    const data = job.skills.split(",").map(skill => skill.trim());
                    console.log(job.id);
                    return(
                    <div
                        className="job-card"
                        onClick={() => navigate(`/jobs/${job.id}`)}>
                        <div>
                            <h3>{job.title}</h3>
                            <p>{job.company} • {job.location}</p>

                            {data.map((skill) => (
                                <span key={skill}>{skill}</span>
                            ))}

                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/jobs/${job.id}`);
                            }}
                        >
                            View
                        </button>
                    </div>
                    )

                })}
            </div>
        </>
    );
}

export default ViewJobs;
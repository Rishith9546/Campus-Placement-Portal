import { useEffect, useState } from "react";
import { Bell, CalendarClock, ChevronDown, ChevronUp } from "lucide-react";
import "./AnnouncementFeed.css";

export default function AnnouncementFeed(){
 const [items,setItems]=useState([]),[state,setState]=useState("loading"),[expanded,setExpanded]=useState(null);
 useEffect(()=>{let live=true;const token=localStorage.getItem("token");fetch("http://localhost:8080/api/announcements",{headers:{Authorization:`Bearer ${token}`}}).then(r=>{if(!r.ok)throw new Error();return r.json()}).then(data=>{if(live){setItems(data);setState("ready")}}).catch(()=>{if(live)setState("error")});return()=>{live=false}},[]);
 if(state==="error"||state==="ready"&&!items.length)return null;
 return <section className="announcement-feed" aria-label="Placement announcements"><header><span><Bell size={16}/></span><div><strong>Placement announcements</strong><small>{state==="loading"?"Checking for notices":"Latest notices for your account"}</small></div></header>{state==="loading"?<div className="announcement-feed-loading"/>:<div className="announcement-feed-list">{items.slice(0,5).map(item=><article key={item.id} className={`announcement-feed-item ${item.priority.toLowerCase()}`}><button onClick={()=>setExpanded(x=>x===item.id?null:item.id)} aria-expanded={expanded===item.id}><span><i>{item.priority}</i><strong>{item.title}</strong><small><CalendarClock size={12}/>{item.publishAt?new Date(item.publishAt).toLocaleDateString():"Recently published"}</small></span>{expanded===item.id?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button>{expanded===item.id&&<p>{item.content}</p>}</article>)}</div>}</section>
}

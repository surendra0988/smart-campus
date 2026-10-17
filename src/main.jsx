import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  LayoutDashboard, Building2, CalendarDays, History, Bell, Settings, Search,
  ChevronRight, Clock3, Users, CheckCircle2, XCircle, AlertCircle, Plus,
  Menu, X, MapPin, Monitor, Cpu, FlaskConical, ArrowLeft, Check, Trash2
} from "lucide-react";
import "./styles.css";

const seedResources = [
  {id:1,name:"Seminar Hall A",type:"Room",capacity:100,location:"Block A • Ground Floor",icon:"hall",tags:["Projector","Wi-Fi","AC"],desc:"Large seminar hall for presentations, workshops and campus events.",guidelines:"Keep the hall clean and return equipment after use."},
  {id:2,name:"Computer Lab 204",type:"Lab",capacity:60,location:"Block B • 2nd Floor",icon:"lab",tags:["60 PCs","LAN","Projector"],desc:"Computer lab with networked workstations for classes and projects.",guidelines:"Use lab systems responsibly and log out after use."},
  {id:3,name:"GPU Server 01",type:"Equipment",capacity:1,location:"Innovation Center",icon:"gpu",tags:["RTX GPU","Linux","Remote"],desc:"High-performance GPU server for approved AI/ML projects.",guidelines:"Use only for academic workloads and approved experiments."},
  {id:4,name:"Electronics Lab",type:"Lab",capacity:35,location:"Block C • 1st Floor",icon:"lab",tags:["Oscilloscope","Kits","Soldering"],desc:"Electronics workspace for circuits, embedded systems and prototypes.",guidelines:"Wear safety equipment and return kits to their storage area."},
  {id:5,name:"Auditorium",type:"Room",capacity:300,location:"Main Campus",icon:"hall",tags:["Stage","Audio","Projector"],desc:"Main auditorium for large campus events and guest lectures.",guidelines:"Large-event bookings require an administrator note."},
  {id:6,name:"IoT Hardware Kit",type:"Equipment",capacity:4,location:"IoT Lab Store",icon:"kit",tags:["ESP32","Sensors","Modules"],desc:"Portable kit for IoT and embedded-system projects.",guidelines:"Check all components before returning the kit."}
];

const initialBookings = [
  {id:101,user:"Rahul Sharma",resourceId:1,date:"2026-10-17",start:"10:00",end:"11:00",purpose:"Faculty workshop",status:"Approved",note:"Approved by Campus Admin"},
  {id:102,user:"Aman Verma",resourceId:2,date:"2026-10-17",start:"13:00",end:"14:00",purpose:"DBMS practical",status:"Approved",note:""},
  {id:103,user:"Priya Singh",resourceId:3,date:"2026-10-18",start:"11:00",end:"13:00",purpose:"ML model training",status:"Approved",note:""}
];

const nav = [
  ["dashboard","Dashboard",LayoutDashboard],
  ["resources","Resources",Building2],
  ["bookings","My Bookings",CalendarDays],
  ["history","History",History],
  ["notifications","Alerts",Bell]
];

const today = "2026-10-17";

function App(){
  const [page,setPage] = useState("dashboard");
  const [resources,setResources] = useState(seedResources);
  const [bookings,setBookings] = useState(initialBookings);
  const [selectedResource,setSelectedResource] = useState(null);
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("All");
  const [mobile,setMobile] = useState(false);
  const [toast,setToast] = useState(null);

  useEffect(()=>{ 
    const saved = localStorage.getItem("smartCampusBookings");
    if(saved) setBookings(JSON.parse(saved));
  },[]);
  useEffect(()=>localStorage.setItem("smartCampusBookings",JSON.stringify(bookings)),[bookings]);

  const notify=(msg,type="success")=>{
    setToast({msg,type}); setTimeout(()=>setToast(null),2600);
  };

  const openResource=(r)=>{setSelectedResource(r);setPage("resource");setMobile(false)};
  const go=(p)=>{setPage(p);setSelectedResource(null);setMobile(false)};

  const pending=bookings.filter(b=>b.status==="Pending");
  const upcoming=bookings.filter(b=>b.user==="You" && ["Pending","Approved"].includes(b.status));
  const completed=bookings.filter(b=>b.user==="You" && b.status==="Completed");

  const approve=(id)=>{
    setBookings(bs=>bs.map(b=>b.id===id?{...b,status:"Approved",note:"Approved by Campus Admin"}:b));
    notify("Booking approved successfully.");
  };
  const reject=(id)=>{
    setBookings(bs=>bs.map(b=>b.id===id?{...b,status:"Rejected",note:"Rejected by Campus Admin"}:b));
    notify("Booking rejected.");
  };
  const cancel=(id)=>{
    setBookings(bs=>bs.map(b=>b.id===id?{...b,status:"Cancelled"}:b));
    notify("Booking cancelled.","info");
  };

  return <div className="app">
    <aside className={"sidebar "+(mobile?"mobile-open":"")}>
      <div className="brand"><div className="brand-mark"><Building2 size={20}/></div><div><b>SmartCampus</b><span>RESOURCE HUB</span></div></div>
      <div className="nav-label">MAIN MENU</div>
      {nav.map(([id,label,Icon])=><button key={id} className={"nav-item "+(page===id?"active":"")} onClick={()=>go(id)}><Icon size={19}/><span>{label}</span>{id==="notifications"&&<em>3</em>}</button>)}
      <div className="nav-label admin-label">ADMIN</div>
      <button className={"nav-item "+(page==="admin"?"active":"")} onClick={()=>go("admin")}><Settings size={19}/><span>Admin Control</span></button>
      <div className="sidebar-bottom"><div className="mini-avatar">SM</div><div><b>Surendra Meena</b><span>Student</span></div><ChevronRight size={16}/></div>
    </aside>

    {mobile && <div className="overlay" onClick={()=>setMobile(false)}/>}
    <main className="main">
      <header className="topbar">
        <button className="mobile-menu" onClick={()=>setMobile(true)}><Menu/></button>
        <div className="top-search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search rooms, labs, equipment..."/></div>
        <div className="top-actions"><button className="icon-btn" onClick={()=>go("notifications")}><Bell size={19}/><i/></button><div className="user-chip"><div className="avatar">SM</div><div><b>Surendra</b><span>Student</span></div></div></div>
      </header>

      {page==="dashboard" && <Dashboard resources={resources} upcoming={upcoming} openResource={openResource} go={go}/>}
      {page==="resources" && <Resources resources={resources} search={search} filter={filter} setFilter={setFilter} openResource={openResource}/>}
      {page==="resource" && selectedResource && <ResourceDetails resource={selectedResource} bookings={bookings} onBack={()=>go("resources")} onBook={(b)=>{setBookings(bs=>[...bs,b]);notify("Booking request submitted.");go("bookings")}}/>}
      {page==="bookings" && <Bookings bookings={bookings.filter(b=>b.user==="You")} onCancel={cancel} go={go}/>}
      {page==="history" && <HistoryPage bookings={bookings.filter(b=>b.user==="You")}/>}
      {page==="notifications" && <Notifications bookings={bookings}/>}
      {page==="admin" && <Admin bookings={bookings} resources={resources} approve={approve} reject={reject} notify={notify}/>}
    </main>
    {toast&&<div className={"toast "+toast.type}>{toast.type==="success"?<CheckCircle2/>:<AlertCircle/>}{toast.msg}</div>}
  </div>
}

function Dashboard({resources,upcoming,openResource,go}){
 return <section className="content">
  <div className="hero"><div><div className="eyebrow">SATURDAY, OCTOBER 17, 2026</div><h1>Good morning, Surendra <span>👋</span></h1><p>Find a campus resource, check availability, and reserve it in a few clicks.</p><div className="hero-actions"><button className="primary" onClick={()=>go("resources")}><Plus size={18}/> New Reservation</button><button className="secondary" onClick={()=>go("bookings")}>View my bookings <ChevronRight size={16}/></button></div></div><div className="hero-art"><div className="art-circle"/><Building2 size={74}/></div></div>
  <div className="stats">
    <Stat icon={CalendarDays} label="Upcoming" value={upcoming.length} hint="Active reservations"/>
    <Stat icon={Clock3} label="Pending" value={upcoming.filter(x=>x.status==="Pending").length} hint="Awaiting approval"/>
    <Stat icon={CheckCircle2} label="Completed" value="12" hint="This semester"/>
    <Stat icon={Building2} label="Resources" value={resources.length} hint="Available to book"/>
  </div>
  <div className="section-head"><div><h2>Popular resources</h2><p>Quick access to frequently used campus spaces and equipment.</p></div><button className="text-btn" onClick={()=>go("resources")}>View all <ChevronRight size={16}/></button></div>
  <div className="resource-grid">{resources.slice(0,3).map(r=><ResourceCard key={r.id} r={r} open={openResource}/>)}</div>
  <div className="section-head upcoming-head"><div><h2>Upcoming reservations</h2><p>Your next scheduled campus resources.</p></div></div>
  <div className="booking-strip">{upcoming.length?upcoming.slice(0,2).map(b=><BookingMini key={b.id} b={b} resource={resources.find(r=>r.id===b.resourceId)}/>):<Empty text="No upcoming reservations yet."/>}</div>
 </section>
}

function Stat({icon:Icon,label,value,hint}){return <div className="stat-card"><div className="stat-icon"><Icon size={20}/></div><div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div></div>}

function ResourceCard({r,open}){return <div className="resource-card"><div className={"resource-image "+r.icon}><div className="resource-icon">{r.icon==="gpu"?<Cpu/>:r.icon==="lab"?<FlaskConical/>:r.icon==="kit"?<Monitor/>:<Building2/>}</div><span className="available"><i/> Available</span></div><div className="resource-body"><div className="card-title"><div><h3>{r.name}</h3><span>{r.type}</span></div><span className="capacity"><Users size={14}/>{r.capacity}</span></div><p>{r.desc}</p><div className="tags">{r.tags.map(t=><span key={t}>{t}</span>)}</div><button className="card-btn" onClick={()=>open(r)}>View & Book <ChevronRight size={16}/></button></div></div>}

function Resources({resources,search,filter,setFilter,openResource}){const filtered=useMemo(()=>resources.filter(r=>(filter==="All"||r.type===filter)&&(r.name+r.type+r.location).toLowerCase().includes(search.toLowerCase())),[resources,search,filter]);return <section className="content"><div className="page-title"><div><div className="eyebrow">RESOURCE DIRECTORY</div><h1>Find a resource</h1><p>Browse rooms, labs and equipment available across campus.</p></div><button className="primary"><Plus size={18}/> Request Resource</button></div><div className="filter-row"><div className="local-search"><Search size={17}/><input value={search} readOnly placeholder="Search resources..."/></div>{["All","Room","Lab","Equipment"].map(x=><button key={x} className={"filter "+(filter===x?"selected":"")} onClick={()=>setFilter(x)}>{x}</button>)}</div><div className="resource-grid all-grid">{filtered.map(r=><ResourceCard key={r.id} r={r} open={openResource}/>)}</div>{!filtered.length&&<Empty text="No resources match your search."/>}</section>}

function ResourceDetails({resource,bookings,onBack,onBook}){const [date,setDate]=useState(today),[start,setStart]=useState("11:00"),[end,setEnd]=useState("12:00"),[purpose,setPurpose]=useState(""),[error,setError]=useState("");const slots=["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"];const busy=(s)=>bookings.some(b=>b.resourceId===resource.id&&b.date===date&&b.status==="Approved"&&s>=b.start&&s<b.end);const submit=()=>{if(!purpose.trim())return setError("Please enter the purpose of your booking.");if(end<=start)return setError("End time must be after start time.");const conflict=bookings.some(b=>b.resourceId===resource.id&&b.date===date&&["Pending","Approved"].includes(b.status)&&start<b.end&&end>b.start);if(conflict)return setError("This time overlaps an existing reservation. Please choose another slot.");onBook({id:Date.now(),user:"You",resourceId:resource.id,date,start,end,purpose,status:"Pending",note:"Awaiting admin approval"});};return <section className="content"><button className="back-btn" onClick={onBack}><ArrowLeft size={17}/> Back to resources</button><div className="detail-layout"><div className="detail-main"><div className={"detail-cover "+resource.icon}><div className="big-icon">{resource.icon==="gpu"?<Cpu/>:resource.icon==="lab"?<FlaskConical/>:resource.icon==="kit"?<Monitor/>:<Building2/>}</div><span className="available"><i/> Available for booking</span></div><div className="detail-info"><div className="detail-heading"><div><span className="type-label">{resource.type}</span><h1>{resource.name}</h1><p><MapPin size={15}/> {resource.location}</p></div><div className="capacity-big"><Users/><b>{resource.capacity}</b><span>capacity</span></div></div><p className="detail-desc">{resource.desc}</p><h3>Facilities & specifications</h3><div className="specs">{resource.tags.map(t=><div key={t}><CheckCircle2 size={16}/>{t}</div>)}</div><h3>Booking guidelines</h3><p className="guidelines">{resource.guidelines}</p></div></div><div className="booking-panel"><div className="panel-label">RESERVE THIS RESOURCE</div><h2>Choose your slot</h2><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><div className="time-row"><label>Start<select value={start} onChange={e=>setStart(e.target.value)}>{slots.map(s=><option key={s}>{s}</option>)}</select></label><label>End<select value={end} onChange={e=>setEnd(e.target.value)}>{slots.map(s=><option key={s}>{s}</option>)}</select></label></div><div className="slot-title">Quick availability</div><div className="slots">{slots.slice(0,6).map(s=><button key={s} disabled={busy(s)} className={busy(s)?"busy":start===s?"chosen":""} onClick={()=>{setStart(s);setEnd(slots[slots.indexOf(s)+1]||"17:00");setError("")}}>{s}<small>{busy(s)?"Booked":"Open"}</small></button>)}</div><label>Purpose<textarea value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="e.g. Project presentation, study session..."/></label>{error&&<div className="error-box"><AlertCircle size={16}/>{error}</div>}<button className="primary full" onClick={submit}>Request Booking <ChevronRight size={17}/></button><small className="approval-note">Your request will be sent to the campus administrator for approval.</small></div></div></section>}

function BookingMini({b,resource}){return <div className="booking-mini"><div className="date-box"><b>{new Date(b.date+"T00:00").getDate()}</b><span>{new Date(b.date+"T00:00").toLocaleString("en",{month:"short"})}</span></div><div><h3>{resource?.name}</h3><p>{b.start} – {b.end} • {b.purpose}</p></div><Status status={b.status}/></div>}

function Bookings({bookings,onCancel,go}){return <section className="content"><div className="page-title"><div><div className="eyebrow">PERSONAL DASHBOARD</div><h1>My bookings</h1><p>Track your reservation requests and upcoming campus access.</p></div><button className="primary" onClick={()=>go("resources")}><Plus size={18}/> New Booking</button></div><div className="booking-list">{bookings.length?bookings.map(b=><BookingRow key={b.id} b={b} onCancel={onCancel}/>):<Empty text="You don't have any bookings yet."/>}</div></section>}

function BookingRow({b,onCancel}){const r=seedResources.find(x=>x.id===b.resourceId);return <div className="booking-row"><div className={"row-icon "+r.icon}>{r.icon==="gpu"?<Cpu/>:r.icon==="lab"?<FlaskConical/>:<Building2/>}</div><div className="row-main"><div className="row-title"><h3>{r.name}</h3><Status status={b.status}/></div><p>{new Date(b.date+"T00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})} • {b.start} – {b.end}</p><small>{b.purpose}</small>{b.note&&<div className="note">💬 {b.note}</div>}</div>{["Pending","Approved"].includes(b.status)&&<button className="cancel-btn" onClick={()=>onCancel(b.id)}><Trash2 size={15}/> Cancel</button>}</div>}

function Status({status}){return <span className={"status "+status.toLowerCase()}>{status==="Approved"?<CheckCircle2/>:status==="Rejected"?<XCircle/>:<Clock3/>}{status}</span>}

function HistoryPage({bookings}){return <section className="content"><div className="page-title"><div><div className="eyebrow">ACTIVITY LOG</div><h1>Booking history</h1><p>A clear record of your previous reservation activity.</p></div></div><div className="history-table"><div className="table-head"><span>RESOURCE</span><span>DATE & TIME</span><span>PURPOSE</span><span>STATUS</span></div>{bookings.map(b=><div className="table-row" key={b.id}><b>{seedResources.find(r=>r.id===b.resourceId)?.name}</b><span>{b.date}<br/>{b.start}–{b.end}</span><span>{b.purpose}</span><Status status={b.status}/></div>)}</div></section>}

function Notifications({bookings}){return <section className="content"><div className="page-title"><div><div className="eyebrow">UPDATES</div><h1>Alerts & notifications</h1><p>Stay informed about reservation status changes.</p></div></div><div className="notifications">{bookings.filter(b=>b.user==="You").map(b=><div className="notification" key={b.id}><div className={"notif-icon "+b.status.toLowerCase()}>{b.status==="Approved"?<CheckCircle2/>:b.status==="Rejected"?<XCircle/>:<Clock3/>}</div><div><b>Booking {b.status}</b><p>{seedResources.find(r=>r.id===b.resourceId)?.name} • {b.date} • {b.start}–{b.end}</p><small>Just now</small></div></div>)}<div className="notification"><div className="notif-icon info"><Bell/></div><div><b>Welcome to SmartCampus</b><p>Use the Resources page to find and reserve campus spaces.</p><small>Today</small></div></div></div></section>}

function Admin({bookings,resources,approve,reject}){const pending=bookings.filter(b=>b.status==="Pending");return <section className="content"><div className="page-title"><div><div className="eyebrow">ADMIN CONTROL</div><h1>Campus operations</h1><p>Review requests, manage resources, and keep schedules conflict-free.</p></div></div><div className="admin-stats"><Stat icon={Clock3} label="Pending requests" value={pending.length} hint="Needs review"/><Stat icon={CalendarDays} label="Today's bookings" value={bookings.filter(b=>b.date===today).length} hint="All resources"/><Stat icon={Building2} label="Resources" value={resources.length} hint="Bookable assets"/></div><div className="admin-panel"><div className="section-head"><div><h2>Pending booking requests</h2><p>Approve or reject requests with a brief note.</p></div><span className="count-pill">{pending.length} pending</span></div>{pending.length?pending.map(b=><div className="request" key={b.id}><div className="mini-avatar">SM</div><div className="request-main"><div><h3>{b.user}</h3><span>requested <b>{resources.find(r=>r.id===b.resourceId)?.name}</b></span></div><p>📅 {b.date} &nbsp; • &nbsp; ⏰ {b.start} – {b.end}</p><small>Purpose: {b.purpose}</small></div><div className="request-actions"><button className="approve" onClick={()=>approve(b.id)}><Check size={16}/> Approve</button><button className="reject" onClick={()=>reject(b.id)}><X size={16}/> Reject</button></div></div>):<Empty text="All booking requests have been reviewed."/>}</div></section>}

function Empty({text}){return <div className="empty"><CalendarDays size={32}/><b>{text}</b></div>}

createRoot(document.getElementById("root")).render(<App/>);

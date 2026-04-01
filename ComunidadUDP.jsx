import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { supabase } from "./src/supabase.js";

const INDUSTRIES = [
    "Minería","Construcción","Oil & Gas","Manufactura",
    "Energía & Utilities","Agua y Saneamiento","Infraestructura",
    "Tecnología","Consultoría","Telecomunicaciones","Logística",
    "Agroindustria","Medio Ambiente","Otro"
];
const CITIES = [
    "Santiago","Antofagasta","Valparaíso","Concepción","La Serena",
    "Iquique","Temuco","Rancagua","Arica","Puerto Montt",
    "Copiapó","Calama","Talca","Otro"
];
const AVAIL = ["Alta","Media","Baja"];

const INITIAL_FORM = {
    nombre:"",telefono:"",correo:"",empresa:"",cargo:"",
    industria:"",ciudad:"",linkedin:"",servicios:"",
    clientes:"",necesidades:"",capacidades:"",disponibilidad:"Media",
    contactable:"Sí",comentarios:""
};

const DEMO = [
    { id:"d1", fecha:"2025-01-15", nombre:"Carlos Mendoza", telefono:"+56 9 8765 4321",
        correo:"cmendoza@ingenieria.cl", empresa:"Codelco", cargo:"Ingeniero de Proyectos Senior",
        industria:"Minería", ciudad:"Antofagasta", linkedin:"linkedin.com/in/cmendoza",
        servicios:"Gestión de proyectos mineros, optimización de procesos extractivos, consultoría en seguridad operacional",
        clientes:"Empresas mineras medianas, consultoras de ingeniería",
        necesidades:"Conexiones con proveedores de tecnología IoT y soluciones de monitoreo remoto para equipos",
        capacidades:"gestión proyectos, minería, seguridad, procesos, PMBOK",
        disponibilidad:"Media", contactable:"Sí", comentarios:"Disponible para reuniones presenciales en Antofagasta" },
    { id:"d2", fecha:"2025-01-22", nombre:"Ana Torres", telefono:"+56 9 7654 3210",
        correo:"atorres@construtech.cl", empresa:"ConstruTech SpA", cargo:"Directora de Innovación",
        industria:"Construcción", ciudad:"Santiago", linkedin:"linkedin.com/in/anatorres",
        servicios:"Implementación BIM, digitalización de obras, capacitación en herramientas digitales para construcción",
        clientes:"Constructoras, desarrolladoras inmobiliarias, empresas de infraestructura",
        necesidades:"Alianzas con empresas de software BIM, acceso a proyectos de construcción sustentable",
        capacidades:"BIM, digitalización, construcción, innovación, capacitación, Revit",
        disponibilidad:"Alta", contactable:"Sí", comentarios:"" },
    { id:"d3", fecha:"2025-02-01", nombre:"Roberto Silva", telefono:"+56 9 6543 2109",
        correo:"rsilva@energiachile.cl", empresa:"Energía Chile SpA", cargo:"Gerente de Ingeniería",
        industria:"Energía & Utilities", ciudad:"Santiago", linkedin:"",
        servicios:"Ingeniería eléctrica, diseño de subestaciones, estudios de factibilidad energética, proyectos ERNC",
        clientes:"Empresas industriales, mineras, organismos de gobierno",
        necesidades:"Expertos en energías renovables especialmente solar y eólica, socios para proyectos de transmisión",
        capacidades:"ingeniería eléctrica, subestaciones, energía, factibilidad, ERNC",
        disponibilidad:"Baja", contactable:"No", comentarios:"Preferir contacto por correo electrónico" },
    { id:"d4", fecha:"2025-02-15", nombre:"Patricia Vega", telefono:"+56 9 5432 1098",
        correo:"pvega@aguaconsult.cl", empresa:"AguaConsult", cargo:"Ingeniera Hidráulica",
        industria:"Agua y Saneamiento", ciudad:"Valparaíso", linkedin:"linkedin.com/in/pvega",
        servicios:"Diseño de sistemas de agua potable y alcantarillado, modelación hidráulica, estudios de impacto ambiental",
        clientes:"Municipios, empresas sanitarias, desarrolladoras inmobiliarias",
        necesidades:"Proyectos de agua potable rural, alianzas con ONG ambientales y organismos públicos",
        capacidades:"hidráulica, agua, saneamiento, modelación, ambiental, EPANET",
        disponibilidad:"Alta", contactable:"Sí", comentarios:"Abierta a proyectos colaborativos en regiones" },
    { id:"d5", fecha:"2025-02-28", nombre:"Diego Romero", telefono:"+56 9 4321 0987",
        correo:"dromero@iotindustrial.cl", empresa:"IoT Industrial Chile", cargo:"CTO y Cofundador",
        industria:"Tecnología", ciudad:"Santiago", linkedin:"linkedin.com/in/dromero",
        servicios:"Soluciones IoT para industria, sensores y monitoreo remoto, integración con sistemas SCADA y automatización",
        clientes:"Industria minera, manufactura, plantas de proceso, Oil & Gas",
        necesidades:"Pilotos en nuevas industrias, distribuidores regionales, ingenieros de procesos con red en minería",
        capacidades:"IoT, SCADA, sensores, automatización, tecnología, monitoreo, industria 4.0",
        disponibilidad:"Alta", contactable:"Sí", comentarios:"Buscamos activamente socios estratégicos para escalar" },
    { id:"d6", fecha:"2025-03-05", nombre:"Fernanda Lagos", telefono:"+56 9 3210 9876",
        correo:"flagos@geodata.cl", empresa:"GeoData Ingeniería", cargo:"Jefa de Proyectos GIS",
        industria:"Infraestructura", ciudad:"Concepción", linkedin:"linkedin.com/in/flagos",
        servicios:"Modelamiento geoespacial, análisis GIS, cartografía de riesgo, estudios de territorio para infraestructura vial",
        clientes:"Ministerio de Obras Públicas, empresas viales, inmobiliarias, consultoras ambientales",
        necesidades:"Conexiones con empresas de drones y fotogrametría, proyectos de infraestructura en el sur",
        capacidades:"GIS, geoespacial, cartografía, infraestructura, riesgo, ArcGIS, QGIS",
        disponibilidad:"Media", contactable:"Sí", comentarios:"" }
];

function initials(name) {
    return name.split(" ").slice(0,2).map(n=>n[0]).join("").toUpperCase();
}
function availColor(a) {
    if(a==="Alta") return {bg:"#d1fae5",text:"#065f46"};
    if(a==="Media") return {bg:"#fef3c7",text:"#92400e"};
    return {bg:"#fee2e2",text:"#991b1b"};
}
const AVATARCOLORS=["#3b82f6","#8b5cf6","#0d9488","#f97316","#ec4899","#6366f1","#10b981","#f59e0b"];
function avatarColor(name){return AVATARCOLORS[name.charCodeAt(0)%AVATARCOLORS.length];}

function Avatar({name,size=40}){
    return(
        <div style={{width:size,height:size,borderRadius:"50%",background:avatarColor(name),
            display:"flex",alignItems:"center",justifyContent:"center",
            color:"#fff",fontWeight:700,fontSize:size*0.35,flexShrink:0}}>
            {initials(name)}
        </div>
    );
}

function Field({label,error,children}){
    return(
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <label style={{fontSize:11,fontWeight:600,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</label>
            {children}
            {error&&<span style={{fontSize:11,color:"#f87171"}}>{error}</span>}
        </div>
    );
}

const inp = (err)=>({
    background:"#1e293b",color:"#e2e8f0",border:`1px solid ${err?"#f87171":"#334155"}`,
    borderRadius:8,padding:"8px 12px",fontSize:13,outline:"none",
    width:"100%",boxSizing:"border-box",fontFamily:"inherit"
});

export default function RedIng(){
    const [view,setView]=useState("landing");
    const [members,setMembers]=useState([]);
    const [loading,setLoading]=useState(true);
    const [form,setForm]=useState(INITIAL_FORM);
    const [errors,setErrors]=useState({});
    const [done,setDone]=useState(false);
    const [search,setSearch]=useState("");
    const [fInd,setFInd]=useState("");
    const [fCiu,setFCiu]=useState("");
    const [fDisp,setFDisp]=useState("");
    const [selected,setSelected]=useState(null);
    const [tab,setTab]=useState("directorio");

    useEffect(()=>{
        (async()=>{
            try{
                const {data,error}=await supabase.from("members").select("*").order("fecha",{ascending:true});
                if(error) throw error;
                if(data.length===0){
                    await supabase.from("members").insert(DEMO);
                    setMembers(DEMO);
                } else {
                    setMembers(data);
                }
            }catch{ setMembers(DEMO); }
            setLoading(false);
        })();
    },[]);

    const fc=(f,v)=>{setForm(p=>({...p,[f]:v}));if(errors[f])setErrors(p=>({...p,[f]:""}));};

    const validate=()=>{
        const req=["nombre","telefono","correo","empresa","cargo","industria","ciudad","servicios","clientes","necesidades","capacidades"];
        const e={};
        req.forEach(f=>{if(!form[f].trim())e[f]="Requerido";});
        if(form.correo&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))e.correo="Correo inválido";
        return e;
    };

    const submit=async()=>{
        const e=validate();
        if(Object.keys(e).length){setErrors(e);
            document.getElementById("regform")?.scrollTo({top:0,behavior:"smooth"});
            return;}
        const m={...form,id:`m${Date.now()}`,fecha:new Date().toISOString().split("T")[0]};
        try{await supabase.from("members").insert([m]);}catch{}
        setMembers(prev=>[...prev,m]);
        setForm(INITIAL_FORM);setDone(true);
    };

    const filtered=members.filter(m=>{
        const t=search.toLowerCase();
        const ms=!t||[m.nombre,m.empresa,m.capacidades,m.servicios,m.cargo].some(s=>s.toLowerCase().includes(t));
        return ms&&(!fInd||m.industria===fInd)&&(!fCiu||m.ciudad===fCiu)&&(!fDisp||m.disponibilidad===fDisp);
    });

    const opportunities=[];
    members.forEach(seeker=>{
        members.forEach(provider=>{
            if(seeker.id===provider.id)return;
            const needs=seeker.necesidades.toLowerCase();
            const offer=(provider.servicios+" "+provider.capacidades).toLowerCase();
            const kws=offer.split(/[\s,]+/).filter(k=>k.length>4);
            const hits=[...new Set(kws.filter(k=>needs.includes(k)))];
            if(hits.length>=2)opportunities.push({seeker,provider,score:hits.length,kws:hits.slice(0,4)});
        });
    });
    opportunities.sort((a,b)=>b.score-a.score);
    const topOpps=opportunities.slice(0,12);

    const exportCSV=()=>{
        const h=["Fecha","Nombre","Teléfono","Correo","Empresa","Cargo","Industria","Ciudad","LinkedIn","Servicios","Clientes","Necesidades","Capacidades","Disponibilidad","Contactable","Comentarios"];
        const rows=members.map(m=>[m.fecha,m.nombre,m.telefono,m.correo,m.empresa,m.cargo,m.industria,m.ciudad,m.linkedin,m.servicios,m.clientes,m.necesidades,m.capacidades,m.disponibilidad,m.contactable,m.comentarios]);
        const csv=[h,...rows].map(r=>r.map(v=>`"${(v||"").replace(/"/g,'""')}"`).join(",")).join("\n");
        const a=document.createElement("a");
        a.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(csv);
        a.download="red-ingenieros.csv";a.click();
    };

    const exportXLS=()=>{
        const h=["Fecha","Nombre","Teléfono","Correo","Empresa","Cargo","Industria","Ciudad","LinkedIn","Servicios","Clientes","Necesidades","Capacidades","Disponibilidad","Contactable","Comentarios"];
        const d=[h,...members.map(m=>[m.fecha,m.nombre,m.telefono,m.correo,m.empresa,m.cargo,m.industria,m.ciudad,m.linkedin,m.servicios,m.clientes,m.necesidades,m.capacidades,m.disponibilidad,m.contactable,m.comentarios])];
        const ws=XLSX.utils.aoa_to_sheet(d);
        ws["!cols"]=h.map((_,i)=>({wch:i<4?18:i<8?16:30}));
        const wb=XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb,ws,"Red Ingenieros");
        XLSX.writeFile(wb,"red-ingenieros.xlsx");
    };

    const S={
        root:{minHeight:"100vh",background:"#020b18",fontFamily:"system-ui,-apple-system,sans-serif",color:"#e2e8f0"},
        nav:{background:"#0a1628",borderBottom:"1px solid #1e3a5f",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:52,position:"sticky",top:0,zIndex:100},
        navBrand:{display:"flex",alignItems:"center",gap:10},
        logo:{width:32,height:32,background:"#f59e0b",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:"#000"},
        brandName:{fontWeight:800,fontSize:16,color:"#fff",letterSpacing:"-0.02em"},
        brandSub:{fontSize:11,color:"#64748b",marginLeft:4},
        navBtns:{display:"flex",alignItems:"center",gap:8},
        navBtn:(active)=>({padding:"6px 14px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",border:"none",
            background:active?"#f59e0b":"transparent",color:active?"#000":"#94a3b8",
            transition:"all 0.15s"}),
        primaryBtn:{background:"#f59e0b",color:"#000",border:"none",padding:"8px 18px",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer"},
    };

    if(loading) return(
        <div style={{...S.root,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{textAlign:"center"}}>
                <div style={{...S.logo,margin:"0 auto 12px",width:48,height:48,fontSize:22}}>⬡</div>
                <p style={{color:"#f59e0b",fontWeight:600}}>Cargando RedIng...</p>
            </div>
        </div>
    );

    if(done) return(
        <div style={{...S.root,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#0d1e36",border:"1px solid #1e3a5f",borderRadius:20,padding:32,maxWidth:400,width:"100%",textAlign:"center"}}>
                <div style={{width:64,height:64,background:"#059669",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28}}>✓</div>
                <h2 style={{color:"#fff",fontSize:22,fontWeight:800,margin:"0 0 8px"}}>¡Ya eres parte de la Red!</h2>
                <p style={{color:"#64748b",fontSize:14,marginBottom:24,lineHeight:1.6}}>Tu perfil fue registrado exitosamente. Ya apareces en el directorio y el sistema de matching.</p>
                <button onClick={()=>{setDone(false);setTab("directorio");setView("directory");}} style={{...S.primaryBtn,width:"100%",padding:"12px 0",fontSize:15,borderRadius:12}}>
                    Ver el Directorio →
                </button>
            </div>
        </div>
    );

    if(selected){
        const m=selected;
        const ac=availColor(m.disponibilidad);
        return(
            <div style={S.root}>
                <nav style={S.nav}>
                    <div style={S.navBrand}>
                        <div style={S.logo}>⬡</div>
                        <span style={S.brandName}>RedIng</span>
                    </div>
                    <button onClick={()=>setSelected(null)} style={{...S.primaryBtn,background:"#1e293b",color:"#94a3b8",border:"1px solid #334155"}}>← Volver</button>
                </nav>
                <div style={{maxWidth:680,margin:"0 auto",padding:"24px 16px"}}>
                    <div style={{background:"#0d1e36",border:"1px solid #1e3a5f",borderRadius:20,padding:24}}>
                        <div style={{display:"flex",gap:16,alignItems:"flex-start",marginBottom:20}}>
                            <Avatar name={m.nombre} size={52}/>
                            <div style={{flex:1}}>
                                <h2 style={{margin:0,fontSize:20,fontWeight:800,color:"#fff"}}>{m.nombre}</h2>
                                <p style={{margin:"2px 0",fontSize:14,color:"#94a3b8"}}>{m.cargo} · {m.empresa}</p>
                                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
                                    <span style={{fontSize:11,background:"#1e3a5f",color:"#93c5fd",padding:"2px 8px",borderRadius:20}}>{m.industria}</span>
                                    <span style={{fontSize:11,background:"#1e3a5f",color:"#93c5fd",padding:"2px 8px",borderRadius:20}}>{m.ciudad}</span>
                                    <span style={{fontSize:11,background:ac.bg,color:ac.text,padding:"2px 8px",borderRadius:20,fontWeight:700}}>Disponibilidad: {m.disponibilidad}</span>
                                    {m.contactable==="Sí"&&<span style={{fontSize:11,background:"#d1fae5",color:"#065f46",padding:"2px 8px",borderRadius:20,fontWeight:700}}>✓ Contactable</span>}
                                </div>
                            </div>
                        </div>

                        {m.contactable==="Sí"&&(
                            <div style={{background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:12,padding:16,marginBottom:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                                <div><p style={{fontSize:10,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Teléfono</p><p style={{margin:0,fontSize:14,color:"#e2e8f0",fontWeight:600}}>{m.telefono}</p></div>
                                <div><p style={{fontSize:10,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Correo</p><p style={{margin:0,fontSize:14,color:"#e2e8f0",fontWeight:600,wordBreak:"break-all"}}>{m.correo}</p></div>
                                {m.linkedin&&<div style={{gridColumn:"1/-1"}}><p style={{fontSize:10,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>LinkedIn</p><p style={{margin:0,fontSize:14,color:"#f59e0b"}}>{m.linkedin}</p></div>}
                            </div>
                        )}

                        {[
                            {label:"Servicios que ofrece",content:m.servicios,accent:"#f59e0b"},
                            {label:"Qué necesita actualmente",content:m.necesidades,accent:"#60a5fa"},
                            {label:"Tipo de clientes que busca",content:m.clientes,accent:"#94a3b8"},
                        ].map((s,i)=>(
                            <div key={i} style={{background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:12,padding:16,marginBottom:12}}>
                                <p style={{fontSize:10,color:s.accent,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:700,marginBottom:8,margin:"0 0 8px"}}>{s.label}</p>
                                <p style={{margin:0,fontSize:13,color:"#cbd5e1",lineHeight:1.7}}>{s.content}</p>
                            </div>
                        ))}

                        <div style={{background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:12,padding:16,marginBottom:12}}>
                            <p style={{fontSize:10,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:700,margin:"0 0 10px"}}>Capacidades clave</p>
                            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                                {m.capacidades.split(",").map((c,i)=>(
                                    <span key={i} style={{background:"#1e3a5f",color:"#93c5fd",fontSize:12,padding:"4px 10px",borderRadius:20}}>{c.trim()}</span>
                                ))}
                            </div>
                        </div>

                        {m.comentarios&&(
                            <div style={{background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:12,padding:16,marginBottom:12}}>
                                <p style={{fontSize:10,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:700,margin:"0 0 8px"}}>Comentarios adicionales</p>
                                <p style={{margin:0,fontSize:13,color:"#cbd5e1",lineHeight:1.7}}>{m.comentarios}</p>
                            </div>
                        )}
                        <p style={{fontSize:11,color:"#334155",marginTop:8}}>Registrado el {m.fecha}</p>
                    </div>
                </div>
            </div>
        );
    }

    return(
        <div style={S.root}>
            {/* NAV */}
            <nav style={S.nav}>
                <div style={S.navBrand}>
                    <div style={S.logo}>⬡</div>
                    <span style={S.brandName}>RedIng</span>
                    <span style={S.brandSub}> Red Colaborativa</span>
                </div>
                <div style={S.navBtns}>
                    {view!=="landing"&&<>
                        <button onClick={()=>{setTab("directorio");setView("directory");}} style={S.navBtn(view==="directory"&&tab==="directorio")}>Directorio</button>
                        <button onClick={()=>{setTab("oportunidades");setView("directory");}} style={S.navBtn(view==="directory"&&tab==="oportunidades")}>Oportunidades</button>
                    </>}
                    <button onClick={()=>setView("register")} style={S.primaryBtn}>+ Registrarse</button>
                </div>
            </nav>

            {/* LANDING */}
            {view==="landing"&&(
                <div>
                    <div style={{background:"linear-gradient(180deg,#0a1628 0%,#020b18 100%)",padding:"64px 16px",textAlign:"center"}}>
                        <div style={{maxWidth:640,margin:"0 auto"}}>
                            <p style={{fontSize:11,color:"#f59e0b",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:16}}>Red Colaborativa Privada · Solo Ingenieros</p>
                            <h1 style={{fontSize:"clamp(28px,5vw,48px)",fontWeight:900,color:"#fff",margin:"0 0 16px",lineHeight:1.15,letterSpacing:"-0.03em"}}>
                                Conecta con ingenieros<br/><span style={{color:"#f59e0b"}}>que generan resultados</span>
                            </h1>
                            <p style={{fontSize:16,color:"#64748b",marginBottom:32,lineHeight:1.7,maxWidth:480,margin:"0 auto 32px"}}>
                                Una red privada donde ingenieros comparten oportunidades reales, forman alianzas estratégicas y construyen negocios juntos.
                            </p>
                            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
                                <button onClick={()=>setView("register")} style={{...S.primaryBtn,padding:"14px 32px",fontSize:15,borderRadius:12}}>Únete a la Red →</button>
                                <button onClick={()=>{setTab("directorio");setView("directory");}} style={{padding:"14px 32px",fontSize:15,borderRadius:12,background:"transparent",border:"1px solid #1e3a5f",color:"#94a3b8",cursor:"pointer",fontWeight:600}}>Ver Directorio</button>
                            </div>
                        </div>
                    </div>

                    <div style={{maxWidth:800,margin:"0 auto",padding:"40px 16px"}}>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:40}}>
                            {[
                                {val:members.length,label:"Miembros"},
                                {val:[...new Set(members.map(m=>m.industria))].length,label:"Industrias"},
                                {val:[...new Set(members.map(m=>m.ciudad))].length,label:"Ciudades"},
                            ].map((s,i)=>(
                                <div key={i} style={{background:"#0d1e36",border:"1px solid #1e3a5f",borderRadius:16,padding:"24px 16px",textAlign:"center"}}>
                                    <p style={{fontSize:36,fontWeight:900,color:"#f59e0b",margin:0}}>{s.val}</p>
                                    <p style={{fontSize:13,color:"#64748b",margin:"4px 0 0"}}>{s.label}</p>
                                </div>
                            ))}
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16}}>
                            {[
                                {icon:"◎",t:"Directorio Filtrable",d:"Busca por industria, ciudad, capacidades y disponibilidad en tiempo real"},
                                {icon:"⟳",t:"Matching de Oportunidades",d:"Detecta automáticamente quién ofrece lo que otros necesitan"},
                                {icon:"↓",t:"Exportar Base de Datos",d:"Descarga el directorio completo en CSV o Excel con un clic"},
                            ].map((f,i)=>(
                                <div key={i} style={{background:"#0d1e36",border:"1px solid #1e3a5f",borderRadius:16,padding:20}}>
                                    <div style={{fontSize:24,color:"#f59e0b",marginBottom:10}}>{f.icon}</div>
                                    <h3 style={{margin:"0 0 8px",fontSize:14,fontWeight:700,color:"#e2e8f0"}}>{f.t}</h3>
                                    <p style={{margin:0,fontSize:13,color:"#64748b",lineHeight:1.6}}>{f.d}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* REGISTER */}
            {view==="register"&&(
                <div style={{maxWidth:640,margin:"0 auto",padding:"24px 16px 48px"}} id="regform">
                    <div style={{marginBottom:20}}>
                        <h2 style={{margin:0,fontSize:22,fontWeight:900,color:"#fff"}}>Únete a la Red</h2>
                        <p style={{margin:"4px 0 0",color:"#64748b",fontSize:13}}>Completa tu perfil para ser parte de la comunidad. Tiempo estimado: 2 minutos.</p>
                    </div>
                    <div style={{background:"#0d1e36",border:"1px solid #1e3a5f",borderRadius:20,padding:24,display:"flex",flexDirection:"column",gap:20}}>

                        {/* Datos de contacto */}
                        <Section title="Datos de Contacto">
                            <Grid>
                                <Field label="Nombre completo *" error={errors.nombre}>
                                    <input style={inp(errors.nombre)} value={form.nombre} onChange={e=>fc("nombre",e.target.value)} placeholder="Ej: Carlos Mendoza"/>
                                </Field>
                                <Field label="Teléfono *" error={errors.telefono}>
                                    <input style={inp(errors.telefono)} value={form.telefono} onChange={e=>fc("telefono",e.target.value)} placeholder="+56 9 1234 5678"/>
                                </Field>
                                <Field label="Correo electrónico *" error={errors.correo}>
                                    <input style={inp(errors.correo)} value={form.correo} onChange={e=>fc("correo",e.target.value)} placeholder="nombre@empresa.cl"/>
                                </Field>
                                <Field label="LinkedIn (opcional)" error="">
                                    <input style={inp("")} value={form.linkedin} onChange={e=>fc("linkedin",e.target.value)} placeholder="linkedin.com/in/tu-perfil"/>
                                </Field>
                            </Grid>
                        </Section>

                        {/* Perfil profesional */}
                        <Section title="Perfil Profesional">
                            <Grid>
                                <Field label="Empresa *" error={errors.empresa}>
                                    <input style={inp(errors.empresa)} value={form.empresa} onChange={e=>fc("empresa",e.target.value)} placeholder="Nombre de tu empresa"/>
                                </Field>
                                <Field label="Cargo *" error={errors.cargo}>
                                    <input style={inp(errors.cargo)} value={form.cargo} onChange={e=>fc("cargo",e.target.value)} placeholder="Ej: Gerente de Proyectos"/>
                                </Field>
                                <Field label="Industria principal *" error={errors.industria}>
                                    <select style={inp(errors.industria)} value={form.industria} onChange={e=>fc("industria",e.target.value)}>
                                        <option value="">Selecciona industria</option>
                                        {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
                                    </select>
                                </Field>
                                <Field label="Ciudad *" error={errors.ciudad}>
                                    <select style={inp(errors.ciudad)} value={form.ciudad} onChange={e=>fc("ciudad",e.target.value)}>
                                        <option value="">Selecciona ciudad</option>
                                        {CITIES.map(c=><option key={c}>{c}</option>)}
                                    </select>
                                </Field>
                            </Grid>
                        </Section>

                        {/* Propuesta de valor */}
                        <Section title="Propuesta de Valor">
                            <div style={{display:"flex",flexDirection:"column",gap:12}}>
                                <Field label="¿Qué servicios ofreces? *" error={errors.servicios}>
                                    <textarea style={{...inp(errors.servicios),height:72,resize:"none"}} value={form.servicios} onChange={e=>fc("servicios",e.target.value)} placeholder="Describe los servicios o expertise que puedes aportar a la red..."/>
                                </Field>
                                <Field label="¿Qué tipo de clientes buscas? *" error={errors.clientes}>
                                    <textarea style={{...inp(errors.clientes),height:56,resize:"none"}} value={form.clientes} onChange={e=>fc("clientes",e.target.value)} placeholder="Ej: Empresas mineras medianas, startups tecnológicas..."/>
                                </Field>
                                <Field label="¿Qué necesitas actualmente? *" error={errors.necesidades}>
                                    <textarea style={{...inp(errors.necesidades),height:56,resize:"none"}} value={form.necesidades} onChange={e=>fc("necesidades",e.target.value)} placeholder="Ej: Expertos en automatización, socios para proyectos internacionales..."/>
                                </Field>
                                <Field label="Capacidades clave (separadas por coma) *" error={errors.capacidades}>
                                    <input style={inp(errors.capacidades)} value={form.capacidades} onChange={e=>fc("capacidades",e.target.value)} placeholder="Ej: gestión proyectos, BIM, hidráulica, IoT, minería"/>
                                </Field>
                            </div>
                        </Section>

                        {/* Preferencias */}
                        <Section title="Preferencias de Contacto">
                            <Grid>
                                <Field label="Disponibilidad" error="">
                                    <select style={inp("")} value={form.disponibilidad} onChange={e=>fc("disponibilidad",e.target.value)}>
                                        {AVAIL.map(a=><option key={a}>{a}</option>)}
                                    </select>
                                </Field>
                                <Field label="¿Puede ser contactado directamente?" error="">
                                    <select style={inp("")} value={form.contactable} onChange={e=>fc("contactable",e.target.value)}>
                                        <option>Sí</option><option>No</option>
                                    </select>
                                </Field>
                            </Grid>
                            <div style={{marginTop:12}}>
                                <Field label="Comentarios adicionales" error="">
                                    <textarea style={{...inp(""),height:56,resize:"none"}} value={form.comentarios} onChange={e=>fc("comentarios",e.target.value)} placeholder="Cualquier información adicional relevante..."/>
                                </Field>
                            </div>
                        </Section>

                        <button onClick={submit} style={{...S.primaryBtn,padding:"14px 0",fontSize:15,borderRadius:12,width:"100%",marginTop:4}}>
                            Registrarme en la Red →
                        </button>
                    </div>
                </div>
            )}

            {/* DIRECTORY / OPPORTUNITIES */}
            {view==="directory"&&(
                <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 16px"}}>
                    {/* Tabs */}
                    <div style={{display:"flex",gap:8,marginBottom:20}}>
                        {[
                            {id:"directorio",label:`Directorio (${members.length})`},
                            {id:"oportunidades",label:`Oportunidades (${topOpps.length})`}
                        ].map(t=>(
                            <button key={t.id} onClick={()=>setTab(t.id)} style={{
                                padding:"8px 18px",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",border:"none",
                                background:tab===t.id?"#f59e0b":"#0d1e36",
                                color:tab===t.id?"#000":"#94a3b8",
                                outline:tab!==t.id?"1px solid #1e3a5f":"none"
                            }}>{t.label}</button>
                        ))}
                    </div>

                    {tab==="directorio"&&(
                        <div>
                            {/* Filters */}
                            <div style={{background:"#0d1e36",border:"1px solid #1e3a5f",borderRadius:16,padding:16,marginBottom:20}}>
                                <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:10,marginBottom:12}}>
                                    <input style={{...inp(""),gridColumn:"span 1"}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre, empresa, capacidades..."/>
                                    <select style={inp("")} value={fInd} onChange={e=>setFInd(e.target.value)}>
                                        <option value="">Todas las industrias</option>
                                        {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
                                    </select>
                                    <select style={inp("")} value={fCiu} onChange={e=>setFCiu(e.target.value)}>
                                        <option value="">Todas las ciudades</option>
                                        {CITIES.map(c=><option key={c}>{c}</option>)}
                                    </select>
                                    <select style={inp("")} value={fDisp} onChange={e=>setFDisp(e.target.value)}>
                                        <option value="">Disponibilidad</option>
                                        {AVAIL.map(a=><option key={a}>{a}</option>)}
                                    </select>
                                </div>
                                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                                    <span style={{fontSize:12,color:"#64748b"}}>{filtered.length} miembro{filtered.length!==1?"s":""} encontrado{filtered.length!==1?"s":""}</span>
                                    <div style={{display:"flex",gap:8}}>
                                        <button onClick={exportCSV} style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,background:"#1e293b",border:"1px solid #334155",color:"#94a3b8",cursor:"pointer"}}>↓ CSV</button>
                                        <button onClick={exportXLS} style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,background:"#1e293b",border:"1px solid #334155",color:"#94a3b8",cursor:"pointer"}}>↓ Excel</button>
                                    </div>
                                </div>
                            </div>

                            {/* Cards */}
                            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
                                {filtered.map(m=>{
                                    const ac=availColor(m.disponibilidad);
                                    return(
                                        <div key={m.id} onClick={()=>setSelected(m)} style={{
                                            background:"#0d1e36",border:"1px solid #1e3a5f",borderRadius:16,padding:18,cursor:"pointer",
                                            transition:"border-color 0.15s",
                                        }}
                                             onMouseEnter={e=>e.currentTarget.style.borderColor="#f59e0b"}
                                             onMouseLeave={e=>e.currentTarget.style.borderColor="#1e3a5f"}>
                                            <div style={{display:"flex",gap:12,marginBottom:12}}>
                                                <Avatar name={m.nombre} size={44}/>
                                                <div style={{flex:1,minWidth:0}}>
                                                    <p style={{margin:0,fontSize:15,fontWeight:700,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.nombre}</p>
                                                    <p style={{margin:"2px 0",fontSize:12,color:"#64748b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.cargo}</p>
                                                    <p style={{margin:0,fontSize:12,color:"#f59e0b",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.empresa}</p>
                                                </div>
                                            </div>
                                            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                                                <span style={{fontSize:10,background:"#1e3a5f",color:"#93c5fd",padding:"2px 8px",borderRadius:20}}>{m.industria}</span>
                                                <span style={{fontSize:10,background:"#1e3a5f",color:"#93c5fd",padding:"2px 8px",borderRadius:20}}>{m.ciudad}</span>
                                                <span style={{fontSize:10,background:ac.bg,color:ac.text,padding:"2px 8px",borderRadius:20,fontWeight:700}}>{m.disponibilidad}</span>
                                            </div>
                                            <p style={{margin:"0 0 8px",fontSize:12,color:"#64748b",lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{m.servicios}</p>
                                            <p style={{margin:0,fontSize:11,color:"#f59e0b59",fontStyle:"italic"}}>Ver perfil completo →</p>
                                        </div>
                                    );
                                })}
                            </div>
                            {filtered.length===0&&(
                                <div style={{textAlign:"center",padding:"48px 0",color:"#334155"}}>
                                    <p style={{fontSize:32,marginBottom:8}}>◎</p>
                                    <p>No se encontraron miembros con esos filtros</p>
                                </div>
                            )}
                        </div>
                    )}

                    {tab==="oportunidades"&&(
                        <div>
                            <div style={{background:"#0d1e36",border:"1px solid #1e3a5f",borderRadius:14,padding:14,marginBottom:20}}>
                                <p style={{margin:0,fontSize:13,color:"#64748b",lineHeight:1.6}}>
                                    El sistema detecta coincidencias entre los servicios/capacidades de un miembro y las necesidades actuales de otro, identificando oportunidades concretas de negocio y colaboración.
                                </p>
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:16}}>
                                {topOpps.map((opp,i)=>(
                                    <div key={i} style={{background:"#0d1e36",border:"1px solid #1e3a5f",borderRadius:16,padding:16}}>
                                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                      <span style={{fontSize:11,background:"#fef3c7",color:"#92400e",fontWeight:800,padding:"3px 10px",borderRadius:20}}>
                        {opp.score} coincidencias
                      </span>
                                            <div style={{height:1,flex:1,background:"#1e3a5f"}}/>
                                        </div>
                                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                                            <div style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:12,padding:14}}>
                                                <p style={{fontSize:10,color:"#60a5fa",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 10px"}}>Necesita</p>
                                                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                                                    <Avatar name={opp.seeker.nombre} size={34}/>
                                                    <div>
                                                        <p style={{margin:0,fontSize:13,fontWeight:700,color:"#fff"}}>{opp.seeker.nombre}</p>
                                                        <p style={{margin:0,fontSize:11,color:"#64748b"}}>{opp.seeker.empresa}</p>
                                                    </div>
                                                </div>
                                                <p style={{margin:0,fontSize:12,color:"#94a3b8",lineHeight:1.6}}>{opp.seeker.necesidades}</p>
                                            </div>
                                            <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:12,padding:14}}>
                                                <p style={{fontSize:10,color:"#34d399",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 10px"}}>Puede Ofrecer</p>
                                                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                                                    <Avatar name={opp.provider.nombre} size={34}/>
                                                    <div>
                                                        <p style={{margin:0,fontSize:13,fontWeight:700,color:"#fff"}}>{opp.provider.nombre}</p>
                                                        <p style={{margin:0,fontSize:11,color:"#64748b"}}>{opp.provider.empresa}</p>
                                                    </div>
                                                </div>
                                                <p style={{margin:0,fontSize:12,color:"#94a3b8",lineHeight:1.6}}>{opp.provider.servicios}</p>
                                            </div>
                                        </div>
                                        <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                                            <span style={{fontSize:11,color:"#475569"}}>Términos en común:</span>
                                            {opp.kws.map((k,j)=>(
                                                <span key={j} style={{fontSize:11,background:"rgba(245,158,11,0.15)",color:"#f59e0b",padding:"2px 8px",borderRadius:20}}>{k}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {topOpps.length===0&&(
                                    <div style={{textAlign:"center",padding:"48px 0",color:"#334155"}}>
                                        <p style={{fontSize:32,marginBottom:8}}>⟳</p>
                                        <p>Registra más miembros para detectar oportunidades de matching</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function Section({title,children}){
    return(
        <div>
            <p style={{fontSize:10,color:"#f59e0b",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 14px",paddingBottom:10,borderBottom:"1px solid #1e3a5f"}}>{title}</p>
            {children}
        </div>
    );
}
function Grid({children}){
    return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>{children}</div>;
}

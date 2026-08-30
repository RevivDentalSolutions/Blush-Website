"use client";
import Link from "next/link";
import {useState} from "react";
import {site} from "@/data/site";
const links=[["Permanent Makeup","/permanent-makeup"],["Brows","/powder-brows"],["Lip Blush","/lip-blushing"],["Eyeliner","/permanent-eyeliner"],["Portfolio","/portfolio"],["About","/about"],["Contact","/contact"]];
export function Header(){const [open,setOpen]=useState(false);return <header className="site-header"><div className="nav-shell"><Link className="wordmark" href="/" onClick={()=>setOpen(false)}><span>{site.shortName}</span><small>Ink & Beauty Studio</small></Link><button className="menu-button" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="primary-nav"><span className="sr-only">Toggle menu</span><i/><i/></button><nav id="primary-nav" className={open?"nav-open":""} aria-label="Primary navigation"><ul>{links.map(([l,h])=><li key={h}><Link href={h} onClick={()=>setOpen(false)}>{l}</Link></li>)}</ul><a className="btn btn-dark nav-book" href={site.bookingLink}>Book now</a></nav></div></header>}

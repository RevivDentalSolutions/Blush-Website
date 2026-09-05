"use client";

import {FormEvent, useState} from "react";

const services = ["Powder Brows", "Lip Blushing", "Permanent Eyeliner / Lash Enhancement", "PMU Correction", "ProCell Microchanneling", "Scar Camouflage", "Stretch Mark Revision", "Not sure yet"];

export function LeadCaptureForm(){
  const [status,setStatus] = useState<"idle"|"sending"|"success"|"error">("idle");
  const [message,setMessage] = useState("");

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(status === "sending") return;
    setStatus("sending");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/leads", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...payload,page:window.location.pathname,referrer:document.referrer,utm_source:new URLSearchParams(window.location.search).get("utm_source") ?? "",utm_medium:new URLSearchParams(window.location.search).get("utm_medium") ?? "",utm_campaign:new URLSearchParams(window.location.search).get("utm_campaign") ?? ""})});
      const data = await response.json();
      if(!response.ok) throw new Error(data.error ?? "We could not send your request.");
      event.currentTarget.reset();
      setStatus("success");
      setMessage("Thank you — your consultation request has been received. We’ll be in touch soon.");
    } catch(error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "We could not send your request. Please call or text the studio.");
    }
  }

  return <form className="lead-form" onSubmit={submit}>
    <div className="form-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <div className="form-grid">
      <label>Full name<input name="name" required autoComplete="name"/></label>
      <label>Phone number<input name="phone" required type="tel" autoComplete="tel"/></label>
      <label>Email<input name="email" required type="email" autoComplete="email"/></label>
      <label>Service interest<select name="service_interest" required defaultValue=""><option value="" disabled>Select a service</option>{services.map(service=><option key={service}>{service}</option>)}</select></label>
    </div>
    <label>How can we help?<textarea name="message" rows={5} placeholder="Tell us a little about what you’re considering."/></label>
    <button className="btn btn-dark" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Request a consultation"}</button>
    {message&&<p className={`form-status form-status-${status}`} role="status">{message}</p>}
  </form>
}

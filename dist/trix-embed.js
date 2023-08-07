var N=Object.defineProperty,z=Object.defineProperties;var F=Object.getOwnPropertyDescriptors;var k=Object.getOwnPropertySymbols;var _=Object.prototype.hasOwnProperty,B=Object.prototype.propertyIsEnumerable;var w=(t,e,r)=>e in t?N(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r,A=(t,e)=>{for(var r in e||(e={}))_.call(e,r)&&w(t,r,e[r]);if(k)for(var r of k(e))B.call(e,r)&&w(t,r,e[r]);return t},R=(t,e)=>z(t,F(e));var U=(t,e,r)=>(w(t,typeof e!="symbol"?e+"":e,r),r);var b={name:"AES-GCM",length:256},D=!0,q=["encrypt","decrypt"];async function O(){let e=["encrypt","decrypt"];return await crypto.subtle.generateKey(b,!0,e)}async function $(t){let e=await crypto.subtle.exportKey("jwk",t);return JSON.stringify(e)}async function J(t){let e=JSON.parse(t);return await crypto.subtle.importKey("jwk",e,b,D,q)}async function W(t,e){let r=new TextEncoder().encode(String(t)),i=crypto.getRandomValues(new Uint8Array(12)),n=await crypto.subtle.encrypt(R(A({},b),{iv:i}),e,r),s={ciphertext:btoa(String.fromCharCode(...new Uint8Array(n))),iv:btoa(String.fromCharCode(...i))};return btoa(JSON.stringify(s))}async function x(){let t=await O(),e=await $(t),r=btoa(e);return console.log({key:r}),{key:t,base64Key:r}}async function T(t,e=[]){let r=await J(atob(t));return e.map(async n=>{let s=await W(n,r),l={value:n,encrypted:s};return console.log(l),l})}async function H(t=[]){let e=await x(),r=await T(e.base64Key,t);return{keyData:e,encryptedValues:r}}function c(t,e=r=>{}){try{let r=new URL(String(t).trim());return e&&e(r),r}catch(r){console.info("trix-embed",`Failed to parse URL! value='${t}']`)}return null}function S(t,e=r=>{}){let r=null;return c(t,i=>r=i.host),r&&e&&e(r),r}function G(t){let e=[],r=document.createTreeWalker(t,NodeFilter.SHOW_TEXT,n=>n.nodeValue.includes("http")?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT),i;for(;i=r.nextNode();)i.nodeValue.split(/\s+/).filter(n=>n.startsWith("http")).forEach(n=>c(n,s=>{e.includes(s.href)||e.push(s.href)}));return e}function X(t){let e=[];return t.src&&c(t.src,i=>e.push(i.href)),t.href&&c(t.href,i=>{e.includes(i.href)||e.push(i.href)}),t.querySelectorAll("[src], [href]").forEach(i=>{c(i.src||i.href,n=>{e.includes(n.href)||e.push(n.href)})}),e}function E(t,e=[]){let r=!1;return S(t,i=>r=!!e.find(n=>i.includes(n))),r}function C(t){return t.reduce((e,r)=>(S(r,i=>{e.includes(i)||e.push(i)}),e),[])}function K(t){let e=X(t),r=G(t);return[...new Set([...e,...r])]}var Q={avif:"image/avif",bmp:"image/bmp",gif:"image/gif",heic:"image/heic",heif:"image/heif",ico:"image/x-icon",jp2:"image/jp2",jpeg:"image/jpeg",jpg:"image/jpeg",jxr:"image/vnd.ms-photo",png:"image/png",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",webp:"image/webp"};var Y=Q,Z=["animate","animateMotion","animateTransform","area","audio","base","embed","feDisplacementMap","feImage","feTile","filter","font-face-uri","iframe","image","link","object","script","source","track","use","video"],ee=["audio","embed","iframe","img","input","script","source","track","video","frame","frameset","object","picture","use"],V=Z.concat(ee);function y(t){try{t=new URL(t);let e=t.pathname.lastIndexOf(".");if(!e)return null;let r=t.pathname.substring(e+1);return Y[r]}catch(e){console.error("Failed to detect media type!",t,e)}}var h=class{constructor(e){if(this.controller=e,this.hosts=e.hostsValue,e.invalidTemplateValue){let r=document.getElementById(e.invalidTemplateValue);r&&(this.invalidTemplate=r)}if(e.validTemplateValue){let r=document.getElementById(e.validTemplateValue);r&&(this.validTemplate=r)}}renderHeader(e){return`
    <h1 style="background-color:ivory; border:solid 1px red; color:red; padding:5px; display:flex; align-items:center; font-size:1.25rem; line-height:1.5rem;">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="flex:1; width:1rem; height:1rem;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
      </svg>
      ${e}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="flex:1; width:1rem; height:1rem;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
      </svg>
    </h1>
    `}renderEmbed(e="https://example.com"){let r=this.validTemplate.content.firstElementChild.cloneNode(!0),i=r.querySelector("iframe"),n=r.querySelector("img");return y(e)?(i.remove(),n.src=e):(n.remove(),i.src=e),r.outerHTML}renderLinks(e=["https://example.com","https://test.com"]){return e=e.filter(i=>{let n=!1;return c(i,s=>n=!0),n}).sort(),e.length?`<ul>${e.map(i=>`<li><a href='${i}'>${i}</a></li>`).join("")}</ul><br>`:void 0}renderValid(e=["https://example.com","https://test.com"]){if(e!=null&&e.length)return e.map(r=>this.renderEmbed(r))}renderInvalid(e=["https://example.com","https://test.com"]){if(!(e!=null&&e.length))return;let r=this.invalidTemplate.content.firstElementChild.cloneNode(!0),i=r.querySelector('[data-list="allowed-hosts"]'),n=r.querySelector('[data-list="hosts"]');if(i&&(this.hosts.length?i.innerHTML=this.hosts.map(s=>`<li><code>${s}</code></li>`).join(""):i.innerHTML=`
          <li>
            <strong>Allowed hosts not configured yet.</strong>
          </li>
        `),n){let s=C(e);s.length?n.innerHTML=s.map(l=>`<li><code>${l}</code></li>`).join(""):n.innerHTML="<li><code>Media is only supported from allowed hosts.</code></li>"}return r.outerHTML}set validTemplate(e){this._validTemplate=e}get validTemplate(){if(this._validTemplate)return this._validTemplate;let e=document.createElement("template");return e.innerHTML="<div><iframe></iframe><img></img></div>",e}set invalidTemplate(e){this._invalidTemplate=e}get invalidTemplate(){if(this._invalidTemplate)return this._invalidTemplate;let e=document.createElement("template");return e.innerHTML=`
      <div style="background-color:ivory; border:solid 1px red; color:red; padding:15px; font-size:1rem; line-height:1.5rem;">
        <h1 style="display:flex; align-items:center;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="flex:1; width:1rem; height:1rem; transform: scale(1.5);">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          Copy / Paste
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="flex:1; width:1rem; height:1rem; transform: scale(1.5);">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </h1>

        <h3 style="padding:15px; font-weight:normal; border-top:solid 1px red; border-bottom:solid 1px red;">The pasted content includes media from unsupported hosts / domains.</h3>

        <h2>Prohibited Hosts / Domains</h2>
        <ul data-list="hosts"></ul>

        <h2 style="color:green;">Allowed Hosts / Domains</h2>
        <ul data-list="allowed-hosts" style="color:green;"></ul>
      </div>
    `,e}};var te=new MutationObserver((t,e)=>{t.forEach(r=>{console.log("Mutation detected:",r)})});function j(t){let e=t.element,r=t.inputElement,i=t.toolbarElement,n=t.formElement;inputElement==null||inputElement.remove(),toolbarElement==null||toolbarElement.remove(),e==null||e.remove(),te.observe(targetElement,{attributes:!0,childList:!0,subtree:!0})}import{Controller as re}from"https://unpkg.com/@hotwired/stimulus@3.2.1/dist/stimulus.js";var f=class extends re{connect(){this.rememberEncryptionKey()}disconnect(){this.forgetEncryptionKey(),this.paranoidValue&&j(this)}async paste(t){let{html:e,string:r,range:i}=t.paste,n=e||r||"",s=this.buildPastedTemplate(n),l=s.content.firstElementChild,m=this.sanitizePastedElement(l).innerHTML.trim(),p=K(l);if(!p.length)return;t.preventDefault(),this.editor.setSelectedRange(i);let d=new h(this),u=p.filter(o=>y(o));Array.from(s.content.firstElementChild.querySelectorAll("iframe")).forEach(o=>{u.includes(o.src)||u.push(o.src)});let v=u.filter(o=>E(o,this.hostsValue)),P=u.filter(o=>!v.includes(o)),M=p.filter(o=>!u.includes(o)),g=M.filter(o=>E(o,this.hostsValue)),I=M.filter(o=>!g.includes(o)),a;a=P,a.length&&await this.insert(d.renderInvalid(a)),a=I,a.length&&(await this.insert(d.renderHeader("Pasted URLs")),await this.insert(d.renderLinks(a),{disposition:"inline"})),a=v,a.length&&(a.length>1&&await this.insert(d.renderHeader("Embedded Media")),await this.insert(d.renderValid(a))),a=g,a.length&&await this.insert(d.renderValid(g)),!(p.length===1||v[0]===m)&&(p.length===1||g[0]===m||m.length&&(await this.insert(d.renderHeader("Pasted Content",m)),this.editor.insertLineBreak(),this.insert(m,{disposition:"inline"})))}buildPastedTemplate(t){let e=document.createElement("template");return e.innerHTML=`<div>${t.trim()}</div>`,e}sanitizePastedElement(t){return t=t.cloneNode(!0),t.querySelectorAll(V.join(", ")).forEach(e=>e.remove()),t}insertAttachment(t,e={delay:0}){let{delay:r}=e;return new Promise(i=>{setTimeout(()=>{let n=new Trix.Attachment({content:t,contentType:"application/vnd.trix-embed.html"});this.editor.insertAttachment(n),i()},r)})}insertHTML(t,e={delay:0}){let{delay:r}=e;return new Promise(i=>{setTimeout(()=>{this.editor.insertHTML(t),this.editor.moveCursorInDirection("forward"),this.editor.insertLineBreak(),this.editor.moveCursorInDirection("backward"),i()},r)})}insert(t,e={delay:0,disposition:"attachment"}){let{delay:r,disposition:i}=e;return t!=null&&t.length?new Promise(n=>{setTimeout(()=>{if(typeof t=="string")return i==="inline"?this.insertHTML(t,{delay:r}).then(n):this.insertAttachment(t,{delay:r}).then(n);if(Array.isArray(t))return i==="inline"?t.reduce((s,l,L)=>s.then(this.insertHTML(l,{delay:r})),Promise.resolve()).then(n):t.reduce((s,l,L)=>s.then(this.insertAttachment(l,{delay:r})),Promise.resolve()).then(n);n()})}):Promise.resolve()}preventConnect(){let t=new MutationObserver((r,i)=>{r.forEach(n=>{console.log("Mutation detected:",n)})}),e={attributes:!0,childList:!0,subtree:!0};t.observe(targetElement,e)}get editor(){return this.element.editor}get toolbarElement(){let t=this.element.previousElementSibling;return siibling!=null&&siibling.tagName.match(/trix-toolbar/i)?t:null}get inputElement(){return document.getElementById(this.element.getAttribute("input"))}get formElement(){return this.element.closest("form")}get storageKey(){var t;return btoa(`hopsoft/trix_embed/${(t=this.element.closest("[id]"))==null?void 0:t.id}`)}get encryptionKey(){return sessionStorage.getItem(this.storageKey)}rememberEncryptionKey(){this.hasHostsKeyValue&&(sessionStorage.setItem(this.storageKey,this.hostsKeyValue),this.element.removeAttribute("data-trix-embed-hosts-key-value"),this.element.removeAttribute("data-trix-embed-hosts-list-value"))}forgetEncryptionKey(){sessionStorage.removeItem(this.storageKey)}};U(f,"values",{hosts:Array,hostsKey:String,hostsList:Array,paranoid:Boolean,validTemplate:String,invalidTemplate:String});var ie={application:null};function ne(t=ie){let{application:e}=t;e.register("trix-embed",f)}self.TrixEmbed={initialize:ne,generateEncryptionKey:x,encryptValues:T,generateEncryptionKeyAndEncryptValues:H};var Le=self.TrixEmbed;export{Le as default};
//# sourceMappingURL=trix-embed.js.map

var z=Object.defineProperty,B=Object.defineProperties;var W=Object.getOwnPropertyDescriptors;var R=Object.getOwnPropertySymbols;var _=Object.prototype.hasOwnProperty,G=Object.prototype.propertyIsEnumerable;var S=(r,e,t)=>e in r?z(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t,A=(r,e)=>{for(var t in e||(e={}))_.call(e,t)&&S(r,t,e[t]);if(R)for(var t of R(e))G.call(e,t)&&S(r,t,e[t]);return r},M=(r,e)=>B(r,W(e));var C=(r,e,t)=>(S(r,typeof e!="symbol"?e+"":e,t),t);var w={name:"AES-GCM",length:256},X=!0,Q=["encrypt","decrypt"];async function Y(){let e=["encrypt","decrypt"];return await crypto.subtle.generateKey(w,!0,e)}async function Z(r){let e=await crypto.subtle.exportKey("jwk",r);return JSON.stringify(e)}async function H(r){let e=JSON.parse(r);return await crypto.subtle.importKey("jwk",e,w,X,Q)}async function ee(r,e){let t=new TextEncoder().encode(String(r)),i=crypto.getRandomValues(new Uint8Array(12)),n=await crypto.subtle.encrypt(M(A({},w),{iv:i}),e,t),o={ciphertext:btoa(String.fromCharCode(...new Uint8Array(n))),iv:btoa(String.fromCharCode(...i))};return btoa(JSON.stringify(o))}async function te(r,e){let t=JSON.parse(atob(r)),i=new Uint8Array(atob(t.ciphertext).split("").map(s=>s.charCodeAt(0))),n=new Uint8Array(atob(t.iv).split("").map(s=>s.charCodeAt(0))),o=await crypto.subtle.decrypt(M(A({},w),{iv:n}),e,i);return new TextDecoder().decode(o)}async function y(){let r=await Y(),e=await Z(r);return btoa(e)}async function g(r,e=[]){let t=await H(atob(r));return Promise.all(e.map(i=>ee(i,t)))}async function j(r,e=[]){let t=await H(atob(r));return Promise.all(e.map(i=>te(i,t)))}async function P(r=[]){let e=await y(),t=await g(e,r);return console.log(`data-trix-embed-key-value="${e}"`),console.log(`data-trix-embed-hosts-value='${JSON.stringify(t)}'`),{key:e,encryptedValues:t}}function u(r,e=t=>{}){try{let t=new URL(String(r).trim());return e&&e(t),t}catch(t){console.info(`Failed to parse URL! value='${r}']`)}return null}function K(r,e=t=>{}){let t=null;return u(r,i=>t=i.host),t&&e&&e(t),t}function re(r){let e=[],t=document.createTreeWalker(r,NodeFilter.SHOW_TEXT,n=>n.nodeValue.includes("http")?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT),i;for(;i=t.nextNode();)i.nodeValue.split(/\s+/).filter(n=>n.startsWith("http")).forEach(n=>u(n,o=>{e.includes(o.href)||e.push(o.href)}));return e}function ie(r){let e=[];return r.src&&u(r.src,i=>e.push(i.href)),r.href&&u(r.href,i=>{e.includes(i.href)||e.push(i.href)}),r.querySelectorAll("[src], [href]").forEach(i=>{u(i.src||i.href,n=>{e.includes(n.href)||e.push(n.href)})}),e}function k(r,e=[]){let t=!1;return K(r,i=>t=!!e.find(n=>i.includes(n))),t}function O(r){return r.reduce((e,t)=>(K(t,i=>{e.includes(i)||e.push(i)}),e),[])}function V(r){let e=ie(r),t=re(r);return[...new Set([...e,...t])]}var $={avif:"image/avif",bmp:"image/bmp",gif:"image/gif",heic:"image/heic",heif:"image/heif",ico:"image/x-icon",jp2:"image/jp2",jpeg:"image/jpeg",jpg:"image/jpeg",jxr:"image/vnd.ms-photo",png:"image/png",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",webp:"image/webp"};var ne=$,oe=["animate","animateMotion","animateTransform","area","audio","base","embed","feDisplacementMap","feImage","feTile","filter","font-face-uri","iframe","image","link","object","script","source","track","use","video"],se=["audio","embed","iframe","img","input","script","source","track","video","frame","frameset","object","picture","use"],I=oe.concat(se);function q(r){return!!Object.values($).find(e=>e===U(r))}function U(r){let e;if(u(r,n=>e=n),!e)return null;let t=e.pathname.lastIndexOf(".");if(!t)return null;let i=e.pathname.substring(t+1);return ne[i]}var b=class{constructor(e){this.controller=e,e.element.addEventListener("trix-file-accept",t=>t.preventDefault())}protect(){if(!this.controller.formElement)return;let e=this.controller.formElement,t=this.controller.inputElement;document.addEventListener("submit",n=>{let o=n.target.closest("form");o&&o.action===e.action&&o.method===e.method&&o!==e&&n.preventDefault()},!0),new MutationObserver((n,o)=>{n.forEach(s=>{var f;let{addedNodes:p,target:d,type:h}=s;switch(h){case"attributes":((f=d.closest("form"))==null?void 0:f.action)===e.action&&(d.id===t.id||d.name===t.name)&&d.remove();break;case"childList":p.forEach(a=>{var m;a.nodeType===Node.ELEMENT_NODE&&(a.tagName.match(/^form$/i)&&a.action===e.action&&a.remove(),((m=d.closest("form"))==null?void 0:m.action)===e.action&&(a.id===t.id||a.name===t.name)&&a.remove())});break}})}).observe(document.body,{attributeFilter:["id","name"],attributes:!0,childList:!0,subtree:!0})}cleanup(){let e=this.controller.element,t=this.controller.inputElement,i=this.controller.toolbarElement;t==null||t.remove(),i==null||i.remove(),e==null||e.remove()}};var x=class{constructor(e){var t;this.controller=e,this.base=this.obfuscate([location.pathname,(t=this.controller.element.closest("[id]"))==null?void 0:t.id].join("/"))}split(e){let t=Math.ceil(e.length/2);return[e.slice(0,t),e.slice(t)]}obfuscate(e){var n;let t=[...e].map(o=>o.charCodeAt(0));return[(n=this.split(t)[1])==null?void 0:n.reverse(),t[0]].flat().join("")}read(e){return sessionStorage.getItem(this.generateStorageKey(e))}write(e,t){return sessionStorage.setItem(this.generateStorageKey(e),t)}remove(e){return sessionStorage.removeItem(this.generateStorageKey(e))}generateStorageKey(e){let t=[...this.obfuscate(e)],[i,n]=this.split(t);return btoa(`${i}/${this.base}/${n}`)}};var ae={header:"<h1></h1>",iframe:"<iframe></iframe>",image:"<img></img>",error:`
    <div>
      <h1>Copy/Paste Info</h1>
      <h3>The pasted content includes media from unsupported hosts.</h3>

      <h2>Prohibited Hosts / Domains</h2>
      <ul data-list="prohibited-hosts">
        <li>Media is only supported from allowed hosts.</li>
      </ul>

      <h2>Allowed Hosts / Domains</h2>
      <ul data-list="allowed-hosts">
        <li>Allowed hosts not configured.</li>
      </ul>
    </div>
  `,exception:`
    <div style='background-color:lightyellow; color:red; border:solid 1px red; padding:20px;'>
      <h1>Unhandled Exception!</h1>
      <p>Show a programmer the message below.</p>
      <pre style="background-color:darkslategray; color:whitesmoke; padding:10px;"><code></code></pre>
    </div>
  `};function D(r){let e=document.createElement("template");return e.innerHTML=ae[r],e}var v=class{constructor(e){this.controller=e,this.initializeTempates()}initializeTempates(){["error","exception","header","iframe","image"].forEach(t=>this.initializeTemplate(t))}initializeTemplate(e){let t;this.controller[`has${e.charAt(0).toUpperCase()+e.slice(1)}TemplateValue`]&&(t=document.getElementById(this.controller[`${e}TemplateValue`])),this[`${e}Template`]=t||D(e)}renderHeader(e){let t=this.headerTemplate.content.firstElementChild.cloneNode(!0),i=t.tagName.match(/h1/i)?t:t.querySelector("h1");return i.innerHTML=e,t.outerHTML}renderLinks(e=["https://example.com","https://test.com"]){return e=e.filter(i=>{let n=!1;return u(i,o=>n=!0),n}).sort(),e.length?`<ul>${e.map(i=>`<li><a href='${i}'>${i}</a></li>`).join("")}</ul><br>`:void 0}renderEmbed(e="https://example.com"){let t;if(q(e)){t=this.imageTemplate.content.firstElementChild.cloneNode(!0);let i=t.tagName.match(/img/i)?t:t.querySelector("img");i.src=e}else{t=this.iframeTemplate.content.firstElementChild.cloneNode(!0);let i=t.tagName.match(/iframe/i)?t:t.querySelector("iframe");i.src=e}return t.outerHTML}renderEmbeds(e=["https://example.com","https://test.com"]){if(e!=null&&e.length)return e.map(t=>this.renderEmbed(t))}renderErrors(e=["https://example.com","https://test.com"],t=[]){if(!(e!=null&&e.length))return;let i=this.errorTemplate.content.firstElementChild.cloneNode(!0),n=i.querySelector('[data-list="prohibited-hosts"]'),o=i.querySelector('[data-list="allowed-hosts"]');if(n){let s=O(e).sort();s.length&&(n.innerHTML=s.map(p=>`<li>${p}</li>`).join(""))}return o&&t.length&&(o.innerHTML=t.map(s=>`<li>${s}</li>`).join("")),i.outerHTML}renderException(e){let t=this.exceptionTemplate.content.firstElementChild.cloneNode(!0),i=t.querySelector("code");return i.innerHTML=e.message,t.outerHTML}};import{Controller as ce}from"https://unpkg.com/@hotwired/stimulus@3.2.1/dist/stimulus.js";var T=class extends ce{async connect(){var r;this.store=new x(this),this.guard=new b(this),await this.rememberConfig(),this.paranoid&&this.guard.protect(),(r=this.toolbarElement.querySelector('[data-trix-button-group="file-tools"]'))==null||r.remove(),window.addEventListener("beforeunload",()=>this.disconnect())}disconnect(){this.paranoid&&this.guard.cleanup(),this.forgetConfig()}async paste(r){let{html:e,string:t,range:i}=r.paste,n=e||t||"",o=this.buildPastedTemplate(n),s=o.content.firstElementChild,d=this.sanitizePastedElement(s).innerHTML.trim(),h=V(s);if(!h.length)return;r.preventDefault(),this.editor.setSelectedRange(i);let f=await this.hosts,a=new v(this);try{let m=h.filter(c=>U(c));Array.from(o.content.firstElementChild.querySelectorAll("iframe")).forEach(c=>{m.includes(c.src)||m.push(c.src)});let L=m.filter(c=>k(c,f)),F=m.filter(c=>!L.includes(c)),N=h.filter(c=>!m.includes(c)),E=N.filter(c=>k(c,f)),J=N.filter(c=>!E.includes(c)),l;if(l=F,l.length&&await this.insert(a.renderErrors(l,f.sort())),l=J,l.length&&(await this.insert(a.renderHeader("Pasted URLs")),await this.insert(a.renderLinks(l),{disposition:"inline"})),l=L,l.length&&(l.length>1&&await this.insert(a.renderHeader("Embedded Media")),await this.insert(a.renderEmbeds(l))),l=E,l.length&&await this.insert(a.renderEmbeds(E)),h.length===1||L[0]===d||h.length===1||E[0]===d)return;d.length&&(await this.insert(a.renderHeader("Pasted Content",d)),this.editor.insertLineBreak(),this.insert(d,{disposition:"inline"}))}catch(m){this.insert(a.renderException(m))}}buildPastedTemplate(r){let e=document.createElement("template");return e.innerHTML=`<div>${r.trim()}</div>`,e}sanitizePastedElement(r){r=r.cloneNode(!0),r.querySelectorAll(I.join(", ")).forEach(i=>i.remove());let e=r.querySelectorAll("*"),t=r.innerHTML.match(/\r\n|\n|\r/g)||[];return(t.length?e.length/t.length:0)<=.1&&(r.innerHTML=r.innerHTML.replaceAll(/\r\n|\n|\r/g,"<br>")),r}insertAttachment(r,e={delay:0}){let{delay:t}=e;return new Promise(i=>{setTimeout(()=>{let n=new Trix.Attachment({content:r,contentType:"application/vnd.trix-embed.html"});this.editor.insertAttachment(n),i()},t)})}insertHTML(r,e={delay:0}){let{delay:t}=e;return new Promise(i=>{setTimeout(()=>{this.editor.insertHTML(r),this.editor.moveCursorInDirection("forward"),this.editor.insertLineBreak(),this.editor.moveCursorInDirection("backward"),i()},t)})}insert(r,e={delay:0,disposition:"attachment"}){let{delay:t,disposition:i}=e;return r!=null&&r.length?new Promise(n=>{setTimeout(()=>{if(typeof r=="string")return i==="inline"?this.insertHTML(r,{delay:t}).then(n):this.insertAttachment(r,{delay:t}).then(n);if(Array.isArray(r))return i==="inline"?r.reduce((o,s,p)=>o.then(this.insertHTML(s,{delay:t})),Promise.resolve()).then(n):r.reduce((o,s,p)=>o.then(this.insertAttachment(s,{delay:t})),Promise.resolve()).then(n);n()})}):Promise.resolve()}get editor(){return this.element.editor}get toolbarElement(){let r=this.element.previousElementSibling;return r!=null&&r.tagName.match(/trix-toolbar/i)?r:null}get inputElement(){return document.getElementById(this.element.getAttribute("input"))}get formElement(){return this.element.closest("form")}get paranoid(){return!!this.store.read("paranoid")}get key(){try{return JSON.parse(this.store.read("key"))[2]}catch(r){}}get hosts(){try{return j(this.key,JSON.parse(this.store.read("hosts")))}catch(r){return[]}}get reservedDomains(){return["example.com","test.com","invalid.com","example.cat","nic.example","example.co.uk"]}async rememberConfig(){let r=await y(),e=await g(r,this.reservedDomains),t=await g(r,this.hostsValue);this.store.write("key",JSON.stringify([e[0],e[1],r,e[2]])),this.element.removeAttribute("data-trix-embed-key-value"),this.store.write("hosts",JSON.stringify(t)),this.element.removeAttribute("data-trix-embed-hosts-value"),this.paranoidValue!==!1&&(this.store.write("paranoid",JSON.stringify(e.slice(3))),this.element.removeAttribute("data-trix-embed-paranoid"))}forgetConfig(){this.store.remove("key"),this.store.remove("hosts"),this.store.remove("paranoid")}};C(T,"values",{validTemplate:String,errorTemplate:String,headerTemplate:String,iframeTemplate:String,imageTemplate:String,hosts:Array,paranoid:{type:Boolean,default:!0}});var le={application:null};function de(r=le){let{application:e}=r;e.register("trix-embed",T)}self.TrixEmbed={initialize:de,generateKey:y,encryptValues:g,generateKeyAndEncryptValues:P};var Oe=self.TrixEmbed;export{Oe as default};

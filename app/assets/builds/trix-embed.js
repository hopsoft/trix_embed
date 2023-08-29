/*
  trix-embed 0.0.3 (MIT)
  Copyright © 2023 Nate Hopkins (hopsoft) <natehop@gmail.com>
*/
var ge=Object.defineProperty,be=Object.defineProperties;var ye=Object.getOwnPropertyDescriptors;var B=Object.getOwnPropertySymbols;var xe=Object.prototype.hasOwnProperty,we=Object.prototype.propertyIsEnumerable;var N=(r,e,t)=>e in r?ge(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t,E=(r,e)=>{for(var t in e||(e={}))xe.call(e,t)&&N(r,t,e[t]);if(B)for(var t of B(e))we.call(e,t)&&N(r,t,e[t]);return r},L=(r,e)=>be(r,ye(e));var J=(r,e,t)=>(N(r,typeof e!="symbol"?e+"":e,t),t);var _={version:"0.0.3"};var R={name:"AES-GCM",length:256},ve=!0,Ee=["encrypt","decrypt"];async function Le(){let e=["encrypt","decrypt"];return await crypto.subtle.generateKey(R,!0,e)}async function Te(r){let e=await crypto.subtle.exportKey("jwk",r);return JSON.stringify(e)}async function G(r){let e=JSON.parse(r);return await crypto.subtle.importKey("jwk",e,R,ve,Ee)}async function Se(r,e){let t=new TextEncoder().encode(String(r)),n=crypto.getRandomValues(new Uint8Array(12)),i=await crypto.subtle.encrypt(L(E({},R),{iv:n}),e,t),s={ciphertext:btoa(String.fromCharCode(...new Uint8Array(i))),iv:btoa(String.fromCharCode(...n))};return btoa(JSON.stringify(s))}async function Ae(r,e){let t=JSON.parse(atob(r)),n=new Uint8Array(atob(t.ciphertext).split("").map(a=>a.charCodeAt(0))),i=new Uint8Array(atob(t.iv).split("").map(a=>a.charCodeAt(0))),s=await crypto.subtle.decrypt(L(E({},R),{iv:i}),e,n);return new TextDecoder().decode(s)}async function T(){let r=await Le(),e=await Te(r);return btoa(e)}async function x(r,e=[]){let t=await G(atob(r));return Promise.all(e.map(n=>Se(n,t)))}async function X(r,e=[]){let t=await G(atob(r));return Promise.all(e.map(n=>Ae(n,t)))}async function Q(r=[]){let e=await T(),t=await x(e,r);return console.log(`data-trix-embed-key-value="${e}"`),console.log(`data-trix-embed-hosts-value='${JSON.stringify(t)}'`),{key:e,encryptedValues:t}}var Y=r=>Math.floor(Math.random()*r),w=(r,e=null)=>{let t=[...r];e==="all"&&(e=t.length);let n=t.length,i=[],s=new Set;for(;i.length<e;){let a=Y(n);for(;s.has(a);)a=Y(n);s.add(a),i.push(t[a])}return typeof e=="number"?i:i[0]};function b(r,e=t=>{}){try{let t=new URL(String(r).trim());return t&&e&&e(t),t}catch(t){console.info(`Failed to parse URL! value='${r}']`)}return null}function Z(r,e=t=>{}){var n;let t=(n=b(r))==null?void 0:n.host;return t&&e&&e(t),t}function O(r){return document.createTreeWalker(r,NodeFilter.SHOW_TEXT,e=>e.nodeValue.match(/http/gi)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP)}function ke(r){let e=new Set,t=O(r),n;for(;n=t.nextNode();)n.nodeValue.split(/\s+/).filter(i=>i.startsWith("http")).forEach(i=>b(i,s=>e.add(s.href)));return[...e]}function U(r){if(r.src){let e=r.src.trim();if(e.length)return e}if(r.href){let e=r.href.trim();if(e.length)return e}return""}function Re(r){let e=new Set;return r.src&&b(r.src,n=>e.add(n.href)),r.href&&b(r.href,n=>e.add(n.href)),r.querySelectorAll("[src], [href]").forEach(n=>b(U(n),i=>e.add(i.href))),[...e]}function C(r,e=[],t=[]){let n=Z(r);return t.includes("*")||t.find(i=>n.endsWith(i))?!1:!!(e.find(i=>n.endsWith(i))||e.includes("*")&&(n||r.startsWith("data:")||r.startsWith("news:")||r.startsWith("tel:")))}function ee(r){return[...r.reduce((e,t)=>(Z(t,n=>e.add(n)),e),new Set)]}function te(r){let e=Re(r),t=ke(r);return[...new Set([...e,...t])]}var re={attachment:"trix-embed/attachment"};var ie={avif:"image/avif",bmp:"image/bmp",gif:"image/gif",heic:"image/heic",heif:"image/heif",ico:"image/x-icon",jp2:"image/jp2",jpeg:"image/jpeg",jpg:"image/jpeg",jxr:"image/vnd.ms-photo",png:"image/png",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",webp:"image/webp"};var Ue=ie,Me=["animate","animateMotion","animateTransform","area","audio","base","embed","feDisplacementMap","feImage","feTile","filter","font-face-uri","iframe","image","link","object","script","source","track","use","video"],Ne=["audio","embed","iframe","img","input","script","source","track","video","frame","frameset","object","picture","use"],ne="trix-editor",se="action-text-attachment",ae=Me.concat(Ne);function oe(r){return!!Object.values(ie).find(e=>e===P(r))}function P(r){let e;if(e=b(r),!e)return null;let t=e.pathname.lastIndexOf(".");if(!t)return null;let n=e.pathname.substring(t+1);return Ue[n]}var j,H,ce=new Set,Oe=`${ne}[data-controller~="trix-embed"]`;function de(r){var n;let{method:e,action:t}=r||{};return t=((n=b(t))==null?void 0:n.pathname)||t,`${e}:${t}`.trim().toLowerCase()}function me(r,e){if(!r)return;let t=de(r);ce.add({key:t,form:r,input:e})}function Ce(r){var l;let e=de(r),t=[...ce].filter(o=>o.key===e);if(!t.length)return!0;if(r.trixEmbedPasting)return!1;if(r.querySelector(Oe))return!0;let n=new FormData(r),i=((l=b(r.action))==null?void 0:l.searchParams)||new URLSearchParams;return!t.map(o=>o.input).map(o=>!(o.name&&(n.has(o.name)||i.has(o.name))||o.id&&(n.has(o.id)||i.has(o.id)))).includes(!1)}function le(r){Ce(r.target)||r.preventDefault()}function F(r){r.removeEventListener("submit",le,!0),r.addEventListener("submit",le,!0)}function Pe(){if(j)return;let r=Document.prototype.createElement;j={value:function(){let e=r.apply(this,arguments);try{String(arguments[0]).toUpperCase()==="FORM"&&F(e)}catch(t){}return e},configurable:!1},Object.defineProperty(Document.prototype,"createElement",j)}function D(r=0){if(!document.body&&r<10)return setTimeout(()=>D(r+1),50);H||(H=new MutationObserver(e=>e.forEach(t=>t.addedNodes.forEach(n=>{n instanceof HTMLFormElement&&F(n)}))),H.observe(document.body,{childList:!0,subtree:!0}))}addEventListener("load",()=>D());Pe();D();document.querySelectorAll("form").forEach(r=>F(r));var S=class{constructor(e){this.controller=e}preventAttachments(){var e,t,n,i,s;(e=this.editor)==null||e.removeAttribute("data-direct-upload-url"),(t=this.editor)==null||t.removeAttribute("data-blob-url-template"),(n=this.editor)==null||n.addEventListener("trix-file-accept",a=>a.preventDefault(),!0),(s=(i=this.toolbar)==null?void 0:i.querySelector('[data-trix-button-group="file-tools"]'))==null||s.remove()}async preventLinks(){var n,i;let e=await this.controller.allowedLinkHosts;!(await this.controller.blockedLinkHosts).length&&e.includes("*")||(i=(n=this.toolbar)==null?void 0:n.querySelector('[data-trix-action="link"]'))==null||i.remove()}protect(e=0){if(!this.toolbar&&e<10)return setTimeout(()=>this.protect(e+1),25);this.preventAttachments(),this.preventLinks(),this.form&&me(this.form,this.input)}get editor(){return this.controller.element}get toolbar(){return this.controller.toolbarElement}get form(){return this.controller.formElement}get input(){return this.controller.inputElement}};var A=class{constructor(e){var n,i,s;let t=[location.pathname,(i=b((n=e.formElement)==null?void 0:n.action))==null?void 0:i.pathname,(s=e.element.closest("[id]"))==null?void 0:s.id];this.controller=e,this.identifier=t.filter(a=>a&&a.length).join("/").replace(/\/{2,}/g,"/"),this.base=this.obfuscate(this.identifier)}split(e){let t=Math.ceil(e.length/2);return[e.slice(0,t),e.slice(t)]}obfuscate(e){var i;let t=[...e].map(s=>s.charCodeAt(0));return[(i=this.split(t)[1])==null?void 0:i.reverse(),t[0]].flat().join("")}read(e){return sessionStorage.getItem(this.generateStorageKey(e))}write(e,t){return sessionStorage.setItem(this.generateStorageKey(e),t)}remove(e){return sessionStorage.removeItem(this.generateStorageKey(e))}generateStorageKey(e){let t=[...this.obfuscate(e)],[n,i]=this.split(t);return btoa(`${n}/${this.base}/${i}`)}};var V={link:"<a href='{{url}}'>{{label}}</a>",embedded:`
    <span>
      <strong>{{label}}</strong>
      <span>{{description}}</span>
      <del>{{url}}</del>
    </span>
  `,prohibited:`
    <span>
      <strong>{{label}}</strong>
      <span>{{description}}</span>
      <del>{{url}}</del>
    </span>
  `,error:`
    <div data-trix-embed data-trix-embed-error>
      <h1>{{header}}</h1>
      <pre><code>{{error.stack}}</code></pre>
    </div>
  `,iframe:`
    <div data-trix-embed>
      <iframe src='{{src}}' loading='lazy' referrerpolicy='no-referrer' scrolling='no'></iframe>
    </div>
  `,image:`
    <div data-trix-embed>
      <img src='{{src}}' loading='lazy'></img>
    </div>
  `,warning:`
    <div data-trix-embed data-trix-embed-warning>
      <h1>{{header}}</h1>
      <h3>{{subheader}}</h3>

      <h2>{{prohibited.header}}</h2>
      <ul>{{prohibited.hosts}}</ul>

      <h2>{{allowed.header}}</h2>
      <ul>{{allowed.hosts}}</ul>
    </div>
  `};var je=[se,"a","abbr","acronym","address","b","big","blockquote","br","cite","code","dd","del","dfn","div","dl","dt","em","figcaption","figure","h1","h2","h3","h4","h5","h6","hr","i","iframe","img","ins","kbd","li","ol","p","pre","samp","small","span","strong","sub","sup","time","tt","ul","var"],He=["abbr","allow","allowfullscreen","allowpaymentrequest","alt","caption","cite","content-type","credentialless","csp","data-trix-embed","data-trix-embed-error","data-trix-embed-prohibited","data-trix-embed-warning","datetime","filename","filesize","height","href","lang","loading","name","presentation","previewable","referrerpolicy","sandbox","sgid","src","srcdoc","title","url","width","xml:lang"],k=class{constructor(e){this.controller=e,this.initializeTempates()}sanitize(e){let t=document.createElement("template");t.innerHTML=`<div>${e}</div>`;let n=t.content.firstElementChild;return[n].concat([...n.querySelectorAll("*")]).forEach(s=>{je.includes(s.tagName.toLowerCase())?[...s.attributes].forEach(a=>{He.includes(a.name.toLowerCase())||s.removeAttribute(a.name)}):s.remove()}),n.innerHTML}initializeTempates(){this.templates=V,Object.keys(V).forEach(e=>this.initializeTemplate(e))}initializeTemplate(e){var s,a;let t=`${e}TemplateValue`,n=this.controller[t],i=n?(a=(s=document.getElementById(n))==null?void 0:s.innerHTML)==null?void 0:a.trim():null;return this.controller[t]=null,i&&(this.templates[e]=i),this.templates[e]}render(e,t={}){return this.templates[e].replace(/{{(.*?)}}/g,(i,s)=>s.split(".").reduce((a,l)=>a[l],t))}renderEmbed(e="https://example.com"){let t=oe(e)?this.render("image",{src:e}):this.render("iframe",{src:e});return this.sanitize(t)}renderEmbeds(e=["https://example.com","https://test.com"]){if(e!=null&&e.length)return e.map(t=>this.renderEmbed(t))}renderWarnings(e=["https://example.com","https://test.com"],t=[],n=[]){if(!(e!=null&&e.length))return;t=[...t].sort(),t.includes("*")&&t.splice(t.indexOf("*"),1),n=[...n],n.includes("*")&&n.splice(n.indexOf("*"),1);let i=[...new Set([...n,...ee(e)])].sort();return this.render("warning",{header:"Copy/Paste Warning",subheader:"Content includes URLs or media from prohibited hosts or restricted protocols.",prohibited:{header:"Prohibited Hosts",hosts:i.length?i.map(s=>`<li>${s}</li>`).join(""):"<li>URLs and media are restricted to allowed hosts and standard protocols.</li>"},allowed:{header:"Allowed Hosts",hosts:t.length?t.map(s=>`<li>${s}</li>`).join(""):"<li>Allowed hosts not configured.</li>"}})}renderError(e){return this.render("error",{header:"Unhandled Exception!",subheader:"Report this problem to a software engineer.",error:e})}};function he(r={Controller:null,Trix:null}){var n;let{Controller:e,Trix:t}=r;return n=class extends e{connect(){this.onPaste=this.paste.bind(this),this.element.addEventListener("trix-paste",this.onPaste,!0),this.onBeforeFetchResponse=this.beforeFetchResponse.bind(this),addEventListener("turbo:before-fetch-response",this.onBeforeFetchResponse,!0),this.onBeforeUnload=this.forgetConfig.bind(this),addEventListener("beforeunload",this.onBeforeUnload,!0),this.store=new A(this),this.guard=new S(this),!this.key&&this.rememberConfig().then(()=>{this.paranoid&&this.guard.protect()})}reconnect(){let i=this.element.getAttribute("data-controller")||"",s=new Set(i.split(" "));s.add("trix-embed"),this.element.setAttribute("data-controller",[...s].join(" ").trim())}disconnect(){this.element.removeEventListener("trix-paste",this.onPaste,!0),removeEventListener("turbo:before-fetch-response",this.onBeforeFetchResponse,!0),removeEventListener("beforeunload",this.onBeforeUnload,!0),this.reconnect()}beforeFetchResponse(i){try{i.target.querySelectorAll("trix-editor").includes(this.element)&&this.forgetConfig()}catch(s){}}async paste(i){this.formElement&&(this.formElement.trixEmbedPasting=!0);try{let{html:s,string:a,range:l}=i.paste,o=s||a||"",d=this.createTemplateElement(o),c=te(d);if(!c.length)return;i.preventDefault(),this.editor.setSelectedRange(l);try{let m=new k(this),h=await this.allowedMediaHosts,u=await this.blockedMediaHosts,p=new Set(c.filter(g=>P(g)));[...d.querySelectorAll("iframe")].forEach(g=>p.add(g.src)),p=[...p];let y=p.filter(g=>C(g,h,u)),v=p.filter(g=>!y.includes(g)),W=await this.allowedLinkHosts,K=await this.blockedLinkHosts,$=c.filter(g=>!p.includes(g)),z=$.filter(g=>C(g,W,K)),q=$.filter(g=>!z.includes(g));if(v.length||q.length){let g=[...new Set([...v,...q])],pe=[...new Set([...h,...W])].filter(M=>!this.reservedDomains.includes(M)),fe=[...new Set([...u,...K])].filter(M=>!this.reservedDomains.includes(M));await this.insert(m.renderWarnings(g,pe,fe))}if(y.length&&await this.insert(m.renderEmbeds(y)),c.length===1&&y.length===1)return;let I=this.sanitizePastedElement(d,{renderer:m,validMediaURLs:y,validLinkURLs:z}).innerHTML.trim();I.length&&await this.insert(I,{disposition:"inline"})}catch(m){this.insert(renderer.renderError(m))}}finally{this.formElement&&delete this.formElement.trixEmbedPasting}}createTemplateElement(i){let s=document.createElement("template");return s.innerHTML=`<div>${i.trim()}</div>`,s.content.firstElementChild}extractLabelFromElement(i,s={default:null}){let a=i.title;return a&&a.length||(a=i.textContent.trim(),a&&a.length)?a:s.default}sanitizePastedElement(i,s={renderer:null,validMediaURLs:[],validLinkURLs:[]}){let{renderer:a,validMediaURLs:l,validLinkURLs:o}=s;i=i.cloneNode(!0);let d=O(i),c=[],m;for(;m=d.nextNode();)m.replacements=m.replacements||new Set,c.push(m),m.nodeValue.split(/\s+/).filter(p=>p.startsWith("http")).forEach(p=>{var v;let f=(v=b(p))==null?void 0:v.href,y=o.includes(f)||o.includes(f)?a.render("link",{url:f,label:f}):a.render("prohibited",{url:f,label:"Prohibited URL:",description:""});m.replacements.add({match:p,replacement:y})});return c.forEach(h=>{if(!h.replacements.size)return;let u=h.nodeValue;[...h.replacements].sort((f,y)=>y.match.length-f.match.length).forEach(f=>u=u.replaceAll(f.match,f.replacement)),h.replaceWith(this.createTemplateElement(u))}),i.querySelectorAll("a").forEach(h=>{let u=U(h),p=this.extractLabelFromElement(h,{default:u}),f=o.includes(u)?a.render("link",{url:u,label:p}):a.render("prohibited",{url:u,label:"Prohibited Link:",description:`(${p})`});h.replaceWith(this.createTemplateElement(f))}),i.querySelectorAll(ae.join(", ")).forEach(h=>{let u=U(h),p=this.extractLabelFromElement(h,{default:u}),f=l.includes(u)?a.render("embedded",{url:u,label:"Allowed Media:",description:"(Embedded Above)"}):a.render("prohibited",{url:u,label:"Prohibited Media:",description:""});h.replaceWith(this.createTemplateElement(f))}),i.innerHTML.replaceAll(/(\n|\r|\f|\v)+/g,"<br>"),i}createAttachment(i){return new t.Attachment({content:i,contentType:re.attachment})}insertNewlines(i=1,s={delay:1}){let{delay:a}=s;return new Promise(l=>{setTimeout(()=>{for(let o=0;o<i;o++)this.editor.insertLineBreak();l()},a)})}insertAttachment(i,s={delay:1}){let{delay:a}=s;return new Promise(l=>{setTimeout(()=>{this.editor.insertAttachment(this.createAttachment(i)),this.insertNewlines(1,{delay:a}).finally(l)},a)})}insertHTML(i,s={delay:1}){let{delay:a}=s;return new Promise(l=>{setTimeout(()=>{this.editor.insertHTML(i),this.insertNewlines(1,{delay:a}).finally(l)},a)})}insert(i,s={delay:1,disposition:"attachment"}){let{delay:a,disposition:l}=s;return i!=null&&i.length?new Promise(o=>{setTimeout(()=>{if(typeof i=="string")return l==="inline"?this.insertHTML(i,{delay:a}).catch(d=>this.renderError(d)).finally(o):this.insertAttachment(i,{delay:a}).catch(d=>this.renderError(d)).finally(o);if(Array.isArray(i)){let d=l==="inline"?i.map(c=>this.insertHTML(c,{delay:a+1})):i.map(c=>this.insertAttachment(c,{delay:a+1}));return Promise.all(d).catch(c=>this.renderError(c)).finally(o)}o()})}):Promise.resolve()}get editor(){return this.element.editor}get toolbarElement(){let i=this.element.getAttribute("toolbar"),s=i?document.getElementById(i):null;if(!s){let a=this.element.previousElementSibling;s=a!=null&&a.tagName.match(/trix-toolbar/i)?a:null}return s}get formElement(){return this.element.closest("form")}get inputElement(){var s;let i=this.element.getAttribute("input");return i?(s=this.formElement)==null?void 0:s.querySelector(`#${i}`):null}get paranoid(){return!!this.store.read("paranoid")}get key(){try{return JSON.parse(this.store.read("key"))[2]}catch(i){return null}}get hostsValueDescriptors(){return Object.values(this.valueDescriptorMap).filter(i=>i.name.endsWith("HostsValue"))}get reservedDomains(){return["embed.example","embed.invalid","embed.local","embed.localhost","embed.test","trix.embed.example","trix.embed.invalid","trix.embed.local","trix.embed.localhost","trix.embed.test","trix.example","trix.invalid","trix.local","trix.localhost","trix.test","www.embed.example","www.embed.invalid","www.embed.local","www.embed.localhost","www.embed.test","www.trix.example","www.trix.invalid","www.trix.local","www.trix.localhost","www.trix.test"]}rememberConfig(){return new Promise(async i=>{let s,a=await T();s=await x(a,w(this.reservedDomains,3)),this.store.write("key",JSON.stringify([s[0],s[1],a,s[2]])),this.paranoidValue!==!1&&(s=await x(a,w(this.reservedDomains,4)),this.store.write("paranoid",JSON.stringify(s))),this.element.removeAttribute("data-trix-embed-paranoid-value"),this.hostsValueDescriptors.forEach(async l=>{let{name:o}=l,d=o.slice(0,o.lastIndexOf("Value")),c=this[o];c.length<4&&(c=c.concat(w(this.reservedDomains,4-c.length))),this.store.write(d,JSON.stringify(await x(a,c))),this.hasOwnProperty(d)||Object.defineProperty(this,d,{get:async()=>{try{return(await X(this.key,JSON.parse(this.store.read(d)))).filter(h=>!this.reservedDomains.includes(h))}catch(m){return console.error(`Failed to get '${d}'!`,m),[]}}}),this.element.removeAttribute(`data-trix-embed-${l.key}`)}),s=await x(a,w(this.reservedDomains,4)),this.store.write("securityHosts",s),s=await x(a,w(this.reservedDomains,4)),this.store.write("obscurityHosts",s),i()})}forgetConfig(){var i,s,a,l;try{(i=this.store)==null||i.remove("key"),(s=this.store)==null||s.remove("paranoid"),this.hostsValueDescriptors.forEach(async o=>{var m;let{name:d}=o,c=d.slice(0,d.lastIndexOf("Value"));(m=this.store)==null||m.remove(c)}),(a=this.store)==null||a.remove("securityHosts"),(l=this.store)==null||l.remove("obscurityHosts")}catch(o){}}},J(n,"values",{embeddedTemplate:String,errorTemplate:String,iframeTemplate:String,imageTemplate:String,linkTemplate:String,prohibitedTemplate:String,warningTemplate:String,allowedLinkHosts:Array,blockedLinkHosts:Array,allowedMediaHosts:Array,blockedMediaHosts:Array,paranoid:{type:Boolean,default:!0}}),n}var ue=!1,Fe={application:null,Controller:null,Trix:null};function De(r=Fe){if(ue)return;let{application:e,Controller:t,Trix:n}=r;e.register("trix-embed",he({Controller:t,Trix:n})),ue=!0}self.TrixEmbed=L(E({},_),{encryptValues:x,generateKey:T,generateKeyAndEncryptValues:Q,initialize:De});var Tt=self.TrixEmbed;export{Tt as default};

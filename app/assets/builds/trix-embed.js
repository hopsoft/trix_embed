/*
  trix-embed 0.0.2 (MIT)
  Copyright © 2023 Nate Hopkins (hopsoft) <natehop@gmail.com>
*/
var fe=Object.defineProperty,ge=Object.defineProperties;var be=Object.getOwnPropertyDescriptors;var I=Object.getOwnPropertySymbols;var ye=Object.prototype.hasOwnProperty,xe=Object.prototype.propertyIsEnumerable;var N=(r,e,t)=>e in r?fe(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t,E=(r,e)=>{for(var t in e||(e={}))ye.call(e,t)&&N(r,t,e[t]);if(I)for(var t of I(e))xe.call(e,t)&&N(r,t,e[t]);return r},L=(r,e)=>ge(r,be(e));var B=(r,e,t)=>(N(r,typeof e!="symbol"?e+"":e,t),t);var J={version:"0.0.2"};var R={name:"AES-GCM",length:256},we=!0,ve=["encrypt","decrypt"];async function Ee(){let e=["encrypt","decrypt"];return await crypto.subtle.generateKey(R,!0,e)}async function Le(r){let e=await crypto.subtle.exportKey("jwk",r);return JSON.stringify(e)}async function _(r){let e=JSON.parse(r);return await crypto.subtle.importKey("jwk",e,R,we,ve)}async function Te(r,e){let t=new TextEncoder().encode(String(r)),s=crypto.getRandomValues(new Uint8Array(12)),i=await crypto.subtle.encrypt(L(E({},R),{iv:s}),e,t),n={ciphertext:btoa(String.fromCharCode(...new Uint8Array(i))),iv:btoa(String.fromCharCode(...s))};return btoa(JSON.stringify(n))}async function Se(r,e){let t=JSON.parse(atob(r)),s=new Uint8Array(atob(t.ciphertext).split("").map(a=>a.charCodeAt(0))),i=new Uint8Array(atob(t.iv).split("").map(a=>a.charCodeAt(0))),n=await crypto.subtle.decrypt(L(E({},R),{iv:i}),e,s);return new TextDecoder().decode(n)}async function T(){let r=await Ee(),e=await Le(r);return btoa(e)}async function x(r,e=[]){let t=await _(atob(r));return Promise.all(e.map(s=>Te(s,t)))}async function G(r,e=[]){let t=await _(atob(r));return Promise.all(e.map(s=>Se(s,t)))}async function X(r=[]){let e=await T(),t=await x(e,r);return console.log(`data-trix-embed-key-value="${e}"`),console.log(`data-trix-embed-hosts-value='${JSON.stringify(t)}'`),{key:e,encryptedValues:t}}var Q=r=>Math.floor(Math.random()*r),w=(r,e=null)=>{let t=[...r];e==="all"&&(e=t.length);let s=t.length,i=[],n=new Set;for(;i.length<e;){let a=Q(s);for(;n.has(a);)a=Q(s);n.add(a),i.push(t[a])}return typeof e=="number"?i:i[0]};function b(r,e=t=>{}){try{let t=new URL(String(r).trim());return t&&e&&e(t),t}catch(t){console.info(`Failed to parse URL! value='${r}']`)}return null}function Y(r,e=t=>{}){var s;let t=(s=b(r))==null?void 0:s.host;return t&&e&&e(t),t}function O(r){return document.createTreeWalker(r,NodeFilter.SHOW_TEXT,e=>e.nodeValue.match(/http/gi)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP)}function Ae(r){let e=new Set,t=O(r),s;for(;s=t.nextNode();)s.nodeValue.split(/\s+/).filter(i=>i.startsWith("http")).forEach(i=>b(i,n=>e.add(n.href)));return[...e]}function U(r){if(r.src){let e=r.src.trim();if(e.length)return e}if(r.href){let e=r.href.trim();if(e.length)return e}return""}function ke(r){let e=new Set;return r.src&&b(r.src,s=>e.add(s.href)),r.href&&b(r.href,s=>e.add(s.href)),r.querySelectorAll("[src], [href]").forEach(s=>b(U(s),i=>e.add(i.href))),[...e]}function C(r,e=[],t=[]){let s=Y(r);return t.includes("*")||t.find(i=>s.endsWith(i))?!1:!!(e.find(i=>s.endsWith(i))||e.includes("*")&&(s||r.startsWith("data:")||r.startsWith("news:")||r.startsWith("tel:")))}function Z(r){return[...r.reduce((e,t)=>(Y(t,s=>e.add(s)),e),new Set)]}function ee(r){let e=ke(r),t=Ae(r);return[...new Set([...e,...t])]}var te={attachment:"trix-embed/attachment"};var re={avif:"image/avif",bmp:"image/bmp",gif:"image/gif",heic:"image/heic",heif:"image/heif",ico:"image/x-icon",jp2:"image/jp2",jpeg:"image/jpeg",jpg:"image/jpeg",jxr:"image/vnd.ms-photo",png:"image/png",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",webp:"image/webp"};var Re=re,Ue=["animate","animateMotion","animateTransform","area","audio","base","embed","feDisplacementMap","feImage","feTile","filter","font-face-uri","iframe","image","link","object","script","source","track","use","video"],Me=["audio","embed","iframe","img","input","script","source","track","video","frame","frameset","object","picture","use"],ie="trix-editor",ne="action-text-attachment",se=Ue.concat(Me);function ae(r){return!!Object.values(re).find(e=>e===P(r))}function P(r){let e;if(e=b(r),!e)return null;let t=e.pathname.lastIndexOf(".");if(!t)return null;let s=e.pathname.substring(t+1);return Re[s]}var j,H,le=new Set,Ne=`${ie}[data-controller~="trix-embed"]`;function ce(r){var s;let{method:e,action:t}=r||{};return t=((s=b(t))==null?void 0:s.pathname)||t,`${e}:${t}`.trim().toLowerCase()}function de(r,e){if(!r)return;let t=ce(r);le.add({key:t,form:r,input:e})}function Oe(r){var l;let e=ce(r),t=[...le].filter(o=>o.key===e);if(!t.length)return!0;if(r.trixEmbedPasting)return!1;if(r.querySelector(Ne))return!0;let s=new FormData(r),i=((l=b(r.action))==null?void 0:l.searchParams)||new URLSearchParams;return!t.map(o=>o.input).map(o=>!(o.name&&(s.has(o.name)||i.has(o.name))||o.id&&(s.has(o.id)||i.has(o.id)))).includes(!1)}function oe(r){Oe(r.target)||r.preventDefault()}function F(r){r.removeEventListener("submit",oe,!0),r.addEventListener("submit",oe,!0)}function Ce(){if(j)return;let r=Document.prototype.createElement;j={value:function(){let e=r.apply(this,arguments);try{String(arguments[0]).toUpperCase()==="FORM"&&F(e)}catch(t){}return e},configurable:!1},Object.defineProperty(Document.prototype,"createElement",j)}function Pe(){H||(H=new MutationObserver(r=>r.forEach(e=>e.addedNodes.forEach(t=>{t instanceof HTMLFormElement&&F(t)}))),H.observe(document.body,{childList:!0,subtree:!0}))}Ce();Pe();document.querySelectorAll("form").forEach(r=>F(r));var S=class{constructor(e){this.controller=e}preventAttachments(){var e,t,s,i,n;(e=this.editor)==null||e.removeAttribute("data-direct-upload-url"),(t=this.editor)==null||t.removeAttribute("data-blob-url-template"),(s=this.editor)==null||s.addEventListener("trix-file-accept",a=>a.preventDefault(),!0),(n=(i=this.toolbar)==null?void 0:i.querySelector('[data-trix-button-group="file-tools"]'))==null||n.remove()}async preventLinks(){var s,i;let e=await this.controller.allowedLinkHosts;!(await this.controller.blockedLinkHosts).length&&e.includes("*")||(i=(s=this.toolbar)==null?void 0:s.querySelector('[data-trix-action="link"]'))==null||i.remove()}protect(e=0){if(!this.toolbar&&e<10)return setTimeout(()=>this.protect(e+1),25);this.preventAttachments(),this.preventLinks(),this.form&&de(this.form,this.input)}get editor(){return this.controller.element}get toolbar(){return this.controller.toolbarElement}get form(){return this.controller.formElement}get input(){return this.controller.inputElement}};var A=class{constructor(e){var s,i,n;let t=[location.pathname,(i=b((s=e.formElement)==null?void 0:s.action))==null?void 0:i.pathname,(n=e.element.closest("[id]"))==null?void 0:n.id];this.controller=e,this.identifier=t.filter(a=>a&&a.length).join("/").replace(/\/{2,}/g,"/"),this.base=this.obfuscate(this.identifier)}split(e){let t=Math.ceil(e.length/2);return[e.slice(0,t),e.slice(t)]}obfuscate(e){var i;let t=[...e].map(n=>n.charCodeAt(0));return[(i=this.split(t)[1])==null?void 0:i.reverse(),t[0]].flat().join("")}read(e){return sessionStorage.getItem(this.generateStorageKey(e))}write(e,t){return sessionStorage.setItem(this.generateStorageKey(e),t)}remove(e){return sessionStorage.removeItem(this.generateStorageKey(e))}generateStorageKey(e){let t=[...this.obfuscate(e)],[s,i]=this.split(t);return btoa(`${s}/${this.base}/${i}`)}};var D={link:"<a href='{{url}}'>{{label}}</a>",embedded:`
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
  `};var je=[ne,"a","abbr","acronym","address","b","big","blockquote","br","cite","code","dd","del","dfn","div","dl","dt","em","figcaption","figure","h1","h2","h3","h4","h5","h6","hr","i","iframe","img","ins","kbd","li","ol","p","pre","samp","small","span","strong","sub","sup","time","tt","ul","var"],He=["abbr","allow","allowfullscreen","allowpaymentrequest","alt","caption","cite","content-type","credentialless","csp","data-trix-embed","data-trix-embed-error","data-trix-embed-prohibited","data-trix-embed-warning","datetime","filename","filesize","height","href","lang","loading","name","presentation","previewable","referrerpolicy","sandbox","sgid","src","srcdoc","title","url","width","xml:lang"],k=class{constructor(e){this.controller=e,this.initializeTempates()}sanitize(e){let t=document.createElement("template");t.innerHTML=`<div>${e}</div>`;let s=t.content.firstElementChild;return[s].concat([...s.querySelectorAll("*")]).forEach(n=>{je.includes(n.tagName.toLowerCase())?[...n.attributes].forEach(a=>{He.includes(a.name.toLowerCase())||n.removeAttribute(a.name)}):n.remove()}),s.innerHTML}initializeTempates(){this.templates=D,Object.keys(D).forEach(e=>this.initializeTemplate(e))}initializeTemplate(e){var n,a;let t=`${e}TemplateValue`,s=this.controller[t],i=s?(a=(n=document.getElementById(s))==null?void 0:n.innerHTML)==null?void 0:a.trim():null;return this.controller[t]=null,i&&(this.templates[e]=i),this.templates[e]}render(e,t={}){return this.templates[e].replace(/{{(.*?)}}/g,(i,n)=>n.split(".").reduce((a,l)=>a[l],t))}renderEmbed(e="https://example.com"){let t=ae(e)?this.render("image",{src:e}):this.render("iframe",{src:e});return this.sanitize(t)}renderEmbeds(e=["https://example.com","https://test.com"]){if(e!=null&&e.length)return e.map(t=>this.renderEmbed(t))}renderWarnings(e=["https://example.com","https://test.com"],t=[],s=[]){if(!(e!=null&&e.length))return;t=[...t].sort(),t.includes("*")&&t.splice(t.indexOf("*"),1),s=[...s],s.includes("*")&&s.splice(s.indexOf("*"),1);let i=[...new Set([...s,...Z(e)])].sort();return this.render("warning",{header:"Copy/Paste Warning",subheader:"Content includes URLs or media from prohibited hosts or restricted protocols.",prohibited:{header:"Prohibited Hosts",hosts:i.length?i.map(n=>`<li>${n}</li>`).join(""):"<li>URLs and media are restricted to allowed hosts and standard protocols.</li>"},allowed:{header:"Allowed Hosts",hosts:t.length?t.map(n=>`<li>${n}</li>`).join(""):"<li>Allowed hosts not configured.</li>"}})}renderError(e){return this.render("error",{header:"Unhandled Exception!",subheader:"Report this problem to a software engineer.",error:e})}};function me(r={Controller:null,Trix:null}){var s;let{Controller:e,Trix:t}=r;return s=class extends e{connect(){this.onPaste=this.paste.bind(this),this.element.addEventListener("trix-paste",this.onPaste,!0),this.onBeforeFetchResponse=this.beforeFetchResponse.bind(this),window.addEventListener("turbo:before-fetch-response",this.onBeforeFetchResponse,!0),this.onBeforeUnload=this.forgetConfig.bind(this),window.addEventListener("beforeunload",this.onBeforeUnload,!0),this.store=new A(this),this.guard=new S(this),!this.key&&this.rememberConfig().then(()=>{this.paranoid&&this.guard.protect()})}reconnect(){let i=this.element.getAttribute("data-controller")||"",n=new Set(i.split(" "));n.add("trix-embed"),this.element.setAttribute("data-controller",[...n].join(" ").trim())}disconnect(){this.element.removeEventListener("trix-paste",this.onPaste,!0),window.removeEventListener("turbo:before-fetch-response",this.onBeforeFetchResponse,!0),window.removeEventListener("beforeunload",this.onBeforeUnload,!0),this.reconnect()}beforeFetchResponse(i){try{i.target.querySelectorAll("trix-editor").includes(this.element)&&this.forgetConfig()}catch(n){}}async paste(i){this.formElement&&(this.formElement.trixEmbedPasting=!0);try{let{html:n,string:a,range:l}=i.paste,o=n||a||"",d=this.createTemplateElement(o),c=ee(d);if(!c.length)return;i.preventDefault(),this.editor.setSelectedRange(l);try{let m=new k(this),h=await this.allowedMediaHosts,u=await this.blockedMediaHosts,p=new Set(c.filter(g=>P(g)));[...d.querySelectorAll("iframe")].forEach(g=>p.add(g.src)),p=[...p];let y=p.filter(g=>C(g,h,u)),v=p.filter(g=>!y.includes(g)),V=await this.allowedLinkHosts,W=await this.blockedLinkHosts,K=c.filter(g=>!p.includes(g)),$=K.filter(g=>C(g,V,W)),z=K.filter(g=>!$.includes(g));if(v.length||z.length){let g=[...new Set([...v,...z])],ue=[...new Set([...h,...V])].filter(M=>!this.reservedDomains.includes(M)),pe=[...new Set([...u,...W])].filter(M=>!this.reservedDomains.includes(M));await this.insert(m.renderWarnings(g,ue,pe))}if(y.length&&await this.insert(m.renderEmbeds(y)),c.length===1&&y.length===1)return;let q=this.sanitizePastedElement(d,{renderer:m,validMediaURLs:y,validLinkURLs:$}).innerHTML.trim();q.length&&await this.insert(q,{disposition:"inline"})}catch(m){this.insert(renderer.renderError(m))}}finally{this.formElement&&delete this.formElement.trixEmbedPasting}}createTemplateElement(i){let n=document.createElement("template");return n.innerHTML=`<div>${i.trim()}</div>`,n.content.firstElementChild}extractLabelFromElement(i,n={default:null}){let a=i.title;return a&&a.length||(a=i.textContent.trim(),a&&a.length)?a:n.default}sanitizePastedElement(i,n={renderer:null,validMediaURLs:[],validLinkURLs:[]}){let{renderer:a,validMediaURLs:l,validLinkURLs:o}=n;i=i.cloneNode(!0);let d=O(i),c=[],m;for(;m=d.nextNode();)m.replacements=m.replacements||new Set,c.push(m),m.nodeValue.split(/\s+/).filter(p=>p.startsWith("http")).forEach(p=>{var v;let f=(v=b(p))==null?void 0:v.href,y=o.includes(f)||o.includes(f)?a.render("link",{url:f,label:f}):a.render("prohibited",{url:f,label:"Prohibited URL:",description:""});m.replacements.add({match:p,replacement:y})});return c.forEach(h=>{if(!h.replacements.size)return;let u=h.nodeValue;[...h.replacements].sort((f,y)=>y.match.length-f.match.length).forEach(f=>u=u.replaceAll(f.match,f.replacement)),h.replaceWith(this.createTemplateElement(u))}),i.querySelectorAll("a").forEach(h=>{let u=U(h),p=this.extractLabelFromElement(h,{default:u}),f=o.includes(u)?a.render("link",{url:u,label:p}):a.render("prohibited",{url:u,label:"Prohibited Link:",description:`(${p})`});h.replaceWith(this.createTemplateElement(f))}),i.querySelectorAll(se.join(", ")).forEach(h=>{let u=U(h),p=this.extractLabelFromElement(h,{default:u}),f=l.includes(u)?a.render("embedded",{url:u,label:"Allowed Media:",description:"(Embedded Above)"}):a.render("prohibited",{url:u,label:"Prohibited Media:",description:""});h.replaceWith(this.createTemplateElement(f))}),i.innerHTML.replaceAll(/(\n|\r|\f|\v)+/g,"<br>"),i}createAttachment(i){return new t.Attachment({content:i,contentType:te.attachment})}insertNewlines(i=1,n={delay:1}){let{delay:a}=n;return new Promise(l=>{setTimeout(()=>{for(let o=0;o<i;o++)this.editor.insertLineBreak();l()},a)})}insertAttachment(i,n={delay:1}){let{delay:a}=n;return new Promise(l=>{setTimeout(()=>{this.editor.insertAttachment(this.createAttachment(i)),this.insertNewlines(1,{delay:a}).finally(l)},a)})}insertHTML(i,n={delay:1}){let{delay:a}=n;return new Promise(l=>{setTimeout(()=>{this.editor.insertHTML(i),this.insertNewlines(1,{delay:a}).finally(l)},a)})}insert(i,n={delay:1,disposition:"attachment"}){let{delay:a,disposition:l}=n;return i!=null&&i.length?new Promise(o=>{setTimeout(()=>{if(typeof i=="string")return l==="inline"?this.insertHTML(i,{delay:a}).catch(d=>this.renderError(d)).finally(o):this.insertAttachment(i,{delay:a}).catch(d=>this.renderError(d)).finally(o);if(Array.isArray(i)){let d=l==="inline"?i.map(c=>this.insertHTML(c,{delay:a+1})):i.map(c=>this.insertAttachment(c,{delay:a+1}));return Promise.all(d).catch(c=>this.renderError(c)).finally(o)}o()})}):Promise.resolve()}get editor(){return this.element.editor}get toolbarElement(){let i=this.element.getAttribute("toolbar"),n=i?document.getElementById(i):null;if(!n){let a=this.element.previousElementSibling;n=a!=null&&a.tagName.match(/trix-toolbar/i)?a:null}return n}get formElement(){return this.element.closest("form")}get inputElement(){var n;let i=this.element.getAttribute("input");return i?(n=this.formElement)==null?void 0:n.querySelector(`#${i}`):null}get paranoid(){return!!this.store.read("paranoid")}get key(){try{return JSON.parse(this.store.read("key"))[2]}catch(i){return null}}get hostsValueDescriptors(){return Object.values(this.valueDescriptorMap).filter(i=>i.name.endsWith("HostsValue"))}get reservedDomains(){return["embed.example","embed.invalid","embed.local","embed.localhost","embed.test","trix.embed.example","trix.embed.invalid","trix.embed.local","trix.embed.localhost","trix.embed.test","trix.example","trix.invalid","trix.local","trix.localhost","trix.test","www.embed.example","www.embed.invalid","www.embed.local","www.embed.localhost","www.embed.test","www.trix.example","www.trix.invalid","www.trix.local","www.trix.localhost","www.trix.test"]}rememberConfig(){return new Promise(async i=>{let n,a=await T();n=await x(a,w(this.reservedDomains,3)),this.store.write("key",JSON.stringify([n[0],n[1],a,n[2]])),this.paranoidValue!==!1&&(n=await x(a,w(this.reservedDomains,4)),this.store.write("paranoid",JSON.stringify(n))),this.element.removeAttribute("data-trix-embed-paranoid-value"),this.hostsValueDescriptors.forEach(async l=>{let{name:o}=l,d=o.slice(0,o.lastIndexOf("Value")),c=this[o];c.length<4&&(c=c.concat(w(this.reservedDomains,4-c.length))),this.store.write(d,JSON.stringify(await x(a,c))),this.hasOwnProperty(d)||Object.defineProperty(this,d,{get:async()=>{try{return(await G(this.key,JSON.parse(this.store.read(d)))).filter(h=>!this.reservedDomains.includes(h))}catch(m){return console.error(`Failed to get '${d}'!`,m),[]}}}),this.element.removeAttribute(`data-trix-embed-${l.key}`)}),n=await x(a,w(this.reservedDomains,4)),this.store.write("securityHosts",n),n=await x(a,w(this.reservedDomains,4)),this.store.write("obscurityHosts",n),i()})}forgetConfig(){var i,n,a,l;try{(i=this.store)==null||i.remove("key"),(n=this.store)==null||n.remove("paranoid"),this.hostsValueDescriptors.forEach(async o=>{var m;let{name:d}=o,c=d.slice(0,d.lastIndexOf("Value"));(m=this.store)==null||m.remove(c)}),(a=this.store)==null||a.remove("securityHosts"),(l=this.store)==null||l.remove("obscurityHosts")}catch(o){}}},B(s,"values",{embeddedTemplate:String,errorTemplate:String,iframeTemplate:String,imageTemplate:String,linkTemplate:String,prohibitedTemplate:String,warningTemplate:String,allowedLinkHosts:Array,blockedLinkHosts:Array,allowedMediaHosts:Array,blockedMediaHosts:Array,paranoid:{type:Boolean,default:!0}}),s}var he=!1,Fe={application:null,Controller:null,Trix:null};function De(r=Fe){if(he)return;let{application:e,Controller:t,Trix:s}=r;e.register("trix-embed",me({Controller:t,Trix:s})),he=!0}self.TrixEmbed=L(E({},J),{encryptValues:x,generateKey:T,generateKeyAndEncryptValues:X,initialize:De});var Tt=self.TrixEmbed;export{Tt as default};

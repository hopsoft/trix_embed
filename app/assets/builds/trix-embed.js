/*
  trix-embed 0.0.2 (MIT)
  Copyright © 2023 Nate Hopkins (hopsoft) <natehop@gmail.com>
*/
var re=Object.defineProperty,ie=Object.defineProperties;var ne=Object.getOwnPropertyDescriptors;var H=Object.getOwnPropertySymbols;var ae=Object.prototype.hasOwnProperty,se=Object.prototype.propertyIsEnumerable;var M=(i,e,t)=>e in i?re(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t,v=(i,e)=>{for(var t in e||(e={}))ae.call(e,t)&&M(i,t,e[t]);if(H)for(var t of H(e))se.call(e,t)&&M(i,t,e[t]);return i},E=(i,e)=>ie(i,ne(e));var V=(i,e,t)=>(M(i,typeof e!="symbol"?e+"":e,t),t);var W={author:"Nate Hopkins (hopsoft) <natehop@gmail.com>",copyright:"Copyright \xA9 2023 Nate Hopkins (hopsoft) <natehop@gmail.com>",description:"A Stimulus controller to safely embed external media in the Trix editor",license:"MIT",repository:"https://github.com/hopsoft/trix_embed",version:"0.0.2"};var U={name:"AES-GCM",length:256},oe=!0,le=["encrypt","decrypt"];async function ce(){let e=["encrypt","decrypt"];return await crypto.subtle.generateKey(U,!0,e)}async function de(i){let e=await crypto.subtle.exportKey("jwk",i);return JSON.stringify(e)}async function I(i){let e=JSON.parse(i);return await crypto.subtle.importKey("jwk",e,U,oe,le)}async function me(i,e){let t=new TextEncoder().encode(String(i)),s=crypto.getRandomValues(new Uint8Array(12)),r=await crypto.subtle.encrypt(E(v({},U),{iv:s}),e,t),n={ciphertext:btoa(String.fromCharCode(...new Uint8Array(r))),iv:btoa(String.fromCharCode(...s))};return btoa(JSON.stringify(n))}async function he(i,e){let t=JSON.parse(atob(i)),s=new Uint8Array(atob(t.ciphertext).split("").map(a=>a.charCodeAt(0))),r=new Uint8Array(atob(t.iv).split("").map(a=>a.charCodeAt(0))),n=await crypto.subtle.decrypt(E(v({},U),{iv:r}),e,s);return new TextDecoder().decode(n)}async function T(){let i=await ce(),e=await de(i);return btoa(e)}async function y(i,e=[]){let t=await I(atob(i));return Promise.all(e.map(s=>me(s,t)))}async function F(i,e=[]){let t=await I(atob(i));return Promise.all(e.map(s=>he(s,t)))}async function $(i=[]){let e=await T(),t=await y(e,i);return console.log(`data-trix-embed-key-value="${e}"`),console.log(`data-trix-embed-hosts-value='${JSON.stringify(t)}'`),{key:e,encryptedValues:t}}function b(i,e=t=>{}){try{let t=new URL(String(i).trim());return t&&e&&e(t),t}catch(t){console.info(`Failed to parse URL! value='${i}']`)}return null}function q(i,e=t=>{}){var s;let t=(s=b(i))==null?void 0:s.host;return t&&e&&e(t),t}function C(i){return document.createTreeWalker(i,NodeFilter.SHOW_TEXT,e=>e.nodeValue.match(/http/gi)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP)}function pe(i){let e=new Set,t=C(i),s;for(;s=t.nextNode();)s.nodeValue.split(/\s+/).filter(r=>r.startsWith("http")).forEach(r=>b(r,n=>e.add(n.href)));return[...e]}function k(i){if(i.src){let e=i.src.trim();if(e.length)return e}if(i.href){let e=i.href.trim();if(e.length)return e}return""}function ue(i){let e=new Set;return i.src&&b(i.src,s=>e.add(s.href)),i.href&&b(i.href,s=>e.add(s.href)),i.querySelectorAll("[src], [href]").forEach(s=>b(k(s),r=>e.add(r.href))),[...e]}function N(i,e=[]){let t=q(i);return t?!!e.find(s=>t.includes(s)):!1}function D(i){return[...i.reduce((e,t)=>(q(t,s=>e.add(s)),e),new Set)]}function J(i){let e=ue(i),t=pe(i);return[...new Set([...e,...t])]}var _={attachment:"trix-embed/attachment"};var B={avif:"image/avif",bmp:"image/bmp",gif:"image/gif",heic:"image/heic",heif:"image/heif",ico:"image/x-icon",jp2:"image/jp2",jpeg:"image/jpeg",jpg:"image/jpeg",jxr:"image/vnd.ms-photo",png:"image/png",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",webp:"image/webp"};var fe=B,ge=["animate","animateMotion","animateTransform","area","audio","base","embed","feDisplacementMap","feImage","feTile","filter","font-face-uri","iframe","image","link","object","script","source","track","use","video"],be=["audio","embed","iframe","img","input","script","source","track","video","frame","frameset","object","picture","use"],G="action-text-attachment",X=ge.concat(be);function Q(i){return!!Object.values(B).find(e=>e===j(i))}function j(i){let e;if(e=b(i),!e)return null;let t=e.pathname.lastIndexOf(".");if(!t)return null;let s=e.pathname.substring(t+1);return fe[s]}var L={};function Y(i){return`${i==null?void 0:i.method}:${i==null?void 0:i.action}`.trim().toLowerCase()}function ye(i){let e=i.target.closest("form"),t=Y(e);if(!L[t])return;let r=[...L[t]].find(n=>n===e);(!r||r.pasting)&&i.preventDefault()}document.addEventListener("submit",ye,!0);var S=class{constructor(e){this.controller=e}preventAttachments(){var e,t,s,r,n;(e=this.editor)==null||e.removeAttribute("data-direct-upload-url"),(t=this.editor)==null||t.removeAttribute("data-blob-url-template"),(s=this.editor)==null||s.addEventListener("trix-file-accept",a=>a.preventDefault(),!0),(n=(r=this.toolbar)==null?void 0:r.querySelector('[data-trix-button-group="file-tools"]'))==null||n.remove()}preventLinks(){var e,t;(t=(e=this.toolbar)==null?void 0:e.querySelector('[data-trix-action="link"]'))==null||t.remove()}protect(e=0){if(!this.toolbar&&e<10)return setTimeout(()=>this.protect(e+1),25);if(this.preventAttachments(),this.preventLinks(),!this.form)return;let t=Y(this.form);L[t]=L[t]||new Set,L[t].add(this.form)}get editor(){return this.controller.element}get toolbar(){return this.controller.toolbarElement}get form(){return this.controller.formElement}};var A=class{constructor(e){var t;this.controller=e,this.base=this.obfuscate([location.pathname,(t=this.controller.element.closest("[id]"))==null?void 0:t.id].join("/"))}split(e){let t=Math.ceil(e.length/2);return[e.slice(0,t),e.slice(t)]}obfuscate(e){var r;let t=[...e].map(n=>n.charCodeAt(0));return[(r=this.split(t)[1])==null?void 0:r.reverse(),t[0]].flat().join("")}read(e){return sessionStorage.getItem(this.generateStorageKey(e))}write(e,t){return sessionStorage.setItem(this.generateStorageKey(e),t)}remove(e){return sessionStorage.removeItem(this.generateStorageKey(e))}generateStorageKey(e){let t=[...this.obfuscate(e)],[s,r]=this.split(t);return btoa(`${s}/${this.base}/${r}`)}};var O={link:"<a href='{{url}}'>{{label}}</a>",embedded:`
    <span>
      <strong>{{label}}</strong>
      <small>{{description}}</small>
      <del>{{url}}</del>
    </span>
  `,prohibited:`
    <span>
      <strong>{{label}}</strong>
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
  `};var xe=[G,"a","abbr","acronym","address","b","big","blockquote","br","cite","code","dd","del","dfn","div","dl","dt","em","figcaption","figure","h1","h2","h3","h4","h5","h6","hr","i","iframe","img","ins","kbd","li","ol","p","pre","samp","small","span","strong","sub","sup","time","tt","ul","var"],we=["abbr","allow","allowfullscreen","allowpaymentrequest","alt","caption","cite","content-type","credentialless","csp","data-trix-embed","data-trix-embed-error","data-trix-embed-prohibited","data-trix-embed-warning","datetime","filename","filesize","height","href","lang","loading","name","presentation","previewable","referrerpolicy","sandbox","sgid","src","srcdoc","title","url","width","xml:lang"],R=class{constructor(e){this.controller=e,this.initializeTempates()}sanitize(e){let t=document.createElement("template");t.innerHTML=`<div>${e}</div>`;let s=t.content.firstElementChild;return[s].concat([...s.querySelectorAll("*")]).forEach(n=>{xe.includes(n.tagName.toLowerCase())?[...n.attributes].forEach(a=>{we.includes(a.name.toLowerCase())||n.removeAttribute(a.name)}):n.remove()}),s.innerHTML}initializeTempates(){this.templates=O,Object.keys(O).forEach(e=>this.initializeTemplate(e))}initializeTemplate(e){var n,a;let t=`${e}TemplateValue`,s=this.controller[t],r=s?(a=(n=document.getElementById(s))==null?void 0:n.innerHTML)==null?void 0:a.trim():null;return this.controller[t]=null,r&&(this.templates[e]=r),this.templates[e]}render(e,t={}){return this.templates[e].replace(/{{(.*?)}}/g,(r,n)=>n.split(".").reduce((a,d)=>a[d],t))}renderEmbed(e="https://example.com"){let t=Q(e)?this.render("image",{src:e}):this.render("iframe",{src:e});return this.sanitize(t)}renderEmbeds(e=["https://example.com","https://test.com"]){if(e!=null&&e.length)return e.map(t=>this.renderEmbed(t))}renderWarnings(e=["https://example.com","https://test.com"],t=[]){if(!(e!=null&&e.length))return;let s=D(e).sort();return this.render("warning",{header:"Copy/Paste Warning",subheader:"The pasted content includes media from unsupported hosts.",prohibited:{header:"Prohibited Hosts",hosts:s.length?s.map(r=>`<li>${r}</li>`).join(""):"<li>Media is only supported from allowed hosts.</li>"},allowed:{header:"Allowed Hosts",hosts:t.length?t.map(r=>`<li>${r}</li>`).join(""):"<li>Allowed hosts not configured.</li>"}})}renderError(e){return this.render("error",{header:"Unhandled Exception!",subheader:"Report this problem to a software engineer.",error:e})}};function Z(i={Controller:null,Trix:null}){var s;let{Controller:e,Trix:t}=i;return s=class extends e{connect(){this.onpaste=this.paste.bind(this),this.element.addEventListener("trix-paste",this.onpaste,!0),this.rememberConfig(),this.store=new A(this),this.guard=new S(this),this.paranoid&&this.guard.protect()}disconnect(){this.element.removeEventListener("trix-paste",this.onpaste,!0),this.forgetConfig()}async paste(r){this.formElement&&(this.formElement.pasting=!0);try{let{html:n,string:a,range:d}=r.paste,m=n||a||"",u=this.createTemplateElement(m),h=J(u);if(!h.length)return;r.preventDefault(),this.editor.setSelectedRange(d);let f=await this.hosts,c=new R(this);try{let o=new Set(h.filter(p=>j(p)));[...u.querySelectorAll("iframe")].forEach(p=>o.add(p.src)),o=[...o];let l=o.filter(p=>N(p,f)),x=o.filter(p=>!l.includes(p)),w=h.filter(p=>!o.includes(p)),K=w.filter(p=>N(p,f)),te=w.filter(p=>!K.includes(p)),P=[...x,...te];if(P.length&&await this.insert(c.renderWarnings(P,f.sort())),l.length&&await this.insert(c.renderEmbeds(l)),h.length===1&&l.length===1)return;let z=this.sanitizePastedElement(u,{renderer:c,validMediaURLs:l,validStandardURLs:K}).innerHTML.trim();z.length&&await this.insert(z,{disposition:"inline"})}catch(o){this.insert(c.renderError(o))}}finally{this.formElement&&delete this.formElement.pasting}}createTemplateElement(r){let n=document.createElement("template");return n.innerHTML=`<div>${r.trim()}</div>`,n.content.firstElementChild}extractLabelFromElement(r,n={default:null}){let a=r.title;return a&&a.length||(a=r.textContent.trim(),a&&a.length)?a:n.default}sanitizePastedElement(r,n={renderer:null,validMediaURLs:[],validStandardURLs:[]}){let{renderer:a,validMediaURLs:d,validStandardURLs:m}=n;r=r.cloneNode(!0);let u=C(r),h=[],f;for(;f=u.nextNode();)f.replacements=f.replacements||new Set,h.push(f),f.nodeValue.split(/\s+/).filter(g=>g.startsWith("http")).forEach(g=>{var w;let l=(w=b(g))==null?void 0:w.href,x=m.includes(l)||m.includes(l)?a.render("link",{url:l,label:l}):a.render("prohibited",{url:l,label:"Prohibited URL"});f.replacements.add({match:g,replacement:x})});return h.forEach(c=>{if(!c.replacements.size)return;let o=c.nodeValue;[...c.replacements].sort((l,x)=>x.match.length-l.match.length).forEach(l=>o=o.replaceAll(l.match,l.replacement)),c.replaceWith(this.createTemplateElement(o))}),r.querySelectorAll("a").forEach(c=>{let o=k(c),g=this.extractLabelFromElement(c,{default:o}),l=m.includes(o)?a.render("link",{url:o,label:g}):a.render("prohibited",{url:o,label:"Prohibited link"});c.replaceWith(this.createTemplateElement(l))}),r.querySelectorAll(X.join(", ")).forEach(c=>{let o=k(c),g=this.extractLabelFromElement(c,{default:o}),l=d.includes(o)?a.render("embedded",{url:o,label:"Allowed Media",description:"(embedded above)"}):a.render("prohibited",{url:o,label:"Prohibited media"});c.replaceWith(this.createTemplateElement(l))}),r.innerHTML.replaceAll(/(\n|\r|\f|\v)+/g,"<br>"),r}createAttachment(r){return new t.Attachment({content:r,contentType:_.attachment})}insertNewlines(r=1,n={delay:1}){let{delay:a}=n;return new Promise(d=>{setTimeout(()=>{for(let m=0;m<r;m++)this.editor.insertLineBreak();d()},a)})}insertAttachment(r,n={delay:1}){let{delay:a}=n;return new Promise(d=>{setTimeout(()=>{this.editor.insertAttachment(this.createAttachment(r)),this.insertNewlines(1,{delay:a}).finally(d)},a)})}insertHTML(r,n={delay:1}){let{delay:a}=n;return new Promise(d=>{setTimeout(()=>{this.editor.insertHTML(r),this.insertNewlines(1,{delay:a}).finally(d)},a)})}insert(r,n={delay:1,disposition:"attachment"}){let{delay:a,disposition:d}=n;return r!=null&&r.length?new Promise(m=>{setTimeout(()=>{if(typeof r=="string")return d==="inline"?this.insertHTML(r,{delay:a}).catch(u=>this.renderError(u)).finally(m):this.insertAttachment(r,{delay:a}).catch(u=>this.renderError(u)).finally(m);if(Array.isArray(r)){let u=d==="inline"?r.map(h=>this.insertHTML(h,{delay:a+1})):r.map(h=>this.insertAttachment(h,{delay:a+1}));return Promise.all(u).catch(h=>this.renderError(h)).finally(m)}m()})}):Promise.resolve()}get editor(){return this.element.editor}get toolbarElement(){let r=this.element.getAttribute("toolbar"),n=r?document.getElementById(r):null;if(!n){let a=this.element.previousElementSibling;n=a!=null&&a.tagName.match(/trix-toolbar/i)?a:null}return n}get inputElement(){var n;let r=this.element.getAttribute("input");return r?((n=this.formElement)==null?void 0:n.querySelector(`#${r}`))||document.getElementById(r):null}get formElement(){return this.element.closest("form")}get paranoid(){return!!this.store.read("paranoid")}get key(){try{return JSON.parse(this.store.read("key"))[2]}catch(r){}}get hosts(){try{return F(this.key,JSON.parse(this.store.read("hosts")))}catch(r){return[]}}get reservedDomains(){return["embed.example","embed.invalid","embed.local","embed.localhost","embed.test","trix.embed.example","trix.embed.invalid","trix.embed.local","trix.embed.localhost","trix.embed.test","trix.example","trix.invalid","trix.local","trix.localhost","trix.test","www.embed.example","www.embed.invalid","www.embed.local","www.embed.localhost","www.embed.test","www.trix.example","www.trix.invalid","www.trix.local","www.trix.localhost","www.trix.test"]}async rememberConfig(){let r=await T(),n=new Set;for(;n.size<3;)n.add(this.reservedDomains[Math.floor(Math.random()*this.reservedDomains.length)]);n=await y(r,[...n]);let a=await y(r,this.hostsValue);this.store.write("key",JSON.stringify([n[0],n[1],r,n[2]])),this.element.removeAttribute("data-trix-embed-key-value"),this.store.write("hosts",JSON.stringify(a)),this.element.removeAttribute("data-trix-embed-hosts-value"),this.paranoidValue!==!1&&(this.store.write("paranoid",JSON.stringify(n.slice(3))),this.element.removeAttribute("data-trix-embed-paranoid"))}forgetConfig(){var r,n,a;(r=this.store)==null||r.remove("key"),(n=this.store)==null||n.remove("hosts"),(a=this.store)==null||a.remove("paranoid")}},V(s,"values",{embeddedTemplate:String,errorTemplate:String,iframeTemplate:String,imageTemplate:String,linkTemplate:String,prohibitedTemplate:String,warningTemplate:String,hosts:Array,paranoid:{type:Boolean,default:!0}}),s}var ee=!1,ve={application:null,Controller:null,Trix:null};function Ee(i=ve){if(ee)return;let{application:e,Controller:t,Trix:s}=i;e.register("trix-embed",Z({Controller:t,Trix:s})),ee=!0}self.TrixEmbed=E(v({},W),{encryptValues:y,generateKey:T,generateKeyAndEncryptValues:$,initialize:Ee});var et=self.TrixEmbed;export{et as default};

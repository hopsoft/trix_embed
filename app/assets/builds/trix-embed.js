/*
  trix-embed 0.0.2 (MIT)
  Copyright © 2023 Nate Hopkins (hopsoft) <natehop@gmail.com>
*/
var Q=Object.defineProperty,Y=Object.defineProperties;var Z=Object.getOwnPropertyDescriptors;var P=Object.getOwnPropertySymbols;var ee=Object.prototype.hasOwnProperty,te=Object.prototype.propertyIsEnumerable;var M=(n,e,t)=>e in n?Q(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t,U=(n,e)=>{for(var t in e||(e={}))ee.call(e,t)&&M(n,t,e[t]);if(P)for(var t of P(e))te.call(e,t)&&M(n,t,e[t]);return n},R=(n,e)=>Y(n,Z(e));var S=(n,e,t)=>(M(n,typeof e!="symbol"?e+"":e,t),t);var A={name:"AES-GCM",length:256},re=!0,ie=["encrypt","decrypt"];async function ne(){let e=["encrypt","decrypt"];return await crypto.subtle.generateKey(A,!0,e)}async function se(n){let e=await crypto.subtle.exportKey("jwk",n);return JSON.stringify(e)}async function K(n){let e=JSON.parse(n);return await crypto.subtle.importKey("jwk",e,A,re,ie)}async function oe(n,e){let t=new TextEncoder().encode(String(n)),i=crypto.getRandomValues(new Uint8Array(12)),r=await crypto.subtle.encrypt(R(U({},A),{iv:i}),e,t),s={ciphertext:btoa(String.fromCharCode(...new Uint8Array(r))),iv:btoa(String.fromCharCode(...i))};return btoa(JSON.stringify(s))}async function ae(n,e){let t=JSON.parse(atob(n)),i=new Uint8Array(atob(t.ciphertext).split("").map(o=>o.charCodeAt(0))),r=new Uint8Array(atob(t.iv).split("").map(o=>o.charCodeAt(0))),s=await crypto.subtle.decrypt(R(U({},A),{iv:r}),e,i);return new TextDecoder().decode(s)}async function v(){let n=await ne(),e=await se(n);return btoa(e)}async function x(n,e=[]){let t=await K(atob(n));return Promise.all(e.map(i=>oe(i,t)))}async function $(n,e=[]){let t=await K(atob(n));return Promise.all(e.map(i=>ae(i,t)))}async function q(n=[]){let e=await v(),t=await x(e,n);return console.log(`data-trix-embed-key-value="${e}"`),console.log(`data-trix-embed-hosts-value='${JSON.stringify(t)}'`),{key:e,encryptedValues:t}}function h(n,e=t=>{}){try{let t=new URL(String(n).trim());return e&&e(t),t}catch(t){console.info(`Failed to parse URL! value='${n}']`)}return null}function V(n,e=t=>{}){let t=null;return h(n,i=>t=i.host),t&&e&&e(t),t}function le(n){let e=[],t=document.createTreeWalker(n,NodeFilter.SHOW_TEXT,r=>r.nodeValue.includes("http")?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT),i;for(;i=t.nextNode();)i.nodeValue.split(/\s+/).filter(r=>r.startsWith("http")).forEach(r=>h(r,s=>{e.includes(s.href)||e.push(s.href)}));return e}function ce(n){let e=[];return n.src&&h(n.src,i=>e.push(i.href)),n.href&&h(n.href,i=>{e.includes(i.href)||e.push(i.href)}),n.querySelectorAll("[src], [href]").forEach(i=>{h(i.src||i.href,r=>{e.includes(r.href)||e.push(r.href)})}),e}function N(n,e=[]){let t=!1;return V(n,i=>t=!!e.find(r=>i.includes(r))),t}function I(n){return n.reduce((e,t)=>(V(t,i=>{e.includes(i)||e.push(i)}),e),[])}function z(n){let e=ce(n),t=le(n);return[...new Set([...e,...t])]}var D={avif:"image/avif",bmp:"image/bmp",gif:"image/gif",heic:"image/heic",heif:"image/heif",ico:"image/x-icon",jp2:"image/jp2",jpeg:"image/jpeg",jpg:"image/jpeg",jxr:"image/vnd.ms-photo",png:"image/png",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",webp:"image/webp"};var de=D,me=["animate","animateMotion","animateTransform","area","audio","base","embed","feDisplacementMap","feImage","feTile","filter","font-face-uri","iframe","image","link","object","script","source","track","use","video"],ue=["audio","embed","iframe","img","input","script","source","track","video","frame","frameset","object","picture","use"],F=me.concat(ue);function J(n){return!!Object.values(D).find(e=>e===H(n))}function H(n){let e;if(h(n,r=>e=r),!e)return null;let t=e.pathname.lastIndexOf(".");if(!t)return null;let i=e.pathname.substring(t+1);return de[i]}var j={},E=class{constructor(e){S(this,"protectSubmit",e=>{let t=this.controller.formElement,i=e.target.closest("form");i&&i.action===t.action&&i.method===t.method&&i!==t&&e.preventDefault()});this.controller=e,e.element.addEventListener("trix-file-accept",t=>t.preventDefault())}protect(){if(!this.controller.formElement)return;let e=this.controller.formElement,t=this.controller.inputElement,i=`${e.method}${e.action}`;document.removeEventListener("submit",j[i],!0),j[i]=this.protectSubmit.bind(this),document.addEventListener("submit",j[i],!0),new MutationObserver((s,o)=>{s.forEach(a=>{let{addedNodes:m,target:u,type:p}=a;switch(p){case"attributes":let b=node.closest("form");e!=null&&e.action&&e.action===(b==null?void 0:b.action)&&(u.id===t.id||u.name===t.name)&&u.remove();break;case"childList":m.forEach(c=>{if(c.nodeType===Node.ELEMENT_NODE){let f=c.closest("form");e!=null&&e.action&&e.action===(f==null?void 0:f.action)?f!==e&&c.remove():t!=null&&t.name&&t.name===(c==null?void 0:c.name)&&c.remove()}});break}})}).observe(document.body,{attributeFilter:["id","name"],attributes:!0,childList:!0,subtree:!0})}cleanup(){let e=this.controller.element,t=this.controller.inputElement,i=this.controller.toolbarElement;t==null||t.remove(),i==null||i.remove(),e==null||e.remove()}};var T=class{constructor(e){var t;this.controller=e,this.base=this.obfuscate([location.pathname,(t=this.controller.element.closest("[id]"))==null?void 0:t.id].join("/"))}split(e){let t=Math.ceil(e.length/2);return[e.slice(0,t),e.slice(t)]}obfuscate(e){var r;let t=[...e].map(s=>s.charCodeAt(0));return[(r=this.split(t)[1])==null?void 0:r.reverse(),t[0]].flat().join("")}read(e){return sessionStorage.getItem(this.generateStorageKey(e))}write(e,t){return sessionStorage.setItem(this.generateStorageKey(e),t)}remove(e){return sessionStorage.removeItem(this.generateStorageKey(e))}generateStorageKey(e){let t=[...this.obfuscate(e)],[i,r]=this.split(t);return btoa(`${i}/${this.base}/${r}`)}};var he={header:"<h1></h1>",iframe:"<iframe></iframe>",image:"<img></img>",error:`
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
  `};function B(n){let e=document.createElement("template");return e.innerHTML=he[n],e}var pe="a abbr acronym action-text-attachment address b big blockquote br cite code dd del dfn div dl dt em figcaption figure h1 h2 h3 h4 h5 h6 hr i iframe img ins kbd li ol p pre samp small span strong sub sup time tt ul var".split(" "),fe="abbr allow allowfullscreen allowpaymentrequest alt caption cite content-type credentialless csp datetime filename filesize height href lang loading name presentation previewable referrerpolicy sandbox sgid src srcdoc title url width xml:lang".split(" "),w=class{constructor(e){this.controller=e,this.initializeTempates()}sanitize(e){return e}initializeTempates(){["error","exception","header","iframe","image"].forEach(t=>this.initializeTemplate(t))}initializeTemplate(e){let t;this.controller[`has${e.charAt(0).toUpperCase()+e.slice(1)}TemplateValue`]&&(t=document.getElementById(this.controller[`${e}TemplateValue`])),this[`${e}Template`]=t||B(e)}renderHeader(e){let t=this.headerTemplate.content.firstElementChild.cloneNode(!0),i=t.tagName.match(/h1/i)?t:t.querySelector("h1");return i.innerHTML=e,t.outerHTML}renderLinks(e=["https://example.com","https://test.com"]){return e=e.filter(i=>{let r=!1;return h(i,s=>r=!0),r}).sort(),e.length?`<ul>${e.map(i=>`<li><a href='${i}'>${i}</a></li>`).join("")}</ul><br>`:void 0}renderEmbed(e="https://example.com"){let t;if(J(e)){t=this.imageTemplate.content.firstElementChild.cloneNode(!0);let i=t.tagName.match(/img/i)?t:t.querySelector("img");i.src=e}else{t=this.iframeTemplate.content.firstElementChild.cloneNode(!0);let i=t.tagName.match(/iframe/i)?t:t.querySelector("iframe");i.src=e}return this.sanitize(t).outerHTML}renderEmbeds(e=["https://example.com","https://test.com"]){if(e!=null&&e.length)return e.map(t=>this.renderEmbed(t))}renderErrors(e=["https://example.com","https://test.com"],t=[]){if(!(e!=null&&e.length))return;let i=this.errorTemplate.content.firstElementChild.cloneNode(!0),r=i.querySelector('[data-list="prohibited-hosts"]'),s=i.querySelector('[data-list="allowed-hosts"]');if(r){let o=I(e).sort();o.length&&(r.innerHTML=o.map(a=>`<li>${a}</li>`).join(""))}return s&&t.length&&(s.innerHTML=t.map(o=>`<li>${o}</li>`).join("")),i.outerHTML}renderException(e){let t=this.exceptionTemplate.content.firstElementChild.cloneNode(!0),i=t.querySelector("code");return i.innerHTML=e.message,t.outerHTML}};var ge={Controller:null,Trix:null};function W(n=ge){var i;let{Controller:e,Trix:t}=n;return i=class extends e{async connect(){var r;this.onpaste=this.paste.bind(this),this.element.addEventListener("trix-paste",this.onpaste,!0),(r=this.toolbarElement.querySelector('[data-trix-button-group="file-tools"]'))==null||r.remove(),this.store=new T(this),this.guard=new E(this),await this.rememberConfig(),this.paranoid&&this.guard.protect(),window.addEventListener("beforeunload",()=>this.disconnect())}disconnect(){this.element.removeEventListener("trix-paste",this.onpaste,!0),this.paranoid&&this.guard.cleanup(),this.forgetConfig()}async paste(r){let{html:s,string:o,range:a}=r.paste,m=s||o||"",u=this.buildPastedTemplate(m),p=u.content.firstElementChild,c=this.sanitizePastedElement(p).innerHTML.trim(),f=z(p);if(!f.length)return;r.preventDefault(),this.editor.setSelectedRange(a);let C=await this.hosts,g=new w(this);try{let y=f.filter(l=>H(l));Array.from(u.content.firstElementChild.querySelectorAll("iframe")).forEach(l=>{y.includes(l.src)||y.push(l.src)});let k=y.filter(l=>N(l,C)),G=y.filter(l=>!k.includes(l)),O=f.filter(l=>!y.includes(l)),L=O.filter(l=>N(l,C)),X=O.filter(l=>!L.includes(l)),d;if(d=G,d.length&&await this.insert(g.renderErrors(d,C.sort())),d=X,d.length&&(await this.insert(g.renderHeader("Pasted URLs")),await this.insert(g.renderLinks(d),{disposition:"inline"})),d=k,d.length&&(d.length>1&&await this.insert(g.renderHeader("Embedded Media")),await this.insert(g.renderEmbeds(d))),d=L,d.length&&await this.insert(g.renderEmbeds(L)),k[0]===c||L[0]===c)return this.editor.insertLineBreak();c.length&&(await this.insert(g.renderHeader("Pasted Content",c)),this.editor.insertLineBreak(),this.insert(c,{disposition:"inline"}))}catch(y){this.insert(g.renderException(y))}}buildPastedTemplate(r){let s=document.createElement("template");return s.innerHTML=`<div>${r.trim()}</div>`,s}sanitizePastedElement(r){r=r.cloneNode(!0),r.querySelectorAll(F.join(", ")).forEach(a=>a.remove());let s=r.querySelectorAll("*"),o=r.innerHTML.match(/\r\n|\n|\r/g)||[];return(o.length?s.length/o.length:0)<=.1&&(r.innerHTML=r.innerHTML.replaceAll(/\r\n|\n|\r/g,"<br>")),r}insertAttachment(r,s={delay:0}){let{delay:o}=s;return new Promise(a=>{setTimeout(()=>{let m=new t.Attachment({content:r,contentType:"application/vnd.trix-embed"});this.editor.insertAttachment(m),a()},o)})}insertHTML(r,s={delay:0}){let{delay:o}=s;return new Promise(a=>{setTimeout(()=>{this.editor.insertHTML(r),this.editor.moveCursorInDirection("forward"),this.editor.insertLineBreak(),this.editor.moveCursorInDirection("backward"),a()},o)})}insert(r,s={delay:0,disposition:"attachment"}){let{delay:o,disposition:a}=s;return r!=null&&r.length?new Promise(m=>{setTimeout(()=>{if(typeof r=="string")return a==="inline"?this.insertHTML(r,{delay:o}).then(m):this.insertAttachment(r,{delay:o}).then(m);if(Array.isArray(r))return a==="inline"?r.reduce((u,p,b)=>u.then(this.insertHTML(p,{delay:o})),Promise.resolve()).then(m):r.reduce((u,p,b)=>u.then(this.insertAttachment(p,{delay:o})),Promise.resolve()).then(m);m()})}):Promise.resolve()}get editor(){return this.element.editor}get toolbarElement(){let r=this.element.previousElementSibling;return r!=null&&r.tagName.match(/trix-toolbar/i)?r:null}get inputElement(){var r;return((r=this.formElement)==null?void 0:r.querySelector(`#${this.element.getAttribute("input")}`))||document.getElementById(this.element.getAttribute("input"))}get formElement(){return this.element.closest("form")}get paranoid(){return!!this.store.read("paranoid")}get key(){try{return JSON.parse(this.store.read("key"))[2]}catch(r){}}get hosts(){try{return $(this.key,JSON.parse(this.store.read("hosts")))}catch(r){return[]}}get reservedDomains(){return["example.com","test.com","invalid.com","example.cat","nic.example","example.co.uk"]}async rememberConfig(){let r=await v(),s=await x(r,this.reservedDomains),o=await x(r,this.hostsValue);this.store.write("key",JSON.stringify([s[0],s[1],r,s[2]])),this.element.removeAttribute("data-trix-embed-key-value"),this.store.write("hosts",JSON.stringify(o)),this.element.removeAttribute("data-trix-embed-hosts-value"),this.paranoidValue!==!1&&(this.store.write("paranoid",JSON.stringify(s.slice(3))),this.element.removeAttribute("data-trix-embed-paranoid"))}forgetConfig(){this.store.remove("key"),this.store.remove("hosts"),this.store.remove("paranoid")}},S(i,"values",{validTemplate:String,errorTemplate:String,headerTemplate:String,iframeTemplate:String,imageTemplate:String,hosts:Array,paranoid:{type:Boolean,default:!0}}),i}var _=!1,ye={application:null,Controller:null,Trix:null};function be(n=ye){if(_)return;let{application:e,Controller:t,Trix:i}=n;e.register("trix-embed",W({Controller:t,Trix:i})),_=!0}self.TrixEmbed={initialize:be,generateKey:v,encryptValues:x,generateKeyAndEncryptValues:q};var Je=self.TrixEmbed;export{Je as default};

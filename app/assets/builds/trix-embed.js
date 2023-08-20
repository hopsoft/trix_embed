/*
  trix-embed 0.0.2 (MIT)
  Copyright © 2023 Nate Hopkins (hopsoft) <natehop@gmail.com>
*/
var Y=Object.defineProperty,Z=Object.defineProperties;var ee=Object.getOwnPropertyDescriptors;var V=Object.getOwnPropertySymbols;var te=Object.prototype.hasOwnProperty,re=Object.prototype.propertyIsEnumerable;var N=(i,e,t)=>e in i?Y(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t,v=(i,e)=>{for(var t in e||(e={}))te.call(e,t)&&N(i,t,e[t]);if(V)for(var t of V(e))re.call(e,t)&&N(i,t,e[t]);return i},E=(i,e)=>Z(i,ee(e));var U=(i,e,t)=>(N(i,typeof e!="symbol"?e+"":e,t),t);var q={author:"Nate Hopkins (hopsoft) <natehop@gmail.com>",copyright:"Copyright \xA9 2023 Nate Hopkins (hopsoft) <natehop@gmail.com>",description:"A Stimulus controller to safely embed external media in the Trix editor",license:"MIT",repository:"https://github.com/hopsoft/trix_embed",version:"0.0.2"};var R={name:"AES-GCM",length:256},ie=!0,ne=["encrypt","decrypt"];async function oe(){let e=["encrypt","decrypt"];return await crypto.subtle.generateKey(R,!0,e)}async function se(i){let e=await crypto.subtle.exportKey("jwk",i);return JSON.stringify(e)}async function P(i){let e=JSON.parse(i);return await crypto.subtle.importKey("jwk",e,R,ie,ne)}async function ae(i,e){let t=new TextEncoder().encode(String(i)),n=crypto.getRandomValues(new Uint8Array(12)),r=await crypto.subtle.encrypt(E(v({},R),{iv:n}),e,t),o={ciphertext:btoa(String.fromCharCode(...new Uint8Array(r))),iv:btoa(String.fromCharCode(...n))};return btoa(JSON.stringify(o))}async function le(i,e){let t=JSON.parse(atob(i)),n=new Uint8Array(atob(t.ciphertext).split("").map(s=>s.charCodeAt(0))),r=new Uint8Array(atob(t.iv).split("").map(s=>s.charCodeAt(0))),o=await crypto.subtle.decrypt(E(v({},R),{iv:r}),e,n);return new TextDecoder().decode(o)}async function w(){let i=await oe(),e=await se(i);return btoa(e)}async function x(i,e=[]){let t=await P(atob(i));return Promise.all(e.map(n=>ae(n,t)))}async function I(i,e=[]){let t=await P(atob(i));return Promise.all(e.map(n=>le(n,t)))}async function W(i=[]){let e=await w(),t=await x(e,i);return console.log(`data-trix-embed-key-value="${e}"`),console.log(`data-trix-embed-hosts-value='${JSON.stringify(t)}'`),{key:e,encryptedValues:t}}function g(i,e=t=>{}){try{let t=new URL(String(i).trim());return t&&e&&e(t),t}catch(t){console.info(`Failed to parse URL! value='${i}']`)}return null}function z(i,e=t=>{}){var n;let t=(n=g(i))==null?void 0:n.host;return t&&e&&e(t),t}function C(i){return document.createTreeWalker(i,NodeFilter.SHOW_TEXT,e=>e.nodeValue.match(/http/gi)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP)}function ce(i){let e=new Set,t=C(i),n;for(;n=t.nextNode();)n.nodeValue.split(/\s+/).filter(r=>r.startsWith("http")).forEach(r=>g(r,o=>e.add(o.href)));return[...e]}function k(i){if(i.src){let e=i.src.trim();if(e.length)return e}if(i.href){let e=i.href.trim();if(e.length)return e}return""}function me(i){let e=new Set;return i.src&&g(i.src,n=>e.add(n.href)),i.href&&g(i.href,n=>e.add(n.href)),i.querySelectorAll("[src], [href]").forEach(n=>g(k(n),r=>e.add(r.href))),[...e]}function M(i,e=[]){let t=z(i);return t?!!e.find(n=>t.includes(n)):!1}function F(i){return[...i.reduce((e,t)=>(z(t,n=>e.add(n)),e),new Set)]}function D(i){let e=me(i),t=ce(i);return[...new Set([...e,...t])]}var J={avif:"image/avif",bmp:"image/bmp",gif:"image/gif",heic:"image/heic",heif:"image/heif",ico:"image/x-icon",jp2:"image/jp2",jpeg:"image/jpeg",jpg:"image/jpeg",jxr:"image/vnd.ms-photo",png:"image/png",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",webp:"image/webp"};var de=J,ue=["animate","animateMotion","animateTransform","area","audio","base","embed","feDisplacementMap","feImage","feTile","filter","font-face-uri","iframe","image","link","object","script","source","track","use","video"],pe=["audio","embed","iframe","img","input","script","source","track","video","frame","frameset","object","picture","use"],_=ue.concat(pe);function B(i){return!!Object.values(J).find(e=>e===O(i))}function O(i){let e;if(e=g(i),!e)return null;let t=e.pathname.lastIndexOf(".");if(!t)return null;let n=e.pathname.substring(t+1);return de[n]}var j={},T=class{constructor(e){U(this,"protectSubmit",e=>{let t=this.controller.formElement,n=e.target.closest("form");n&&n.action===t.action&&n.method===t.method&&n!==t&&e.preventDefault()});this.controller=e}preventAttachments(){var e;(e=this.controller.toolbarElement.querySelector('[data-trix-button-group="file-tools"]'))==null||e.remove(),this.controller.element.removeAttribute("data-direct-upload-url"),this.controller.element.removeAttribute("data-blob-url-template"),this.controller.element.addEventListener("trix-file-accept",t=>t.preventDefault())}preventLinks(){var e;(e=this.controller.toolbarElement.querySelector('[data-trix-action="link"]'))==null||e.remove()}protect(){if(this.preventAttachments(),this.preventLinks(),!this.controller.formElement)return;let e=this.controller.formElement,t=this.controller.inputElement,n=`${e.method}${e.action}`;document.removeEventListener("submit",j[n],!0),j[n]=this.protectSubmit.bind(this),document.addEventListener("submit",j[n],!0),new MutationObserver((o,s)=>{o.forEach(d=>{let{addedNodes:h,target:u,type:m}=d;switch(m){case"attributes":let l=node.closest("form");e!=null&&e.action&&e.action===(l==null?void 0:l.action)&&(u.id===t.id||u.name===t.name)&&u.remove();break;case"childList":h.forEach(c=>{if(c.nodeType===Node.ELEMENT_NODE){let a=c.closest("form");e!=null&&e.action&&e.action===(a==null?void 0:a.action)?a!==e&&c.remove():t!=null&&t.name&&t.name===(c==null?void 0:c.name)&&c.remove()}});break}})}).observe(document.body,{attributeFilter:["id","name"],attributes:!0,childList:!0,subtree:!0})}cleanup(){let e=this.controller.element,t=this.controller.inputElement,n=this.controller.toolbarElement;t==null||t.remove(),n==null||n.remove(),e==null||e.remove()}};var L=class{constructor(e){var t;this.controller=e,this.base=this.obfuscate([location.pathname,(t=this.controller.element.closest("[id]"))==null?void 0:t.id].join("/"))}split(e){let t=Math.ceil(e.length/2);return[e.slice(0,t),e.slice(t)]}obfuscate(e){var r;let t=[...e].map(o=>o.charCodeAt(0));return[(r=this.split(t)[1])==null?void 0:r.reverse(),t[0]].flat().join("")}read(e){return sessionStorage.getItem(this.generateStorageKey(e))}write(e,t){return sessionStorage.setItem(this.generateStorageKey(e),t)}remove(e){return sessionStorage.removeItem(this.generateStorageKey(e))}generateStorageKey(e){let t=[...this.obfuscate(e)],[n,r]=this.split(t);return btoa(`${n}/${this.base}/${r}`)}};var he={iframe:"<div><iframe></iframe></div>",image:"<div><img></img></div>",warning:`
    <div>
      <h1>Copy/Paste Warning</h1>
      <hr>
      <h3>The pasted content includes media from unsupported hosts.</h3>
      <h2>Prohibited Hosts</h2>
      <ul data-list="prohibited-hosts">
        <li>Media is only supported from allowed hosts.</li>
      </ul>
      <h2>Allowed Hosts</h2>
      <ul data-list="allowed-hosts">
        <li>Allowed hosts not configured.</li>
      </ul>
    </div>
  `,error:`
    <div style='background-color:lightyellow; color:red; border:solid 1px red; padding:20px;'>
      <h1>Unhandled Exception!</h1>
      <p>Show a programmer the message below.</p>
      <pre style="background-color:darkslategray; color:whitesmoke; padding:10px;"><code></code></pre>
    </div>
  `};function G(i){let e=document.createElement("template");return e.innerHTML=he[i],e}var fe="a abbr acronym action-text-attachment address b big blockquote br cite code dd del dfn div dl dt em figcaption figure h1 h2 h3 h4 h5 h6 hr i iframe img ins kbd li ol p pre samp small span strong sub sup time tt ul var".split(" "),ge="abbr allow allowfullscreen allowpaymentrequest alt caption cite content-type credentialless csp datetime filename filesize height href lang loading name presentation previewable referrerpolicy sandbox sgid src srcdoc title url width xml:lang".split(" "),S=class{constructor(e){this.controller=e,this.initializeTempates()}sanitize(e){return[e].concat([...e.querySelectorAll("*")]).forEach(n=>{fe.includes(n.tagName.toLowerCase())?[...n.attributes].forEach(r=>{ge.includes(r.name.toLowerCase())||n.removeAttribute(r.name)}):n.remove()}),e}initializeTempates(){["error","iframe","image","warning"].forEach(t=>this.initializeTemplate(t))}initializeTemplate(e){let t,n=`${e}Template`,r=`${n}Value`;this.controller[`has${r.charAt(0).toUpperCase()+r.slice(1)}`]&&(t=document.getElementById(this.controller[r])),this[n]=t||G(e),this.controller[r]=null}renderEmbed(e="https://example.com"){let t;if(B(e)){t=this.imageTemplate.content.firstElementChild.cloneNode(!0);let n=t.tagName.match(/img/i)?t:t.querySelector("img");n.src=e}else{t=this.iframeTemplate.content.firstElementChild.cloneNode(!0);let n=t.tagName.match(/iframe/i)?t:t.querySelector("iframe");n.src=e}return this.sanitize(t).outerHTML}renderEmbeds(e=["https://example.com","https://test.com"]){if(e!=null&&e.length)return e.map(t=>this.renderEmbed(t))}renderWarnings(e=["https://example.com","https://test.com"],t=[]){if(!(e!=null&&e.length))return;let n=this.warningTemplate.content.firstElementChild.cloneNode(!0),r=n.querySelector('[data-list="prohibited-hosts"]'),o=n.querySelector('[data-list="allowed-hosts"]');if(r){let s=F(e).sort();s.length&&(r.innerHTML=s.map(d=>`<li>${d}</li>`).join(""))}return o&&t.length&&(o.innerHTML=t.map(s=>`<li>${s}</li>`).join("")),n.outerHTML}renderError(){let e=this.errorTemplate.content.firstElementChild.cloneNode(!0),t=e.querySelector("code");return t.innerHTML=error.message,e.outerHTML}};var be={Controller:null,Trix:null};function X(i=be){var n;let{Controller:e,Trix:t}=i;return n=class extends e{async connect(){this.guard=new T(this),this.paranoidValue&&this.guard.protect(),this.store=new L(this),await this.rememberConfig(),this.onpaste=this.paste.bind(this),this.element.addEventListener("trix-paste",this.onpaste,!0),window.addEventListener("beforeunload",()=>this.disconnect())}disconnect(){this.element.removeEventListener("trix-paste",this.onpaste,!0),this.paranoid&&this.guard.cleanup(),this.forgetConfig()}async paste(r){let{html:o,string:s,range:d}=r.paste,h=o||s||"",u=this.createTemplateElement(h),m=D(u);if(console.log("pastedElement",u),console.log("pastedURLs",m),!m.length)return;r.preventDefault(),this.editor.setSelectedRange(d);let l=await this.hosts,c=new S(this);try{let a=new Set(m.filter(f=>O(f)));[...u.querySelectorAll("iframe")].forEach(f=>a.add(f.src)),a=[...a];let b=a.filter(f=>M(f,l)),A=a.filter(f=>!b.includes(f)),H=m.filter(f=>!a.includes(f)),$=H.filter(f=>M(f,l)),ve=H.filter(f=>!$.includes(f)),y;if(y=A,y.length&&await this.insert(c.renderWarnings(y,l.sort())),y=b,y.length&&await this.insert(c.renderEmbeds(y)),m.length===1&&b.length===1)return;let K=this.sanitizePastedElement(u,{validMediaURLs:b,validStandardURLs:$}).innerHTML.trim();K.length&&this.insert(K,{disposition:"inline"})}catch(a){this.insert(c.renderError(a))}}createTemplateElement(r){let o=document.createElement("template");return o.innerHTML=`<div>${r.trim()}</div>`,o.content.firstElementChild}extractLabelFromElement(r,o={default:null}){let s=r.title;return s&&s.length||(s=r.textContent.trim(),s&&s.length)?s:o.default}sanitizePastedElement(r,o={validMediaURLs:[],validStandardURLs:[]}){let{validMediaURLs:s,validStandardURLs:d}=o;r=r.cloneNode(!0),r.querySelectorAll(_.join(", ")).forEach(l=>{let c=k(l),a=this.extractLabelFromElement(l,{default:c}),p=s.includes(c)?`<ins>${a}</ins>`:`<del>${a}</del>`;l.replaceWith(this.createTemplateElement(p))}),r.querySelectorAll("a").forEach(l=>{let c=k(l),a=this.extractLabelFromElement(l,{default:c}),p=d.includes(c)?`<a href="${c}">${a}</a>`:`<del>${a}</del>`;l.replaceWith(this.createTemplateElement(p))});let h=C(r),u=[],m;for(;m=h.nextNode();)m.replacements=m.replacements||new Set,u.push(m),m.nodeValue.split(/\s+/).filter(a=>a.startsWith("http")).forEach(a=>{var A;let p=(A=g(a))==null?void 0:A.href,b=d.includes(p)||d.includes(p)?`<a href="${p}">${p}</a><br>`:`<del>${p}</del><br>`;m.replacements.add({match:a,replacement:b})});return u.forEach(l=>{if(!l.replacements.size)return;let c=l.nodeValue;[...l.replacements].sort((p,b)=>b.match.length-p.match.length).forEach(p=>c=c.replaceAll(p.match,p.replacement)),l.replaceWith(this.createTemplateElement(c))}),r.innerHTML.replaceAll(/(\n|\r|\f|\v)+/g,"<br>"),r}insertAttachment(r,o={delay:0}){let{delay:s}=o;return new Promise(d=>{setTimeout(()=>{let h=new t.Attachment({content:r,contentType:"application/vnd.trix-embed"});this.editor.insertAttachment(h),d()},s)})}insertHTML(r,o={delay:0}){let{delay:s}=o;return new Promise(d=>{setTimeout(()=>{this.editor.insertHTML(r),this.editor.moveCursorInDirection("forward"),this.editor.insertLineBreak(),this.editor.moveCursorInDirection("backward"),d()},s)})}insert(r,o={delay:0,disposition:"attachment"}){let{delay:s,disposition:d}=o;return r!=null&&r.length?new Promise(h=>{setTimeout(()=>{if(typeof r=="string")return d==="inline"?this.insertHTML(r,{delay:s}).then(h):this.insertAttachment(r,{delay:s}).then(h);if(Array.isArray(r))return d==="inline"?r.reduce((u,m,l)=>u.then(this.insertHTML(m,{delay:s})),Promise.resolve()).then(h):r.reduce((u,m,l)=>u.then(this.insertAttachment(m,{delay:s})),Promise.resolve()).then(h);h()})}):Promise.resolve()}get editor(){return this.element.editor}get toolbarElement(){let r=this.element.previousElementSibling;return r!=null&&r.tagName.match(/trix-toolbar/i)?r:null}get inputElement(){var r;return((r=this.formElement)==null?void 0:r.querySelector(`#${this.element.getAttribute("input")}`))||document.getElementById(this.element.getAttribute("input"))}get formElement(){return this.element.closest("form")}get paranoid(){return!!this.store.read("paranoid")}get key(){try{return JSON.parse(this.store.read("key"))[2]}catch(r){}}get hosts(){try{return I(this.key,JSON.parse(this.store.read("hosts")))}catch(r){return[]}}get reservedDomains(){return["example.com","test.com","invalid.com","example.cat","nic.example","example.co.uk"]}async rememberConfig(){let r=await w(),o=await x(r,this.reservedDomains),s=await x(r,this.hostsValue);this.store.write("key",JSON.stringify([o[0],o[1],r,o[2]])),this.element.removeAttribute("data-trix-embed-key-value"),this.store.write("hosts",JSON.stringify(s)),this.element.removeAttribute("data-trix-embed-hosts-value"),this.paranoidValue!==!1&&(this.store.write("paranoid",JSON.stringify(o.slice(3))),this.element.removeAttribute("data-trix-embed-paranoid"))}forgetConfig(){this.store.remove("key"),this.store.remove("hosts"),this.store.remove("paranoid")}},U(n,"values",{warningTemplate:String,iframeTemplate:String,imageTemplate:String,hosts:Array,paranoid:{type:Boolean,default:!0}}),n}var Q=!1,ye={application:null,Controller:null,Trix:null};function xe(i=ye){if(Q)return;let{application:e,Controller:t,Trix:n}=i;e.register("trix-embed",X({Controller:t,Trix:n})),Q=!0}self.TrixEmbed=E(v({},q),{encryptValues:x,generateKey:w,generateKeyAndEncryptValues:W,initialize:xe});var Qe=self.TrixEmbed;export{Qe as default};

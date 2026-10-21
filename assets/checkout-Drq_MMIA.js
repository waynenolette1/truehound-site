import{P as e}from"./app-shared-B66wY_Wf.js";var t=e.brand.product,n=`Book the migration`;function r(e){let t=(e??``).trim();if(!t)return null;try{let e=new URL(t);return e.protocol===`https:`?e.toString():null}catch{return null}}var i=r(void 0);function a(n){let r=e.links?.salesEmail||`truehoundhq@truehound.io`,i=n?`${t}: book the migration (${n})`:`${t}: book the migration`,a=`Hi ${t} team,

I'd like to book the Compass migration${n?` on ${n}`:``}.

Name:
Company:
Services in Compass (roughly):
Compass renewal date:
`;return`mailto:${r}?subject=${encodeURIComponent(i)}&body=${encodeURIComponent(a)}`}function o(e={}){let t=e.checkoutUrl===void 0?i:e.checkoutUrl;return t?{kind:`checkout`,href:t,label:e.plan?`Buy ${e.plan}`:`Pay and book the migration`,external:!0}:{kind:`contact`,href:a(e.plan),label:n,external:!1}}var s=`If your Compass migration is not done before your renewal date, the migration fee is refunded.`,c={migration:{S:r(`https://buy.stripe.com/bJe9AV2RZ9Jcbnn5jFfMA08`),M:r(`https://buy.stripe.com/bJe3cx78f2gKajj4fBfMA09`),L:r(`https://buy.stripe.com/5kQ4gB64b08CfDD6nJfMA0a`)},keptTrue:{S:r(`https://buy.stripe.com/8x2fZj507dZs2QR27tfMA03`),M:r(`https://buy.stripe.com/bJe14p8cj9JcfDD8vRfMA05`),L:r(`https://buy.stripe.com/4gMdRb50708C0IJ13pfMA07`)}},l={S:r(`https://buy.stripe.com/6oU3cx1NV6x08bbh2nfMA02`),M:r(`https://buy.stripe.com/cNicN7akr5sW633aDZfMA04`),L:r(`https://buy.stripe.com/eVqbJ378f7B46337rNfMA06`)},u={monthly:r(`https://buy.stripe.com/eVq8wR2RZf3wcrr13pfMA00`),annual:r(`https://buy.stripe.com/fZu9AVcszcVo1MNaDZfMA01`)},d={audit:r(`https://buy.stripe.com/4gM28takrdZs77727tfMA0b`),watch:r(`https://buy.stripe.com/cNidRbfELdZsgHHaDZfMA0c`)};function f(n,r){let i=e.links?.salesEmail||`truehoundhq@truehound.io`,a=`${t}: activate ${n}`,o=`Hi ${t} team,

I'd like to pay for ${n} and activate my workspace.

Name:
Company:
Account email: ${r??``}
`;return`mailto:${i}?subject=${encodeURIComponent(a)}&body=${encodeURIComponent(o)}`}function p(e,t=c,n=l,r=u,i=d){let a=e.offer===`audit`||e.offer===`watch`?i[e.offer]:e.offer===`starter`?r[e.term===`annual`?`annual`:`monthly`]:e.offer===`keptTrue`&&e.term===`monthly`?n[e.band]??t.keptTrue[e.band]:t[e.offer][e.band];if(a){let t=new URL(a);return e.email&&t.searchParams.set(`prefilled_email`,e.email),{kind:`checkout`,href:t.toString(),label:e.offer===`migration`?`Pay the deposit`:`Pay and activate`,external:!0}}return{kind:`contact`,href:f(e.planName,e.email),label:`Email sales to pay`,external:!1}}export{o as n,p as r,s as t};
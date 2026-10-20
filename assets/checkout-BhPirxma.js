import{P as e}from"./app-shared-BKVSJ747.js";var t=e.brand.product,n=`Book the migration`;function r(e){let t=(e??``).trim();if(!t)return null;try{let e=new URL(t);return e.protocol===`https:`?e.toString():null}catch{return null}}var i=r(void 0);function a(n){let r=e.links?.salesEmail||`truehoundhq@truehound.io`,i=n?`${t}: book the migration (${n})`:`${t}: book the migration`,a=`Hi ${t} team,

I'd like to book the Compass migration${n?` on ${n}`:``}.

Name:
Company:
Services in Compass (roughly):
Compass renewal date:
`;return`mailto:${r}?subject=${encodeURIComponent(i)}&body=${encodeURIComponent(a)}`}function o(e={}){let t=e.checkoutUrl===void 0?i:e.checkoutUrl;return t?{kind:`checkout`,href:t,label:e.plan?`Buy ${e.plan}`:`Pay and book the migration`,external:!0}:{kind:`contact`,href:a(e.plan),label:n,external:!1}}var s=`If your Compass migration is not done before your renewal date, the migration fee is refunded.`,c={migration:{S:r(void 0),M:r(void 0),L:r(void 0)},keptTrue:{S:r(void 0),M:r(void 0),L:r(void 0)}},l={S:r(void 0),M:r(void 0),L:r(void 0)},u={monthly:r(void 0),annual:r(void 0)};function d(n,r){let i=e.links?.salesEmail||`truehoundhq@truehound.io`,a=`${t}: activate ${n}`,o=`Hi ${t} team,

I'd like to pay for ${n} and activate my workspace.

Name:
Company:
Account email: ${r??``}
`;return`mailto:${i}?subject=${encodeURIComponent(a)}&body=${encodeURIComponent(o)}`}function f(e,t=c,n=l,r=u){let i=e.offer===`starter`?r[e.term===`annual`?`annual`:`monthly`]:e.offer===`keptTrue`&&e.term===`monthly`?n[e.band]??t.keptTrue[e.band]:t[e.offer][e.band];if(i){let t=new URL(i);return e.email&&t.searchParams.set(`prefilled_email`,e.email),{kind:`checkout`,href:t.toString(),label:e.offer===`migration`?`Pay the deposit`:`Pay and activate`,external:!0}}return{kind:`contact`,href:d(e.planName,e.email),label:`Email sales to pay`,external:!1}}export{o as n,f as r,s as t};
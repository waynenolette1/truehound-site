import{P as e}from"./app-shared-C36vUb1l.js";var t=e.brand.product,n=`Book the migration`;function r(e){let t=(e??``).trim();if(!t)return null;try{let e=new URL(t);return e.protocol===`https:`?e.toString():null}catch{return null}}var i=r(void 0);function a(n){let r=e.links?.salesEmail||`sales@truehound.io`,i=n?`${t}: book the migration (${n})`:`${t}: book the migration`,a=`Hi ${t} team,

I'd like to book the Compass migration${n?` on ${n}`:``}.

Name:
Company:
Services in Compass (roughly):
Compass renewal date:
`;return`mailto:${r}?subject=${encodeURIComponent(i)}&body=${encodeURIComponent(a)}`}function o(e={}){let t=e.checkoutUrl===void 0?i:e.checkoutUrl;return t?{kind:`checkout`,href:t,label:e.plan?`Buy ${e.plan}`:`Pay and book the migration`,external:!0}:{kind:`contact`,href:a(e.plan),label:n,external:!1}}var s=`If your Compass migration is not done before your renewal date, the migration fee is refunded.`,c={migration:{S:r(void 0),M:r(void 0),L:r(void 0)},keptTrue:{S:r(void 0),M:r(void 0),L:r(void 0)}},l={migration:`the Compass migration`,keptTrue:`Catalog kept true`};function u(n,r){let i=e.links?.salesEmail||`sales@truehound.io`,a=`${t}: ${l[n]} (${r})`,o=`Hi ${t} team,

I'd like to buy ${l[n]} (${r}).

Name:
Company:
Services, roughly:
${n===`migration`?`Compass renewal date:
`:``}`;return`mailto:${i}?subject=${encodeURIComponent(a)}&body=${encodeURIComponent(o)}`}function d(e,t,r,i=c){let a=i[e][t];return a?{kind:`checkout`,href:a,label:e===`migration`?`Pay the deposit`:`Buy Catalog kept true`,external:!0}:{kind:`contact`,href:u(e,r),label:e===`migration`?n:`Talk to us to start`,external:!1}}export{d as n,o as r,s as t};
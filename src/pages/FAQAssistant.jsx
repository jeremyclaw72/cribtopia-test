import React, { useState } from 'react';

const LOGO = "https://media.base44.com/images/public/69b1a2ff64aa2c797de555bf/b3c405919_IMG_6232.png";

const FAQS = [
  { q: 'What is Cribtopia?', a: 'Cribtopia is a platform for buying, selling, and renting properties without agents. No commissions, no middlemen.' },
  { q: 'How does FSBO work?', a: 'FSBO (For Sale By Owner) lets you list your property for free. Buyers make offers directly through our platform.' },
  { q: 'What is Rent-to-Own?', a: 'Rent-to-Own allows you to rent a property with an option to purchase it later. A portion of your rent goes toward the down payment.' },
  { q: 'How are contracts generated?', a: 'Our AI generates state-specific contracts based on your transaction details. All 50 states are supported.' },
  { q: 'Is there a fee?', a: 'Basic listings are free. Premium listings and AI features have optional upgrade plans.' },
];

export default function FAQAssistant() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a2540, #1a3a5c)', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      {/* Nav */}
      <nav style={{ padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <img src={LOGO} style={{ height: 32, borderRadius: 7 }} alt="Cribtopia" />
        <span style={{ fontWeight: 800, fontSize: 16 }}>Cribtopia</span>
        <span style={{ marginLeft: 'auto' }} />
        <a href="#/" style={{ color: '#10b981', textDecoration: 'none' }}>← Home</a>
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: 40 }}>
        <h1 style={{ margin: '0 0 30px', textAlign: 'center' }}>❓ Frequently Asked Questions</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} style={{ width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', color: '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16, fontWeight: 600 }}>
                {faq.q}
                <span style={{ fontSize: 20 }}>{openIndex === i ? '−' : '+'}</span>
              </button>
              {openIndex === i && (
                <div style={{ padding: '0 20px 16px', opacity: 0.8, lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <p style={{ marginTop: 40, textAlign: 'center', opacity: 0.6, fontSize: 14 }}>
          Still have questions? Use the chat widget in the bottom right corner.
        </p>
      </div>
    </div>
  );
}
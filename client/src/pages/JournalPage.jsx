import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';

const JournalPage = () => {
  const articles = [
    {
      id: 1,
      tag: 'CRAFT & HERITAGE',
      title: 'The Art of Seasoned Walnut: Why Fine Artisan Timbers Outlast Industrial Furniture',
      excerpt:
        'A rare glimpse into our 90-day natural kiln conditioning process, and how timber grain memory resists cracking over decades.',
      date: 'OCTOBER 2026',
      readTime: '6 MIN READ',
      image: '/uploads/hero-slide-1.jpg'
    },
    {
      id: 2,
      tag: 'LIGHTING DESIGN',
      title: 'Circadian Sanctuaries: The Emotional Architecture of 2700K Warmth',
      excerpt:
        'Why switching off overhead harsh white illumination in favor of low-level ambient table lamps alters evening cortisol and prepares the mind for restorative sleep.',
      date: 'SEPTEMBER 2026',
      readTime: '4 MIN READ',
      image: '/uploads/hero-slide-2.jpg'
    },
    {
      id: 3,
      tag: 'INTERIOR STYLING',
      title: 'Styling the Sculptural Mushroom Silhouette: Console Proportions & Balance',
      excerpt:
        'Interior stylists share how pairing domed wooden lamps with raw ceramic vessels and art monographs creates an effortlessly layered entryway credenza.',
      date: 'AUGUST 2026',
      readTime: '5 MIN READ',
      image: '/uploads/hero-slide-3.jpg'
    },
    {
      id: 4,
      tag: 'ATELIER CARE',
      title: 'Restoring Hand-Turned Woodwork: A Guide to Cold-Pressed Linseed & Beeswax',
      excerpt:
        'Simple annual rituals to nurture the living timber grain of your ELQARA luminaires and deepen their honey patina over generations.',
      date: 'JULY 2026',
      readTime: '3 MIN READ',
      image: '/uploads/prod-carved-vessel.jpg'
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', paddingBottom: '6rem' }}>
      <section
        style={{
          paddingTop: '4.5rem',
          paddingBottom: '4.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-hairline)'
        }}
      >
        <div className="container" style={{ maxWidth: '780px', textAlign: 'center' }}>
          <span className="pre-heading" style={{ justifyContent: 'center' }}>
            THE ELQARA JOURNAL
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', color: 'var(--text-main)', marginTop: '0.4rem', marginBottom: '0.8rem' }}>
            Reflections on Light, Wood & Living
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
            Essays on architectural lighting design, artisan lineages, and considered interior environments.
          </p>
        </div>
      </section>

      <section className="container" style={{ paddingTop: '4rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem'
          }}
        >
          {articles.map((item) => (
            <article
              key={item.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ aspectRatio: '16 / 10', backgroundColor: '#F4EFEA', overflow: 'hidden' }}>
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>{item.tag}</span>
                  <span>•</span>
                  <span>{item.date}</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={12} /> {item.readTime}
                  </span>
                </div>

                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', lineHeight: 1.25, color: 'var(--text-main)', marginBottom: '0.8rem' }}>
                  {item.title}
                </h2>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {item.excerpt}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-hairline)' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    <span>Read Essay</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default JournalPage;

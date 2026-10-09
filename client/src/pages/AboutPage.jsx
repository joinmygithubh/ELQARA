import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, ShieldCheck, Sparkles } from 'lucide-react';

const AboutPage = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', paddingBottom: '6rem' }}>
      {/* Editorial Banner */}
      <section
        style={{
          paddingTop: '5rem',
          paddingBottom: '5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-hairline)'
        }}
      >
        <div className="container" style={{ maxWidth: '820px', textAlign: 'center' }}>
          <span className="pre-heading" style={{ justifyContent: 'center' }}>
            THE ELQARA PHILOSOPHY
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.6rem, 4.5vw, 3.8rem)',
              lineHeight: 1.12,
              marginTop: '0.6rem',
              marginBottom: '1.25rem',
              color: 'var(--text-main)'
            }}
          >
            Light as a Living Presence. Form as Considered Stillness.
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--text-body)', fontWeight: 300 }}>
            ELQARA was founded on a quiet conviction: that the objects illuminating our private dwellings should not be mass-produced industrial artifacts, but enduring sculptural companions shaped with artisan care.
          </p>
        </div>
      </section>

      {/* Main Narrative with Image Split */}
      <section className="container" style={{ paddingTop: '5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '4rem',
            alignItems: 'center',
            marginBottom: '6rem'
          }}
        >
          <div>
            <span className="pre-heading">GENESIS & HERITAGE</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.6rem', marginTop: '0.6rem', marginBottom: '1.25rem' }}>
              The Lineage of Fine Woodturning
            </h2>
            <p style={{ fontSize: '0.98rem', lineHeight: 1.8, color: 'var(--text-body)', marginBottom: '1.25rem' }}>
              At ELQARA, we celebrate the enduring lineage of artisanal woodworking. Master craftspeople pass down lathe techniques, woodturning gouges, and hand-carving chisels to create timeless forms that honor raw materials.
            </p>
            <p style={{ fontSize: '0.98rem', lineHeight: 1.8, color: 'var(--text-body)', marginBottom: '2rem' }}>
              ELQARA was established to celebrate this dedicated craft in the modern era. By uniting traditional woodturners with minimalist architectural sensibilities, we create lamps that feel at home in Tokyo apartments, Scandinavian villas, and contemporary sanctuaries alike.
            </p>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--accent-gold)' }}>90+ Days</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kiln-Seasoned Timbers</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border-hairline)' }} />
              <div>
                <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--accent-gold)' }}>0% Plastic</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pure Solid Wood, Glass & Brass</div>
              </div>
            </div>
          </div>

          <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            <img
              src="/uploads/hero-slide-1.jpg"
              alt="Artisanal woodturning at ELQARA"
              style={{ width: '100%', height: '480px', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* 3 Pillars of Discipline */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '4rem 3rem', borderRadius: 'var(--radius-sm)', marginBottom: '6rem' }}>
          <div className="section-header-wrap">
            <span className="pre-heading">THREE DISCIPLINES</span>
            <h2 className="section-title">How Every ELQARA Object is Realized</h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '2.5rem'
            }}
          >
            <div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--accent-gold)', display: 'block', marginBottom: '0.5rem' }}>
                01
              </span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.6rem' }}>
                Conscious Material Sourcing
              </h3>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text-body)' }}>
                We work exclusively with certified seasoned walnut, Sheesham (Indian rosewood), cast brass, and mouth-blown borosilicate glass. No synthetic resins or veneer imitations.
              </p>
            </div>

            <div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--accent-gold)', display: 'block', marginBottom: '0.5rem' }}>
                02
              </span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.6rem' }}>
                Generational Master Handiwork
              </h3>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text-body)' }}>
                Each curved mushroom shade, fluted bowl, and arc spine is shaped on manual lathes in our atelier. The natural grain differences make every single piece unique in the world.
              </p>
            </div>

            <div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--accent-gold)', display: 'block', marginBottom: '0.5rem' }}>
                03
              </span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.6rem' }}>
                Calibrated Circadian Warmth
              </h3>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text-body)' }}>
                We eliminate harsh cold blue LEDs. All lamps operate at 2200K – 2700K golden spectrums that soften architecture and signal peaceful restorative evening time.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', maxWidth: '580px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginBottom: '1rem' }}>
            Bring Quiet Luxury Into Your Dwellings
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Browse our current catalog of limited artisanal luminaires.
          </p>
          <Link to="/shop" className="btn-dark">
            <span>Explore Current Editions</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

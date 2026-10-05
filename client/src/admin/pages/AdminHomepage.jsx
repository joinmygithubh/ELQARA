import React, { useState, useEffect } from 'react';
import { Home, Save, Check } from 'lucide-react';
import { homepageAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminHomepage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await homepageAPI.get();
        if (res.data?.success) {
          setSettings(res.data.settings);
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await homepageAPI.update(settings);
      if (res.data?.success) {
        showToast('Homepage settings updated successfully', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem' }}>Loading homepage settings...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="pre-heading">STOREFRONT CONTENT</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
          Homepage & Banner Configuration
        </h1>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '820px' }}>
        {/* Announcement Bar */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1.25rem' }}>
            Top Announcement Bar
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Announcement Message
              </label>
              <input
                type="text"
                value={settings?.announcementBar?.text || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcementBar: { ...settings.announcementBar, text: e.target.value }
                  })
                }
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings?.announcementBar?.enabled || false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcementBar: { ...settings.announcementBar, enabled: e.target.checked }
                  })
                }
                style={{ accentColor: 'var(--text-main)', width: '16px', height: '16px' }}
              />
              <span>Display Announcement Bar on Storefront</span>
            </label>
          </div>
        </div>

        {/* Primary Hero Slide (Matches Provided UI) */}
        {settings?.heroSlides && settings.heroSlides.length > 0 && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.4rem' }}>
              Primary Hero Slide (Slide 01 — Reference UI)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Controls the centerpiece typography and image seen immediately when customers arrive at ELQARA.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Pre-Heading
                </label>
                <input
                  type="text"
                  value={settings.heroSlides[0]?.preheading || ''}
                  onChange={(e) => {
                    const updated = [...settings.heroSlides];
                    updated[0].preheading = e.target.value;
                    setSettings({ ...settings, heroSlides: updated });
                  }}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Main Editorial Heading (Line breaks supported with \n)
                </label>
                <textarea
                  rows={2}
                  value={settings.heroSlides[0]?.title || ''}
                  onChange={(e) => {
                    const updated = [...settings.heroSlides];
                    updated[0].title = e.target.value;
                    setSettings({ ...settings, heroSlides: updated });
                  }}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Subtitle Narrative
                </label>
                <textarea
                  rows={2}
                  value={settings.heroSlides[0]?.subtitle || ''}
                  onChange={(e) => {
                    const updated = [...settings.heroSlides];
                    updated[0].subtitle = e.target.value;
                    setSettings({ ...settings, heroSlides: updated });
                  }}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Button Call-to-Action Text
                  </label>
                  <input
                    type="text"
                    value={settings.heroSlides[0]?.buttonText || ''}
                    onChange={(e) => {
                      const updated = [...settings.heroSlides];
                      updated[0].buttonText = e.target.value;
                      setSettings({ ...settings, heroSlides: updated });
                    }}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Top-Right Heritage Badge Text
                  </label>
                  <input
                    type="text"
                    value={settings.heroSlides[0]?.badgeText || ''}
                    onChange={(e) => {
                      const updated = [...settings.heroSlides];
                      updated[0].badgeText = e.target.value;
                      setSettings({ ...settings, heroSlides: updated });
                    }}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-dark"
          style={{ width: 'fit-content', padding: '0.95rem 2rem' }}
        >
          <Save size={16} />
          <span>{saving ? 'Saving Settings...' : 'Save & Publish Storefront Settings'}</span>
        </button>
      </form>
    </div>
  );
};

export default AdminHomepage;

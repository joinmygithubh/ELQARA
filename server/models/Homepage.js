import mongoose from 'mongoose';

const homepageSchema = new mongoose.Schema(
  {
    heroSlides: [
      {
        preheading: { type: String, default: 'PREMIUM HOME DÉCOR & LIGHTING' },
        title: { type: String, default: 'Crafted forms. Considered spaces.' },
        subtitle: {
          type: String,
          default: 'Discover handcrafted lighting and décor that brings warmth, character and calm to your space.'
        },
        buttonText: { type: String, default: 'EXPLORE COLLECTION' },
        buttonLink: { type: String, default: '/shop' },
        badgeText: { type: String, default: 'Handcrafted in India' },
        image: { type: String, required: true },
        slideNumber: { type: String, default: '01' }
      }
    ],
    announcementBar: {
      text: { type: String, default: 'Complimentary shipping on all handcrafted artisanal orders across India' },
      enabled: { type: Boolean, default: true }
    },
    featuredCollectionTitle: {
      type: String,
      default: 'The Saharanpur Heritage'
    },
    featuredCollectionSubtitle: {
      type: String,
      default: 'Sculpted by generational woodturners and brass artisans in Uttar Pradesh.'
    }
  },
  {
    timestamps: true,
    autoIndex: false
  }
);

const Homepage = mongoose.models.Homepage || mongoose.model('Homepage', homepageSchema);
export default Homepage;

import Homepage from '../models/Homepage.js';

// @desc    Get homepage configuration
// @route   GET /api/homepage
// @access  Public
export const getHomepageSettings = async (req, res, next) => {
  try {
    let settings = await Homepage.findOne().lean();
    if (!settings) {
      const created = await Homepage.create({
        heroSlides: [
          {
            preheading: 'PREMIUM HOME DÉCOR & LIGHTING',
            title: 'Crafted forms.\nConsidered spaces.',
            subtitle: 'Discover handcrafted lighting and décor that brings warmth, character and calm to your space.',
            buttonText: 'EXPLORE COLLECTION',
            buttonLink: '/shop',
            badgeText: 'Handcrafted in India',
            image: '/uploads/hero-slide-1.jpg',
            slideNumber: '01'
          },
          {
            preheading: 'ARCHITECTURAL ILLUMINATION',
            title: 'Subtle warmth.\nTimeless glass.',
            subtitle: 'Fluted amber crystal and brushed brass that infuse every corner with gentle, considered radiance.',
            buttonText: 'DISCOVER LAMPS',
            buttonLink: '/shop?category=table-lamps',
            badgeText: 'Artisanal Brasswork',
            image: '/uploads/hero-slide-2.jpg',
            slideNumber: '02'
          },
          {
            preheading: 'SCULPTURAL LIVING',
            title: 'Graceful arcs.\nEffortless calm.',
            subtitle: 'Elevate expansive living rooms with solid walnut arcs and hand-blown opaline diffusers.',
            buttonText: 'VIEW FLOOR LAMPS',
            buttonLink: '/shop?category=floor-lamps',
            badgeText: 'Artisanal Woodcraft',
            image: '/uploads/hero-slide-3.jpg',
            slideNumber: '03'
          }
        ],
        announcementBar: {
          text: 'Complimentary white-glove shipping on all handcrafted artisanal orders across India',
          enabled: true
        }
      });
      settings = created.toObject ? created.toObject() : created;
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('[getHomepageSettings Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching homepage settings'
    });
  }
};

// @desc    Update homepage settings (Admin)
// @route   PUT /api/homepage
// @access  Private/Admin
export const updateHomepageSettings = async (req, res, next) => {
  try {
    let settings = await Homepage.findOne();
    if (!settings) {
      settings = new Homepage(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();

    res.json({
      success: true,
      message: 'Homepage settings updated successfully',
      settings
    });
  } catch (error) {
    next(error);
  }
};

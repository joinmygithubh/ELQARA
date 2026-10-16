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
            title: 'Timeless Decor\nfor Modern Spaces',
            subtitle: 'Explore handcrafted home décor and lighting that bring warmth, character and elegance to your everyday spaces.',
            buttonText: 'EXPLORE COLLECTION',
            buttonLink: '/shop',
            badgeText: 'Handcrafted in India',
            image: '/uploads/hero-banner-editorial.png',
            slideNumber: '01'
          },
          {
            preheading: 'ARCHITECTURAL ILLUMINATION',
            title: 'Subtle warmth.\nTimeless stone.',
            subtitle: 'Hand-sculpted travertine forms and organic woven linen that infuse every room with gentle, considered radiance.',
            buttonText: 'DISCOVER LAMPS',
            buttonLink: '/shop?category=table-lamps',
            badgeText: 'Natural Travertine',
            image: '/uploads/hero-slide-travertine.png',
            slideNumber: '02'
          },
          {
            preheading: 'SCULPTURAL LIVING',
            title: 'Fluted textures.\nQuiet luxury.',
            subtitle: 'Precision-fluted seasoned hardwood and natural stone console textures crafted for serene modern sanctuaries.',
            buttonText: 'EXPLORE EDITIONS',
            buttonLink: '/shop',
            badgeText: 'Artisanal Woodcraft',
            image: '/uploads/hero-slide-fluted.png',
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

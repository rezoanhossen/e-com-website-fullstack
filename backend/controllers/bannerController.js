const Banner = require('../models/Banner');

// Get all active banners
exports.getBanners = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isActive: true };
    
    if (type) {
      filter.type = type;
    }

    const banners = await Banner.find(filter)
      .sort({ position: 1, createdAt: -1 });

    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get hero banners specifically
exports.getHeroBanners = async (req, res) => {
  try {
    const banners = await Banner.find({
      type: 'hero',
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [{ endDate: null }, { endDate: { $gte: new Date() } }]
    }).sort({ position: 1 });

    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all banners
exports.getAllBanners = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, isActive } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const banners = await Banner.find(filter)
      .sort({ position: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalBanners = await Banner.countDocuments(filter);

    res.json({
      banners,
      totalBanners,
      totalPages: Math.ceil(totalBanners / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Create banner
exports.createBanner = async (req, res) => {
  try {
    const { title, subtitle, description, image, link, type, position, startDate, endDate } = req.body;

    if (!title || !image) {
      return res.status(400).json({ message: 'Title and image are required' });
    }

    const banner = new Banner({
      title,
      subtitle,
      description,
      image,
      link: link || null,
      type: type || 'hero',
      position: position || 0,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      isActive: true
    });

    await banner.save();
    res.status(201).json({ message: 'Banner created successfully', banner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update banner
exports.updateBanner = async (req, res) => {
  try {
    const { title, subtitle, description, image, link, type, position, startDate, endDate, isActive } = req.body;

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      {
        title,
        subtitle,
        description,
        image,
        link: link || null,
        type,
        position,
        startDate,
        endDate: endDate || null,
        isActive,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json({ message: 'Banner updated successfully', banner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete banner
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Reorder banners
exports.reorderBanners = async (req, res) => {
  try {
    const { banners } = req.body;

    for (let i = 0; i < banners.length; i++) {
      await Banner.findByIdAndUpdate(banners[i].id, { position: i });
    }

    res.json({ message: 'Banners reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

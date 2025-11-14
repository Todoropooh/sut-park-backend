import ServiceItem from "../models/serviceItemModel.js";

export default {
  getServiceItems: async (req, res) => {
    try {
      const items = await ServiceItem.find();
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  },

  getPublicServiceItems: async (req, res) => {
    try {
      const items = await ServiceItem.find({ isActive: true });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  },

  createServiceItem: async (req, res) => {
    try {
      const { title, description, targetAudience } = req.body;

      const item = new ServiceItem({
        title,
        description,
        targetAudience: targetAudience?.split(",") || [],
        imageUrl: req.file ? `/uploads/services/${req.file.filename}` : null,
      });

      await item.save();
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateServiceItem: async (req, res) => {
    try {
      const { title, description, targetAudience } = req.body;

      const updateData = {
        title,
        description,
        targetAudience: targetAudience?.split(",") || [],
      };

      if (req.file) {
        updateData.imageUrl = `/uploads/services/${req.file.filename}`;
      }

      const updated = await ServiceItem.findByIdAndUpdate(req.params.id, updateData, { new: true });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  deleteServiceItem: async (req, res) => {
    try {
      await ServiceItem.findByIdAndDelete(req.params.id);
      res.json({ message: "Item deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

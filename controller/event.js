const express = require("express");
const router = express.Router();
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isSellerAuthenticated } = require("../middleware/auth");
const Event = require("../model/event");
const fs = require("fs");

// Create event
router.post(
  "/create-event",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);

      if (!shop) {
        return next(new ErrorHandler("Shop ID is invalid!", 400));
      }

      const files = req.files;
      const imageUrls = files.map((file) => file.filename || file.location);

      const eventData = req.body;
      eventData.images = imageUrls;
      eventData.shop = shop;

      const event = await Event.create(eventData);

      res.status(201).json({
        success: true,
        message: "Event created successfully!",
        event,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Get all events for a shop
router.get(
  "/get-all-events-shop/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find({ shop: req.params.id });

      if (!events.length) {
        return next(new ErrorHandler("No events found for this shop!", 404));
      }

      res.status(200).json({ success: true, events });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Delete an event for a shop
router.delete(
  "/delete-shop-event/:id",
  isSellerAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const eventId = req.params.id;

      const event = await Event.findById(eventId);

      if (!event) {
        return next(new ErrorHandler("Event not found with this ID!", 404));
      }

      // Delete event images from server
      event.images.forEach((imageUrl) => {
        const filePath = `uploads/${imageUrl}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log("Error deleting event images:", err);
          }
        });
      });

      await Event.findByIdAndDelete(eventId);

      res.status(200).json({
        success: true,
        message: "Event deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Get all events
router.get(
  "/get-all-events",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find().sort({ createdAt: -1 });

      res.status(200).json({ success: true, events });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

module.exports = router;

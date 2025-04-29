const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const {
  isSellerAuthenticated,
  isAuthenticated,
} = require("../middleware/auth");
const fs = require("fs");

// Create product
router.post(
  "/create-product",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId } = req.body;

      if (!shopId) {
        return next(new ErrorHandler("Shop ID is required!", 400));
      }

      const shop = await Shop.findById(shopId);

      if (!shop) {
        return next(new ErrorHandler("Shop ID is invalid!", 400));
      }

      const files = req.files;
      if (!files || files.length === 0) {
        return next(new ErrorHandler("At least one image is required!", 400));
      }

      const imageUrls = files.map((file) => file.filename || file.location);
      const productData = { ...req.body, images: imageUrls, shop };

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        product,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Get all products for a shop
router.get(
  "/get-all-products-shop/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        return next(new ErrorHandler("Shop ID is required!", 400));
      }

      const products = await Product.find({ shopId: id });

      if (!products) {
        return next(new ErrorHandler("No products found for this shop!", 404));
      }

      res.status(200).json({ success: true, products });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Delete a product for a shop
router.delete(
  "/delete-shop-product/:id",
  isSellerAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;

      if (!productId) {
        return next(new ErrorHandler("Product ID is required!", 400));
      }

      const productData = await Product.findById(productId);

      if (!productData) {
        return next(new ErrorHandler("Product not found with this ID!", 404));
      }

      productData.images.forEach((imageUrl) => {
        const filePath = `uploads/${imageUrl}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log("Error deleting product images!", err);
          }
        });
      });

      await Product.findByIdAndDelete(productId);

      res.status(200).json({
        success: true,
        message: "Product deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Get all products
router.get(
  `/get-all-products`,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      res.status(200).json({ success: true, products });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Review for a product
router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { user, rating, comment, productId } = req.body;

      if (!user || !rating || !comment || !productId) {
        return next(
          new ErrorHandler("Missing required fields for review!", 400)
        );
      }

      const product = await Product.findById(productId);
      if (!product) {
        return next(new ErrorHandler("Product not found!", 404));
      }

      const review = {
        user,
        rating,
        comment,
        productId,
      };

      const existingReview = product.reviews.find(
        (rev) => rev.user._id.toString() === user._id.toString()
      );

      if (existingReview) {
        existingReview.rating = rating;
        existingReview.comment = comment;
        existingReview.user = user;
      } else {
        product.reviews.push(review);
      }

      let avg = 0;
      product.reviews.forEach((rev) => {
        avg += rev.rating;
      });

      product.ratings = parseFloat((avg / product.reviews.length).toFixed(1));

      await product.save({ validateBeforeSave: false });

      res
        .status(200)
        .json({ success: true, message: "Review submitted successfully!" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

module.exports = router;

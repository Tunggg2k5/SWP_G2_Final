import { Router } from "express";
import {
  createConsultation,
  getAvailability,
  getBootstrap,
  getDentistById,
  getDentistReviews,
  getDentists,
  getHealth,
  getReviews,
  getRooms,
  getServices
} from "../controllers/publicController.js";
import { getCollection } from "../config/mongodb.js";

const router = Router();

router.get("/health", getHealth);
router.get("/services", getServices);
router.get("/bootstrap", getBootstrap);
router.get("/reviews", getReviews);
router.get("/dentists", getDentists);
router.get("/dentists/:id", getDentistById);
router.get("/dentists/:id/reviews", getDentistReviews);
router.get("/rooms", getRooms);
router.get("/availability", getAvailability);
router.post("/consultations", createConsultation);

// Temporary endpoint to fix corrupted Vietnamese text in DB
router.get("/fix-db", async (req, res) => {
  try {
    const reviewsCol = getCollection("reviews");
    const reviews = await reviewsCol.find({}).toArray();
    let updatedCount = 0;
    
    for (const review of reviews) {
      if (review.comment && review.comment.includes("?")) {
        // Fix common mojibake patterns
        let fixedComment = review.comment
          .replace(/Quy tr\?nh r\? r\?ng/g, "Quy trình rõ ràng")
          .replace(/nh\?n vi\?n h\? tr\? t\?t/g, "nhân viên hỗ trợ tốt")
          .replace(/B\?c s\? t\? v\?n r\? r\?ng/g, "Bác sĩ tư vấn rõ ràng")
          .replace(/thao t\?c nh\? nh\?ng/g, "thao tác nhẹ nhàng")
          .replace(/K\?t qu\? t\?t/g, "Kết quả tốt")
          .replace(/\?/g, ""); // Remove remaining question marks
          
        await reviewsCol.updateOne({ _id: review._id }, { $set: { comment: fixedComment } });
        updatedCount++;
      }
    }
    res.json({ success: true, message: `Fixed ${updatedCount} reviews.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

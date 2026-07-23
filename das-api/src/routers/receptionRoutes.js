import { Router } from "express";
import {
  createPatient,
  deleteConsultation,
  getConsultations,
  getDashboard,
  getPatients,
  updateConsultation,
  updateAppointmentSlot
} from "../controllers/receptionController.js";
import { authorize, requireAuth } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth, authorize("receptionist", "admin"));

router.get("/dashboard", getDashboard);
router.get("/patients", getPatients);
router.post("/patients", createPatient);
router.patch("/slots/:id", updateAppointmentSlot);
router.get("/consultations", getConsultations);
router.patch("/consultations/:id", updateConsultation);
router.delete("/consultations/:id", deleteConsultation);

export default router;

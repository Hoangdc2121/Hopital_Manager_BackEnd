import express from "express";
import { invoiceController } from "../../controllers/medicalStaff/invoiceController.js";

const router = express.Router()

router.get('/getAllInvoices',invoiceController.getAllInvoices)
router.post('/ConfirmPaymentInvoice/:invoiceId',invoiceController.ConfirmPaymentInvoice)

export default router
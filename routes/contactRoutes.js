// routes/contactRoutes.js

const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contactController');

// (Path '/' ที่นี่ หมายถึง '/api/contacts')

router.get('/', contactController.getAllContacts);
router.get('/:id', contactController.getContactById);
router.patch('/:id/read', contactController.updateContactReadStatus); // (ใช้ PATCH สำหรับอัปเดตเล็กน้อย)
router.delete('/:id', contactController.deleteContact);

module.exports = router;
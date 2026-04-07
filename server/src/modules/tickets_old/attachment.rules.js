// src/modules/tickets/attachment.rules.js

const ATTACHMENT_RULES = {
  PRODUCT_SERIAL_NUMBER: { maxSize: 2 * 1024 * 1024, type: 'IMAGE' },
  PRODUCT_INVOICE: { maxSize: 2 * 1024 * 1024, type: 'IMAGE' },
  FAULT_VIDEO: { maxSize: 10 * 1024 * 1024, type: 'VIDEO' },
  OTHERS: { maxSize: 10 * 1024 * 1024, type: 'ANY' },
  BOX_IMAGE_1: { maxSize: 2 * 1024 * 1024, type: 'IMAGE' },
  BOX_IMAGE_2: { maxSize: 2 * 1024 * 1024, type: 'IMAGE' },
  BOX_IMAGE_3: { maxSize: 2 * 1024 * 1024, type: 'IMAGE' },
  BOX_IMAGE_4: { maxSize: 2 * 1024 * 1024, type: 'IMAGE' },
  BOX_IMAGE_5: { maxSize: 2 * 1024 * 1024, type: 'IMAGE' },
  BOX_IMAGE_6: { maxSize: 2 * 1024 * 1024, type: 'IMAGE' }
};

module.exports = ATTACHMENT_RULES;
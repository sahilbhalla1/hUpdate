const ATTACHMENT_CONFIG = {
  DOA: {
    required: [
      'PRODUCT_SERIAL_NUMBER',
      'PRODUCT_INVOICE',
      'FAULT_VIDEO',
      'BOX_IMAGE_1',
      'BOX_IMAGE_2',
      'BOX_IMAGE_3',
      'BOX_IMAGE_4',
      'BOX_IMAGE_5',
      'BOX_IMAGE_6'
    ],
    optional: [
      'OTHERS'
    ]
  },
  EXCHANGE: {
    required: [
      'PRODUCT_SERIAL_NUMBER',
      'PRODUCT_INVOICE',
      'FAULT_VIDEO'
    ],
    optional: ['OTHERS']
  }
};

module.exports = ATTACHMENT_CONFIG;
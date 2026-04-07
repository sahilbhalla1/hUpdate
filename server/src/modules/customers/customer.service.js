const db = require("../../config/db");

async function findCustomerWithProductsByPhone(phone) {
  const [customerRows] = await db.execute(
    `
      SELECT
        id,
        customer_code,
        user_type,
        title,
        first_name,
        last_name,
        company_name,
        primary_phone,
        alternate_phone,
        email,
        country_code,
        zip_code,
        city,
        province,
        address_line1,
        address_line2,
        address_line3,
        building_code,
        social_x,
        social_facebook,
        social_linkedin,
        social_instagram,
        social_youtube
      FROM customers
      WHERE primary_phone = ?
        AND status = 'ACTIVE'
      LIMIT 1
    `,
    [phone]
  );

  if (!customerRows.length) {
    return null;
  }

  const customer = customerRows[0];

  const [productRows] = await db.execute(
    `
      SELECT
        cp.id AS customer_product_id,
        cp.serial_no,
        cp.serial_no_alt,
        cp.purchase_date,
        cp.purchase_channel,
        cp.purchase_partner,
        cp.warranty_type_id,

        p.id AS product_id,
        p.product_code,

        cm.id AS customer_model_id,
        cm.model_number,

        ms.id AS model_spec_id,
        ms.spec_value AS model_specification,

        sc.id AS sub_category_id,
        sc.name AS sub_category_name,

        c.id AS category_id,
        c.name AS category_name

      FROM customer_products cp
      JOIN product_ids p
        ON p.id = cp.product_id
      JOIN customer_models cm
        ON cm.id = p.customer_model_id
      JOIN model_specifications ms
        ON ms.id = cm.model_spec_id
      JOIN sub_categories sc
        ON sc.id = ms.sub_category_id
      JOIN categories c
        ON c.id = sc.category_id

      WHERE cp.customer_id = ?
        AND cp.status = 'ACTIVE'
    `,
    [customer.id]
  );

  return {
    customer: {
      id: customer.id,
      customerCode: customer.customer_code,
      userType: customer.user_type,
      title: customer.title,
      firstName: customer.first_name,
      lastName: customer.last_name,
      companyName: customer.company_name,
      primaryPhone: customer.primary_phone,
      alternatePhone: customer.alternate_phone,
      email: customer.email,
      countryCode: customer.country_code,
      zipCode: customer.zip_code,
      city: customer.city,
      province: customer.province,
      addressLine1: customer.address_line1,
      addressLine2: customer.address_line2,
      addressLine3: customer.address_line3,
      buildingCode: customer.building_code,
      social: {
        x: customer.social_x,
        facebook: customer.social_facebook,
        linkedin: customer.social_linkedin,
        instagram: customer.social_instagram,
        youtube: customer.social_youtube
      }
    },

    products: productRows.map((p) => ({
      customerProductId: p.customer_product_id,

      productId: p.product_id,
      productCode: p.product_code,

      categoryId: p.category_id,
      category: p.category_name,

      subCategoryId: p.sub_category_id,
      subCategory: p.sub_category_name,

      modelSpecificationId: p.model_spec_id,
      modelSpecification: p.model_specification,

      customerModelId: p.customer_model_id,
      customerModelNumber: p.model_number,

      serialNo: p.serial_no,
      serialNoAlt: p.serial_no_alt,
      purchaseDate: p.purchase_date,
      purchaseChannel: p.purchase_channel,
      purchasePartner: p.purchase_partner,
      warrantyTypeId: p.warranty_type_id
    }))
  };
}


module.exports = {
  findCustomerWithProductsByPhone
};

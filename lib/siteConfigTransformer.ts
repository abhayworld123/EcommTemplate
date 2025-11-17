/**
 * Utility functions for transforming site_config data between CSV/flat format and database format
 */

/**
 * Transforms flat CSV/JSON site_config data (with social_media_* fields) 
 * into the nested structure expected by the database
 */
export function transformSiteConfigForDatabase(config: any) {
  // Reconstruct social_media object from flattened fields
  const socialMedia: any = {};
  
  if (config.social_media_facebook) {
    socialMedia.facebook = config.social_media_facebook;
  }
  if (config.social_media_twitter) {
    socialMedia.twitter = config.social_media_twitter;
  }
  if (config.social_media_instagram) {
    socialMedia.instagram = config.social_media_instagram;
  }
  if (config.social_media_linkedin) {
    socialMedia.linkedin = config.social_media_linkedin;
  }
  
  // If social_media already exists as nested object, use it (backward compatibility)
  if (config.social_media && typeof config.social_media === 'object') {
    Object.assign(socialMedia, config.social_media);
  }

  return {
    id: config.id || '1',
    site_name: config.site_name,
    banner_image: config.banner_image,
    description: config.description,
    theme_color: config.theme_color,
    contact_email: config.contact_email,
    contact_phone: config.contact_phone,
    contact_address: config.contact_address,
    social_media: Object.keys(socialMedia).length > 0 ? socialMedia : null,
  };
}

/**
 * Transforms database site_config data (with nested social_media) 
 * into flat CSV-compatible format
 */
export function transformSiteConfigForCSV(config: any) {
  const socialMedia = config.social_media || {};
  
  return {
    id: config.id,
    site_name: config.site_name,
    banner_image: config.banner_image,
    description: config.description,
    theme_color: config.theme_color,
    contact_email: config.contact_email,
    contact_phone: config.contact_phone,
    contact_address: config.contact_address,
    social_media_facebook: socialMedia.facebook || '',
    social_media_twitter: socialMedia.twitter || '',
    social_media_instagram: socialMedia.instagram || '',
    social_media_linkedin: socialMedia.linkedin || '',
  };
}





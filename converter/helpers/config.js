/**
 * Helper: Config
 * -----------------------------------------------------------------------------
 * Single source of truth for config settings in Converter.
 *
 */

/**
 * Export.
 * @returns {Object}
 */
module.exports = {
  liquidTestConditions: [
    '==',
    '!=',
    '>',
    '>=',
    '<',
    '<=',
  ],
  noRenderBoundProps: [
    'class',
    'style',
  ],
  noRenderProps: [
    'key',
    'on',
    'ref',
  ],
  noRenderTags: ['template'],
  selfClosingTags: [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
  ],
  validHtmlTags: [
    'a',
    'abbr',
    'address',
    'article',
    'aside',
    'audio',
    'blockquote',
    'br',
    'button',
    'canvas',
    'caption',
    'component',
    'div',
    'em',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'hr',
    'iframe',
    'img',
    'input',
    'label',
    'li',
    'main',
    'ol',
    'p',
    'picture',
    'pre',
    'section',
    'source',
    'span',
    'strong',
    'table',
    'td',
    'th',
    'tr',
    'ul',
    'video',
  ],
  validLiquidObjects: [
    // Truthy conditions
    'true',
    'false',
    // Liquid objects
    'additional_checkout_buttons',
    'address',
    'all_country_option_tags',
    'all_products',
    'app',
    'article',
    'articles',
    'block',
    'blog',
    'blogs',
    'brand',
    'brand_color',
    'canonical_url',
    'cart',
    'checkout',
    'collection',
    'collections',
    'color',
    'color_scheme',
    'color_scheme_group',
    'comment',
    'company',
    'company_address',
    'company_location',
    'content_for_additional_checkout_buttons',
    'content_for_header',
    'content_for_index',
    'content_for_layout',
    'country',
    'country_option_tags',
    'currency',
    'current_page',
    'current_tags',
    'customer',
    'discount',
    'discount_allocation',
    'discount_application',
    'external_video',
    'filter',
    'filter_value',
    'focal_point',
    'font',
    'forloop',
    'form',
    'form_errors',
    'fulfillment',
    'generic_file',
    'gift_card',
    'group',
    'handle',
    'image',
    'image_presentation',
    'images',
    'line_item',
    'link',
    'linklist',
    'linklists',
    'localization',
    'location',
    'market',
    'measurement',
    'media',
    'metafield',
    'metaobject',
    'metaobject_definition',
    'metaobject_system',
    'model',
    'model_source',
    'money',
    'order',
    'page',
    'page_description',
    'page_image',
    'page_title',
    'pages',
    'paginate',
    'part',
    'pending_payment_instruction_input',
    'policy',
    'powered_by_link',
    'predictive_search',
    'predictive_search_resources',
    'product',
    'product_option',
    'quantity_price_break',
    'quantity_rule',
    'rating',
    'recipient',
    'recommendations',
    'request',
    'robots',
    'routes',
    'rule',
    'script',
    'scripts',
    'search',
    'section',
    'selling_plan',
    'selling_plan_allocation',
    'selling_plan_allocation_price_adjustment',
    'selling_plan_checkout_charge',
    'selling_plan_group',
    'selling_plan_group_option',
    'selling_plan_option',
    'selling_plan_price_adjustment',
    'settings',
    'shipping_method',
    'shop',
    'shop_locale',
    'sitemap',
    'sort_option',
    'store_availability',
    'tablerowloop',
    'tax_line',
    'template',
    'theme',
    'transaction',
    'transaction_payment_details',
    'unit_price_measurement',
    'user',
    'user_agent',
    'variant',
    'video',
    'video_source',
  ],
  vConditionals: ['if', 'else-if', 'else', 'for', 'show'],
  vContent: ['html', 'text'],
  vElseConditionals: ['else-if', 'else'],
  vIfConditionals: ['if', 'else-if', 'else', 'show'],
}

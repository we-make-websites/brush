/**
 * API: Templates.
 * -----------------------------------------------------------------------------
 * Returns templates required for default Shopify build.
 *
 */

/**
 * gift_card.liquid template.
 * @returns {String}
 */
function giftCard() {
  return `{% layout none %}

{% assign formatted_initial_value = gift_card.initial_value | money_without_trailing_zeros %}
{% assign formatted_initial_value_stripped = formatted_initial_value | strip_html %}

<!DOCTYPE html>
<html>

<head>

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="format-detection" content="telephone=no">

  <title>Here's your {{ formatted_initial_value_stripped }} gift card for {{ shop.name }}!</title>
  <meta name="description" content="Here's your gift card!">

  {{ 'gift-card.css' | shopify_asset_url | stylesheet_tag }}
  {{ 'modernizr.gift-card.js' | shopify_asset_url | script_tag }}
  {{ 'vendor/qrcode.js' | shopify_asset_url | script_tag }}
  <link href="//fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">

  <!--[if lt IE 9]>
    {{ 'vendor/html5shiv.js' | shopify_asset_url | script_tag }}
  <![endif]-->

  <script type='text/javascript'>
    function selectText(element) {

        var doc = document;
        var text = doc.getElementById(element);

        if (doc.body.createTextRange) { // ms
            var range = doc.body.createTextRange();
            range.moveToElementText(text);
            range.select();
        } else if (window.getSelection) { // moz, opera, webkit
            var selection = window.getSelection();
            var range = doc.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
        }

    }
  </script>

</head>

<body>

  <div class="wrap">

    <header role="banner" id="header">
      <a href="{{ shop.url }}" class="logo">{{ shop.name }}</a>
      <a href="{{ shop.url }}" class="shop-url">{{ shop.url | remove: 'http://' }}</a>
    </header>

      <main role="main">

          <div id="gift-card-outer-container" {% if gift_card.expired or gift_card.enabled != true %}class="disabled"{% endif %}>
            <div id="gift-card-inner-container">

              <header id="gift-card-header">
                <h2>Here's your gift card!</h2>
                {% unless gift_card.enabled %}
                  <span class="tag">Disabled</span>
                {% endunless %}
                {% if gift_card.expired and gift_card.enabled %}
                    <span class="tag">Expired on {{ gift_card.expires_on | date: "%d/%m/%y" }}</span>
                {% endif %}
                {% if gift_card.expired != true and gift_card.expires_on and gift_card.enabled %}
                  <span class="tag light">Expires on {{ gift_card.expires_on | date: "%d/%m/%y" }}</span>
                {% endif %}
              </header>

              <div id="gift-card-holder">
                <div class="corner top-left"></div>
                <div class="corner bottom-right"></div>
                <div class="corner top-right"></div>
                <div class="corner bottom-left"></div>
                <div id="gift-card">
                  <img src="{{ 'gift-card/card.jpg' | shopify_asset_url }}" alt="Gift card illustration">
                  {% assign initial_value_size = formatted_initial_value | size %}
                  <div id="gift-card-amount" class="{% if initial_value_size > 6 %}medium{% endif %}">
                    {% if gift_card.balance != gift_card.initial_value %}
                      <span class="tooltip-container"><span class="tooltip-label">{{ gift_card.balance | money }} <small>left</small></span><span class="tooltip-triangle"></span></span>
                    {% endif %}
                    <strong>{{ formatted_initial_value }}</strong>
                  </div>
                  {% assign code_size = gift_card.code | format_code | size %}
                  <div id="gift-card-code-outer" class="{% if code_size <= 25 %}large{% elsif code_size > 25 and code_size <= 30 %}medium{% else %}small{% endif %}" onclick="selectText('gift-card-code-digits');">
                    <div id="gift-card-code-inner">
                      <strong id="gift-card-code-digits">{{ gift_card.code | format_code }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div id="gift-card-instructions">
                <p>Use this code at checkout to redeem your gift card.</p>
              </div>
              <div id="qr-code"></div>
              <script>
                new QRCode(document.getElementById("qr-code"), {
                  text: "{{ gift_card.qr_identifier }}",
                  width: 120,
                  height: 120
                });
              </script>
              <div id="gift-card-actions">
                <a href="{{ shop.url }}" class="btn center" target="_blank">Start Shopping</a>
                <a href="#" class="action-link left" onclick="window.print();"><i class="ico-16 print"></i>Print</a>
              </div>
            </div>
          </div>
      </main> <!-- / Main -->

      <footer role="contentinfo">
        {% if gift_card.pass_url %}
          <a href="{{ gift_card.pass_url }}"><img id="apple-wallet-badge" src="{{ 'gift-card/add-to-apple-wallet.svg' | shopify_asset_url }}" width="120" height="40" alt="Add To Apple Wallet"></a>
        {% endif %}
      </footer>

    </div>

</body>
</html>`
}

/**
 * Index.json template.
 * @returns {String}
 */
function index() {
  return `{
  "sections": {},
  "order": []
}`
}

/**
 * Title.
 * @returns {String}
 */
function title() {
  return `
  {%- liquid
    assign og_description = 'Storybook of all styles and components built for # by We Make Websites.' | replace: '#', shop.name
    assign og_title = 'Storybook'
    assign og_type = 'website'
    assign og_url = canonical_url | default: request.origin
  -%}

  <title>{{ og_title }}</title>

  <meta property="og:description" content="{{ og_description | escape }}">
  <meta property="og:site_name" content="{{ shop.name }}">
  <meta property="og:title" content="{{ og_title | escape }}">
  <meta property="og:type" content="{{ og_type }}">
  <meta property="og:url" content="{{ og_url }}">
  <meta property="og:image" content="http:{{ 'storybook-social.jpg' | asset_img_url: '1200x' }}">
  <meta property="og:image:alt" content="">
  <meta property="og:image:height" content="628">
  <meta property="og:image:secure_url" content="https:{{ 'storybook-social.jpg' | asset_img_url: '1200x' }}">
  <meta property="og:image:width" content="1200">
`
}

/**
 * Export API.
 */
module.exports = {
  giftCard,
  index,
  title,
}

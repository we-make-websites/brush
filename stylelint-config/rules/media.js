module.exports = {
  // Specify pattern of custom media query names
  'custom-media-pattern': null,
  // Specify a list of disallowed media feature names
  'media-feature-name-disallowed-list': null,
  // Disallow unknown media feature names
  'media-feature-name-no-unknown': [
    true, {
      ignoreMediaFeatureNames: ['prefers-reduced-motion'],
    },
  ],
  // Disallow vendor prefixes for media feature names
  'media-feature-name-no-vendor-prefix': true,
  // Specify a list of allowed media feature name
  'media-feature-name-allowed-list': null,
}

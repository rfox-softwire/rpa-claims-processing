/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./src/email-system/public/**/*.html",
    "./src/email-system/public/js/**/*.js",
    "./src/claim-management-system/public/**/*.html",
    "./src/claim-management-system/public/js/**/*.js",
    "./src/claim-submission-system/public/**/*.html",
    "./src/claim-submission-system/public/js/**/*.js",
    "./src/policy-administration-system/public/**/*.html",
    "./src/policy-administration-system/public/js/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

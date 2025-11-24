/**
 * ESLint Custom Rule: no-secondary-background-in-page-container
 *
 * Prevents use of background="secondary" in PageContainer components
 * at the page level, which causes body gradient bleed-through.
 *
 * Installation:
 * 1. Add this file to: .eslint/rules/no-secondary-background-in-page-container.js
 * 2. Update eslint.config.mjs to include this rule
 * 3. Run: npm run lint
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        'Disallow background="secondary" in PageContainer at page level',
      category: "Design System",
      recommended: true,
    },
    messages: {
      avoidSecondary:
        'Avoid background="secondary" in PageContainer for full pages. Use background="gradient" (default) or "white" instead. Secondary backgrounds allow body gradient to show through on scrolling pages.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXElement(node) {
        // Check if this is a PageContainer component
        if (
          node.openingElement.name.name === "PageContainer" ||
          (node.openingElement.name.object &&
            node.openingElement.name.object.name === "PageContainer")
        ) {
          // Look for background prop
          const backgroundProp = node.openingElement.attributes.find(
            (attr) =>
              attr.type === "JSXAttribute" && attr.name.name === "background"
          );

          if (backgroundProp && backgroundProp.value) {
            const value = backgroundProp.value.value;

            // Check if it's "secondary"
            if (value === "secondary") {
              // Check if we're in a page file (app/**/page.tsx pattern)
              const filename = context.getFilename();
              const isPageFile =
                filename.includes("/app/") && filename.endsWith("page.tsx");

              if (isPageFile) {
                context.report({
                  node: backgroundProp,
                  messageId: "avoidSecondary",
                });
              }
            }
          }
        }
      },
    };
  },
};

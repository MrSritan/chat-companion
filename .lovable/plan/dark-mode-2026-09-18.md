# Dark mode

## What will change
- Add a sun/moon switch to the chat header on laptop and phone.
- Apply a polished charcoal dark palette while retaining Athena’s purple accent.
- Keep all chat content, conversation history, and interactions unchanged.

## Technical approach
- Use a native checkbox and CSS selectors to switch theme tokens, so the theme control requires no JavaScript state or new backend.
- Reuse the existing semantic color system so the sidebar, header, messages, input, borders, and overlays switch consistently.
- Keep the current light theme as the default for each page load.

## Validation
- Check the switch and dark colors in both desktop and mobile layouts.
- Confirm chat sending and sidebar controls still work in both themes.

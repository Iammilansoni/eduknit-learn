// Content Protection Utilities

export const disableRightClick = (e: MouseEvent) => {
  e.preventDefault();
  return false;
};

export const overlayStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'transparent',
  zIndex: 1,
  pointerEvents: 'none' as const,
};

export const preventCopyPaste = (e: ClipboardEvent) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
};

export const preventKeyboardShortcuts = (e: KeyboardEvent) => {
  // Block Ctrl+C, Ctrl+A, Ctrl+V, Ctrl+X, Ctrl+S, F12, Ctrl+Shift+I, Ctrl+U
  if (
    (e.ctrlKey && (e.key === 'c' || e.key === 'C')) ||
    (e.ctrlKey && (e.key === 'a' || e.key === 'A')) ||
    (e.ctrlKey && (e.key === 'v' || e.key === 'V')) ||
    (e.ctrlKey && (e.key === 'x' || e.key === 'X')) ||
    (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
    (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
    (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) ||
    (e.ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) ||
    (e.ctrlKey && e.shiftKey && (e.key === 'j' || e.key === 'J')) ||
    e.key === 'F12'
  ) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
};

export const disableTextSelection = {
  userSelect: 'none' as const,
  WebkitUserSelect: 'none' as const,
  MozUserSelect: 'none' as const,
  msUserSelect: 'none' as const,
  WebkitTouchCallout: 'none' as const,
  WebkitTapHighlightColor: 'transparent' as const,
};

export const disableDragAndDrop = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
};

// Apply global protection
export const applyGlobalProtection = () => {
  // Disable context menu globally
  document.addEventListener('contextmenu', disableRightClick);
  
  // Disable keyboard shortcuts
  document.addEventListener('keydown', preventKeyboardShortcuts);
  
  // Disable copy/paste events
  document.addEventListener('copy', preventCopyPaste);
  document.addEventListener('cut', preventCopyPaste);
  document.addEventListener('paste', preventCopyPaste);
  
  // Disable drag and drop
  document.addEventListener('dragstart', disableDragAndDrop);
  document.addEventListener('drop', disableDragAndDrop);
  
  // Disable text selection on mobile
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });
  
  // Disable print
  window.addEventListener('beforeprint', (e) => {
    e.preventDefault();
    alert('Printing is not allowed');
    return false;
  });
  
  // Disable developer tools (F12)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
  });
};

// Remove global protection
export const removeGlobalProtection = () => {
  document.removeEventListener('contextmenu', disableRightClick);
  document.removeEventListener('keydown', preventKeyboardShortcuts);
  document.removeEventListener('copy', preventCopyPaste);
  document.removeEventListener('cut', preventCopyPaste);
  document.removeEventListener('paste', preventCopyPaste);
  document.removeEventListener('dragstart', disableDragAndDrop);
  document.removeEventListener('drop', disableDragAndDrop);
};

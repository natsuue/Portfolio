// index.html adds `is-booting` to <html> on a normal visit (not for direct links such as
// /#contact). While it is set, the nav and the Hero copy wait; removing it starts their entrance.

export const isBooting = () => document.documentElement.classList.contains('is-booting');

export function release() {
  document.documentElement.classList.remove('is-booting');
}

const root = document.documentElement;
root.classList.remove('no-js');

const interactiveGroups = [
  ...document.querySelectorAll('.mahmudc-landing__service'),
  ...document.querySelectorAll('.mahmudc-landing__timeline-item')
];

interactiveGroups.forEach((element) => {
  const activate = () => element.classList.add('is-active');
  const deactivate = () => element.classList.remove('is-active');

  element.addEventListener('pointerenter', activate);
  element.addEventListener('pointerleave', deactivate);
  element.addEventListener('focusin', activate);
  element.addEventListener('focusout', deactivate);
});

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const syncMotionPreference = (event) => {
  root.classList.toggle('reduce-motion', event.matches);
};

syncMotionPreference(reducedMotionQuery);
reducedMotionQuery.addEventListener('change', syncMotionPreference);

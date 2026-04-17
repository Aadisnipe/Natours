// skeleton.js - Handle skeleton screen logic

document.addEventListener('DOMContentLoaded', function () {
  // Hide skeleton and show content after page loads
  hideSkeleton();
});

window.addEventListener('load', function () {
  // Make sure skeleton is hidden after all resources load
  hideSkeleton();
});

function hideSkeleton() {
  const skeletonContainer = document.querySelector('[data-skeleton]');
  if (skeletonContainer) {
    skeletonContainer.style.display = 'none';
  }

  // Show all elements with hide-while-loading class
  const elementsToShow = document.querySelectorAll('.hide-while-loading');
  elementsToShow.forEach((el) => {
    el.classList.remove('hide-while-loading');
  });
}

// Trigger skeleton hide after a timeout as fallback (3 seconds)
setTimeout(() => {
  hideSkeleton();
}, 3000);

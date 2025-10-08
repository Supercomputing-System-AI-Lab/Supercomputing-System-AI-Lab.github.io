// SuperOffload Table of Contents - Left Sidebar
(function() {
  'use strict';
  
  // Only run on SuperOffload blog pages
  if (!document.querySelector('.blog-superoffload')) return;
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTOC);
  } else {
    initTOC();
  }
  
  function initTOC() {
    const article = document.querySelector('.blog-superoffload');
    if (!article) return;
    
    // Find the first ul in the content (this is the TOC)
    const tocList = article.querySelector('ul');
    if (!tocList) return;
    
    // Create TOC container
    const tocContainer = document.createElement('nav');
    tocContainer.className = 'superoffload-toc';
    tocContainer.setAttribute('aria-label', 'Table of Contents');
    
    // Add TOC title
    const tocTitle = document.createElement('div');
    tocTitle.className = 'toc-title';
    tocTitle.textContent = 'Table of Contents';
    tocContainer.appendChild(tocTitle);
    
    // Clone the TOC list
    const tocClone = tocList.cloneNode(true);
    tocContainer.appendChild(tocClone);
    
    // Remove the original TOC from content
    const tocSection = tocList.closest('h2, p');
    if (tocSection) {
      let nextElement = tocSection.nextElementSibling;
      tocSection.remove();
      
      // Remove the following ul and hr if they exist
      if (nextElement && nextElement.tagName === 'UL') {
        const hrElement = nextElement.nextElementSibling;
        nextElement.remove();
        if (hrElement && hrElement.tagName === 'HR') {
          hrElement.remove();
        }
      }
    }
    
    // Insert TOC at the beginning of the article
    article.insertBefore(tocContainer, article.firstChild);
    
    // Highlight active section on scroll
    highlightActiveSection();
    window.addEventListener('scroll', highlightActiveSection);
  }
  
  function highlightActiveSection() {
    const article = document.querySelector('.blog-superoffload');
    if (!article) return;
    
    const tocLinks = article.querySelectorAll('.superoffload-toc a');
    const headings = article.querySelectorAll('h2[id], h3[id]');
    
    let currentActive = null;
    const scrollPos = window.scrollY + 100;
    
    headings.forEach(heading => {
      if (heading.offsetTop <= scrollPos) {
        currentActive = heading.id;
      }
    });
    
    tocLinks.forEach(link => {
      if (link.getAttribute('href') === '#' + currentActive) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
})();


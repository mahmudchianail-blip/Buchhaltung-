class OptisparHeader {
  constructor(root) {
    this.root = root;
    this.wrapper = root.closest('.section-header');
    this.menuToggle = root.querySelector('[data-optispar-menu-toggle]');
    this.mobileOverlay = root.querySelector('[data-optispar-mobile-overlay]');
    this.menuCloseTriggers = root.querySelectorAll('[data-optispar-menu-close]');
    this.menuSearchTrigger = root.querySelector('[data-optispar-menu-search]');
    this.searchToggle = root.querySelector('[data-optispar-search-toggle]');
    this.searchBar = root.querySelector('#optispar-search-bar');
    this.searchClose = root.querySelector('[data-optispar-search-close]');
    this.searchInput = this.searchBar ? this.searchBar.querySelector('input[type="search"]') : null;
    this.state = {
      menuOpen: false,
      searchOpen: false,
    };

    this.handleScroll = this.handleScroll.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);

    this.init();
  }

  init() {
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.handleScroll();

    if (this.menuToggle && this.mobileOverlay) {
      this.menuToggle.addEventListener('click', () => this.toggleMenu(true));
      this.menuCloseTriggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
          const isLink = trigger.tagName === 'A';
          if (!isLink) {
            event.preventDefault();
          }
          this.toggleMenu(false);
        });
      });
    }

    if (this.menuSearchTrigger) {
      this.menuSearchTrigger.addEventListener('click', () => {
        this.toggleMenu(false);
        this.toggleSearch(true);
      });
    }

    if (this.searchToggle && this.searchBar) {
      this.searchToggle.addEventListener('click', () => {
        this.toggleSearch(!this.state.searchOpen);
      });
    }

    if (this.searchClose) {
      this.searchClose.addEventListener('click', () => this.toggleSearch(false));
    }
  }

  handleScroll() {
    const threshold = 36;
    if (window.scrollY > threshold) {
      this.root.classList.add('optispar-header--scrolled');
    } else {
      this.root.classList.remove('optispar-header--scrolled');
    }
  }

  handleKeydown(event) {
    if (event.key !== 'Escape') return;

    if (this.state.searchOpen) {
      this.toggleSearch(false);
      return;
    }

    if (this.state.menuOpen) {
      this.toggleMenu(false);
    }
  }

  toggleSearch(forceOpen) {
    const shouldOpen = forceOpen === undefined ? !this.state.searchOpen : forceOpen;
    if (!this.searchBar) return;

    if (shouldOpen) {
      this.root.classList.add('optispar-header--search-active');
      this.searchBar.hidden = false;
      requestAnimationFrame(() => {
        this.searchBar.classList.add('is-visible');
      });
      this.state.searchOpen = true;
      if (this.searchToggle) {
        this.searchToggle.setAttribute('aria-expanded', 'true');
      }
      document.addEventListener('keydown', this.handleKeydown);
      if (this.searchInput) {
        setTimeout(() => this.searchInput.focus(), 120);
      }
    } else {
      this.root.classList.remove('optispar-header--search-active');
      if (this.searchToggle) {
        this.searchToggle.setAttribute('aria-expanded', 'false');
      }
      this.searchBar.classList.remove('is-visible');
      setTimeout(() => {
        if (!this.state.searchOpen) {
          this.searchBar.hidden = true;
        }
      }, 200);
      this.state.searchOpen = false;
      if (!this.state.menuOpen) {
        document.removeEventListener('keydown', this.handleKeydown);
      }
    }
  }

  toggleMenu(forceOpen) {
    if (!this.mobileOverlay) return;
    const shouldOpen = forceOpen === undefined ? !this.state.menuOpen : forceOpen;

    if (shouldOpen) {
      this.state.menuOpen = true;
      this.root.classList.add('optispar-header--menu-open');
      this.mobileOverlay.hidden = false;
      requestAnimationFrame(() => {
        this.mobileOverlay.classList.add('is-visible');
      });
      if (this.menuToggle) {
        this.menuToggle.setAttribute('aria-expanded', 'true');
      }
      document.body.classList.add('optispar-no-scroll');
      document.addEventListener('keydown', this.handleKeydown);
    } else {
      this.state.menuOpen = false;
      this.root.classList.remove('optispar-header--menu-open');
      this.mobileOverlay.classList.remove('is-visible');
      if (this.menuToggle) {
        this.menuToggle.setAttribute('aria-expanded', 'false');
      }
      setTimeout(() => {
        if (!this.state.menuOpen) {
          this.mobileOverlay.hidden = true;
        }
      }, 220);
      document.body.classList.remove('optispar-no-scroll');
      if (!this.state.searchOpen) {
        document.removeEventListener('keydown', this.handleKeydown);
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('[data-optispar-header]');
  if (header) {
    new OptisparHeader(header);
  }
});

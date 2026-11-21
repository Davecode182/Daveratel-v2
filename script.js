/* =================================================================
   SCRIPT — PIERRE David
   -----------------------------------------------------------------
   Sommaire :
   1. Animation de frappe — effet "SPen" sur la planche crème
   2. Apparition au défilement (reveal) + remplissage des barres
   3. Formulaire de contact (ouverture du client de messagerie)
   4. Année automatique dans le pied de page
   ================================================================= */

(function () {
  'use strict';

  /* ===============================================================
     1) ANIMATION DE FRAPPE — EFFET "SPen" SUR LA PLANCHE CRÈME
     =============================================================== */
  const typedLines = [
    { el: document.getElementById('typed-1'),
      text: "FAMV — Faculté d'Agronomie et de Médecine Vétérinaire" },
    { el: document.getElementById('typed-2'),
      text: "UEH — Université d'État d'Haïti" },
    { el: document.getElementById('typed-3'),
      text: "PDA — Production Animale" }
  ];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Curseur "SPen noir doré" réutilisé d'une ligne à l'autre
  const pen = document.createElement('span');
  pen.className = 'pen-cursor';
  pen.setAttribute('aria-hidden', 'true');

  let typingStarted = false;

  /** Remplit immédiatement tout le texte (accessibilité / JS bloqué) */
  function fillAllText() {
    typedLines.forEach(function (line) {
      if (line.el) line.el.textContent = line.text;
    });
  }

 /** Écrit la ligne n° i caractère par caractère, puis efface en boucle */
function typeLine(i) {
  if (i >= typedLines.length) {
    // Pause une fois les 3 lignes écrites, puis effacement en remontant
    setTimeout(function () {
      eraseLine(typedLines.length - 1);
    }, 1800);
    return;
  }

  const line = typedLines[i];
  if (!line.el) {
    typeLine(i + 1);
    return;
  }

  // Place le curseur juste après le texte de la ligne courante
  line.el.parentElement.appendChild(pen);

  let index = line.el.textContent.length;
  (function tick() {
    index++;
    line.el.textContent = line.text.slice(0, index);

    if (index < line.text.length) {
      // Vitesse légèrement variable => rendu plus "humain"
      setTimeout(tick, 26 + Math.random() * 42);
    } else {
      // Petite pause avant la ligne suivante
      setTimeout(function () {
        typeLine(i + 1);
      }, 520);
    }
  })();
}

/** Efface la ligne n° i caractère par caractère en remontant */
function eraseLine(i) {
  if (i < 0) {
    // Petite pause une fois tout effacé, puis on recommence à écrire
    setTimeout(function () {
      typeLine(0);
    }, 600);
    return;
  }

  const line = typedLines[i];
  if (!line.el) {
    eraseLine(i - 1);
    return;
  }

  line.el.parentElement.appendChild(pen);

  let index = line.el.textContent.length;
  (function eraseTick() {
    index--;
    line.el.textContent = line.text.slice(0, index);

    if (index > 0) {
      setTimeout(eraseTick, 18 + Math.random() * 20);
    } else {
      setTimeout(function () {
        eraseLine(i - 1);
      }, 250);
    }
  })();
}

  function startTyping() {
    if (typingStarted) return;
    typingStarted = true;
    if (reduceMotion) { fillAllText(); return; }
    typeLine(0);
  }

  // Démarrage de l'écriture lorsque la planche devient visible
  const plank = document.getElementById('plank');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    startTyping();
  } else if (plank) {
    const plankObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          startTyping();
          obs.disconnect();
        }
      });
    }, { threshold: 0.2 });
    plankObserver.observe(plank);
  } else {
    startTyping();
  }

  /* ===============================================================
     2) APPARITION AU DÉFILEMENT (reveal) + REMPLISSAGE DES BARRES
     =============================================================== */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealElements.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // Repli : tout afficher immédiatement
    revealElements.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ===============================================================
     3) FORMULAIRE DE CONTACT (ouverture du client de messagerie)
     =============================================================== */
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  // ⚠️ Adresse de réception des messages — modifiable si besoin
  const DESTINATAIRE = 'david.pierre004@student.ueh.edu.ht';

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const nom = document.getElementById('nom').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      // Validation simple
      if (!nom || !email || !message) {
        status.textContent = 'Merci de remplir tous les champs.';
        status.style.color = '#c42a8c';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = 'Merci de saisir une adresse e-mail valide.';
        status.style.color = '#c42a8c';
        return;
      }

      const sujet = encodeURIComponent('Message depuis le site — ' + nom);
      const corps = encodeURIComponent(
        message + '\n\n— ' + nom + ' (' + email + ')'
      );

      window.location.href =
        'mailto:' + DESTINATAIRE + '?subject=' + sujet + '&body=' + corps;

      status.style.color = '#1f6bff';
      status.textContent = 'Votre client de messagerie va s\'ouvrir avec le message pré-rempli.';
      form.reset();
    });
  }

  /* ===============================================================
     4) ANNÉE AUTOMATIQUE DANS LE PIED DE PAGE
     =============================================================== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
# Déneigement MAK Excavation — Site Web

Site vitrine statique pour **Déneigement MAK Excavation**, entreprise familiale à Saint-Colomban, Québec. Déneigement résidentiel, excavation, terrassement et travaux connexes dans les Laurentides.

**GitHub:** https://github.com/onyxops19/deneigementmak

---

## Stack technique

| Élément | Détail |
|---|---|
| Type | Site statique — HTML + CSS + JavaScript vanilla |
| Framework | Aucun (pas de build step, pas de Node.js) |
| Animations | GSAP 3 + ScrollTrigger (CDN, `defer`) |
| Fontes | Google Fonts CDN |
| Carte | Google Maps iframe embed (sans clé API) |
| Hébergement | GitHub → Vercel (statique) |

---

## Structure des fichiers

```
Deneigement-MAK/
├── index.html                  # Page principale (SPA 7 sections)
├── contact.html                # Page de soumission / contact
├── css/
│   └── style.css               # Tous les styles (variables, layout, composants)
├── js/
│   └── main.js                 # Toute la logique JS
├── assets/
│   ├── favicon.svg
│   └── logo.png
├── Pictures/
│   ├── unnamed (13).webp       # Photo chalet — hero contact.html
│   ├── unnamed (14).webp       # Photo de chantier
│   ├── unnamed (16).webp       # Photo hero principal
│   ├── unnamed (17).webp       # Photo réalisation
│   ├── unnamed (18).webp       # Photo réalisation
│   ├── unnamed (19).webp       # Photo réalisation
│   ├── unnamed (20).webp       # Photo réalisation
│   ├── unnamed (21).webp       # Photo réalisation
│   ├── unnamed (22).webp       # Photo réalisation
│   └── unnamed (23).webp       # Photo réalisation
└── Deneigement_MAK_Excavation.pdf
```

---

## Pages

### `index.html` — Page principale

7 sections défilantes :

#### 1. Hero
- Photo de fond plein écran (`unnamed (16).webp`)
- Animation d'entrée : révélation du logo en forme de **M** (masque SVG polygon, GSAP)
- Titre : *Déneigement Fiable. Excavation Méticuleuse.*
- Sous-titre, CTA principal → `contact.html`, numéro de téléphone

#### 2. Pourquoi nous choisir (Promise)
- Colonne gauche : 4 statistiques animées au scroll
  - `10+` Ans d'expérience
  - `200+` Clients satisfaits
  - `5.0/5` Note Google
  - `100%` Satisfaction garantie
- Colonne droite : mini-formulaire de soumission (non fonctionnel pour l'instant — `action="#"`)
- Compteurs : `IntersectionObserver` + `requestAnimationFrame`, easing cubique, respecte `prefers-reduced-motion`

#### 3. Services
6 cartes de services :
- Déneigement résidentiel
- Déneigement commercial
- Terrassement
- Excavation
- Démolition
- Nivellement de terrain

#### 4. Réalisations
- Carrousel horizontal scroll-driven (GSAP ScrollTrigger + `pin`)
- 6 diapositives avec photo + titre + description + CTA → `contact.html`
- Dots de navigation synchronisés avec le scroll

#### 5. Avis clients
- Marquee infini automatique (gauche → droite, pause au survol)
- 19 cartes style Google Reviews avec avatar coloré, 5 étoiles, logo G, texte, date
- Technique : CSS `@keyframes marqueeScroll` + JS clone des cartes pour boucle seamless
- Dégradés de fondu sur les bords (pseudo-éléments `::before` / `::after`)

#### 6. Zones de service
- Colonne gauche : texte des régions desservies (Saint-Colomban, Laurentides, Mirabel, etc.)
- Colonne droite : carte Google Maps centrée sur Saint-Colomban, Québec (iframe embed)

#### Footer
- Logo + tagline
- Liens rapides
- Coordonnées (téléphone, courriel)
- Bandeau CTA → `contact.html`

---

### `contact.html` — Page de soumission

#### Hero
- Photo chalet (`Pictures/unnamed (13).webp`) en fond
- Overlay dégradé sombre (`rgba(28,25,22,0.82)` → `rgba(30,45,61,0.70)`)
- Titre, sous-titre, breadcrumb de confiance

#### Formulaire complet
Champs :
- Prénom / Nom
- Téléphone / Courriel
- Adresse complète (adresse, ville, code postal)
- Type de service (select)
- Description des travaux (textarea)
- Comment nous avez-vous trouvés (select)

Soumission : `mailto:deneigement.mak@gmail.com` (`method="post"`, `enctype="text/plain"`)

#### Panneau d'information (droite)
- Téléphone : (514) 297-2370
- Courriel : deneigement.mak@gmail.com
- Adresse : Saint-Colomban, Québec
- Horaires : Hiver 24h/7j · Été lun.–ven. 7h–18h
- Bullets « Pourquoi nous choisir »

#### Pré-remplissage URL
`?service=...&address=...` pré-remplit automatiquement les champs correspondants via `URLSearchParams`.

---

## Navigation

| Lien | Destination |
|---|---|
| Accueil | `index.html#hero` |
| Services | `index.html#services` |
| Réalisations | `index.html#realisations` |
| Avis | `index.html#avis` |
| Régions | `index.html#regions` |
| Contact | `contact.html` |

- La nav est **transparente** sur le hero, devient **solide** après 65% de hauteur hero scrollée
- Sur `contact.html` : classe `nav--solid` appliquée d'emblée (pas de hero scroll)
- Mobile : hamburger + drawer animé

---

## JavaScript — `js/main.js`

| Fonction | Rôle |
|---|---|
| `initHeroReveal()` | Animation M mask (GSAP), fix bfcache (`pageshow` + `e.persisted`) |
| `initNav()` | Transparent → solid on scroll |
| `initMobileNav()` | Hamburger + drawer + Escape key |
| `initRealisations()` | GSAP ScrollTrigger horizontal carousel + dots |
| `initCounters()` | Animated stats on scroll (IntersectionObserver + rAF) |
| `initAvisMarquee()` | Clone review cards for seamless CSS marquee loop |
| `initReveal()` | `.reveal` → `.reveal.is-visible` via IntersectionObserver |

---

## CSS — `css/style.css`

### Variables principales
```css
--c-navy:   #0D1B2A   /* fond principal */
--c-blue:   #1A3A5C   /* sections alternées */
--c-accent: #4A9FD4   /* bleu clair, CTA, accents */
--c-white:  #FFFFFF
--c-paper:  #F4F4F0   /* fond sections claires */
--font-display: /* fonte titre */
--font-body:    /* fonte corps */
```

### Points de rupture responsive
- `≤ 1023px` : grilles 2 colonnes → 1 colonne (promise, regions)
- `≤ 767px` : mobile nav, ajustements typographie et espacement

---

## Coordonnées client

- **Entreprise :** Déneigement MAK Excavation
- **Téléphone :** (514) 297-2370
- **Courriel :** deneigement.mak@gmail.com
- **Localisation :** Saint-Colomban, Québec, Canada
- **Zone desservie :** Les Laurentides et les environs

---

## Déploiement

1. Pousser sur `main` via git
2. Connecter le repo GitHub à **Vercel** (déploiement automatique)
3. Aucun build step requis — site 100% statique

```bash
git add -A
git commit -m "message"
git push origin main
```

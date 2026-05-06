# hamza-dev

A full-stack developer portfolio built with **Next.js** and **React**. It combines a glassmorphism UI, dark and light themes, scroll-driven motion, and an interactive **Three.js** hero background—focused on clarity, performance, and maintainability.

---

## Features

- **Pages Router** (`src/pages`) — classic `_app` / `_document` composition with straightforward routing.
- **Theming** — `next-themes` with Tailwind `light` / `dark` variants and consistent typography.
- **Motion** — Framer Motion for section entrances and interactions; **Lenis** for smooth scrolling.
- **Hero** — `@react-three/fiber` + `@react-three/drei` + **three** for a lightweight canvas scene behind content.
- **Sections** — Hero, About, Skills (Simple Icons), Quote, Projects, Contact, and Footer; viewport-based lazy loading where it helps.
- **SEO basics** — Title, description, keywords, and Open Graph tags via `next/head` in `_app.jsx`.

---

## Tech stack

| Area | Packages |
|------|----------|
| Framework | [Next.js](https://nextjs.org/) 16, [React](https://react.dev/) 19 |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v4, PostCSS, `tw-animate-css` |
| Motion | [Framer Motion](https://www.framer.com/motion/), [Lenis](https://lenis.darkroom.engineering/) |
| 3D | [three](https://threejs.org/), `@react-three/fiber`, `@react-three/drei` |
| Icons | [Lucide React](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/) (including Simple Icons) |
| Themes | [next-themes](https://github.com/pacocoursey/next-themes) |

Patches ([`patch-package`](https://github.com/ds300/patch-package)): `postinstall` applies `patches/@react-three+fiber+9.6.1.patch` to silence deprecated `THREE.Clock` usage from the library until upstream ships a fix.

---

## Project structure

```
src/
├── pages/
│   ├── _app.jsx       # Fonts, global providers, layout shell, document head
│   ├── _document.jsx  # HTML document wrapper
│   └── index.jsx      # Home page composition
├── components/        # UI sections (Hero3D, Navigation, About, …)
├── lib/
│   └── constants.js   # Bio, skills metadata, quote text, etc.
└── styles/
    └── globals.css    # Tailwind entry + theme + component utilities
```

---

## Getting started

**Requirements:** Node.js 20+ recommended, npm (or compatible package manager).

```bash
git clone <your-repo-url>
cd hamza-dev
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).  
`npm install` runs `patch-package` automatically via `postinstall`.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve production build locally |

---

## Customization

1. **Copy and branding** — Edit `src/lib/constants.js` (name, title, bio, social URLs, quote, education, expertise labels).
2. **Projects** — Project cards live in `src/components/Projects.jsx` (static list; adjust images, links, and copy there).
3. **Skills** — Update the skills array in `src/components/Skills.jsx` (icons use `react-icons/si` where applicable).
4. **SEO / meta** — Adjust defaults in `src/pages/_app.jsx` (`<Head>`: title, description, Open Graph).
5. **Global look** — Colors, glass styles, and light-mode overrides are in `src/styles/globals.css`.

There is no mandatory `.env` for the default static portfolio. Add `NEXT_PUBLIC_*` variables only if you introduce APIs or analytics later.

---

## Deployment

Build a static-friendly Next output and deploy on **Vercel**, **Netlify**, or any Node host:

```bash
npm run build
```

Connect the repository to your host, set the install command to `npm install`, build to `npm run build`, and output/start per the host’s Next.js guidelines.

---

## License

This repository is marked **private** in `package.json`. If you open-source it, add a `LICENSE` file and update this section accordingly.

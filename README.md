# Developer Portfolio

A modern, responsive developer portfolio built with Next.js, Tailwind CSS, and ShadCN UI. Features dark/light mode toggle, smooth animations, and a clean professional design.

## 🚀 Features

- **Modern Design**: Clean, professional layout with blue/slate color scheme
- **Responsive**: Mobile-first design that works on all devices
- **Dark/Light Mode**: Theme toggle with smooth transitions
- **Smooth Scrolling**: Seamless navigation between sections
- **Contact Form**: Functional contact form with validation
- **SEO Optimized**: Meta tags, Open Graph, and structured data
- **Performance**: Optimized for speed and accessibility

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: ShadCN UI
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/developer-portfolio.git
   cd developer-portfolio
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Personal Information
Update the following files with your information:

- `app/layout.tsx` - SEO metadata and site information
- `components/about-section.tsx` - Bio, skills, and timeline
- `components/hero-section.tsx` - Name and tagline
- `data/projects.ts` - Your projects and portfolio items
- `components/site-header.tsx` - Social media links
- `app/contact/page.tsx` - Contact information

### Environment Variables
Create a `.env.local` file for any environment-specific variables:

\`\`\`env
# Add any API keys or configuration here
NEXT_PUBLIC_SITE_URL=https://your-domain.com
\`\`\`

## 🎨 Customization

### Colors
The color scheme is defined in `app/globals.css`. The current theme uses:
- **Primary**: Cyan-600 (#0891b2)
- **Accent**: Emerald-500 (#10b981)
- **Neutrals**: Slate colors for backgrounds and text

### Content Sections
- **Hero**: Main introduction and call-to-action
- **About**: Bio, skills, and career timeline
- **Services**: Service offerings and capabilities
- **Projects**: Portfolio showcase with featured projects
- **Contact**: Contact form and information

## 📱 Pages

- `/` - Main portfolio page with all sections
- `/contact` - Dedicated contact page with form

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Deploy with Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure your domain (optional)
   - Deploy!

### Manual Deployment

1. **Build the project**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start production server**
   \`\`\`bash
   npm start
   \`\`\`

## 📊 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for LCP, FID, and CLS
- **SEO**: Comprehensive meta tags and structured data
- **Accessibility**: WCAG AA compliant

## 🔍 SEO Features

- Meta tags and Open Graph data
- Structured data markup
- XML sitemap
- Robots.txt
- Canonical URLs
- Social media optimization

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/developer-portfolio/issues).

## 📞 Support

If you have any questions or need help with setup, feel free to reach out:

- Email: your.email@example.com
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourusername)
- Twitter: [@yourusername](https://twitter.com/yourusername)

---

**Built with ❤️ using Next.js and Tailwind CSS**
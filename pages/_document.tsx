import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="th">
      <Head>
        {/* Title & Meta Description */}
        <meta name="description" content="ยินดีตอนรับทุกคนจ้าา" />
        <meta name="keywords" content="จองสนามแบดมินตัน เชียงราย, สนามแบด เชียงราย, ออลสตา เชียงราย, ออลสตาแบดมินตัน, สนามแบดมินตัน เชียงราย, ตีแบด เชียงราย, สมัครแข่งแบด เชียงราย, บุฟเฟ่ต์แบดมินตัน เชียงราย, All Stars Arena, allstars arena เชียงราย" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="ก๊วนแบดมินตันนิวเคลียร์ Nuclear Badminton" />
        <meta property="og:description" content="ยินดีตอนรับทุกคนจ้าาา" />
        <meta property="og:image" content="https://res.cloudinary.com/dgzxkk45s/image/upload/v1776445303/J_PT_ssdphz.jpg" />
        <meta property="og:url" content="https://www.allstarsarena.com" />
        <meta property="og:type" content="website" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ก๊วนแบดมินตันนิวเคลียร์ Nuclear Badminton" />
        <meta name="twitter:description" content="ยินดีตอนรับทุกคนจ้าาาา" />
        <meta name="twitter:image" content="https://res.cloudinary.com/dgzxkk45s/image/upload/v1776445303/J_PT_ssdphz.jpg" />
        <meta name="twitter:url" content="https://www.allstarsarena.com" />
        
        {/* Favicon */}
        <link rel="icon" href="/logo.jpg" />

        {/* Sitemap */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />

        {/* Robots Meta Tags */}
        <meta name="robots" content="index, follow" />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

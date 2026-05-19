import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

export default function Logo({
  size = 40,
  mobileSize = 32,
  className = "",
  showName = false,
  clickable = true,
  variant = "icon",
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentSize, setCurrentSize] = useState(size);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (variant === "backdrop") return;

    const handleResize = () => {
      setCurrentSize(window.innerWidth < 768 ? mobileSize : size);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [size, mobileSize, variant]);

  useEffect(() => {
    setIsLoaded(false);
  }, [resolvedTheme]);

  const isDark = !mounted || resolvedTheme === "dark";
  const src = isDark ? "/assets/logo/logo-dark.png" : "/assets/logo/logo-light.png";

  const handleClick = () => {
    if (clickable) {
      document.querySelector("#hero")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (variant === "backdrop") {
    return (
      <div
        className={`logo-backdrop-wrap ${className}`}
        aria-hidden={!clickable}
      >
        {!isLoaded && (
          <div className="absolute inset-0 animate-pulse opacity-30 bg-linear-to-br from-purple-500/5 to-cyan-500/5" />
        )}
        <Image
          src={src}
          alt=""
          fill
          className={`logo-blend object-contain object-center transition-opacity duration-700 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
          quality={100}
          sizes="(max-width: 768px) 100vw, 40vw"
          priority
        />
      </div>
    );
  }

  const logoMark = (
    <div
      className="relative shrink-0 transition-all duration-300 hover:scale-105"
      style={{ width: currentSize, height: currentSize }}
    >
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-cyan-500/20 animate-pulse"
          aria-hidden
        />
      )}

      <Image
        src={src}
        alt="Hamza Choudhary Logo"
        width={currentSize}
        height={currentSize}
        className={`h-full w-full object-contain logo-glow transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
        priority={currentSize <= 48}
        quality={100}
        sizes={`${currentSize}px`}
      />
    </div>
  );

  const label = showName ? (
    <span className="text-xl font-space font-bold text-gradient whitespace-nowrap">
      Hamza Choudhary
    </span>
  ) : null;

  if (clickable) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-3 cursor-pointer border-0 bg-transparent p-0 ${className}`}
        aria-label="Scroll to top"
      >
        {logoMark}
        {label}
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {logoMark}
      {label}
    </div>
  );
}

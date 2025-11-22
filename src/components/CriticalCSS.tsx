/**
 * Inline critical CSS in <head> for immediate above-the-fold rendering
 * Eliminates render-blocking CSS and improves FCP/LCP
 */
export function CriticalCSS() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          :root{--color-primary:#3b82f6;--color-text-primary:#1e293b;--color-bg-white:#fff;--font-family-primary:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}body{margin:0;padding:0;font-family:var(--font-family-primary);color:var(--color-text-primary);background:linear-gradient(135deg,#f0f9ff 0%,#f5f3ff 50%,#fce7f3 100%);-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}nav{position:fixed;top:0;width:100%;background:var(--color-bg-white);box-shadow:0 1px 3px rgba(0,0,0,.1);z-index:50}main{padding-top:4rem;min-height:100vh}.btn-primary{background:var(--color-primary);color:#fff;padding:.75rem 1.5rem;border-radius:.5rem;font-weight:600;border:none;cursor:pointer;min-height:48px;min-width:48px}.container-responsive{width:100%;max-width:1280px;margin:0 auto;padding:0 1rem}
        `,
      }}
    />
  );
}

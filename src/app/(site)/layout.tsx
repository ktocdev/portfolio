import SiteShell from '@/components/SiteShell';

/* Every portfolio page sits in this group so it gets the header and footer.
   Pages outside it (the Main Character splash) render bare in the root layout. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}

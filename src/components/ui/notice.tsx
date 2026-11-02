import { Alert } from "@/components/ui/alert";

/** Amber note (review warnings, sensitive-content notices): Alert's warning variant. */
function Notice({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Alert variant="warning" className={className}>
      {children}
    </Alert>
  );
}

export { Notice };

export function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          Powered by{" "}
          <a
            href="https://www.helius.dev/"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Helius
          </a>{" "}
          &{" "}
          <a
            href="https://lightprotocol.com/"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Light
          </a>
          .
        </p>
      </div>
    </footer>
  );
}

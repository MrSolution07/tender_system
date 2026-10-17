import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-primary-deep text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
        <div>
          <p className="font-display text-xl font-semibold">Major Tech</p>
          <p className="mt-3 max-w-[40ch] text-pretty text-primary-foreground/80">
            A public window onto what government published, who won, and what
            was spent.
          </p>
        </div>

        <nav aria-label="Browse">
          <h2 className="font-display text-base font-semibold">Browse</h2>
          <ul className="mt-3 grid gap-2 text-primary-foreground/80">
            <li>
              <Link href="/tenders" className="underline-offset-4 hover:underline">
                Open tenders
              </Link>
            </li>
            <li>
              <Link href="/awards" className="underline-offset-4 hover:underline">
                Awards and spend
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-base font-semibold">Not published here</h2>
          <p className="mt-3 max-w-[40ch] text-pretty text-primary-foreground/80">
            Bids, scores, evaluator notes and contact details stay inside the
            staff desk.
          </p>
          <Link
            href="/desk/sign-in"
            className="mt-3 inline-block text-primary-foreground underline underline-offset-4"
          >
            Staff desk
          </Link>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <p className="mx-auto max-w-6xl px-6 py-5 text-sm text-primary-foreground/75">
          Major Tech government tender register.
        </p>
      </div>
    </footer>
  );
}

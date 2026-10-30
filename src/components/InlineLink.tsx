// Puts a link into its sentence: a tap-to-call number or a website. The copy
// keeps the whole sentence with a placeholder ("Call us at {number}."), so the
// readability check reads it as one string. The pseudo-element gives a short
// link like "988" a 44px tap area without changing the line height
export const InlineLink = ({
  text,
  label,
  href,
  placeholder = "{number}",
}: {
  text: string;
  label: string;
  href: string;
  placeholder?: string;
}) => {
  const [before, after] = text.split(placeholder);
  return (
    <>
      {before}
      <a
        href={href}
        className="focus-ring relative rounded-sm font-medium whitespace-nowrap text-action underline underline-offset-4 hover:text-action-hover after:absolute after:-inset-x-2 after:-inset-y-3.5 after:content-['']"
      >
        {label}
      </a>
      {after}
    </>
  );
};

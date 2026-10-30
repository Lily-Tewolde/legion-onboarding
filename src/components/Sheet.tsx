"use client";

import { type ReactNode, type RefObject, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { copy } from "@/copy";
import { Close } from "./icons";

// One panel, two shapes (the spec's sheets and dialogs): a sheet from the
// bottom on phones, with a grabber you can drag down past 90px to close, and a
// dialog that fades in and grows from 96% on wider screens. A native <dialog>,
// so focus stays inside, Escape closes it and focus returns to what opened it.
// Tapping the scrim closes it too. Leaving is quicker than arriving

export type SheetHandle = { open: () => void; close: () => void };

const CLOSE_MS = 280;

export function Sheet({
  ref,
  title,
  titleId,
  children,
  onClose,
}: {
  ref: RefObject<SheetHandle | null>;
  title: string;
  titleId: string;
  children: ReactNode;
  onClose?: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const drag = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [closing, setClosing] = useState(false);

  const finish = () => {
    dialog.current?.close();
    setClosing(false);
    setDragY(0);
    onClose?.();
  };

  const close = () => {
    if (!dialog.current?.open || closing) return;
    setClosing(true);
    window.setTimeout(finish, CLOSE_MS);
  };

  // Next keeps a screen you've left alive but hidden. A sheet left open there
  // stays modal, and nothing on the next screen can be clicked, so it closes
  // when its screen is hidden or goes away
  useLayoutEffect(() => {
    const node = dialog.current;
    return () => node?.close();
  }, []);

  useImperativeHandle(ref, () => ({
    open: () => {
      setClosing(false);
      setDragY(0);
      dialog.current?.showModal();
      heading.current?.focus();
    },
    close,
  }));

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => event.target === dialog.current && close()}
      data-closing={closing || undefined}
      // Follows the finger with no easing, then settles back (the spec's settle curve)
      style={{
        transform: dragY ? `translateY(${dragY}px)` : undefined,
        transition: dragging ? "none" : "transform 0.45s var(--ease-settle)",
      }}
      className={[
        "sheet m-0 flex-col gap-3 bg-white p-0 text-navy outline-none open:flex",
        "backdrop:bg-navy/32 backdrop:animate-[fade-in_.3s_ease_both] data-closing:backdrop:animate-[fade-out_.28s_var(--ease-exit)_both]",
        // Phones: a sheet pinned to the bottom
        "max-md:top-auto max-md:bottom-0 max-md:mx-auto max-md:w-full max-md:max-w-form max-md:rounded-t-card max-md:shadow-sheet",
        "max-md:animate-[sheet-in_var(--in)_var(--ease-spring)_both] max-md:data-closing:animate-[sheet-out_var(--out)_var(--ease-exit)_both]",
        "max-md:px-4 max-md:pb-[calc(16px+env(safe-area-inset-bottom))]",
        // Wider screens: a centred dialog
        "md:m-auto md:w-[440px] md:max-w-[calc(100vw-48px)] md:rounded-card md:p-6 md:shadow-dialog",
        "md:animate-[grow-in_var(--in)_var(--ease-spring)_both] md:data-closing:animate-[grow-out_var(--out)_var(--ease-exit)_both]",
        "motion-reduce:animate-[fade-in_.2s_ease_both]! motion-reduce:data-closing:animate-[fade-out_.2s_ease_both]!",
      ].join(" ")}
    >
      <div
        className="flex touch-none flex-col gap-2 pt-2 max-md:cursor-grab md:flex-row md:items-start md:justify-between md:pt-0"
        onPointerDown={(event) => {
          if (window.matchMedia("(min-width: 768px)").matches) return;
          drag.current = event.clientY;
          setDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (drag.current !== null) setDragY(Math.max(0, event.clientY - drag.current));
        }}
        onPointerUp={() => {
          if (drag.current === null) return;
          drag.current = null;
          setDragging(false);
          if (dragY > 90) close();
          else setDragY(0);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
          setDragY(0);
        }}
      >
        <span aria-hidden="true" className="h-[5px] w-9 self-center rounded-full bg-[#c9d1de] md:hidden" />
        <h2
          id={titleId}
          ref={heading}
          tabIndex={-1}
          className="display text-[22px] leading-7 outline-none md:text-card-question-lg"
        >
          {title}
        </h2>
        <button
          type="button"
          aria-label={copy.common.close}
          onClick={close}
          className="focus-ring -m-2 hidden size-11 flex-none cursor-pointer items-center justify-center rounded-full text-slate md:flex"
        >
          <Close size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

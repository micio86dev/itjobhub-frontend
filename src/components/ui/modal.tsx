import {
  component$,
  Slot,
  type PropFunction,
  useStylesScoped$,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Spinner } from "./spinner";
import styles from "./modal.css?inline";

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose$?: PropFunction<() => void>;
  onConfirm$?: PropFunction<() => void>;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const Modal = component$<ModalProps>((props) => {
  useStylesScoped$(styles);
  const modalRef = useSignal<HTMLDivElement>();
  const confirmButtonRef = useSignal<HTMLButtonElement>();

  // Focus trap and ESC key handler
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track, cleanup }) => {
    // Tracciamo la prop direttamente dall'oggetto props
    const open = track(() => props.isOpen);

    if (!open) return;

    const timer = setTimeout(() => {
      confirmButtonRef.value?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        // Cerchiamo il pulsante di chiusura nel DOM per scatenare l'evento correttamente
        const closeBtn = modalRef.value?.querySelector(
          '[data-testid="modal-cancel"]',
        ) as HTMLButtonElement;
        closeBtn?.click();
      }

      if (e.key === "Tab" && modalRef.value) {
        const focusableElements = modalRef.value.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    cleanup(() => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    });
  });

  if (!props.isOpen) return null;

  return (
    <div
      ref={modalRef}
      class="modal-backdrop"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-content-wrapper">
        <div
          class="overlay"
          aria-hidden="true"
          onClick$={async () => {
            if (props.onClose$) await props.onClose$();
          }}
        ></div>

        <span class="modal-spacer" aria-hidden="true">
          &#8203;
        </span>

        <div class="modal-panel" role="document">
          <div class="modal-header">
            <div class="modal-body">
              {props.isDestructive && (
                <div class="icon-wrapper icon-destructive">
                  <svg
                    class="icon-svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              )}
              <div
                class={`content-section ${!props.isDestructive ? "content-section-full" : ""}`}
              >
                <h3 class="title" id="modal-title">
                  {props.title}
                </h3>
                <div class="slot-wrapper" id="modal-description">
                  <div class="slot-text">
                    <Slot />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="footer">
            <button
              ref={confirmButtonRef}
              type="button"
              data-testid="modal-confirm"
              disabled={props.isLoading}
              class={`btn-confirm ${
                props.isDestructive ? "btn-destructive" : "btn-primary"
              } ${props.isLoading ? "btn-loading" : ""}`}
              onClick$={async () => {
                // IL FIX DEFINITIVO: Accedi alla prop tramite l'oggetto props
                if (props.onConfirm$) await props.onConfirm$();
              }}
              aria-busy={props.isLoading}
            >
              {props.isLoading && <Spinner size="sm" class="mr-2 -ml-1" />}
              {props.confirmText || "Confirm"}
            </button>
            <button
              type="button"
              data-testid="modal-cancel"
              class="btn-cancel"
              onClick$={async () => {
                if (props.onClose$) await props.onClose$();
              }}
            >
              {props.cancelText || "Cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

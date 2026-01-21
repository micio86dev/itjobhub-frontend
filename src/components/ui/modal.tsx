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
  onClose$: PropFunction<() => void>;
  onConfirm$: PropFunction<() => void>;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const Modal = component$<ModalProps>(
  ({
    title,
    isOpen,
    onClose$,
    onConfirm$,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false,
    isLoading = false,
  }) => {
    useStylesScoped$(styles);
    const modalRef = useSignal<HTMLDivElement>();
    const confirmButtonRef = useSignal<HTMLButtonElement>();

    // Focus trap and ESC key handler - WCAG 2.1 AA requirement
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track, cleanup }) => {
      const open = track(() => isOpen);

      if (!open) return;

      // Focus the confirm button when modal opens
      setTimeout(() => {
        confirmButtonRef.value?.focus();
      }, 50);

      // ESC key handler
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose$();
        }

        // Focus trap - Tab key handling
        if (e.key === "Tab" && modalRef.value) {
          const focusableElements =
            modalRef.value.querySelectorAll<HTMLElement>(
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

      // Prevent body scroll when modal is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      cleanup(() => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = originalOverflow;
      });
    });

    if (!isOpen) return null;

    return (
      <div
        ref={modalRef}
        class="modal-backdrop"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        role="dialog"
        aria-modal="true"
      >
        <div class="modal-content-wrapper">
          {/* Background overlay */}
          <div class="overlay" aria-hidden="true" onClick$={onClose$}></div>

          {/* Center content */}
          <span class="modal-spacer" aria-hidden="true">
            &#8203;
          </span>

          <div class="modal-panel" role="document">
            <div class="modal-header">
              <div class="modal-body">
                {isDestructive && (
                  <div class="icon-wrapper icon-destructive">
                    <svg
                      class="icon-svg"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
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
                  class={`content-section ${!isDestructive ? "content-section-full" : ""}`}
                >
                  <h3 class="title" id="modal-title">
                    {title}
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
                disabled={isLoading}
                class={`btn-confirm ${
                  isDestructive ? "btn-destructive" : "btn-primary"
                } ${isLoading ? "btn-loading" : ""}`}
                onClick$={onConfirm$}
                aria-busy={isLoading}
              >
                {isLoading && <Spinner size="sm" class="-ml-1 mr-2" />}
                {confirmText}
              </button>
              <button
                type="button"
                data-testid="modal-cancel"
                class="btn-cancel"
                onClick$={onClose$}
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

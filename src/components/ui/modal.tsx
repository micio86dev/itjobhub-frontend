import {
  component$,
  Slot,
  type PropFunction,
  $,
  useStylesScoped$,
} from "@builder.io/qwik";
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
    if (!isOpen) return null;

    return (
      <div
        class="modal-backdrop"
        aria-labelledby="modal-title"
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

          <div class="modal-panel">
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
                  <div class="slot-wrapper">
                    <div class="slot-text">
                      <Slot />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="footer">
              <button
                type="button"
                data-testid="modal-confirm"
                disabled={isLoading}
                class={`btn-confirm ${
                  isDestructive ? "btn-destructive" : "btn-primary"
                } ${isLoading ? "btn-loading" : ""}`}
                onClick$={$(() => onConfirm$())}
              >
                {isLoading && (
                  <svg class="spinner" fill="none" viewBox="0 0 24 24">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {confirmText}
              </button>
              <button
                type="button"
                data-testid="modal-cancel"
                class="btn-cancel"
                onClick$={$(() => onClose$())}
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

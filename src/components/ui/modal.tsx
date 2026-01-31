import {
  component$,
  Slot,
  type PropFunction,
  useStylesScoped$,
} from "@builder.io/qwik";
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

  if (!props.isOpen) return null;

  return (
    <div
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      data-testid="modal-root"
    >
      <div class="modal-content-wrapper">
        <div class="overlay" aria-hidden="true" onClick$={props.onClose$}></div>
        <span class="modal-spacer" aria-hidden="true">
          &#8203;
        </span>
        <div class="modal-panel">
          <div class="modal-header">
            <h3 class="title" id="modal-title">
              {props.title}
            </h3>
            <div class="slot-wrapper">
              <Slot />
            </div>
          </div>
          <div class="footer">
            <button
              type="button"
              class={`btn-confirm ${props.isDestructive ? "btn-destructive" : "btn-primary"} ${props.isLoading ? "btn-loading" : ""}`}
              disabled={props.isLoading}
              data-testid="modal-confirm"
              onClick$={props.onConfirm$}
            >
              {props.isLoading ? (
                <>
                  <svg
                    class="spinner"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
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
                  {props.confirmText || "Loading..."}
                </>
              ) : (
                props.confirmText || "Confirm"
              )}
            </button>
            <button
              type="button"
              class="btn-cancel"
              data-testid="modal-cancel"
              onClick$={props.onClose$}
            >
              {props.cancelText || "Cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

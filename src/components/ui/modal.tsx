import {
  component$,
  Slot,
  useStylesScoped$,
  type Signal,
  type PropFunction,
} from "@builder.io/qwik";
import styles from "./modal.css?inline";

interface ModalProps {
  title: string;
  isOpen: Signal<boolean>;
  onConfirm$: PropFunction<() => Promise<void>>;
  onCancel$?: PropFunction<() => void>;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const Modal = component$<ModalProps>(
  ({
    title,
    isOpen,
    onConfirm$,
    onCancel$,
    confirmText,
    cancelText,
    isDestructive,
    isLoading,
  }) => {
    useStylesScoped$(styles);

    return (
      <div
        class="modal-backdrop"
        style={{ display: isOpen.value ? "flex" : "none" }}
        role="dialog"
        aria-modal="true"
      >
        <div class="modal-content-wrapper">
          <div
            class="overlay"
            onClick$={() => {
              isOpen.value = false;
              onCancel$?.();
            }}
          />

          <div class="modal-panel">
            <div class="modal-header">
              <h3 class="title">{title}</h3>
              <Slot />
            </div>

            <div class="footer">
              <button
                type="button"
                class={`btn-confirm ${
                  isDestructive ? "btn-destructive" : "btn-primary"
                }`}
                disabled={isLoading}
                onClick$={() => {
                  isOpen.value = false;
                  onConfirm$?.();
                }}
              >
                {isLoading ? "Loading..." : confirmText || "Confirm"}
              </button>

              <button
                type="button"
                class="btn-cancel"
                onClick$={() => {
                  isOpen.value = false;
                  onCancel$?.();
                }}
              >
                {cancelText || "Cancel"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

import {
  component$,
  useStylesScoped$,
  useSignal,
  $,
  type PropFunction,
} from "@builder.io/qwik";
import styles from "./admin-delete-button.css?inline";
import { Modal } from "~/components/ui/modal";
import { useTranslate } from "~/contexts/i18n";

interface AdminDeleteButtonProps {
  onDelete$: PropFunction<() => Promise<void>>;
  confirmTitle: string;
  confirmMessage: string;
  buttonText: string;
  isDeleting?: boolean;
  testId?: string;
}

export const AdminDeleteButton = component$<AdminDeleteButtonProps>((props) => {
  useStylesScoped$(styles);
  const t = useTranslate();
  const showModal = useSignal(false);

  const handleConfirm = $(async () => {
    await props.onDelete$();
    showModal.value = false;
  });

  return (
    <>
      <button
        onClick$={$(() => (showModal.value = true))}
        class="deleteButton"
        data-testid={props.testId || "delete-button"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        {props.buttonText}
      </button>

      <Modal
        title={props.confirmTitle}
        isOpen={showModal.value}
        onClose$={$(() => (showModal.value = false))}
        onConfirm$={handleConfirm}
        isDestructive={true}
        isLoading={props.isDeleting}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
      >
        <p>{props.confirmMessage}</p>
      </Modal>
    </>
  );
});

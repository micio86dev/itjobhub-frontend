import { component$, Slot, type PropFunction } from "@builder.io/qwik";
// import styles from "./modal.css?inline";

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
  // useStylesScoped$(styles);

  if (!props.isOpen) return null;

  return (
    <div
      class="z-50 fixed inset-0 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      data-testid="modal-root"
    >
      <div class="sm:block flex justify-center items-end sm:p-0 px-4 pt-4 pb-20 min-h-screen text-center">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick$={props.onClose$}
        ></div>
        <span
          class="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div class="inline-block bg-white shadow-xl sm:my-8 rounded-lg sm:w-full sm:max-w-lg overflow-hidden text-left sm:align-middle align-bottom transition-all transform">
          <div class="bg-white sm:p-6 px-4 pt-5 pb-4 sm:pb-4">
            <h3
              class="font-medium text-gray-900 text-lg leading-6"
              id="modal-title"
            >
              {props.title}
            </h3>
            <div class="mt-2">
              <Slot />
            </div>
          </div>
          <div class="sm:flex sm:flex-row-reverse bg-gray-50 px-4 sm:px-6 py-3">
            <button
              type="button"
              class="inline-flex justify-center bg-red-600 hover:bg-red-700 shadow-sm sm:ml-3 px-4 py-2 border border-transparent rounded-md focus:outline-none w-full sm:w-auto font-medium text-white sm:text-sm text-base"
              data-testid="modal-confirm"
              onClick$={props.onConfirm$}
            >
              {props.confirmText || "Confirm"}
            </button>
            <button
              type="button"
              class="inline-flex justify-center bg-white hover:bg-gray-50 shadow-sm mt-3 sm:mt-0 sm:ml-3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none w-full sm:w-auto font-medium text-gray-700 sm:text-sm text-base"
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

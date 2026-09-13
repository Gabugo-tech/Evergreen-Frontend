"use client";

import { LogOut } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmModal({ open, onClose, onConfirm }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sign out of Evergreen?"
      description="You will need to sign in again to access your account."
      size="sm"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Stay signed in
          </Button>
          <Button variant="danger" fullWidth onClick={onConfirm} leftIcon={<LogOut className="h-4 w-4" />}>
            Sign Out
          </Button>
        </div>
      }
    >
      <p className="text-sm text-slate-500 dark:text-slate-400 py-2">
        Make sure you&apos;ve saved any pending work before signing out.
        Your session will be cleared from this device.
      </p>
    </Modal>
  );
}

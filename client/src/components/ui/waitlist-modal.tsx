import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type WaitlistModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="bg-primary text-white px-6 py-4 -mx-6 -mt-6 rounded-t-lg">
          <DialogTitle className="flex justify-between items-center">
            <span className="text-xl">Thank You!</span>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-white hover:bg-primary-dark"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <DialogTitle className="text-xl font-medium text-gray-900 mb-2">You're on the waitlist!</DialogTitle>
          <DialogDescription className="text-gray-600 mb-6">
            We'll notify you as soon as StayEase launches. In the meantime, follow us on social media for updates.
          </DialogDescription>
        </div>
        
        <DialogFooter className="sm:justify-center">
          <Button className="bg-primary hover:bg-primary-dark text-white" onClick={onClose}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

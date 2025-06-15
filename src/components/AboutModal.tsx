
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Github } from "lucide-react";

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <div className="flex items-center gap-2 mb-2">
          <Info className="text-blue-500" size={28} />
          <DialogTitle className="text-lg font-bold">Public:Translate 言語機</DialogTitle>
        </div>
      </DialogHeader>
      <DialogDescription>
        <div className="text-sm text-gray-800 dark:text-gray-100">
          <p>
            <b>Public:Translate 言語機</b> is a simple, live translation display for sharing spoken text and translation to an audience—whether in classrooms, talks, remotely, or on a TV.
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              <b>Usage:</b> Click the mic to start or stop recording. The left column shows your spoken language; the right column shows the translated text.
            </li>
            <li>
              <b>Presenting:</b> Share this browser tab, browser window, or app to your audience using <b>Screen Share</b> (on Zoom, Google Meet, or video calls) or cast to a TV.
            </li>
            <li>
              <b>Audio Output:</b> Press the speaker icon at the bottom of either column to play back the transcript using text-to-speech. Microphone input and TTS playback are balanced, so the mic pauses during audio.
            </li>
            <li>
              <b>Tips:</b> For best results, present in Chrome or Edge. You can adjust language, font size, and alignment from the controls bar at the bottom.
            </li>
            <li>
              <b>On Mobile/TV:</b> Open publictranslate.vercel.app in the mobile/TV browser and select "Add to Home Screen" for full-screen usage.
            </li>
          </ul>
          <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 border-t pt-2 flex items-center gap-2">
            <a
              href="https://github.com/your-repo-url"
              className="flex items-center gap-1 underline text-blue-700 dark:text-blue-400"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on GitHub"
            >
              <Github size={16} /> Source on GitHub
            </a>
            <span>
              | <a href="https://docs.lovable.dev/tips-tricks/troubleshooting" className="underline" target="_blank" rel="noopener">Help docs</a>
            </span>
          </div>
        </div>
      </DialogDescription>
      <DialogClose asChild>
        <Button className="w-full mt-4">Close</Button>
      </DialogClose>
    </DialogContent>
  </Dialog>
);

export default AboutModal;

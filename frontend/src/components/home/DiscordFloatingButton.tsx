
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const DiscordFloatingButton = () => {
  return (
    <a
      href="https://discord.gg/your-invite-link"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center justify-center",
        "w-14 h-14 rounded-full",
        "bg-[#5865F2] hover:bg-[#4752C4]",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-300",
        "group"
      )}
      aria-label="Join our Discord community"
    >
      <MessageCircle className="w-6 h-6 text-white" />
      <span className={cn(
        "absolute right-16 bg-white text-gray-800",
        "px-4 py-2 rounded-lg shadow-lg",
        "text-sm font-medium",
        "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
        "transition-all duration-300",
        "whitespace-nowrap"
      )}>
        Join our Community
      </span>
    </a>
  );
};

export default DiscordFloatingButton;


import React, { useMemo } from 'react';
import { WrenchIcon, XIcon } from './icons';
import AnimatedLogo from './AnimatedLogo';
import TextType from './TextType';

interface HeaderProps {
  onConfigureClick: () => void;
  onLogout: () => void;
  isProcessing: boolean;
  isLoggedIn: boolean;
  userName: string | null;
  taglines: string[];
}

const Header: React.FC<HeaderProps> = ({ onConfigureClick, isProcessing, isLoggedIn, userName, onLogout, taglines }) => {
  const shuffledTaglines = useMemo(() => 
      [...taglines].sort(() => Math.random() - 0.5), 
      [taglines]
  );
  
  return (
    <header className="bg-slate-600/25 backdrop-blur-xl sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto max-w-4xl p-4 flex justify-between items-center">
        {/* Left side: Configure, Logo, Tagline */}
        <div className="flex items-center gap-3">
           <button
            onClick={onConfigureClick}
            className="flex-shrink-0 p-2 bg-slate-800 hover:bg-slate-700/70 border border-slate-700 text-silver-light hover:text-white rounded-full transition-all duration-200 shadow-md"
            aria-label="Configuration Settings"
          >
            <WrenchIcon className="w-8 h-8 items-center" />
          </button>
          <div className="flex flex-col gap-1">
             <AnimatedLogo isAnimating={isProcessing} />
              <div className="h-5"> {/* Container to prevent layout shift */}
                <TextType 
                  as="p"
                  text={shuffledTaglines}
                  typingSpeed={50}
                  deletingSpeed={30}
                  pauseDuration={30000}
                  loop={true}
                  className="text-sm text-silver-medium hidden sm:block -mt-1 ml-1"
                  showCursor={true}
                  cursorCharacter="_"
                  cursorBlinkDuration={0.6}
                  cursorClassName="text-silver-medium"
                  hideCursorWhileTyping={true}
                />
              </div>
          </div>
        </div>

        {/* Right side: Profile, Logout */}
        <div className="flex items-center gap-2">
          {isLoggedIn && userName && (
             <div className="h-16 w-32 flex items-center justify-start -mr-16 sm:-mr-12">
                <div className="group relative flex items-center filter-goo">
                    {/* Logout button that slides and rotates out */}
                    <button
                        onClick={onLogout}
                        className="absolute left-1/2 -translate-x-1/2 w-9 h-9 bg-red-600/80 backdrop-blur-sm border border-red-500/50 text-white rounded-full flex items-center justify-center transition-all duration-300 ease-out transform opacity-0 -rotate-90 group-hover:opacity-100 group-hover:rotate-0 group-hover:left-[calc(50%+3.125rem)] shadow-lg shadow-black/30"
                        aria-label="Logout"
                        style={{ willChange: 'left, transform, opacity' }}
                    >
                        <XIcon className="w-5 h-5"/>
                    </button>
                    
                    {/* Profile Bubble - always visible */}
                    <div 
                        className="relative z-10 w-12 h-12 bg-slate-700 border-2 border-slate-600 rounded-full flex items-center justify-center font-bold text-xl text-primary select-none cursor-pointer transition-colors duration-200 group-hover:bg-slate-600"
                        aria-label={`Logged in as ${userName}`}
                        title={`Logged in as ${userName}`}
                    >
                        {userName.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;